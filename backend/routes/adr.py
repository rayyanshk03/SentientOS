from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from fastapi import APIRouter
from parcle import save_memory, query_memory, list_recent_memories

router = APIRouter()

class CreateAdrRequest(BaseModel):
    decisionName: str
    problem: str
    solution: str
    reasoning: str
    alternatives: str
    author: str
    date: Optional[str] = None
    projectId: Optional[str] = "default-project"

class ExplainAdrRequest(BaseModel):
    query: str
    projectId: Optional[str] = "default-project"

@router.post("/adr")
async def create_adr(req: CreateAdrRequest):
    """
    Saves an Architecture Decision Record to Parcle.
    Fields are formatted as markdown so they can be queried and read later.
    """
    decision_date = req.date or datetime.utcnow().strftime("%Y-%m-%d")
    
    # Format the content into a rich markdown structure
    content = f"""# {req.decisionName}

## Problem
{req.problem}

## Chosen Solution
{req.solution}

## Reasoning
{req.reasoning}

## Alternatives Considered
{req.alternatives}

**Author:** {req.author}
**Date:** {decision_date}
"""

    session_id = await save_memory(
        title=req.decisionName,
        content=content,
        category="Architecture Decision Record",
        source="adr_module",
        project_id=req.projectId,
        tags=[
            "type:adr", 
            "decision:true", 
            f"author:{req.author}",
            f"title:{req.decisionName}",
            f"timestamp:{datetime.utcnow().isoformat()}",
            f"description:{req.problem[:120]}..."
        ]
    )
    
    if not session_id:
        return {"success": False, "error": "Failed to save ADR to Parcle"}
        
    return {
        "success": True,
        "memory_id": session_id,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/adr")
async def get_adrs(limit: int = 50):
    """
    Fetches recent ADRs from Parcle by fetching sources and filtering for type:adr.
    """
    sources = await list_recent_memories(limit=limit)
    adrs = []
    
    for s in sources:
        tag = s.get("tag") or {}
        # We look for the custom "type:adr" or category "Architecture Decision Record"
        if tag.get("type") == "adr" or tag.get("category") == "Architecture Decision Record":
            # Extract basic info
            title = tag.get("title") or s.get("title") or "Unnamed Decision"
            description = tag.get("description", "A documented architecture decision.")
            
            adrs.append({
                "id": s.get("session_id") or s.get("id"),
                "title": title,
                "description": description,
                "timestamp": tag.get("timestamp") or s.get("updated_at") or s.get("created_at"),
                "author": tag.get("author", "Unknown"),
            })
            
    return {"success": True, "data": adrs}

@router.post("/adr/explain")
async def explain_adr(req: ExplainAdrRequest):
    """
    Finds the ADR from Parcle, looks up its content in MongoDB, and uses Gemini LLM to explain it.
    """
    import asyncio
    from agent import call_gemini
    from parcle import list_recent_memories
    from database import get_collections
    
    # 1. Search Parcle memories for the specific decision to get the memory ID
    sources = await list_recent_memories(limit=100)
    session_id = None
    for s in sources:
        tag = s.get("tag") or {}
        title = tag.get("title") or s.get("title") or ""
        if title == req.query:
            session_id = s.get("id") or s.get("session_id")
            break
            
    if not session_id:
        return {"success": True, "explanation": f"I couldn't find an Architecture Decision Record for '{req.query}' in the memory bank."}
        
    # 2. Extract context from MongoDB using the session ID
    db_collections = get_collections()
    if not db_collections or "memories" not in db_collections:
        return {"success": False, "error": "Database connection failed or memories collection missing"}

    memory_doc = db_collections["memories"].find_one({"memoryId": session_id})
    context_text = memory_doc.get("content", "") if memory_doc else ""
    
    if not context_text:
        return {"success": True, "explanation": f"The Architecture Decision Record for '{req.query}' has no detailed context."}
    
    # 3. Ask Gemini to synthesize an explanation
    system_prompt = """You are a Principal Software Engineer explaining an architectural decision to a team member.
Use the provided Architecture Decision Record (ADR) context to explain WHY a specific decision was made.
Focus on the Problem, Chosen Solution, and Reasoning. Do not hallucinate; only use the provided context.
Keep your explanation concise but informative (1-2 paragraphs), and use bullet points if helpful."""

    prompt = f"Explain the architectural decision regarding: {req.query}\n\nContext from ADRs:\n{context_text}"
    
    try:
        explanation = await asyncio.wait_for(
            call_gemini(system_prompt, prompt),
            timeout=30.0
        )
        return {"success": True, "explanation": explanation}
    except Exception as e:
        print(f"Error explaining ADR: {e}")
        return {"success": False, "error": str(e)}
