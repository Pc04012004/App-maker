export async function GET(): Promise<Response> {
  return Response.json({
    hasApiKey: Boolean(process.env.GROQ_API_KEY),
  });
}
