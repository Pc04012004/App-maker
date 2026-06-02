from typing import List, Optional

from pydantic import BaseModel, Field


class PhaseResult(BaseModel):
    phaseId: str
    content: str
    approved: bool = False
    editedContent: Optional[str] = None


class SDLCRequest(BaseModel):
    phaseId: str
    requirementDocument: str
    previousPhases: List[PhaseResult] = Field(default_factory=list)
    apiKey: Optional[str] = None


class SDLCResponse(BaseModel):
    content: str
    error: Optional[str] = None


class DeployFile(BaseModel):
    path: str
    content: str


class DeployRequest(BaseModel):
    files: List[DeployFile]
    projectName: str
    vercelToken: Optional[str] = None


class DeployResponse(BaseModel):
    url: str
    deploymentId: str
    readyState: str
