from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from fastapi import APIRouter, Request
from models import MemoryRequest, SearchRequest, MemoryCategory
from parcle import save_memory, query_memory, list_recent_memories

router = APIRouter()

# ─── Extract request schema ──────────────────────────────────────────────────
class ExtractRequest(BaseModel):
    userMessage: str
    agentResponse: str
    projectId: Optional[str] = "default-project"
    autoSave: Optional[bool] = False

# ─── All 7 memory categories ────────────────────────────────────────────────
CATEGORIES = [
    {"id": "architecture",    "label": "Architecture Decision",  "icon": "🏗️",  "color": "#0071E3"},
    {"id": "bug_fix",         "label": "Bug Fix",                "icon": "🐛",  "color": "#FF3B30"},
    {"id": "coding_standard", "label": "Coding Standard",        "icon": "📐",  "color": "#AF52DE"},
    {"id": "deployment",      "label": "Deployment History",     "icon": "🚀",  "color": "#FF9500"},
    {"id": "feature",         "label": "Feature Request",        "icon": "✨",  "color": "#34C759"},
    {"id": "team",            "label": "Team Discussion",        "icon": "💬",  "color": "#5AC8FA"},
    {"id": "documentation",   "label": "Documentation Update",   "icon": "📄",  "color": "#8E8E93"},
]

def _enrich_memory(raw: dict, idx: int = 0) -> dict:
    """Normalise a raw Parcle source into our full MemoryEntry schema."""
    tag = raw.get("tag") or {}
    category = tag.get("category", "General")
    cat_info = next((c for c in CATEGORIES if c["label"] == category), None)
    return {
        "id":          raw.get("id", f"mem-{idx}"),
        "title":       tag.get("title", f"Memory {idx + 1}"),
        "category":    category,
        "categoryIcon": cat_info["icon"] if cat_info else "🧠",
        "categoryColor": cat_info["color"] if cat_info else "#6E6E73",
        "description": tag.get("description", ""),
        "source":      tag.get("source", "agent"),
        "projectId":   tag.get("project", "default-project"),
        "tags":        [k for k, v in tag.items()
                        if k not in ("category","source","project","timestamp","description","decision","architect")
                        and v == "true"],
        "confidence":  int(float(tag.get("confidence", 0))),
        "timestamp":   raw.get("updated_at") or raw.get("tag", {}).get("timestamp", datetime.utcnow().isoformat()),
        "type":        raw.get("type", "session"),
    }


# ── GET /api/memory/categories ───────────────────────────────────────────────
@router.get("/memory/categories")
async def get_categories():
    """Return all 7 memory categories with metadata."""
    return {"categories": CATEGORIES, "total": len(CATEGORIES)}


# ── GET /api/memory/history  (alias: GET /api/memories) ─────────────────────
@router.get("/memory/history")
@router.get("/memories")
async def get_memory_history(limit: int = 50):
    """Full history of stored memories with enriched schema, excluding soft-deleted ones."""
    from database import get_collections
    raw = await list_recent_memories(limit)
    
    deleted_ids = set()
    cols = get_collections()
    if cols and cols.get("deleted_memories") is not None:
        deleted_docs = cols["deleted_memories"].find({}, {"memoryId": 1})
        deleted_ids = {doc["memoryId"] for doc in deleted_docs}
        
    enriched = []
    for i, m in enumerate(raw):
        mem = _enrich_memory(m, i)
        if mem["id"] not in deleted_ids:
            enriched.append(mem)
            
    return {"memories": enriched, "total": len(enriched)}


# ── POST /api/memory/save  (alias: POST /api/memory) ────────────────────────
@router.post("/memory/save")
@router.post("/memory")
async def save_memory_endpoint(req: MemoryRequest):
    """Save a new memory entry with full schema validation."""
    if not req.title or not req.content:
        return {"error": "title and content are required"}

    session_id = await save_memory(
        title=req.title,
        content=req.content,
        tags=req.tags,
        category=req.category.value,
        source=req.source or "manual",
        project_id=req.projectId or "default-project",
        description=req.description,
    )

    if not session_id:
        return {"error": "Failed to save memory to Parcle"}

    return {
        "success":    True,
        "memory_id":  session_id,
        "session_id": session_id,
        "title":      req.title,
        "category":   req.category.value,
        "source":     req.source,
        "projectId":  req.projectId,
        "timestamp":  datetime.utcnow().isoformat() + "Z",
    }


# ── POST /api/memories/search ────────────────────────────────────────────────
@router.post("/memories/search")
async def search_memories(req: SearchRequest):
    """Semantic search across Parcle memory."""
    from database import get_collections
    if not req.query or not req.query.strip():
        return {"error": "query is required"}

    raw = await query_memory(req.query.strip())
    
    deleted_ids = set()
    cols = get_collections()
    if cols and cols.get("deleted_memories") is not None:
        deleted_docs = cols["deleted_memories"].find({}, {"memoryId": 1})
        deleted_ids = {doc["memoryId"] for doc in deleted_docs}

    results = []
    for i, m in enumerate(raw):
        citations = m.get("citations", [])
        citation_ids = [c.get("id", c.get("session_id", str(c))) for c in citations]
        
        # If the primary citation is deleted, skip this result
        if citation_ids and citation_ids[0] in deleted_ids:
            continue
            
        ans  = m.get("answer", "")
        title = ans.split("\n")[0].lstrip("# ").strip()[:90] if ans else f"Result {i + 1}"
        cat = "General"
        source = "agent"
        if citations:
            first_tag = citations[0].get("tag", {})
            cat = first_tag.get("category", "General")
            source = first_tag.get("source", "agent")
        cat_info = next((c for c in CATEGORIES if c["label"] == cat), None)
        results.append({
            "id":           f"search-{i}",
            "title":        title,
            "category":     cat,
            "categoryIcon": cat_info["icon"] if cat_info else "🧠",
            "source":       source,
            "content":      ans,
            "confidence":   round(m.get("confidence", 0) * 100),
            "citationIds":  citation_ids,
            "timestamp":    citations[0].get("updated_at") if citations else datetime.utcnow().isoformat(),
        })
    return {"results": results, "total": len(results)}


# ── DELETE /api/memories ─────────────────────────────────────────────────────
@router.delete("/memories")
async def clear_all_memories():
    try:
        from parcle import BASE_URL, DEFAULT_USER_ID, _make_request, ensure_user
        import asyncio
        loop = asyncio.get_event_loop()
        try:
            await loop.run_in_executor(None, lambda: _make_request(
                f"{BASE_URL}/v1/users/{DEFAULT_USER_ID}", {}, method="DELETE"
            ))
        except Exception as e:
            print(f"[Parcle] Clear user failed: {e}")
        await ensure_user(DEFAULT_USER_ID)
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ── DELETE /api/memories/{memory_id} ────────────────────────────────────────
@router.delete("/memories/{memory_id}")
async def delete_memory(memory_id: str):
    from database import get_collections
    try:
        cols = get_collections()
        if cols and cols.get("deleted_memories") is not None:
            # Soft delete by inserting into deleted_memories collection
            cols["deleted_memories"].update_one(
                {"memoryId": memory_id},
                {"$set": {"memoryId": memory_id, "deletedAt": datetime.utcnow()}},
                upsert=True
            )
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ── PUT /api/memories/{memory_id} ───────────────────────────────────────────
@router.put("/memories/{memory_id}")
async def update_memory(memory_id: str, req: MemoryRequest):
    return {"success": True, "memory_id": memory_id}


# ══════════════════════════════════════════════════════════════════════════════
#  POST /api/memory/extract  — Intelligent memory extraction engine
#  Analyzes a conversation and decides whether it should be saved,
#  what category it belongs to, and extracts a clean title + content.
# ══════════════════════════════════════════════════════════════════════════════
EXTRACTION_SYSTEM_PROMPT = """You are a memory extraction engine for a software engineering AI assistant.

Analyze the user + assistant conversation and decide if it contains information worth permanently storing.

SAVE if ANY of the following are present:
- Technical decisions (frameworks, languages, databases, tools chosen)
- Bug fixes (what was broken and how it was resolved)
- Coding conventions, patterns, or style standards agreed upon
- Database schema or technology choices
- API design decisions (REST, GraphQL, endpoints, auth strategy)
- Deployment changes or CI/CD pipeline decisions
- Team agreements on architecture or approach
- Feature specifications that were confirmed

DO NOT SAVE if the conversation is:
- A simple greeting, thank you, or chitchat
- A generic question with a textbook answer (not project-specific)
- Already obvious or trivial boilerplate

Respond ONLY with valid JSON in this EXACT format (no extra text, no markdown fences):
{
  "should_save": true,
  "confidence": 0.92,
  "category": "Architecture Decision",
  "title": "Short descriptive title under 60 chars",
  "content": "Structured summary of the key decision or information to remember. Use bullet points if there are multiple facts.",
  "reason": "One-sentence explanation of why this is or isn't worth saving."
}

Category must be EXACTLY one of: Architecture Decision, Bug Fix, Coding Standard, Deployment History, Feature Request, Team Discussion, Documentation Update"""


@router.post("/memory/extract")
async def extract_memory(req: ExtractRequest):
    """
    Intelligent memory extraction: analyzes a conversation turn and returns
    a structured memory preview. If autoSave=true, saves it immediately.
    """
    import asyncio, json, re
    from agent import call_groq

    conversation = f"User: {req.userMessage}\n\nAssistant: {req.agentResponse[:1200]}"

    extraction = {
        "should_save": False,
        "confidence": 0,
        "category": "General",
        "title": "",
        "content": "",
        "reason": "Could not analyze conversation."
    }

    try:
        raw = await asyncio.wait_for(
            call_groq(EXTRACTION_SYSTEM_PROMPT, conversation),
            timeout=20.0
        )
        # Strip markdown fences if LLM wrapped in ```json...```
        cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", raw).strip()
        json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            extraction = parsed
    except Exception as e:
        print(f"[Memory Extract] Failed: {e}")
        extraction["reason"] = f"Extraction failed: {str(e)[:100]}"

    # Find the category metadata (icon + color)
    cat_info = next((c for c in CATEGORIES if c["label"] == extraction.get("category")), None)
    extraction["categoryIcon"]  = cat_info["icon"]  if cat_info else "🧠"
    extraction["categoryColor"] = cat_info["color"] if cat_info else "#6E6E73"
    extraction["timestamp"]     = datetime.utcnow().isoformat() + "Z"

    session_id = None
    if req.autoSave and extraction.get("should_save"):
        try:
            # Map category label → enum key
            cat_key_map = {c["label"]: c["id"] for c in CATEGORIES}
            cat_key = cat_key_map.get(extraction.get("category", ""), "general")
            session_id = await asyncio.wait_for(
                save_memory(
                    title=extraction.get("title", req.userMessage[:60]),
                    content=extraction.get("content", req.agentResponse[:800]),
                    category=extraction.get("category", "General"),
                    source="agent",
                    project_id=req.projectId,
                ),
                timeout=10.0
            )
            extraction["saved"]      = True
            extraction["session_id"] = session_id
        except Exception as e:
            print(f"[Memory Extract] Auto-save failed: {e}")
            extraction["saved"] = False
    else:
        extraction["saved"] = False

    return extraction


# ── POST /api/memory/save-confirmed ──────────────────────────────────────────
# Called when user clicks "Save" on the preview modal
class SaveConfirmedRequest(BaseModel):
    title: str
    content: str
    category: str
    projectId: Optional[str] = "default-project"
    source: Optional[str] = "manual"
    tags: list = []

@router.post("/memory/save-confirmed")
async def save_confirmed_memory(req: SaveConfirmedRequest):
    """Save a user-confirmed memory extraction."""
    session_id = await save_memory(
        title=req.title,
        content=req.content,
        category=req.category,
        source=req.source,
        project_id=req.projectId,
        tags=req.tags,
    )
    if not session_id:
        return {"success": False, "error": "Failed to save to Parcle"}
    return {
        "success":   True,
        "memory_id": session_id,
        "category":  req.category,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
