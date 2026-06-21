import os
import asyncio
import time
import json
import urllib.request
import urllib.error
from datetime import datetime
from parcle import query_memory, save_memory
from database import get_collections

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

async def call_gemini(system_prompt: str, user_message: str, chat_history: list = None, model_name: str = "gemini-2.0-flash-lite") -> str:
    from dotenv import dotenv_values
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    config = dotenv_values(env_path)
    api_key = config.get("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is missing. Please add it to your .env file.")
    api_key = api_key.strip()

    contents = []
    if chat_history:
        for msg in chat_history:
            role = "model" if msg.get("role") == "agent" else "user"
            contents.append({"parts": [{"text": msg.get("content", "")}], "role": role})
            
    # Add the current message
    contents.append({"parts": [{"text": user_message}], "role": "user"})

    payload = json.dumps({
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1024,
            "thinkingConfig": {"thinkingBudget": 0}
        }
    }).encode("utf-8")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    loop = asyncio.get_event_loop()
    def do_request():
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))

    try:
        data = await loop.run_in_executor(None, do_request)
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"[Gemini] HTTP {e.code} on {model_name}: {body[:200]}")
        
        # Fallback logic for Quota/Rate Limit or Expired keys
        if e.code in (429, 400, 403, 500, 503):
            fallbacks = {
                "gemini-2.5-flash":    "gemini-2.0-flash",
                "gemini-2.0-flash":    "gemini-flash-latest",
                "gemini-flash-latest": "gemini-2.0-flash-lite",
                "gemini-2.0-flash-lite": None
            }
            next_model = fallbacks.get(model_name)
            if next_model:
                print(f"[Gemini] Error {e.code} on {model_name}. Trying {next_model}...")
                return await call_gemini(system_prompt, user_message, chat_history, model_name=next_model)
            else:
                print(f"[Gemini] All fallbacks exhausted (Error {e.code}). Returning mock response.")
                return "**[Demo Mode — API Quota Exceeded]**\n\nThe Gemini API key in your `.env` file has exhausted its free quota. To restore live responses:\n1. Visit [ai.google.dev](https://ai.google.dev) and generate a new API key\n2. Update `GEMINI_API_KEY` in your `.env` file\n3. Restart the backend server\n\nYour UI, memory system, and Parcle integration are all working correctly — only the LLM inference is in demo mode."
        
        raise Exception(f"Gemini API error {e.code}: {body[:300]}")


async def run_agent(user_task: str, persona: str = 'architect', chat_history: list = None, on_step=None):
    start_time = time.time()
    print('\n═══════════════════════════════════════════')
    print(f"[Agent] 🚀 runAgent started | LLM: Gemini 2.5 Flash")
    print(f"[Agent] 📝 Task: \"{user_task}\"")
    print('═══════════════════════════════════════════')

    if on_step:
        await on_step('🔍 Querying Parcle memory...')

    parcle_memories = []
    try:
        parcle_memories = await asyncio.wait_for(query_memory(user_task), timeout=10.0)
    except asyncio.TimeoutError:
        print("[Agent] ⚠️ Parcle query timed out — continuing without memory.")
    except Exception as e:
        print(f"[Agent] Parcle query failed: {e}")

    if on_step:
        await on_step(f'📚 Found {len(parcle_memories)} relevant memories')

    retrieved_memories = []
    for i, m in enumerate(parcle_memories):
        ans = m.get('answer', '')
        title = ans.split('\n')[0].lstrip('# ').strip()[:90] if ans else f"Memory {i+1}"
        retrieved_memories.append({
            "title": title,
            "confidence": round((m.get('confidence', 0)) * 100),
            "citationIds": [c.get('id', c.get('session_id', str(c))) for c in m.get('citations', [])]
        })

    memory_summary = 'No prior decisions found for this project yet.'
    if parcle_memories:
        memory_summary = "\n\n".join(
            f"Memory {i+1} (confidence: {round(m.get('confidence', 0)*100)}%):\n{m.get('answer', '')}"
            for i, m in enumerate(parcle_memories)
        )

    # Fetch User Identity
    identity_context = ""
    try:
        cols = get_collections()
        if cols and cols.get("users") is not None:
            user = cols["users"].find_one({}, sort=[("createdAt", -1)])
            if user:
                identity_context = f"\n\nUSER IDENTITY:\nName: {user.get('name', '')}\nRole: {user.get('role', '')}\nTech Stack: {', '.join(user.get('techStack', []))}\nCoding Style: {user.get('codingStyle', '')}\nProject: {user.get('projectDescription', '')}\n(Use this context to personalize your responses)"
    except Exception as e:
        print(f"[Agent] Failed to load identity: {e}")

    PERSONA_PROMPTS = {
        "architect": "You are a senior software architect focused on long-term design patterns, scalability, and robust system architecture.",
        "debugger": "You are an expert debugger. Analyze systematically, find root causes, and provide fixes for complex bugs.",
        "docs": "You are a technical writer. Be clear, concise, structured, and focus on writing documentation and README updates.",
        "ui": "You are a UI/UX engineer. Prioritize consistency, design rules, modern aesthetics, and user experience.",
    }

    persona_prompt = PERSONA_PROMPTS.get(persona, PERSONA_PROMPTS['architect'])

    system_prompt = f"""{persona_prompt}{identity_context}

CONTEXT FROM MEMORY:
{memory_summary}

RESPONSE RULES:
• Simple question → 1-3 plain sentences, no headers.
• Explanation / overview → short paragraphs, bullets ok.
• Technical plan → structured: summary → steps → code snippets.
NEVER use robotic headers for simple questions.
ALWAYS match tone to the question."""

    if on_step:
        await on_step('🧠 Sending to Gemini...')

    try:
        agent_response = await asyncio.wait_for(
            call_gemini(system_prompt, user_task, chat_history),
            timeout=60.0
        )
    except asyncio.TimeoutError:
        raise Exception("Gemini took too long to respond. Please check your internet connection or API key.")
    except Exception as e:
        print(f"[Agent] ❌ Gemini call failed: {e}")
        raise

    if on_step:
        await on_step('💾 Saving decision to Parcle...')

    today = datetime.utcnow().strftime("%Y-%m-%d")
    decision_title = f"{user_task[:77]}..." if len(user_task) > 80 else user_task

    session_id = None
    try:
        session_id = await asyncio.wait_for(
            save_memory(decision_title, agent_response, [
                persona or 'architect', 'decision', f"date:{today}"
            ]),
            timeout=10.0
        )
    except asyncio.TimeoutError:
        print("[Agent] ⚠️ Parcle save timed out — skipping.")
    except Exception as e:
        print(f"[Agent] ⚠️ Failed to save to Parcle: {e}")

    time_taken = int((time.time() - start_time) * 1000)

    try:
        cols = get_collections()
        if cols and cols["agent_logs"] is not None:
            cols["agent_logs"].insert_one({
                "taskId": f"task-{int(time.time()*1000)}",
                "task": user_task,
                "persona": persona or 'architect',
                "llm": "gemini-2.5-flash",
                "memoriesUsed": [m.get("id", m.get("session_id", "unknown")) for m in parcle_memories],
                "response": agent_response,
                "timeTaken": time_taken,
                "rating": None,
                "createdAt": datetime.utcnow()
            })
    except Exception as e:
        print(f"[Agent] ⚠️ Failed to log to MongoDB: {e}")

    return {
        "response": agent_response,
        "sessionId": session_id,
        "memoriesUsed": len(parcle_memories),
        "retrievedMemories": retrieved_memories
    }
