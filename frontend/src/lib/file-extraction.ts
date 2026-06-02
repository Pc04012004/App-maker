import { GeneratedFile } from "./types";

export function extractFilesFromContent(content: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const seenPaths = new Set<string>();

  const patterns = [
    /###\s*FILE:\s*`(.+?)`\s*\n```(\w*)\n([\s\S]*?)```/g,
    /##\s*FILE:\s*`(.+?)`\s*\n```(\w*)\n([\s\S]*?)```/g,
    /FILE:\s*`(.+?)`\s*\n```(\w*)\n([\s\S]*?)```/g,
    /`(.+?\.(?:html|css|js|jsx|ts|tsx|json|py|java|go|rs|sql|yml|yaml|sh|dockerfile))`\s*\n```(\w*)\n([\s\S]*?)```/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const filePath = match[1].trim();
      const language = match[2] || guessLanguage(filePath);
      const fileContent = match[3];
      if (!seenPaths.has(filePath) && fileContent.trim()) {
        seenPaths.add(filePath);
        files.push({ path: filePath, content: fileContent, language });
      }
    }
  }

  if (files.length === 0) {
    const htmlMatch = content.match(/```html\s*\n([\s\S]*?)```/);
    if (htmlMatch && htmlMatch[1].trim()) {
      files.push({
        path: "index.html",
        content: htmlMatch[1],
        language: "html",
      });
    }
  }

  if (files.length === 0) {
    const doctypeMatch = content.match(
      /(<!DOCTYPE html[\s\S]*?<\/html>)/i
    );
    if (doctypeMatch && doctypeMatch[1].trim()) {
      files.push({
        path: "index.html",
        content: doctypeMatch[1],
        language: "html",
      });
    }
  }

  return files;
}

function guessLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const langMap: Record<string, string> = {
    html: "html",
    css: "css",
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    json: "json",
    py: "python",
    java: "java",
    go: "go",
    rs: "rust",
    sql: "sql",
    yml: "yaml",
    yaml: "yaml",
    sh: "bash",
    dockerfile: "dockerfile",
    md: "markdown",
  };
  return langMap[ext] ?? ext;
}
