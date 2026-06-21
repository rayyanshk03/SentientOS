import json
import httpx
from datetime import datetime, timezone, time as dt_time
from fastapi import APIRouter, Request
from database import get_collections
from parcle import list_recent_memories, save_memory
from agent import call_gemini

router = APIRouter()

@router.get("/standup/today")
async def generate_today_standup(request: Request):
    # 1. Start of today UTC
    now = datetime.utcnow()
    start_of_day = datetime.combine(now.date(), dt_time.min)

    # 2. Fetch agent logs
    cols = get_collections()
    logs = []
    if cols and cols.get("agent_logs") is not None:
        cursor = cols["agent_logs"].find({"createdAt": {"$gte": start_of_day}})
        for doc in cursor:
            logs.append({
                "task": doc.get("task", ""),
                "response": doc.get("response", ""),
                "persona": doc.get("persona", "")
            })

    # 3. Fetch parcle memories
    memories = []
    recent_memories = await list_recent_memories(limit=100)
    start_iso = start_of_day.isoformat()
    for m in recent_memories:
        updated = m.get("updated_at", "")
        if updated and updated >= start_iso:
            if m.get("tag", {}).get("standup") != "true" and not m.get("content", "").startswith("[Memory] Standup Summary"):
                memories.append(m.get("content", ""))

    if not logs and not memories:
        return {"summary": "No activity recorded today to generate a standup."}

    # 4. Form prompt
    logs_text = json.dumps(logs, indent=2) if logs else "None"
    memories_text = json.dumps(memories, indent=2) if memories else "None"

    system_prompt = "You are an AI generating a Daily Standup Summary."
    user_prompt = f"""Based on these agent activities today:
{logs_text}

And these architectural decisions/memories saved:
{memories_text}

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

    # 5. Call Gemini
    try:
        summary = await call_gemini(system_prompt, user_prompt)
    except Exception as e:
        print(f"[Standup] Gemini Error: {e}")
        return {"error": "Failed to generate summary.", "details": str(e)}

    # 6. Save to parcle
    today_str = now.strftime("%Y-%m-%d")
    title = f"Standup Summary {today_str}"
    
    await save_memory(
        title=title,
        content=summary,
        tags=["standup", f"date:{today_str}"]
    )

    return {"summary": summary}


@router.get("/standup/history")
async def get_standup_history():
    # Fetch recent memories, filter for tag containing standup
    recent_memories = await list_recent_memories(limit=100)
    standups = []
    
    for m in recent_memories:
        # Check if tags include "standup" or title indicates it
        has_standup_tag = m.get("tag", {}).get("standup") == "true"
        # Since memory content from parcle source often includes the title [Memory] ...
        is_standup_title = "[Memory] Standup Summary" in m.get("content", "")
        
        if has_standup_tag or is_standup_title:
            standups.append({
                "id": m.get("id") or m.get("session_id"),
                "date": m.get("updated_at", ""),
                "summary": m.get("content", "")
            })
            
            if len(standups) >= 7:
                break
                
    return {"standups": standups}
