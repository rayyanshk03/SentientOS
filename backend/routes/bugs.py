from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from fastapi import APIRouter
from parcle import save_memory, query_memory, list_recent_memories

router = APIRouter()

class CreateBugRequest(BaseModel):
    title: str
    rootCause: Optional[str] = ""
    solution: str
    author: Optional[str] = "Unknown"
    date: Optional[str] = None
    projectId: Optional[str] = "default-project"

class SearchBugRequest(BaseModel):
    query: str
    projectId: Optional[str] = "default-project"

@router.post("/bugs")
async def create_bug(req: CreateBugRequest):
    """
    Saves a Bug Fix Record to Parcle.
    Fields are formatted as markdown so they can be queried and read later.
    """
    bug_date = req.date or datetime.utcnow().strftime("%Y-%m-%d")
    
    # Format the content into a rich markdown structure
    content = f"""# Bug: {req.title}

## Root Cause
{req.rootCause}

## Solution
{req.solution}

**Resolved By:** {req.author}
**Date:** {bug_date}
"""

    session_id = await save_memory(
        title=req.title,
        content=content,
        category="Bug Fix",
        source="bug_module",
        project_id=req.projectId,
        tags=[
            "type:bug", 
            f"author:{req.author}",
            f"title:{req.title}",
            f"timestamp:{datetime.utcnow().isoformat()}",
            f"description:{req.rootCause[:120]}..."
        ]
    )
    
    if not session_id:
        return {"success": False, "error": "Failed to save Bug Fix to Parcle"}
        
    return {
        "success": True,
        "memory_id": session_id,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/bugs")
async def get_bugs(limit: int = 50):
    """
    Fetches recent bugs from Parcle by fetching sources and filtering for type:bug.
    """
    from database import get_collections
    sources = await list_recent_memories(limit=limit)
    
    deleted_ids = set()
    cols = get_collections()
    if cols and cols.get("deleted_memories") is not None:
        deleted_docs = cols["deleted_memories"].find({}, {"memoryId": 1})
        deleted_ids = {doc["memoryId"] for doc in deleted_docs}
        
    bugs = []
    
    for s in sources:
        memory_id = s.get("session_id") or s.get("id")
        if memory_id in deleted_ids:
            continue
            
        tag = s.get("tag") or {}
        # Filter out Demo Data
        if tag.get("author") == "Demo Script":
            continue

        # Look for custom "type:bug" or category "Bug Fix"
        if tag.get("type") == "bug" or tag.get("category") == "Bug Fix":
            title = tag.get("title") or s.get("title") or "Unnamed Bug"
            description = tag.get("description", "A documented bug fix.")
            
            content = ""
            if cols and "memories" in cols:
                import asyncio
                doc = await asyncio.to_thread(cols["memories"].find_one, {"memoryId": memory_id})
                if doc:
                    content = doc.get("content", "")
            
            bugs.append({
                "id": memory_id,
                "title": title,
                "description": description,
                "content": content,
                "timestamp": tag.get("timestamp") or s.get("updated_at") or s.get("created_at"),
                "author": tag.get("author", "Unknown"),
            })
            
    return {"success": True, "data": bugs}

@router.post("/bugs/search")
async def search_bug(req: SearchBugRequest):
    """
    Finds the bug locally in MongoDB and uses Gemini LLM to summarize the solution.
    """
    import asyncio
    from agent import call_gemini
    from database import get_collections
    
    # 1. Search local DB for the specific bug
    db_collections = await get_collections()
    if not db_collections:
        return {"success": False, "error": "Database connection failed"}
        
    memory = await db_collections["sources"].find_one({"title": req.query})
    
    if not memory:
        # Fallback to checking tag.title
        memory = await db_collections["sources"].find_one({"tag.title": req.query})
        
    if not memory:
        return {"success": True, "answer": f"I couldn't find a Bug Fix record for '{req.query}' in the memory bank."}
        
    # 2. Extract context
    context_text = memory.get("content", "")
    
    if not context_text:
        return {"success": True, "answer": f"The Bug Fix record for '{req.query}' has no detailed context."}
    
    # 3. Ask Gemini to summarize
    system_prompt = """You are a Senior Debugging Assistant explaining a past bug fix to a teammate.
Use the provided context to explain what caused the bug and how it was resolved.
Do not hallucinate; only use the provided context.
Keep your explanation concise but informative, highlighting the root cause and the fix."""

    prompt = f"Summarize the solution for this bug: {req.query}\n\nContext:\n{context_text}"
    
    try:
        answer = await asyncio.wait_for(
            call_gemini(system_prompt, prompt),
            timeout=20.0
        )
        return {"success": True, "answer": answer}
    except Exception as e:
        print(f"[Bug Search] Error: {e}")
        return {"success": False, "error": str(e)}
