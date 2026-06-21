import os
import asyncio
import time
import json
import urllib.request
import urllib.error
from datetime import datetime
from parcle import query_memory, save_memory
from database import get_collections

GROQ_API_URL  = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL    = "llama-3.3-70b-versatile"  # Free, fast, generous quota
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# ─── Groq (primary — free tier, 14,400 req/day) ─────────────────────────────
async def call_groq(system_prompt: str, user_message: str, chat_history: list = None) -> str:
    from dotenv import dotenv_values
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    config   = dotenv_values(env_path)
    api_key  = config.get("GROQ_API_KEY") or os.getenv("GROQ_API_KEY")

    if not api_key or not api_key.strip().startswith("gsk_"):
        raise ValueError("GROQ_API_KEY missing or invalid — add it to your .env file")
    api_key = api_key.strip()

    messages = [{"role": "system", "content": system_prompt}]
    if chat_history:
        for msg in chat_history:
            role = "assistant" if msg.get("role") == "agent" else "user"
            messages.append({"role": role, "content": msg.get("content", "")})
    messages.append({"role": "user", "content": user_message})

    payload = json.dumps({
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": 1024,
        "temperature": 0.7,
    }).encode("utf-8")

    req = urllib.request.Request(
        GROQ_API_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "SentientOS/1.0",
        },
        method="POST"
    )

    loop = asyncio.get_event_loop()
    def do_request():
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))

    try:
        data = await loop.run_in_executor(None, do_request)
        return data["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"[Groq] HTTP {e.code}: {body[:200]}")
        raise Exception(f"Groq API error {e.code}: {body[:300]}")


# ─── Gemini (fallback — multiple model tiers) ────────────────────────────────
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

        if e.code in (429, 400, 403, 500, 503):
            fallbacks = {
                "gemini-2.5-flash":      "gemini-2.0-flash",
                "gemini-2.0-flash":      "gemini-flash-latest",
                "gemini-flash-latest":   "gemini-2.0-flash-lite",
                "gemini-2.0-flash-lite": None
            }
            next_model = fallbacks.get(model_name)
            if next_model:
                print(f"[Gemini] Error {e.code} on {model_name}. Trying {next_model}...")
                return await call_gemini(system_prompt, user_message, chat_history, model_name=next_model)
            else:
                raise Exception(f"Gemini quota exhausted on all models (HTTP {e.code})")

        raise Exception(f"Gemini API error {e.code}: {body[:300]}")


# ─── Smart router: Groq → Gemini → mock ─────────────────────────────────────
async def call_llm(system_prompt: str, user_message: str, chat_history: list = None) -> tuple[str, str]:
    """Returns (response_text, provider_name)"""
    # 1. Try Groq first (free + fast)
    try:
        response = await call_groq(system_prompt, user_message, chat_history)
        return response, "Groq LLaMA 3.3"
    except Exception as groq_err:
        print(f"[LLM] Groq failed: {groq_err}")

    # 2. Fall back to Gemini
    try:
        response = await call_gemini(system_prompt, user_message, chat_history)
        return response, "Gemini"
    except Exception as gemini_err:
        print(f"[LLM] Gemini failed: {gemini_err}")

    # 3. Last resort: informative mock
    mock = (
        "I couldn't reach any AI provider right now.\n\n"
        "**To fix this, add one of these to your `.env` file:**\n\n"
        "**Option A — Groq (recommended, free):**\n"
        "1. Visit [console.groq.com](https://console.groq.com) and sign up (free)\n"
        "2. Go to **API Keys** → Create Key\n"
        "3. Add `GROQ_API_KEY=gsk_...` to your `.env`\n\n"
        "**Option B — Gemini:**\n"
        "1. Visit [aistudio.google.com](https://aistudio.google.com) → Get API Key\n"
        "2. Add `GEMINI_API_KEY=AIza...` to your `.env`\n\n"
        "Restart the backend after updating `.env`."
    )
    return mock, "mock"


async def run_agent(user_task: str, persona: str = 'architect', chat_history: list = None, on_step=None):
    start_time = time.time()
    print('\n═══════════════════════════════════════════')
    print(f"[Agent] 🚀 runAgent started")
    print(f"[Agent] 📝 Task: \"{user_task}\"")
    print('═══════════════════════════════════════════')

    if on_step:
        await on_step('🔍 Querying Parcle memory...')

    query_string = user_task
    task_lower = user_task.lower()
    if any(w in task_lower for w in ["pdf", "upload", "document", "file", "summarize"]):
        try:
            cols = get_collections()
            if cols and cols.get("uploads") is not None:
                recent = cols["uploads"].find_one({}, sort=[("uploadedAt", -1)])
                if recent:
                    filename = recent.get("filename", "")
                    if filename:
                        query_string = f"{user_task} (Context: {filename})"
                        if on_step:
                            await on_step(f'📄 Searching with recent upload: {filename}')
        except Exception:
            pass

    parcle_memories = []
    try:
        parcle_memories = await asyncio.wait_for(query_memory(query_string), timeout=10.0)
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
1. Provide the main response according to the user's task (keep it concise and helpful).
2. AT THE END of every response, you MUST append a "Reasoning Trace" section formatted exactly like this:

### Reasoning Trace
**Memories Retrieved:**
- [List the titles or topics of the context memories you used]

**Reasoning:**
[Explain briefly how these specific memories influenced your generated solution]

Even if no memories were retrieved, include the trace and state that you relied on general knowledge.
ALWAYS include this section."""

    if on_step:
        await on_step('🧠 Calling AI...')

    try:
        agent_response, provider = await asyncio.wait_for(
            call_llm(system_prompt, user_task, chat_history),
            timeout=60.0
        )
        print(f"[Agent] ✅ Response from {provider}")
    except asyncio.TimeoutError:
        raise Exception("AI took too long to respond. Please check your internet connection.")
    except Exception as e:
        print(f"[Agent] ❌ LLM call failed: {e}")
        raise

    if on_step:
        await on_step('💾 Saving decision to Parcle...')

    today = datetime.utcnow().strftime("%Y-%m-%d")
    decision_title = f"{user_task[:77]}..." if len(user_task) > 80 else user_task

    # ── Auto-detect memory category from task keywords ─────────────────────
    task_lower = user_task.lower()
    if any(w in task_lower for w in ["architect", "design", "pattern", "structure", "schema", "database", "api"]):
        auto_category = "Architecture Decision"
    elif any(w in task_lower for w in ["bug", "fix", "error", "crash", "issue", "broken", "debug"]):
        auto_category = "Bug Fix"
    elif any(w in task_lower for w in ["standard", "style", "lint", "format", "convention", "guideline"]):
        auto_category = "Coding Standard"
    elif any(w in task_lower for w in ["deploy", "release", "ci", "cd", "pipeline", "production", "staging"]):
        auto_category = "Deployment History"
    elif any(w in task_lower for w in ["feature", "add", "build", "implement", "create", "new"]):
        auto_category = "Feature Request"
    elif any(w in task_lower for w in ["doc", "readme", "comment", "docstring", "wiki"]):
        auto_category = "Documentation Update"
    elif any(w in task_lower for w in ["team", "review", "discuss", "meeting", "decision", "agree"]):
        auto_category = "Team Discussion"
    else:
        auto_category = "General"

    session_id = None
    try:
        session_id = await asyncio.wait_for(
            save_memory(
                title=decision_title,
                content=agent_response,
                tags=[persona or 'architect', f"date:{today}"],
                category=auto_category,
                source="agent",
                project_id=os.getenv("ENTER_PROJECT_ID", "eternal-architect"),
            ),
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
                "llm": provider,
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
