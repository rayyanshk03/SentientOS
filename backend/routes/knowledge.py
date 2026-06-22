from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from fastapi import APIRouter
from parcle import save_memory, query_memory, list_recent_memories

router = APIRouter()

class CreateKnowledgeRequest(BaseModel):
    title: str
    category: str  # e.g., 'Coding Standard', 'Team Agreement', 'Deployment Rule'
    content: str
    author: str
    projectId: Optional[str] = "default-project"

class SearchKnowledgeRequest(BaseModel):
    query: str
    projectId: Optional[str] = "default-project"

@router.post("/knowledge")
async def create_knowledge(req: CreateKnowledgeRequest):
    """
    Saves a specific engineering knowledge document to Parcle.
    """
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Format the content into a rich markdown structure
    body = f"""# {req.title}

{req.content}

**Category:** {req.category}
**Author:** {req.author}
**Date:** {date_str}
"""

    session_id = await save_memory(
        title=req.title,
        content=body,
        category=req.category,
        source="knowledge_module",
        project_id=req.projectId,
        tags=[
            "type:knowledge", 
            f"author:{req.author}",
            f"title:{req.title}",
            f"timestamp:{datetime.utcnow().isoformat()}",
            f"description:{req.content[:120]}..."
        ]
    )
    
    if not session_id:
        return {"success": False, "error": "Failed to save Knowledge to Parcle"}
        
    return {
        "success": True,
        "memory_id": session_id,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/knowledge")
async def get_knowledge(limit: int = 50):
    """
    Fetches recent knowledge records from Parcle.
    """
    sources = await list_recent_memories(limit=limit)
    records = []
    
    for s in sources:
        tag = s.get("tag") or {}
        # We look for custom "type:knowledge"
        if tag.get("type") == "knowledge":
            title = tag.get("title") or s.get("title") or "Unnamed Knowledge"
            description = tag.get("description", "")
            
            records.append({
                "id": s.get("session_id") or s.get("id"),
                "title": title,
                "category": tag.get("category", "General"),
                "description": description,
                "timestamp": tag.get("timestamp") or s.get("updated_at") or s.get("created_at"),
                "author": tag.get("author", "Unknown"),
            })
            
    return {"success": True, "data": records}

@router.post("/knowledge/search")
async def search_knowledge(req: SearchKnowledgeRequest):
    """
    A Global RAG endpoint. Searches Parcle memory (with a local DB fallback), then summarizes using Gemini LLM.
    """
    import asyncio
    from agent import call_gemini
    from database import get_collections
    
    context_chunks = []
    
    # 1. Try Parcle semantic search
    try:
        results = await query_memory(req.query)
        if results and results[0].get("citations"):
            for r in results:
                for cit in r.get("citations", []):
                    text = cit.get("text", "")
                    if text and len(text) > 20:
                        context_chunks.append(text)
    except Exception as e:
        print(f"[Knowledge Search] Parcle timed out, falling back to local DB: {e}")
    
    # 2. Fallback to Local DB search if Parcle failed or returned nothing
    if not context_chunks:
        try:
            db_collections = await get_collections()
            if db_collections:
                # Basic text search fallback (case-insensitive regex on title or content)
                import re
                query_regex = re.compile(req.query, re.IGNORECASE)
                cursor = db_collections["sources"].find({
                    "$or": [
                        {"title": query_regex},
                        {"content": query_regex},
                        {"tag.title": query_regex}
                    ]
                }).limit(5)
                
                async for memory in cursor:
                    content = memory.get("content", "")
                    if content:
                        context_chunks.append(content)
        except Exception as db_e:
            print(f"[Knowledge Search] Local DB fallback failed: {db_e}")
            
    if not context_chunks:
        return {"success": True, "answer": "I couldn't find any relevant engineering knowledge in the memory bank."}
                
    context_text = "\n\n---\n\n".join(context_chunks[:7]) # Top 7 chunks
    
    # 3. Ask Gemini to synthesize the answer
    system_prompt = """You are an expert AI engineering assistant. Your team members rely on you to search the project's memory bank (which includes architecture decisions, bugs, and explicit coding standards).
When asked an engineering or architectural question, use the provided context from the memory bank to synthesize a definitive, accurate answer.
- Do not hallucinate external information. Only use the provided context.
- Be direct and list bullet points if appropriate.
- If the context doesn't contain the answer, simply state that it's not documented yet."""

    prompt = f"Question: {req.query}\n\nContext from memory bank:\n{context_text}"
    
    try:
        answer = await asyncio.wait_for(
            call_gemini(system_prompt, prompt),
            timeout=25.0
        )
        return {"success": True, "answer": answer}
    except Exception as e:
        print(f"[Knowledge Search] Error: {e}")
        return {"success": False, "error": str(e)}
