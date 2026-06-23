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

# ─── Webhook Integrations Models ──────────────────────────────────────────────

class WebhookEvent(BaseModel):
    id: str
    platform: str
    status: str
    payload: Any
    created_at: str

class ResolutionAction(BaseModel):
    action_type: str
    description: str
    status: str
    timestamp: str

class Investigation(BaseModel):
    id: str
    event_id: str
    category: str
    root_cause: str
    severity: str
    confidence_score: int
    resolution_strategy: str
    simulated_actions: List[ResolutionAction] = []
    memory_hit_score: int = 0
    created_at: str
    status: str

class AnalyticsRecord(BaseModel):
    total_webhooks: int
    investigations_created: int
    resolutions_completed: int
    failed_resolutions: int
    avg_resolution_time_ms: int
    memory_retrieval_success_rate: float
    avg_confidence_score: float
