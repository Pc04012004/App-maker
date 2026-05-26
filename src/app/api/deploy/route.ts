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

interface VercelDeploymentStatus {
  readyState: string;
  url: string;
  error?: { code: string; message: string };
}

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as DeployRequest;
  const { files, projectName, vercelToken } = body;

  const token = vercelToken || process.env.VERCEL_TOKEN;
  if (!token) {
    return Response.json(
      { error: "Vercel API token is required. Set VERCEL_TOKEN in .env.local or enter it in the UI." },
      { status: 400 }
    );
  }

  if (!files || files.length === 0) {
    return Response.json(
      { error: "No files to deploy." },
      { status: 400 }
    );
  }

  const sanitizedName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 52) || "sdlc-app";

  // Normalize file paths and prepare for static deployment
  const normalizedFiles = normalizeFilePaths(files);
  const vercelFiles: VercelFileEntry[] = normalizedFiles.map((f) => ({
    file: f.path,
    data: f.content,
    encoding: "utf-8" as const,
  }));

  // Ensure there's always an index.html at root
  const hasRootHtml = normalizedFiles.some(
    (f) => f.path === "index.html"
  );

  if (!hasRootHtml) {
    // Try to find any HTML file and use it as index
    const anyHtml = normalizedFiles.find((f) => f.path.endsWith(".html"));
    if (anyHtml) {
      vercelFiles.push({
        file: "index.html",
        data: anyHtml.content,
        encoding: "utf-8",
      });
    } else {
      // No HTML at all — wrap everything into a single index.html
      vercelFiles.length = 0;
      vercelFiles.push({
        file: "index.html",
        data: bundleAsHtml(normalizedFiles),
        encoding: "utf-8",
      });
    }
  }

  try {
    const response = await fetch("https://api.vercel.com/v13/deployments", {
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
          buildCommand: "",
          outputDirectory: "",
        },
        target: "production",
      }),
    });

    const data = (await response.json()) as VercelDeployResponse;

    if (!response.ok) {
      const errorMessage =
        data.error?.message ?? `Vercel API error: ${response.status}`;
      return Response.json({ error: errorMessage }, { status: response.status });
    }

    // Poll until deployment is ready (max 60 seconds)
    const deployUrl = `https://${data.url}`;
    const readyUrl = await waitForDeployment(data.id, token, 60);

    return Response.json({
      url: readyUrl ?? deployUrl,
      deploymentId: data.id,
      readyState: readyUrl ? "READY" : data.readyState,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}

function normalizeFilePaths(files: DeployFile[]): DeployFile[] {
  return files.map((f) => {
    let path = f.path;
    // Strip leading ./ or /
    path = path.replace(/^\.?\//, "");
    // If path starts with src/ or public/, flatten it
    path = path.replace(/^(src|public)\//, "");
    return { path, content: f.content };
  });
}

function bundleAsHtml(files: DeployFile[]): string {
  // Collect CSS files
  const cssFiles = files.filter((f) => f.path.endsWith(".css"));
  const cssContent = cssFiles.map((f) => f.content).join("\n");

  // Collect JS files
  const jsFiles = files.filter(
    (f) => f.path.endsWith(".js") || f.path.endsWith(".ts")
  );
  const jsContent = jsFiles.map((f) => f.content).join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Application</title>
  <style>
${cssContent || "body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; }"}
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
${jsContent}
  </script>
</body>
</html>`;
}

async function waitForDeployment(
  deploymentId: string,
  token: string,
  maxSeconds: number
): Promise<string | null> {
  const start = Date.now();
  const maxMs = maxSeconds * 1000;

  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(
        `https://api.vercel.com/v13/deployments/${deploymentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = (await res.json()) as VercelDeploymentStatus;
        if (data.readyState === "READY") {
          return `https://${data.url}`;
        }
        if (data.readyState === "ERROR") {
          return null;
        }
      }
    } catch {
      // ignore polling errors
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  return null;
}
