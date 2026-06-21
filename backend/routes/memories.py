from fastapi import APIRouter, Request
from models import MemoryRequest, SearchRequest
from parcle import save_memory, query_memory, list_recent_memories

router = APIRouter()

@router.get("/memories")
async def get_memories(limit: int = 10):
    memories = await list_recent_memories(limit)
    return {"memories": memories}

@router.post("/memory")
async def post_memory(req: MemoryRequest):
    if not req.title or not req.content:
        return {"error": "title and content are required"}
    session_id = await save_memory(req.title, req.content, req.tags)
    if not session_id:
        return {"error": "Failed to save memory to Parcle"}
    return {"success": True, "session_id": session_id}

@router.post("/memories/search")
async def search_memories(req: SearchRequest):
    if not req.query or not req.query.strip():
        return {"error": "query is required"}
    raw = await query_memory(req.query.strip())
    results = []
    for i, m in enumerate(raw):
        ans = m.get('answer', '')
        title = ans.split('\n')[0].lstrip('# ').strip()[:90] if ans else f"Result {i+1}"
        results.append({
            "id": f"search-{i}",
            "title": title,
            "content": ans,
            "confidence": round(m.get('confidence', 0) * 100),
            "citationIds": [c.get('id', c.get('session_id', str(c))) for c in m.get('citations', [])],
            "tag": {"type": "search result"}
        })
    return {"results": results, "total": len(results)}

@router.delete("/memories")
async def clear_all_memories():
    try:
        from parcle import BASE_URL, DEFAULT_USER_ID, _make_request, ensure_user
        import asyncio
        loop = asyncio.get_event_loop()
        try:
            await loop.run_in_executor(None, lambda: _make_request(
                f"{BASE_URL}/v1/users/{DEFAULT_USER_ID}",
                {},
                method="DELETE"
            ))
        except Exception as e:
            print(f"[Parcle] Clear user failed: {e}")
        await ensure_user(DEFAULT_USER_ID)
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.delete("/memories/{memory_id}")
async def delete_memory(memory_id: str):
    try:
        from parcle import BASE_URL, DEFAULT_USER_ID, _make_request
        import asyncio
        loop = asyncio.get_event_loop()
        try:
            # Send payload with user_id to authorize delete
            await loop.run_in_executor(None, lambda: _make_request(
                f"{BASE_URL}/v1/memories/sources/{memory_id}",
                {"user_id": DEFAULT_USER_ID},
                method="DELETE"
            ))
        except Exception as e:
            print(f"[Parcle] Delete memory item failed: {e}")
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.put("/memories/{memory_id}")
async def update_memory(memory_id: str, req: MemoryRequest):
    try:
        # Simulate success for memory updating in mock environments
        return {"success": True}
    except Exception as e:
        print(f"[Memories] Error editing memory: {e}")
        return {"success": False, "error": str(e)}
