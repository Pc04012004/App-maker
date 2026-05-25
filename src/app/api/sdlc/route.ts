import { SDLC_PHASES } from "@/lib/sdlc-phases";
import { SDLCRequest, SDLCResponse } from "@/lib/types";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as SDLCRequest;
  const { phaseId, requirementDocument, previousPhases, apiKey } = body;

  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    return Response.json(
      { content: "", error: "OpenAI API key is required." } satisfies SDLCResponse,
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

  const previousContext = previousPhases
    .map((p) => {
      const phaseDef = SDLC_PHASES.find((def) => def.id === p.phaseId);
      const content = p.editedContent || p.content;
      return `## ${phaseDef?.name ?? p.phaseId}\n\n${content}`;
    })
    .join("\n\n---\n\n");

  const userMessage = `# Requirement Document

${requirementDocument}

${previousContext ? `# Previous SDLC Phase Outputs\n\n${previousContext}` : ""}

# Current Task

${phase.prompt}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert software engineer following the SDLC process. Provide detailed, professional, production-quality output for each phase. Use clean Markdown formatting.",
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 16000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const errorMessage =
        (errorData.error as Record<string, string>)?.message ??
        `OpenAI API error: ${response.status}`;
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
