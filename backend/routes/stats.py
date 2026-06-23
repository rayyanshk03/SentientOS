from fastapi import APIRouter
from parcle import list_recent_memories

router = APIRouter()



from datetime import datetime, timedelta

@router.get("/stats")
async def get_stats():
    from database import get_collections
    raw_memories = await list_recent_memories(100) # Fetch up to 100 to avoid Parcle API 422 limit error
    cols = get_collections()
    
    deleted_ids = set()
    if cols and cols.get("deleted_memories") is not None:
        deleted_docs = cols["deleted_memories"].find({}, {"memoryId": 1})
        deleted_ids = {doc["memoryId"] for doc in deleted_docs}
        
    memories = [m for m in raw_memories if m.get("id") not in deleted_ids]
    
    # 1. Total Memories
    total_memories = len(memories)
    
    # 2. Decisions Ingested
    decisions_saved = 0
    for m in memories:
        tag = m.get("tag", {})
        if tag.get("type") == "adr" or tag.get("category") == "Architecture Decision Record":
            decisions_saved += 1
            
    # 3. Queries Contextualized & Agent Latency
    queries_today = 0
    avg_response = 0.0
    if cols and cols.get("agent_logs") is not None:
        agent_logs = list(cols["agent_logs"].find({}, {"timeTaken": 1, "createdAt": 1}))
        queries_today = len(agent_logs)
        if queries_today > 0:
            total_time_ms = sum(log.get("timeTaken", 0) for log in agent_logs)
            avg_response = round((total_time_ms / queries_today) / 1000, 1)

    # 4. Ingestion Growth (Last 24 Hours, 6 buckets of 4 hours)
    hourly_growth = [0] * 6
    now = datetime.utcnow()
    
    for m in memories:
        ts_str = m.get("updated_at") or m.get("created_at")
        if not ts_str:
            continue
        try:
            # Parse ISO 8601 (e.g. "2024-05-18T10:30:00Z" or "2024-05-18T10:30:00.123Z")
            ts_str = ts_str.replace("Z", "+00:00")
            dt = datetime.fromisoformat(ts_str).replace(tzinfo=None)
            diff_hours = (now - dt).total_seconds() / 3600
            if diff_hours < 24:
                bucket_idx = 5 - int(diff_hours // 4)
                if 0 <= bucket_idx <= 5:
                    hourly_growth[bucket_idx] += 1
        except Exception:
            pass

    return {
        "totalMemories": total_memories,
        "queriesToday": queries_today,
        "decisionsSaved": decisions_saved,
        "avgResponseTime": avg_response,
        "hourlyGrowth": hourly_growth,
        "mongoConnected": cols is not None and cols.get("projects") is not None,
        "parcleOnline": type(memories) is list
    }

@router.get("/projects")
async def get_projects():
    from database import get_collections
    try:
        cols = get_collections()
        if not cols or cols["projects"] is None:
            return {"error": "MongoDB not connected"}
        docs = list(cols["projects"].find({}, {"_id": 0}))
        return {"projects": docs}
    except Exception as e:
        return {"error": str(e)}


