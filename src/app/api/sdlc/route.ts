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

  const summarizePhase = (content: string, maxLen: number): string => {
    if (content.length <= maxLen) return content;
    return content.slice(0, maxLen) + "\n\n[...truncated for brevity]";
  };

  const reqSummary =
    requirementDocument.length > 1500
      ? requirementDocument.slice(0, 1500) + "\n\n[...truncated]"
      : requirementDocument;

  const previousContext = previousPhases
    .map((p) => {
      const phaseDef = SDLC_PHASES.find((def) => def.id === p.phaseId);
      const content = p.editedContent || p.content;
      return `## ${phaseDef?.name ?? p.phaseId}\n${summarizePhase(content, 800)}`;
    })
    .join("\n\n");

  const userMessage = `# Requirements\n${reqSummary}\n\n${previousContext ? `# Previous Phases\n${previousContext}` : ""}\n\n# Task\n${phase.prompt}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "Expert software engineer. Output concise, production-quality Markdown. No filler or preamble.",
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 3000,
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
