"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Rocket,
  Loader2,
  ExternalLink,
  AlertCircle,
  Key,
  CheckCircle,
  Globe,
} from "lucide-react";
import { SDLC_PHASES } from "@/lib/sdlc-phases";
import { PhaseResult } from "@/lib/types";
import MarkdownRenderer from "./MarkdownRenderer";

interface FinalOutputProps {
  phases: PhaseResult[];
  onDownload: () => void;
  onStartNew: () => void;
}

type DeployState = "idle" | "deploying" | "success" | "error";

interface DeployFile {
  path: string;
  content: string;
}

function closeHtmlIfTruncated(html: string): string {
  // Remove trailing incomplete tags/code
  let cleaned = html.replace(/```\s*$/, "").trimEnd();

  // If truncated mid-tag, remove the partial tag
  const lastOpenBracket = cleaned.lastIndexOf("<");
  const lastCloseBracket = cleaned.lastIndexOf(">");
  if (lastOpenBracket > lastCloseBracket) {
    cleaned = cleaned.slice(0, lastOpenBracket).trimEnd();
  }

  // Close unclosed script/style tags
  if (cleaned.includes("<script") && !cleaned.includes("</script>")) {
    cleaned += "\n</script>";
  }
  if (cleaned.includes("<style") && !cleaned.includes("</style>")) {
    cleaned += "\n</style>";
  }
  if (!cleaned.includes("</body>")) {
    cleaned += "\n</body>";
  }
  if (!cleaned.includes("</html>")) {
    cleaned += "\n</html>";
  }
  return cleaned;
}

export default function FinalOutput({
  phases,
  onDownload,
  onStartNew,
}: FinalOutputProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [copiedPhase, setCopiedPhase] = useState<string | null>(null);
  const [deployState, setDeployState] = useState<DeployState>("idle");
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [hasVercelToken, setHasVercelToken] = useState(false);
  const [vercelToken, setVercelToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data: { hasApiKey: boolean; hasVercelToken: boolean }) => {
        setHasVercelToken(data.hasVercelToken);
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const copyContent = async (phaseId: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedPhase(phaseId);
    setTimeout(() => setCopiedPhase(null), 2000);
  };

  const extractFiles = useCallback((): DeployFile[] => {
    const codePhase = phases.find((p) => p.phaseId === "code-generation");
    if (!codePhase) return [];

    const codeContent = codePhase.editedContent ?? codePhase.content;
    const files: DeployFile[] = [];

    // Strategy 1: Try ### FILE: `path` format (with or without closing ```)
    const fileRegex = /###\s*FILE:\s*`(.+?)`\s*\n```[\w]*\n([\s\S]*?)(?:```|$)/g;
    let match;
    while ((match = fileRegex.exec(codeContent)) !== null) {
      const content = match[2].trim();
      if (content.length > 0) {
        files.push({ path: match[1], content });
      }
    }

    if (files.length > 0) return files;

    // Strategy 2: Try any ```html code block
    const htmlBlockRegex = /```html\s*\n([\s\S]*?)(?:```|$)/g;
    while ((match = htmlBlockRegex.exec(codeContent)) !== null) {
      const content = match[1].trim();
      if (content.length > 50 && content.includes("<")) {
        files.push({ path: "index.html", content: closeHtmlIfTruncated(content) });
        return files;
      }
    }

    // Strategy 3: Try any code block at all
    const anyBlockRegex = /```\w*\s*\n([\s\S]*?)(?:```|$)/g;
    while ((match = anyBlockRegex.exec(codeContent)) !== null) {
      const content = match[1].trim();
      if (content.length > 100 && (content.includes("<!DOCTYPE") || content.includes("<html"))) {
        files.push({ path: "index.html", content: closeHtmlIfTruncated(content) });
        return files;
      }
    }

    // Strategy 4: Look for raw HTML in the content itself
    const htmlMatch = codeContent.match(/(<!DOCTYPE[\s\S]*$)/i) ??
                      codeContent.match(/(<html[\s\S]*$)/i);
    if (htmlMatch && htmlMatch[1].length > 100) {
      files.push({ path: "index.html", content: closeHtmlIfTruncated(htmlMatch[1]) });
      return files;
    }

    return files;
  }, [phases]);

  const handleDeploy = useCallback(async () => {
    const files = extractFiles();
    if (files.length === 0) {
      setDeployError(
        "No code files found. The Code Generation phase needs to produce files in the format: ### FILE: `filename`"
      );
      setDeployState("error");
      return;
    }

    setDeployState("deploying");
    setDeployError(null);

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files,
          projectName: "sdlc-generated-app",
          vercelToken: vercelToken || undefined,
        }),
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || data.error) {
        setDeployError(data.error ?? "Deployment failed.");
        setDeployState("error");
        return;
      }

      setDeployUrl(data.url ?? null);
      setDeployState("success");
    } catch {
      setDeployError("Failed to connect to the deployment server.");
      setDeployState("error");
    }
  }, [extractFiles, vercelToken]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Step 8: Deployment Tag */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-5 py-2 text-sm font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400">
          <Globe className="h-4 w-4" />
          STEP 8 — Deployment
        </div>
      </div>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          SDLC Process Complete!
        </h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          All phases have been reviewed and approved. Your application blueprint
          is ready.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-4">
        <button
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <Download className="h-4 w-4" />
          Download All as ZIP
        </button>
        <button
          onClick={handleDeploy}
          disabled={deployState === "deploying"}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {deployState === "deploying" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Rocket className="h-4 w-4" />
          )}
          {deployState === "deploying"
            ? "Deploying..."
            : deployState === "success"
              ? "Deployed!"
              : "Deploy to Vercel"}
        </button>
        <button
          onClick={onStartNew}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <FileText className="h-4 w-4" />
          Start New Project
        </button>
      </div>

      {/* Vercel Token Section */}
      <div className="mb-6 flex justify-center">
        {hasVercelToken ? (
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            Vercel token configured via environment
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <Key className="h-4 w-4" />
              {showTokenInput ? "Hide" : "Set"} Vercel Token
            </button>
            {showTokenInput && (
              <div className="mt-2">
                <input
                  type="password"
                  value={vercelToken}
                  onChange={(e) => setVercelToken(e.target.value)}
                  placeholder="Enter your Vercel API token..."
                  className="w-80 rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <p className="mt-1 text-xs text-zinc-400">
                  Get a token at{" "}
                  <a
                    href="https://vercel.com/account/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:underline"
                  >
                    vercel.com/account/tokens
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deploy Status */}
      {deployState === "success" && deployUrl && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950/50">
          <div className="mb-2 flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
            <Check className="h-5 w-5" />
            <span className="text-lg font-semibold">
              Deployed Successfully!
            </span>
          </div>
          <a
            href={deployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-lg font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {deployUrl}
            <ExternalLink className="h-4 w-4" />
          </a>
          <p className="mt-2 text-sm text-green-600 dark:text-green-500">
            Your application is live! It may take a few seconds for the
            deployment to fully propagate.
          </p>
        </div>
      )}

      {deployState === "error" && deployError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Deployment Failed
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {deployError}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {phases.map((phaseResult) => {
          const phaseDef = SDLC_PHASES.find(
            (p) => p.id === phaseResult.phaseId
          );
          if (!phaseDef) return null;
          const isExpanded = expandedPhases.has(phaseResult.phaseId);
          const content =
            phaseResult.editedContent ?? phaseResult.content;

          return (
            <div
              key={phaseResult.phaseId}
              className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <button
                onClick={() => togglePhase(phaseResult.phaseId)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {phaseDef.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyContent(phaseResult.phaseId, content);
                    }}
                    className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                    title="Copy content"
                  >
                    {copiedPhase === phaseResult.phaseId ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-zinc-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-zinc-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
                  <div className="max-h-[500px] overflow-y-auto">
                    <MarkdownRenderer content={content} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
