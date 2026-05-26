import { SDLC_PHASES } from "@/lib/sdlc-phases";
import { SDLCRequest, SDLCResponse } from "@/lib/types";

const CODE_GEN_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

const CODE_GEN_MAX_TOKENS = 8000;
const DEFAULT_MAX_TOKENS = 2000;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGroqWithRetry(
  key: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
  temperature: number
): Promise<{ content: string; error?: string }> {
  let lastError = "";

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            max_tokens: maxTokens,
            temperature,
          }),
        }
      );

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        const waitMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : RETRY_DELAY_MS * (attempt + 1);
        await sleep(waitMs);
        continue;
      }

      if (response.status === 503 || response.status === 502) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        lastError =
          (errorData.error as Record<string, string>)?.message ??
          `Groq API error: ${response.status}`;

        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          return { content: "", error: lastError };
        }

        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      const data = (await response.json()) as {
        choices: { message: { content: string }; finish_reason: string }[];
      };
      const content = data.choices[0]?.message?.content ?? "";

      if (!content.trim()) {
        lastError = "AI returned an empty response. Retrying...";
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      return { content };
    } catch (err) {
      lastError =
        err instanceof Error ? err.message : "Network error connecting to AI";
      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  return { content: "", error: lastError || "Failed after multiple retries." };
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as SDLCRequest;
  const { phaseId, requirementDocument, previousPhases, apiKey } = body;

  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) {
    return Response.json(
      {
        content: "",
        error: "Groq API key is required.",
      } satisfies SDLCResponse,
      { status: 400 }
    );
  }

  const phase = SDLC_PHASES.find((p) => p.id === phaseId);
  if (!phase) {
    return Response.json(
      { content: "", error: "Invalid phase ID." } satisfies SDLCResponse,
      { status: 400 }
    );
  }

  const isCodeGen = phaseId === "code-generation";
  const model = isCodeGen ? CODE_GEN_MODEL : DEFAULT_MODEL;
  const maxTokens = isCodeGen ? CODE_GEN_MAX_TOKENS : DEFAULT_MAX_TOKENS;

  const reqLimit = isCodeGen ? 2000 : 800;
  const reqSummary =
    requirementDocument.length > reqLimit
      ? requirementDocument.slice(0, reqLimit) + "..."
      : requirementDocument;

  let previousContext = "";
  if (isCodeGen) {
    const contextPhases = previousPhases.filter((p) => p.approved);
    const contextParts: string[] = [];
    for (const prev of contextPhases) {
      const def = SDLC_PHASES.find((d) => d.id === prev.phaseId);
      const text = prev.editedContent || prev.content;
      const limit = prev.phaseId === "implementation-plan" ? 1500 : 800;
      const trimmed = text.length > limit ? text.slice(0, limit) + "..." : text;
      contextParts.push(`## ${def?.name ?? prev.phaseId}\n${trimmed}`);
    }
    previousContext = contextParts.join("\n\n");
  } else {
    const lastPhase =
      previousPhases.length > 0
        ? previousPhases[previousPhases.length - 1]
        : null;
    if (lastPhase) {
      const lastDef = SDLC_PHASES.find((def) => def.id === lastPhase.phaseId);
      const lastContent = lastPhase.editedContent || lastPhase.content;
      const trimmed =
        lastContent.length > 600
          ? lastContent.slice(0, 600) + "..."
          : lastContent;
      previousContext = `## ${lastDef?.name ?? lastPhase.phaseId}\n${trimmed}`;
    }
  }

  const systemPrompt = isCodeGen
    ? "You are an expert web developer who creates beautiful, fully functional single-file HTML applications. You always produce complete, working code with stunning modern UI. Never output incomplete code, placeholder comments, or TODO items. Every feature must be fully implemented and functional."
    : "Concise Markdown output. No filler.";

  const userMessage = `${reqSummary}\n\n${previousContext ? `${previousContext}\n\n` : ""}${phase.prompt}`;

  const result = await callGroqWithRetry(
    key,
    model,
    systemPrompt,
    userMessage,
    maxTokens,
    isCodeGen ? 0.3 : 0.2
  );

  if (result.error) {
    return Response.json(
      { content: "", error: result.error } satisfies SDLCResponse,
      { status: 500 }
    );
  }

  return Response.json({ content: result.content } satisfies SDLCResponse);
}
