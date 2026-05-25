"use client";

import { useState } from "react";
import {
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";
import { SDLC_PHASES } from "@/lib/sdlc-phases";
import { PhaseResult } from "@/lib/types";
import MarkdownRenderer from "./MarkdownRenderer";

interface FinalOutputProps {
  phases: PhaseResult[];
  onDownload: () => void;
  onStartNew: () => void;
}

export default function FinalOutput({
  phases,
  onDownload,
  onStartNew,
}: FinalOutputProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [copiedPhase, setCopiedPhase] = useState<string | null>(null);

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

  return (
    <div className="mx-auto w-full max-w-5xl">
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

      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <Download className="h-4 w-4" />
          Download All as ZIP
        </button>
        <button
          onClick={onStartNew}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          <FileText className="h-4 w-4" />
          Start New Project
        </button>
      </div>

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
