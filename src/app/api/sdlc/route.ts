import { SDLC_PHASES } from "@/lib/sdlc-phases";
import { SDLCRequest, SDLCResponse } from "@/lib/types";

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

  const reqSummary =
    requirementDocument.length > 800
      ? requirementDocument.slice(0, 800) + "..."
      : requirementDocument;

  // Only send the last phase output as context (not all previous phases)
  const lastPhase = previousPhases.length > 0 ? previousPhases[previousPhases.length - 1] : null;
  let previousContext = "";
  if (lastPhase) {
    const lastDef = SDLC_PHASES.find((def) => def.id === lastPhase.phaseId);
    const lastContent = lastPhase.editedContent || lastPhase.content;
    const trimmed = lastContent.length > 600 ? lastContent.slice(0, 600) + "..." : lastContent;
    previousContext = `## ${lastDef?.name ?? lastPhase.phaseId}\n${trimmed}`;
  }

  const userMessage = `${reqSummary}\n\n${previousContext ? `${previousContext}\n\n` : ""}${phase.prompt}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Concise Markdown output. No filler.",
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2000,
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
