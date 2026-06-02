"use client";

import {
  ClipboardList,
  Layout,
  Cpu,
  ListTodo,
  Code,
  TestTube,
  Rocket,
  Check,
  Loader2,
} from "lucide-react";
import { SDLC_PHASES } from "@/lib/sdlc-phases";
import { PhaseResult } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardList,
  Layout,
  Cpu,
  ListTodo,
  Code,
  TestTube,
  Rocket,
};

interface PhaseNavigationProps {
  currentPhaseIndex: number;
  phases: PhaseResult[];
  isProcessing: boolean;
  onSelectPhase?: (phaseIndex: number) => void;
}

export default function PhaseNavigation({
  currentPhaseIndex,
  phases,
  isProcessing,
  onSelectPhase,
}: PhaseNavigationProps) {
  return (
    <nav className="w-full overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1 p-1">
        {SDLC_PHASES.map((phase, index) => {
          const Icon = ICON_MAP[phase.icon] ?? ClipboardList;
          const phaseResult = phases.find((p) => p.phaseId === phase.id);
          const isActive = index === currentPhaseIndex;
          const isCompleted = phaseResult?.approved;
          const isCurrent = isActive && isProcessing;
          const isSelectable =
            Boolean(onSelectPhase) && (Boolean(phaseResult) || index <= currentPhaseIndex);

          let statusClasses =
            "border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500";
          if (isCompleted) {
            statusClasses =
              "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400";
          } else if (isActive) {
            statusClasses =
              "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-400";
          }

          return (
            <li key={phase.id} className="flex items-center">
              <button
                type="button"
                onClick={() => onSelectPhase?.(index)}
                disabled={!isSelectable}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  isSelectable ? "cursor-pointer hover:shadow-sm" : "cursor-default"
                } ${statusClasses}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {isCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </span>
                <span className="hidden whitespace-nowrap sm:inline">
                  {phase.name}
                </span>
              </button>
              {index < SDLC_PHASES.length - 1 && (
                <div
                  className={`mx-1 h-px w-4 ${
                    isCompleted
                      ? "bg-green-300 dark:bg-green-700"
                      : "bg-zinc-200 dark:bg-zinc-700"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
