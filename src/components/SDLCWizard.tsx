"use client";

import { useState, useCallback } from "react";
import { SDLC_PHASES } from "@/lib/sdlc-phases";
import { PhaseResult, SDLCRequest, SDLCResponse } from "@/lib/types";
import { extractFilesFromContent } from "@/lib/file-extraction";
import PhaseNavigation from "./PhaseNavigation";
import PhasePanel from "./PhasePanel";
import FinalOutput from "./FinalOutput";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ArrowLeft } from "lucide-react";

interface SDLCWizardProps {
  requirementDocument: string;
  apiKey: string;
  onBack: () => void;
}

const CLIENT_RETRIES = 2;

export default function SDLCWizard({
  requirementDocument,
  apiKey,
  onBack,
}: SDLCWizardProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phases, setPhases] = useState<PhaseResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const generatePhase = useCallback(async () => {
    const phase = SDLC_PHASES[currentPhaseIndex];
    setIsProcessing(true);
    setError(null);

    const approvedPhases = phases.filter((p) => p.approved);

    const requestBody: SDLCRequest = {
      phaseId: phase.id,
      requirementDocument,
      previousPhases: approvedPhases,
      apiKey,
    };

    for (let attempt = 0; attempt <= CLIENT_RETRIES; attempt++) {
      try {
        const response = await fetch("/api/sdlc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const data = (await response.json()) as SDLCResponse;

        if (!response.ok || data.error) {
          if (attempt < CLIENT_RETRIES && response.status >= 500) {
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
            continue;
          }
          setError(data.error ?? "An unexpected error occurred.");
          setIsProcessing(false);
          return;
        }

        if (!data.content || !data.content.trim()) {
          if (attempt < CLIENT_RETRIES) {
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          setError("AI returned an empty response. Please try again.");
          setIsProcessing(false);
          return;
        }

        const newResult: PhaseResult = {
          phaseId: phase.id,
          content: data.content,
          approved: false,
        };

        setPhases((prev) => {
          const existing = prev.findIndex((p) => p.phaseId === phase.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = newResult;
            return updated;
          }
          return [...prev, newResult];
        });

        setIsProcessing(false);
        return;
      } catch {
        if (attempt < CLIENT_RETRIES) {
          await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
          continue;
        }
        setError("Failed to connect to the server. Please try again.");
        setIsProcessing(false);
        return;
      }
    }

    setIsProcessing(false);
  }, [currentPhaseIndex, phases, requirementDocument, apiKey]);

  const approvePhase = useCallback(
    (editedContent?: string) => {
      const phase = SDLC_PHASES[currentPhaseIndex];
      setPhases((prev) =>
        prev.map((p) =>
          p.phaseId === phase.id
            ? {
                ...p,
                approved: true,
                editedContent: editedContent ?? p.editedContent,
              }
            : p
        )
      );

      if (currentPhaseIndex < SDLC_PHASES.length - 1) {
        setCurrentPhaseIndex((prev) => prev + 1);
        setError(null);
      } else {
        setIsComplete(true);
      }
    },
    [currentPhaseIndex]
  );

  const regeneratePhase = useCallback(() => {
    generatePhase();
  }, [generatePhase]);

  const handleDownload = useCallback(async () => {
    const zip = new JSZip();
    const docs = zip.folder("sdlc-output");
    if (!docs) return;

    docs.file(
      "00-requirements.md",
      `# Original Requirements\n\n${requirementDocument}`
    );

    phases.forEach((phaseResult, index) => {
      const phaseDef = SDLC_PHASES.find((p) => p.id === phaseResult.phaseId);
      const content = phaseResult.editedContent ?? phaseResult.content;
      const fileName = `${String(index + 1).padStart(2, "0")}-${phaseResult.phaseId}.md`;
      docs.file(
        fileName,
        `# ${phaseDef?.name ?? phaseResult.phaseId}\n\n${content}`
      );
    });

    const codePhase = phases.find((p) => p.phaseId === "code-generation");
    if (codePhase) {
      const codeContent = codePhase.editedContent ?? codePhase.content;
      const codeFolder = zip.folder("generated-code");
      if (codeFolder) {
        const extractedFiles = extractFilesFromContent(codeContent);
        for (const file of extractedFiles) {
          codeFolder.file(file.path, file.content);
        }
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "sdlc-project-output.zip");
  }, [phases, requirementDocument]);

  const currentPhaseResult = phases.find(
    (p) => p.phaseId === SDLC_PHASES[currentPhaseIndex]?.id
  );

  if (isComplete) {
    return (
      <FinalOutput
        phases={phases}
        onDownload={handleDownload}
        onStartNew={onBack}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <PhaseNavigation
          currentPhaseIndex={currentPhaseIndex}
          phases={phases}
          isProcessing={isProcessing}
        />
      </div>

      <PhasePanel
        currentPhaseIndex={currentPhaseIndex}
        phaseResult={currentPhaseResult}
        isProcessing={isProcessing}
        error={error}
        onGenerate={generatePhase}
        onApprove={approvePhase}
        onRegenerate={regeneratePhase}
        isLastPhase={currentPhaseIndex === SDLC_PHASES.length - 1}
      />
    </div>
  );
}
