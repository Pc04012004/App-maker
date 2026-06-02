"use client";

import { useState } from "react";
import {
  Check,
  Pencil,
  RotateCcw,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { SDLC_PHASES } from "@/lib/sdlc-phases";
import { PhaseResult } from "@/lib/types";
import MarkdownRenderer from "./MarkdownRenderer";

interface PhasePanelProps {
  currentPhaseIndex: number;
  phaseResult: PhaseResult | undefined;
  isProcessing: boolean;
  error: string | null;
  onGenerate: () => void;
  onApprove: (editedContent?: string) => void;
  onRegenerate: () => void;
  isLastPhase: boolean;
}

export default function PhasePanel({
  currentPhaseIndex,
  phaseResult,
  isProcessing,
  error,
  onGenerate,
  onApprove,
  onRegenerate,
  isLastPhase,
}: PhasePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const phase = SDLC_PHASES[currentPhaseIndex];

  const content = phaseResult?.editedContent ?? phaseResult?.content ?? "";

  const handleStartEdit = () => {
    setEditContent(content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    onApprove(editContent);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent("");
  };

  if (!phaseResult && !isProcessing && !error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 dark:border-zinc-700 dark:bg-zinc-900/50">
        <div className="mb-4 rounded-full bg-indigo-100 p-4 dark:bg-indigo-900/30">
          <ChevronRight className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {phase.name}
        </h3>
        <p className="mb-6 max-w-md text-center text-sm text-zinc-500 dark:text-zinc-400">
          {phase.description}
        </p>
        <button
          onClick={onGenerate}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Generate {phase.name}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {phase.name}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {phaseResult?.approved
              ? "Approved"
              : isProcessing
                ? "Generating..."
                : "Review and approve to continue"}
          </p>
        </div>
        {phaseResult?.approved && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Check className="h-3 w-3" />
            Approved
          </span>
        )}
      </div>

      <div className="p-6">
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              AI is working on {phase.name}...
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              This may take a minute
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Error
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
              <button
                onClick={onGenerate}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-red-700 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <RotateCcw className="h-3 w-3" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {content && !isProcessing && (
          <>
            {isEditing ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="h-[500px] w-full rounded-lg border border-zinc-300 bg-zinc-50 p-4 font-mono text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleSaveEdit}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                    Save & Approve
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="max-h-[600px] overflow-y-auto rounded-lg border border-zinc-100 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <MarkdownRenderer content={content} />
                </div>

                {!phaseResult?.approved && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => onApprove()}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <Check className="h-4 w-4" />
                      {isLastPhase ? "Approve & Finish" : "Approve & Continue"}
                    </button>
                    <button
                      onClick={handleStartEdit}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={onRegenerate}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Regenerate
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
