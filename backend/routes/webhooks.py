import json
from fastapi import APIRouter, Request
from agent import run_agent

router = APIRouter()

@router.post("/webhooks/github/pr")
async def github_pr_webhook(request: Request):
    """
    Simulates a GitHub PR webhook.
    Receives code diffs, queries Parcle for coding standards,
    and uses the agent to generate an autonomous code review/patch.
    """
    body = await request.json()
    pr_title = body.get("title", "Unknown PR")
    pr_diff = body.get("diff", "")
    
    task = f"CODE REVIEW REQUIRED: A new pull request '{pr_title}' has been submitted. Here is the diff:\n\n{pr_diff}\n\nPlease review this code strictly against our historical Coding Standards and Architecture Decisions. If there are violations, generate a patch or comment."
    
    try:
        # run_agent automatically queries Parcle, runs LLM, and saves the new memory.
        result = await run_agent(task, persona="architect")
        
        return {
            "status": "success",
            "message": "PR reviewed successfully",
            "agent_response": result[0] if isinstance(result, tuple) else getattr(result, 'agent_response', str(result)),
            "memories_used": result[1] if isinstance(result, tuple) and len(result) > 1 else []
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/webhooks/produck/feedback")
async def produck_feedback_webhook(request: Request):
    """
    Simulates the Zero-Sync Debugger (Produck Integration).
    Receives user bug reports, cross-references historical bug fixes in Parcle,
    and autonomously generates a code patch.
    """
    body = await request.json()
    bug_title = body.get("title", "User Feedback")
    bug_desc = body.get("description", "")
    
    task = f"ZERO-SYNC DEBUGGER TRIGGERED: We received user feedback/bug report via Produck: '{bug_title}'. Description: {bug_desc}. Please cross-reference our historical bug fixes and generate an autonomous patch to resolve this."
    
    try:
        result = await run_agent(task, persona="debugger")
        
        return {
            "status": "success",
            "message": "Bug analyzed and patch generated",
            "agent_response": result[0] if isinstance(result, tuple) else getattr(result, 'agent_response', str(result)),
            "memories_used": result[1] if isinstance(result, tuple) and len(result) > 1 else []
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/webhooks/onboarding")
async def onboarding_webhook(request: Request):
    """
    Simulates the Context-Aware Onboarding Bot.
    """
    body = await request.json()
    new_dev = body.get("developer", "New Dev")
    
    task = f"ONBOARDING TRIGGERED: A new developer '{new_dev}' has joined the project. Please ingest the team's entire documentation and past architecture decisions from memory, and spin up a comprehensive 'Getting Started' environment setup guide instantly."
    try:
        result = await run_agent(task, persona="docs")
        return {
            "status": "success",
            "message": "Onboarding Guide Generated",
            "agent_response": result[0] if isinstance(result, tuple) else getattr(result, 'agent_response', str(result))
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/webhooks/server/error")
async def error_log_webhook(request: Request):
    """
    Simulates the Error Log Archivist.
    """
    body = await request.json()
    error_trace = body.get("trace", "")
    
    task = f"ERROR LOG ARCHIVIST: Please categorize and archive this specific server error log into Parcle so it is searchable for future troubleshooting:\n\n{error_trace}"
    try:
        result = await run_agent(task, persona="debugger")
        return {
            "status": "success",
            "message": "Error Log Archived",
            "agent_response": result[0] if isinstance(result, tuple) else getattr(result, 'agent_response', str(result))
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/webhooks/github/push")
async def auto_docs_webhook(request: Request):
    """
    Simulates the Documentation Helper.
    """
    body = await request.json()
    diff = body.get("diff", "")
    
    task = f"DOCUMENTATION HELPER: Code has been pushed. Please watch these code changes and update the project's README.md file accordingly, storing the version history:\n\n{diff}"
    try:
        result = await run_agent(task, persona="docs")
        return {
            "status": "success",
            "message": "Documentation Updated",
            "agent_response": result[0] if isinstance(result, tuple) else getattr(result, 'agent_response', str(result))
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/webhooks/github/cleanup")
async def cleanup_webhook(request: Request):
    """
    Simulates the Repository Cleanup Bot.
    """
    body = await request.json()
    code_file = body.get("file", "")
    
    task = f"CLEANUP BOT: Please identify unused variables or imports in this Enter project file and suggest a cleanup patch:\n\n{code_file}"
    try:
        result = await run_agent(task, persona="architect")
        return {
            "status": "success",
            "message": "Cleanup Patch Suggested",
            "agent_response": result[0] if isinstance(result, tuple) else getattr(result, 'agent_response', str(result))
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
