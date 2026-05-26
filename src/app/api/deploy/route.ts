interface DeployFile {
  path: string;
  content: string;
}

interface DeployRequest {
  files: DeployFile[];
  projectName: string;
  vercelToken?: string;
}

interface VercelFileEntry {
  file: string;
  data: string;
  encoding: "utf-8";
}

interface VercelDeployResponse {
  id: string;
  url: string;
  readyState: string;
  alias?: string[];
  error?: { code: string; message: string };
}

function extractFilesFromMarkdown(rawContent: string): DeployFile[] {
  const files: DeployFile[] = [];
  const patterns = [
    /###\s*FILE:\s*`(.+?)`\s*\n```[\w]*\n([\s\S]*?)```/g,
    /###\s*FILE:\s*`(.+?)`\s*\n\s*```[\w]*\n([\s\S]*?)```/g,
    /##\s*FILE:\s*`(.+?)`\s*\n```[\w]*\n([\s\S]*?)```/g,
    /FILE:\s*`(.+?)`\s*\n```[\w]*\n([\s\S]*?)```/g,
    /`(.+?\.(?:html|css|js|ts|json))`\s*\n```[\w]*\n([\s\S]*?)```/g,
  ];

  const seenPaths = new Set<string>();

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(rawContent)) !== null) {
      const filePath = match[1].trim();
      const fileContent = match[2];
      if (!seenPaths.has(filePath) && fileContent.trim()) {
        seenPaths.add(filePath);
        files.push({ path: filePath, content: fileContent });
      }
    }
  }

  if (files.length === 0) {
    const htmlMatch = rawContent.match(
      /```html\s*\n([\s\S]*?)```/
    );
    if (htmlMatch && htmlMatch[1].trim()) {
      files.push({ path: "index.html", content: htmlMatch[1] });
    }
  }

  if (files.length === 0) {
    const doctypeMatch = rawContent.match(
      /(<!DOCTYPE html[\s\S]*?<\/html>)/i
    );
    if (doctypeMatch && doctypeMatch[1].trim()) {
      files.push({ path: "index.html", content: doctypeMatch[1] });
    }
  }

  return files;
}

function ensureIndexHtml(files: DeployFile[]): DeployFile[] {
  const hasIndex = files.some(
    (f) =>
      f.path === "index.html" ||
      f.path === "./index.html" ||
      f.path === "/index.html"
  );

  if (hasIndex) return files;

  const htmlFile = files.find((f) => f.path.endsWith(".html"));
  if (htmlFile) {
    return [{ path: "index.html", content: htmlFile.content }, ...files];
  }

  const jsFiles = files.filter(
    (f) => f.path.endsWith(".js") || f.path.endsWith(".ts")
  );
  const cssFiles = files.filter((f) => f.path.endsWith(".css"));

  const scriptTags = jsFiles
    .map((f) => `<script>\n${f.content}\n</script>`)
    .join("\n");
  const styleTags = cssFiles
    .map((f) => `<style>\n${f.content}\n</style>`)
    .join("\n");

  const appName =
    files.length > 0
      ? "Generated Application"
      : "SDLCFlow Application";

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1e293b;
    }
    .container {
      max-width: 600px;
      margin: 2rem;
      background: white;
      border-radius: 1rem;
      padding: 3rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      text-align: center;
    }
    h1 { font-size: 1.75rem; margin-bottom: 1rem; color: #1e293b; }
    p { color: #64748b; margin-bottom: 1.5rem; line-height: 1.6; }
    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      padding: 0.5rem 1.5rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }
  </style>
  ${styleTags}
</head>
<body>
  <div class="container">
    <div class="badge">SDLCFlow</div>
    <h1 style="margin-top:1.5rem">${appName}</h1>
    <p>Your application has been generated and deployed successfully.</p>
    <div id="app"></div>
  </div>
  ${scriptTags}
</body>
</html>`;

  return [{ path: "index.html", content: indexHtml }, ...files];
}

function normalizeFilePath(filePath: string): string {
  let normalized = filePath
    .replace(/^\.\//, "")
    .replace(/^\//, "")
    .replace(/\.\./g, "")
    .replace(/\/+/g, "/");

  if (normalized.startsWith("/")) {
    normalized = normalized.slice(1);
  }

  return normalized || "index.html";
}

export async function POST(request: Request): Promise<Response> {
  let body: DeployRequest;
  try {
    body = (await request.json()) as DeployRequest;
  } catch {
    return Response.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { projectName, vercelToken } = body;
  let { files } = body;

  const token = vercelToken || process.env.VERCEL_TOKEN;
  if (!token) {
    return Response.json(
      {
        error:
          "Vercel API token is required. Set VERCEL_TOKEN in .env.local or enter it in the UI.",
      },
      { status: 400 }
    );
  }

  if (!files || files.length === 0) {
    return Response.json(
      { error: "No files to deploy." },
      { status: 400 }
    );
  }

  files = files
    .filter((f) => f.content && f.content.trim())
    .map((f) => ({
      path: normalizeFilePath(f.path),
      content: f.content,
    }));

  if (files.length === 0) {
    return Response.json(
      { error: "All files were empty after processing." },
      { status: 400 }
    );
  }

  files = ensureIndexHtml(files);

  const sanitizedName =
    projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 52) || "sdlc-app";

  const vercelFiles: VercelFileEntry[] = files.map((f) => ({
    file: f.path,
    data: f.content,
    encoding: "utf-8" as const,
  }));

  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(
        "https://api.vercel.com/v13/deployments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: sanitizedName,
            files: vercelFiles,
            projectSettings: {
              framework: null,
            },
          }),
        }
      );

      const data = (await response.json()) as VercelDeployResponse;

      if (!response.ok) {
        const errorMessage =
          data.error?.message ?? `Vercel API error: ${response.status}`;

        if (
          response.status === 429 ||
          response.status >= 500
        ) {
          if (attempt < maxRetries - 1) {
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
            continue;
          }
        }

        return Response.json(
          { error: errorMessage },
          { status: response.status }
        );
      }

      const deployUrl = `https://${data.url}`;

      return Response.json({
        url: deployUrl,
        deploymentId: data.id,
        readyState: data.readyState,
      });
    } catch (err) {
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      const message =
        err instanceof Error ? err.message : "Unknown error";
      return Response.json({ error: message }, { status: 500 });
    }
  }

  return Response.json(
    { error: "Deployment failed after multiple retries." },
    { status: 500 }
  );
}

export { extractFilesFromMarkdown };
