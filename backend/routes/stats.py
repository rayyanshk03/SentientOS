from fastapi import APIRouter
from parcle import list_recent_memories

router = APIRouter()

global_stats = {"queriesToday": 0, "decisionsSaved": 0, "lastActive": None}

@router.get("/stats")
async def get_stats():
    memories = await list_recent_memories(100)
    return {
        **global_stats,
        "totalMemories": len(memories)
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

@router.get("/conversations/{project_id}")
async def get_conversations(project_id: str):
    from database import get_collections
    try:
        cols = get_collections()
        if not cols or cols["conversations"] is None:
            return {"error": "MongoDB not connected"}
        docs = list(cols["conversations"].find({"projectId": project_id}, {"_id": 0}).sort("updatedAt", -1).limit(20))
        sessions = []
        for doc in docs:
            msgs = doc.get("messages", [])
            last_msg = msgs[-1].get("content", "")[:100] if msgs else ""
            sessions.append({
                "sessionId": doc.get("sessionId"),
                "messageCount": len(msgs),
                "lastMessagePreview": last_msg,
                "date": doc.get("updatedAt") or doc.get("createdAt")
            })
        return {"sessions": sessions}
    except Exception as e:
        return {"error": str(e)}
