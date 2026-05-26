import { SDLC_PHASES } from "@/lib/sdlc-phases";
import { SDLCRequest, SDLCResponse } from "@/lib/types";

const CODE_PHASES = new Set(["code-generation", "testing-strategy"]);

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as SDLCRequest;
  const { phaseId, requirementDocument, previousPhases, apiKey } = body;

  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) {
    return Response.json(
      { content: "", error: "Groq API key is required." } satisfies SDLCResponse,
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

  const isHeavyPhase = CODE_PHASES.has(phaseId);

  let contextMessage: string;

  if (isHeavyPhase) {
    // For code generation & testing: send full requirement + all previous phases (summarized)
    const reqText =
      requirementDocument.length > 2000
        ? requirementDocument.slice(0, 2000) + "..."
        : requirementDocument;

    const previousContext = previousPhases
      .map((p) => {
        const phaseDef = SDLC_PHASES.find((def) => def.id === p.phaseId);
        const content = p.editedContent || p.content;
        const maxLen = p.phaseId === "tech-architecture" ? 1500 : 800;
        const trimmed = content.length > maxLen ? content.slice(0, maxLen) + "..." : content;
        return `## ${phaseDef?.name ?? p.phaseId}\n${trimmed}`;
      })
      .join("\n\n");

    contextMessage = `# User Requirements\n${reqText}\n\n# Previous SDLC Phases\n${previousContext}\n\n# Your Task\n${phase.prompt}`;
  } else {
    // For lightweight phases: send requirement + only last phase
    const reqSummary =
      requirementDocument.length > 1200
        ? requirementDocument.slice(0, 1200) + "..."
        : requirementDocument;

    let previousContext = "";
    if (previousPhases.length > 0) {
      const lastPhase = previousPhases[previousPhases.length - 1];
      const lastDef = SDLC_PHASES.find((def) => def.id === lastPhase.phaseId);
      const lastContent = lastPhase.editedContent || lastPhase.content;
      const trimmed = lastContent.length > 800 ? lastContent.slice(0, 800) + "..." : lastContent;
      previousContext = `## ${lastDef?.name ?? lastPhase.phaseId}\n${trimmed}`;
    }

    contextMessage = `${reqSummary}\n\n${previousContext ? `${previousContext}\n\n` : ""}${phase.prompt}`;
  }

  const model = isHeavyPhase ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant";
  const maxTokens = phaseId === "code-generation" ? 6000 : isHeavyPhase ? 3000 : 2000;
  const systemPrompt = isHeavyPhase
    ? "You are an expert full-stack developer who creates BEAUTIFUL, polished applications. Generate a COMPLETE, WORKING application as a single index.html file with embedded CSS and JavaScript. The UI must be visually stunning with modern design (gradients, shadows, animations, professional colors). Every feature must be fully implemented — no placeholders, no TODOs. The code must work immediately when opened in a browser."
    : "Concise Markdown output. No filler.";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contextMessage },
        ],
        max_tokens: maxTokens,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const errorMessage =
        (errorData.error as Record<string, string>)?.message ??
        `Groq API error: ${response.status}`;
      return Response.json(
        { content: "", error: errorMessage } satisfies SDLCResponse,
        { status: response.status }
      );
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    const content = data.choices[0]?.message?.content ?? "";

    return Response.json({ content } satisfies SDLCResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { content: "", error: message } satisfies SDLCResponse,
      { status: 500 }
    );
  }
}
