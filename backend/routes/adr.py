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
    Uses the Parcle search API to find the ADR and then Groq LLM to explain it.
    """
    import asyncio
    from agent import call_groq
    
    # 1. Search Parcle for the specific decision
    search_query = f"Architecture decision record regarding {req.query}"
    results = await query_memory(search_query)
    
    if not results or not results[0].get("citations"):
        return {"success": True, "explanation": f"I couldn't find an Architecture Decision Record for '{req.query}' in the memory bank."}
        
    # 2. Extract context from citations
    context_chunks = []
    for r in results:
        for cit in r.get("citations", []):
            text = cit.get("text", "")
            if text and len(text) > 20:
                context_chunks.append(text)
                
    context_text = "\n\n---\n\n".join(context_chunks[:5]) # Top 5 chunks
    
    # 3. Ask Groq to synthesize an explanation
    system_prompt = """You are a Principal Software Engineer explaining an architectural decision to a team member.
Use the provided Architecture Decision Record (ADR) context to explain WHY a specific decision was made.
Focus on the Problem, Chosen Solution, and Reasoning. Do not hallucinate; only use the provided context.
Keep your explanation concise but informative (1-2 paragraphs), and use bullet points if helpful."""

    prompt = f"Explain the architectural decision regarding: {req.query}\n\nContext from ADRs:\n{context_text}"
    
    try:
        explanation = await asyncio.wait_for(
            call_groq(system_prompt, prompt),
            timeout=20.0
        )
        return {"success": True, "explanation": explanation}
    except Exception as e:
        print(f"[ADR Explain] Error: {e}")
        return {"success": False, "error": str(e)}
