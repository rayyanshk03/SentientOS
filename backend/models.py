from pydantic import BaseModel
from typing import List, Optional, Any
from enum import Enum

class MemoryCategory(str, Enum):
    architecture   = "Architecture Decision"
    bug_fix        = "Bug Fix"
    coding_standard = "Coding Standard"
    deployment     = "Deployment History"
    feature        = "Feature Request"
    team           = "Team Discussion"
    documentation  = "Documentation Update"
    general        = "General"

class AgentRequest(BaseModel):
    task: str
    persona: str = "architect"
    projectId: str = "default-project"
    forceOverride: bool = False
    sessionId: Optional[str] = None

class MemoryRequest(BaseModel):
    title: str
    content: str
    description: Optional[str] = None          # Summary / human-readable desc
    category: MemoryCategory = MemoryCategory.general
    source: Optional[str] = "manual"           # manual | agent | upload | standup
    projectId: Optional[str] = "default-project"
    tags: List[str] = []

class MemoryEntry(BaseModel):
    """Full memory entry returned from API responses"""
    id: str
    title: str
    category: str
    description: Optional[str] = None
    content: str
    source: str
    projectId: str
    tags: List[str] = []
    confidence: int = 0
    timestamp: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    projectId: str = "default-project"
    category: Optional[str] = None

class AgentResponse(BaseModel):
    response: str
    retrievedMemories: List[Any] = []
    memorySaved: bool = False
    conflict: bool = False
