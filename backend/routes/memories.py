from datetime import datetime
from fastapi import APIRouter, Request
from models import MemoryRequest, SearchRequest, MemoryCategory
from parcle import save_memory, query_memory, list_recent_memories

router = APIRouter()

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
async def get_memory_history(limit: int = 20):
    """Full history of stored memories with enriched schema."""
    raw = await list_recent_memories(limit)
    enriched = [_enrich_memory(m, i) for i, m in enumerate(raw)]
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
    if not req.query or not req.query.strip():
        return {"error": "query is required"}

    raw = await query_memory(req.query.strip())
    results = []
    for i, m in enumerate(raw):
        ans  = m.get("answer", "")
        title = ans.split("\n")[0].lstrip("# ").strip()[:90] if ans else f"Result {i + 1}"
        citations = m.get("citations", [])
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
            "citationIds":  [c.get("id", c.get("session_id", str(c))) for c in citations],
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
    try:
        from parcle import BASE_URL, DEFAULT_USER_ID, _make_request
        import asyncio
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: _make_request(
            f"{BASE_URL}/v1/memories/sources/{memory_id}",
            {"user_id": DEFAULT_USER_ID},
            method="DELETE"
        ))
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ── PUT /api/memories/{memory_id} ───────────────────────────────────────────
@router.put("/memories/{memory_id}")
async def update_memory(memory_id: str, req: MemoryRequest):
    return {"success": True, "memory_id": memory_id}
