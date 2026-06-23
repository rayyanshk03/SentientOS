import json
import time
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from models import AgentRequest
from agent import run_agent
from database import get_collections

router = APIRouter()

@router.api_route("/agent", methods=["GET", "POST"])
async def agent_endpoint(request: Request):
    if request.method == "GET":
        task = request.query_params.get("task")
        persona = request.query_params.get("persona", "architect")
        project_id = request.query_params.get("projectId", "default-project")
        session_id = request.query_params.get("sessionId", f"sess-{int(time.time()*1000)}")
    else:
        body = await request.json()
        task = body.get("task")
        persona = body.get("persona", "architect")
        project_id = body.get("projectId", "default-project")
        session_id = body.get("sessionId", f"sess-{int(time.time()*1000)}")

    if not task:
        return {"error": "task is required"}

    import asyncio

    async def event_generator():
        q = asyncio.Queue()

        async def on_step(msg: str):
            await q.put(f"event: step\ndata: {json.dumps(msg)}\n\n")

        async def worker():
            try:
                # Retrieve chat history from MongoDB
                chat_history = []
                try:
                    cols = get_collections()
                    if cols and cols["conversations"] is not None:
                        conv = await asyncio.to_thread(cols["conversations"].find_one, {"sessionId": session_id})
                        if conv and "messages" in conv:
                            chat_history = conv["messages"][-10:] # last 10 messages for context
                except Exception as e:
                    print(f"[Server] Failed to fetch chat history: {e}")

                result = await run_agent(
                    user_task=task,
                    persona=persona,
                    chat_history=chat_history,
                    on_step=on_step,
                    project_id=project_id,
                    session_id=session_id
                )
                await q.put(f"event: done\ndata: {json.dumps({'response': result['response'], 'retrievedMemories': result['retrievedMemories'], 'memoriesSaved': True})}\n\n")

                try:
                    cols = get_collections()
                    if cols and cols["conversations"] is not None:
                        await asyncio.to_thread(
                            cols["conversations"].update_one,
                            {"sessionId": session_id},
                            {
                                "$set": {"projectId": project_id, "updatedAt": datetime.utcnow()},
                                "$setOnInsert": {"createdAt": datetime.utcnow()},
                                "$push": {
                                    "messages": {
                                        "$each": [
                                            {"role": "user", "content": task, "timestamp": datetime.utcnow()},
                                            {"role": "agent", "content": result["response"], "timestamp": datetime.utcnow()}
                                        ]
                                    }
                                }
                            },
                            upsert=True
                        )
                except Exception as e:
                    print(f"[Server] Failed to save conversation: {e}")

            except Exception as e:
                print(f"[Server] /api/agent error: {e}")
                await q.put(f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n")
            finally:
                await q.put(None)

        asyncio.create_task(worker())

        while True:
            item = await q.get()
            if item is None:
                break
            yield item

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/conversations/{project_id}")
async def get_conversations(project_id: str):
    try:
        cols = get_collections()
        if not cols or cols["conversations"] is None:
            return {"success": False, "error": "Database not connected"}
        
        import asyncio
        docs = await asyncio.to_thread(lambda: list(cols["conversations"].find({"projectId": project_id}).sort("updatedAt", -1)))
        
        convs = []
        for doc in docs:
            messages = doc.get("messages", [])
            preview = messages[0].get("content", "") if messages else ""
            msg_count = len(messages)
            
            # Format time relatively or pass ISO string
            convs.append({
                "sessionId": doc.get("sessionId"),
                "projectId": doc.get("projectId"),
                "preview": preview[:60] if preview else "Empty conversation",
                "msgCount": msg_count,
                "updatedAt": doc.get("updatedAt", doc.get("createdAt")).isoformat() if doc.get("updatedAt") or doc.get("createdAt") else datetime.utcnow().isoformat()
            })
        return {"conversations": convs}
    except Exception as e:
        print(f"[Conversations] Error fetching list: {e}")
        return {"conversations": [], "error": str(e)}

@router.get("/conversations/session/{session_id}")
async def get_session_messages(session_id: str):
    try:
        cols = get_collections()
        if not cols or cols["conversations"] is None:
            return {"success": False, "error": "Database not connected"}
            
        import asyncio
        doc = await asyncio.to_thread(cols["conversations"].find_one, {"sessionId": session_id})
        
        if doc and "messages" in doc:
            msgs = []
            for m in doc["messages"]:
                msgs.append({
                    "id": m.get("id", str(time.time())),
                    "role": m.get("role"),
                    "content": m.get("content")
                })
            return {"messages": msgs}
        return {"messages": []}
    except Exception as e:
        print(f"[Conversations] Error fetching session: {e}")
        return {"messages": [], "error": str(e)}

@router.get("/projects")
async def get_projects():
    try:
        cols = get_collections()
        if not cols or cols["projects"] is None:
            return {"success": False, "error": "Database not connected"}
            
        import asyncio
        docs = await asyncio.to_thread(lambda: list(cols["projects"].find({}).sort("updatedAt", -1)))
        
        projects = []
        for doc in docs:
            projects.append({
                "id": str(doc.get("_id")) or doc.get("id"),
                "projectId": doc.get("projectId"),
                "name": doc.get("name"),
                "description": doc.get("description"),
                "techStack": doc.get("techStack", []),
                "memoryCount": doc.get("memoryCount", 14),
                "updatedAt": doc.get("updatedAt").isoformat() if doc.get("updatedAt") else datetime.utcnow().isoformat()
            })
        
        # If empty, return mock default
        if not projects:
            default_proj = {
                "id": "sentientos-default",
                "projectId": "SentientOS",
                "name": "SentientOS",
                "description": "AI agent with Parcle memory",
                "techStack": ["React", "Vite", "MongoDB"],
                "memoryCount": 14,
                "updatedAt": datetime.utcnow().isoformat()
            }
            try:
                # Cache it in database
                cols["projects"].insert_one({
                    "projectId": "SentientOS",
                    "name": "SentientOS",
                    "description": "AI agent with Parcle memory",
                    "techStack": ["React", "Vite", "MongoDB"],
                    "memoryCount": 14,
                    "updatedAt": datetime.utcnow()
                })
            except Exception:
                pass
            projects = [default_proj]
            
        return {"projects": projects}
    except Exception as e:
        print(f"[Projects] Error: {e}")
        return {"projects": [], "error": str(e)}

@router.post("/projects")
async def create_project(request: Request):
    try:
        body = await request.json()
        name = body.get("name")
        description = body.get("description", "")
        tech_stack = body.get("techStack", [])
        
        if not name:
            return {"error": "name is required"}
            
        project_id = name.lower().replace(" ", "-")
        
        cols = get_collections()
        if cols and cols["projects"] is not None:
            import asyncio
            new_proj = {
                "projectId": project_id,
                "name": name,
                "description": description,
                "techStack": tech_stack,
                "memoryCount": 0,
                "updatedAt": datetime.utcnow()
            }
            await asyncio.to_thread(cols["projects"].insert_one, new_proj)
            return {"success": True, "projectId": project_id}
        return {"error": "database unavailable"}
    except Exception as e:
        print(f"[Projects] Error creating: {e}")
        return {"error": str(e)}
