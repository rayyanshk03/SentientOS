from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from fastapi import APIRouter
from parcle import save_memory, query_memory, list_recent_memories

router = APIRouter()

class CreateBugRequest(BaseModel):
    title: str
    rootCause: str
    solution: str
    author: str
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
    sources = await list_recent_memories(limit=limit)
    bugs = []
    
    for s in sources:
        tag = s.get("tag") or {}
        # Look for custom "type:bug" or category "Bug Fix"
        if tag.get("type") == "bug" or tag.get("category") == "Bug Fix":
            title = tag.get("title") or s.get("title") or "Unnamed Bug"
            description = tag.get("description", "A documented bug fix.")
            
            bugs.append({
                "id": s.get("session_id") or s.get("id"),
                "title": title,
                "description": description,
                "timestamp": tag.get("timestamp") or s.get("updated_at") or s.get("created_at"),
                "author": tag.get("author", "Unknown"),
            })
            
    return {"success": True, "data": bugs}

@router.post("/bugs/search")
async def search_bug(req: SearchBugRequest):
    """
    Uses the Parcle search API to find the bug and then Groq LLM to summarize the solution.
    """
    import asyncio
    from agent import call_groq
    
    # 1. Search Parcle for the specific bug query
    search_query = f"Bug fix solution for {req.query}"
    results = await query_memory(search_query)
    
    if not results or not results[0].get("citations"):
        return {"success": True, "answer": f"I couldn't find a past bug fix matching '{req.query}' in the memory bank."}
        
    # 2. Extract context from citations
    context_chunks = []
    for r in results:
        for cit in r.get("citations", []):
            text = cit.get("text", "")
            if text and len(text) > 20:
                context_chunks.append(text)
                
    context_text = "\n\n---\n\n".join(context_chunks[:5]) # Top 5 chunks
    
    # 3. Ask Groq to synthesize the root cause and solution
    system_prompt = """You are an AI engineering assistant. A developer is asking if we have seen a specific bug before.
Use the provided Bug Fix context to summarize the previously documented solution.
Clearly state the Root Cause and the Solution. If there are multiple relevant past bugs, summarize the most relevant ones.
Do not hallucinate; only use the provided context. Keep your response concise, helpful, and direct."""

    prompt = f"Have we seen this bug before: {req.query}\n\nContext from past bugs:\n{context_text}"
    
    try:
        answer = await asyncio.wait_for(
            call_groq(system_prompt, prompt),
            timeout=20.0
        )
        return {"success": True, "answer": answer}
    except Exception as e:
        print(f"[Bug Search] Error: {e}")
        return {"success": False, "error": str(e)}
