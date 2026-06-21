from pydantic import BaseModel
from typing import List, Optional, Any

class AgentRequest(BaseModel):
    task: str
    persona: str = "architect"
    projectId: str = "default-project"
    forceOverride: bool = False
    sessionId: Optional[str] = None

class MemoryRequest(BaseModel):
    title: str
    content: str
    tags: List[str] = []

class SearchRequest(BaseModel):
    query: str
    projectId: str = "default-project"

class AgentResponse(BaseModel):
    response: str
    retrievedMemories: List[Any] = []
    memorySaved: bool = False
    conflict: bool = False
