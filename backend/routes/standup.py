import json
import httpx
from datetime import datetime, timezone, time as dt_time
from fastapi import APIRouter, Request
from database import get_collections
from parcle import list_recent_memories, save_memory
from agent import call_llm
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class StandupRequest(BaseModel):
    messages: Optional[List[Dict[str, Any]]] = None

router = APIRouter()

@router.post("/standup/today")
async def generate_today_standup(req: StandupRequest):
    # 1. Start of today UTC
    now = datetime.utcnow()
    start_of_day = datetime.combine(now.date(), dt_time.min)
    today_str = now.strftime("%Y-%m-%d")

    # 2. Fetch agent logs
    cols = get_collections()
    logs = []
    if cols and cols.get("agent_logs") is not None:
        # Fetch up to 15 most recent logs for today
        cursor = cols["agent_logs"].find({"createdAt": {"$gte": start_of_day}}).sort("createdAt", -1).limit(15)
        for doc in cursor:
            task = doc.get("task", "")
            resp = doc.get("response", "")
            if len(task) > 200: task = task[:200] + "..."
            if len(resp) > 300: resp = resp[:300] + "..."
            logs.append({
                "task": task,
                "response": resp,
                "persona": doc.get("persona", "")
            })

    # 3. Fetch parcle memories
    recent_memories = await list_recent_memories(limit=100)
    
    # Pre-fetch content for all relevant memories
    content_map = {}
    cols = get_collections()
    if cols and cols.get("memories") is not None:
        mem_ids = [m.get("id") or m.get("session_id") for m in recent_memories]
        mem_docs = cols["memories"].find({"memoryId": {"$in": mem_ids}}, {"memoryId": 1, "content": 1})
        for doc in mem_docs:
            content_map[doc["memoryId"]] = doc.get("content", "")

    # Process only the most recent 10 memories for the day to avoid LLM token rate limits
    memories = []
    today_memories_count = 0
    for m in recent_memories:
        updated = m.get("updated_at") or m.get("tag", {}).get("timestamp", "")
        # Filter for TODAY only
        if updated and updated.startswith(today_str):
            if today_memories_count >= 10:
                break
                
            title = m.get("title") or m.get("tag", {}).get("title", "Decision")
            content = content_map.get(m.get("id") or m.get("session_id"), "")
            
            # Truncate content to 250 chars to prevent massive context payloads
            if len(content) > 250:
                content = content[:250] + "..."
                
            date_str = updated.split("T")[1][:5] if "T" in updated else updated
            memories.append(f"[{date_str}] {title}\n{content}")
            today_memories_count += 1

    if not logs and not memories:
        return {"summary": "No activity recorded today to generate a standup."}

    # 4. Form prompt
    logs_text = json.dumps(logs, indent=2) if logs else "None"
    memories_text = json.dumps(memories, indent=2) if memories else "None"
    
    current_chat_text = ""
    if req.messages:
        # Format the chat messages for context
        formatted_messages = []
        for msg in req.messages:
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')
            formatted_messages.append(f"[{role.upper()}]: {content}")
        current_chat_text = "Current Chat Session:\n" + "\n".join(formatted_messages)

    system_prompt = "You are an AI generating a Daily Standup Summary."
    user_prompt = f"""Based on these agent activities today:
{logs_text}

And these architectural decisions/memories saved:
{memories_text}

{current_chat_text}

Write a concise daily standup summary covering:
- What was worked on
- What decisions were made  
- What bugs were fixed
- What blockers exist
- What's planned next

Format as bullet points under each heading exactly using these emojis:
✅ Completed
🔧 Fixed
📐 Decided
⛔ Blockers
🔜 Next

Do not output any markdown code blocks (like ```markdown), just the text directly."""

    # 5. Call LLM (routes Groq -> Gemini)
    try:
        summary, provider = await call_llm(system_prompt, user_prompt)
    except Exception as e:
        print(f"[Standup] LLM Error: {e}")
        return {"error": "Failed to generate summary.", "details": str(e)}

    # 6. Save to parcle
    today_str = now.strftime("%Y-%m-%d")
    title = f"Standup Summary {today_str}"
    
    session_id = await save_memory(
        title=title,
        content=summary,
        tags=["standup", f"date:{today_str}"]
    )

    if session_id:
        cols = get_collections()
        if cols and cols.get("memories") is not None:
            cols["memories"].update_one(
                {"memoryId": session_id},
                {"$set": {"memoryId": session_id, "content": summary, "updatedAt": datetime.utcnow()}},
                upsert=True
            )

    return {"summary": summary}


@router.get("/standup/history")
async def get_standup_history():
    # Fetch recent memories, filter for tag containing standup
    recent_memories = await list_recent_memories(limit=100)
    standups = []
    cols = get_collections()
    content_map = {}
    if cols and cols.get("memories") is not None:
        mem_ids = [m.get("id") or m.get("session_id") for m in recent_memories]
        mem_docs = cols["memories"].find({"memoryId": {"$in": mem_ids}}, {"memoryId": 1, "content": 1})
        for doc in mem_docs:
            content_map[doc["memoryId"]] = doc.get("content", "")

    for m in recent_memories:
        mem_id = m.get("id") or m.get("session_id")
        has_standup_tag = m.get("tag", {}).get("standup") == "true"
        is_standup_title = "Standup Summary" in m.get("tag", {}).get("title", "")
        
        if has_standup_tag or is_standup_title:
            standups.append({
                "id": mem_id,
                "date": m.get("updated_at") or m.get("tag", {}).get("timestamp", ""),
                "summary": content_map.get(mem_id, "")
            })
            
            if len(standups) >= 7:
                break
                
    return {"standups": standups}
