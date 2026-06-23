import json
import time
import asyncio
from datetime import datetime
from fastapi import APIRouter, Request
from database import get_collections
from parcle import query_memory, save_memory
from agent import call_llm

router = APIRouter()

INVESTIGATION_PROMPT = """You are SentientOS, an elite AI autonomous agent.
Analyze this webhook incident payload. Determine the root cause, severity, and exactly what autonomous actions you would take to resolve it.

Return ONLY a valid JSON object matching exactly this schema, and nothing else:
{
  "category": "String (e.g. Server Crash, Code Bug, Security Alert)",
  "root_cause": "String explaining the core issue",
  "severity": "String (Critical, High, Medium, Low)",
  "confidence_score": 95,
  "resolution_strategy": "String explaining how to fix it",
  "simulated_actions": [
    {
      "action_type": "String (e.g. RestartService, CreatePR)",
      "description": "String describing the action",
      "status": "Success",
      "timestamp": "ISO Date"
    }
  ]
}"""

async def run_autonomous_investigation(platform: str, payload: dict, context_task: str):
    cols = get_collections()
    event_id = f"evt_{int(time.time()*1000)}"
    
    # 1. Save WebhookEvent
    if cols and cols.get("webhook_events") is not None:
        await asyncio.to_thread(cols["webhook_events"].insert_one, {
            "id": event_id,
            "platform": platform,
            "status": "Received",
            "payload": payload,
            "created_at": datetime.utcnow().isoformat()
        })

    # 2. Query Parcle Memory
    print(f"[Ops Center] 🔍 Searching memory for {platform} incident...")
    memories = []
    try:
        memories = await asyncio.wait_for(query_memory(context_task), timeout=15.0)
    except Exception as e:
        print(f"[Ops Center] ⚠️ Memory search failed: {e}")

    memory_hit_score = memories[0]["confidence"] if memories and "confidence" in memories[0] else 0
    memory_context = "\n\n".join([f"Historical Incident: {m['title']}\n{m['content']}" for m in memories[:3]])
    
    prompt = f"{INVESTIGATION_PROMPT}\n\nHistorical Memory Context:\n{memory_context if memory_context else 'None found.'}"

    # 3. AI Analysis
    print(f"[Ops Center] 🧠 Analyzing incident with LLM...")
    response_text, provider = await asyncio.wait_for(call_llm(prompt, f"Incident Payload: {json.dumps(payload)}\nContext: {context_task}"), timeout=60.0)

    try:
        # Try parsing JSON (clean up markdown block if present)
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        analysis = json.loads(clean_text)
    except Exception as e:
        print(f"[Ops Center] ❌ Failed to parse JSON from LLM: {e}\n{response_text}")
        analysis = {
            "category": "Unknown",
            "root_cause": "AI failed to generate structured response.",
            "severity": "Medium",
            "confidence_score": 0,
            "resolution_strategy": "Manual intervention required.",
            "simulated_actions": []
        }

    investigation_id = f"inv_{int(time.time()*1000)}"
    investigation_record = {
        "id": investigation_id,
        "event_id": event_id,
        "category": analysis.get("category", "General"),
        "root_cause": analysis.get("root_cause", "Unknown"),
        "severity": analysis.get("severity", "Medium"),
        "confidence_score": analysis.get("confidence_score", 50),
        "resolution_strategy": analysis.get("resolution_strategy", ""),
        "simulated_actions": analysis.get("simulated_actions", []),
        "memory_hit_score": memory_hit_score,
        "created_at": datetime.utcnow().isoformat(),
        "status": "Resolved"
    }

    # 4. Save Investigation
    if cols and cols.get("investigations") is not None:
        await asyncio.to_thread(cols["investigations"].insert_one, investigation_record)

    # 5. Save Back to Memory
    await save_memory(
        title=f"Resolved {platform} Incident: {investigation_record['category']}",
        content=f"Root Cause: {investigation_record['root_cause']}\nResolution: {investigation_record['resolution_strategy']}",
        category="Bug Fix" if "Bug" in investigation_record['category'] else "General",
        source="ops_center"
    )

    return investigation_record


@router.post("/webhooks/github")
async def github_webhook(request: Request):
    payload = await request.json()
    task = f"GitHub event received: {payload.get('action')} on repository. Please analyze."
    inv = await run_autonomous_investigation("GitHub", payload, task)
    return {"status": "success", "investigation": inv}

@router.post("/webhooks/jira")
async def jira_webhook(request: Request):
    payload = await request.json()
    task = f"Jira ticket updated: {payload.get('issue_key')}. {payload.get('summary')}"
    inv = await run_autonomous_investigation("Jira", payload, task)
    return {"status": "success", "investigation": inv}

@router.post("/webhooks/datadog")
async def datadog_webhook(request: Request):
    payload = await request.json()
    task = f"Datadog Alert: {payload.get('alert_type')}. {payload.get('title')}. Metric spiked."
    inv = await run_autonomous_investigation("Datadog", payload, task)
    return {"status": "success", "investigation": inv}

@router.post("/webhooks/slack")
async def slack_webhook(request: Request):
    payload = await request.json()
    task = f"Slack Incident reported by user: {payload.get('text')}"
    inv = await run_autonomous_investigation("Slack", payload, task)
    return {"status": "success", "investigation": inv}

@router.post("/webhooks/custom")
async def custom_webhook(request: Request):
    payload = await request.json()
    task = "Custom JSON Webhook payload received. Please analyze anomalies."
    inv = await run_autonomous_investigation("Custom", payload, task)
    return {"status": "success", "investigation": inv}

# ─── Data Fetching Routes ─────────────────────────────────────────────────────

@router.get("/webhooks/events")
async def get_events():
    cols = get_collections()
    if not cols or cols.get("webhook_events") is None:
        return {"events": []}
    docs = await asyncio.to_thread(lambda: list(cols["webhook_events"].find({}).sort("created_at", -1).limit(50)))
    for d in docs:
        d["_id"] = str(d["_id"])
    return {"events": docs}

@router.get("/webhooks/investigations")
async def get_investigations():
    cols = get_collections()
    if not cols or cols.get("investigations") is None:
        return {"investigations": []}
    docs = await asyncio.to_thread(lambda: list(cols["investigations"].find({}).sort("created_at", -1).limit(50)))
    for d in docs:
        d["_id"] = str(d["_id"])
    return {"investigations": docs}

@router.get("/webhooks/analytics")
async def get_analytics():
    cols = get_collections()
    if not cols or cols.get("investigations") is None:
        return {}
    
    docs = await asyncio.to_thread(lambda: list(cols["investigations"].find({})))
    total_webhooks = await asyncio.to_thread(cols["webhook_events"].count_documents, {}) if cols.get("webhook_events") is not None else 0
    
    if not docs:
        return {
            "total_webhooks": total_webhooks,
            "investigations_created": 0,
            "resolutions_completed": 0,
            "avg_confidence_score": 0,
            "memory_retrieval_success_rate": 0
        }

    total_inv = len(docs)
    total_conf = sum(d.get("confidence_score", 0) for d in docs)
    memory_hits = sum(1 for d in docs if d.get("memory_hit_score", 0) > 0)

    # Count by platform
    events = await asyncio.to_thread(lambda: list(cols["webhook_events"].find({}))) if cols.get("webhook_events") is not None else []
    platforms = {}
    for e in events:
        p = e.get("platform", "Unknown")
        platforms[p] = platforms.get(p, 0) + 1

    return {
        "total_webhooks": total_webhooks,
        "investigations_created": total_inv,
        "resolutions_completed": total_inv,
        "avg_confidence_score": total_conf / total_inv,
        "memory_retrieval_success_rate": (memory_hits / total_inv) * 100,
        "platforms": platforms
    }
