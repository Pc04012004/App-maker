export interface SDLCPhase {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
}

export interface PhaseResult {
  phaseId: string;
  content: string;
  approved: boolean;
  editedContent?: string;
}

export interface ProjectState {
  requirementDocument: string;
  currentPhaseIndex: number;
  phases: PhaseResult[];
  apiKey: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface SDLCRequest {
  phaseId: string;
  requirementDocument: string;
  previousPhases: PhaseResult[];
  apiKey: string;
}

export interface SDLCResponse {
  content: string;
  error?: string;
}
