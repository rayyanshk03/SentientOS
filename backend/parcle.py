import os
import json
import asyncio
import urllib.request
import urllib.error
from datetime import datetime

BASE_URL = 'https://api.parcle.ai'
DEFAULT_USER_ID = os.getenv("ENTER_PROJECT_ID", "eternal-architect")

def get_api_key():
    from dotenv import dotenv_values
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    config = dotenv_values(env_path)
    api_key = config.get("PARCLE_API_KEY") or os.getenv("PARCLE_API_KEY")
    if not api_key:
        raise ValueError("PARCLE_API_KEY is not set in environment variables.")
    return api_key.strip()

def _make_request(url, payload, method="POST"):
    """Synchronous urllib helper — call via run_in_executor for async use."""
    api_key = get_api_key()
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/111.0"
        },
        method=method
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

async def ensure_user(user_id: str):
    loop = asyncio.get_event_loop()
    try:
        await loop.run_in_executor(None, lambda: _make_request(
            f"{BASE_URL}/v1/users",
            {"user_id": user_id, "name": "Eternal Architect Agent", "timezone": "UTC"}
        ))
    except Exception:
        pass  # Ignore 409 or other errors

async def save_memory(
    title: str,
    content: str,
    tags: list = None,
    category: str = "General",
    source: str = "agent",
    project_id: str = None,
    description: str = None
):
    """Save a memory to Parcle with full metadata schema."""
    if tags is None:
        tags = []

    timestamp = datetime.utcnow().isoformat() + "Z"
    project_name = project_id or os.getenv("ENTER_PROJECT_ID", "eternal-architect")

    print(f"[Parcle] 💾 saveMemory → title=\"{title}\" category={category} source={source}")

    try:
        await ensure_user(DEFAULT_USER_ID)

        # Build rich tag object with all required metadata fields
        tag_object = {
            "project": project_name,
            "timestamp": timestamp,
            "category": category,
            "source": source,
            "decision": "true",
            "architect": "true",
            "title": title[:200]
        }

        if description:
            tag_object["description"] = description[:200]  # Parcle tag value limit

        for t in tags:
            if isinstance(t, str) and ':' in t:
                k, v = t.split(':', 1)
                tag_object[k.strip()] = v.strip()
            elif isinstance(t, str):
                tag_object[t] = "true"
            elif isinstance(t, dict):
                tag_object.update(t)

        payload = {
            "user_id": DEFAULT_USER_ID,
            "messages": [
                {"role": "user",      "content": f"[{category}] {title}"},
                {"role": "assistant", "content": content}
            ],
            "tag": tag_object
        }

        loop = asyncio.get_event_loop()
        data = await loop.run_in_executor(
            None,
            lambda: _make_request(f"{BASE_URL}/v1/memories/ingest_dialog", payload)
        )
        session_id = data.get("session_id")
        print(f"[Parcle] ✅ Memory saved → session_id={session_id} category={category}")
        return session_id
    except Exception as e:
        print(f"[Parcle] ❌ save_memory failed: {e}")
        return None

async def query_memory(natural_language_query: str):
    print(f"[Parcle] 🔍 queryMemory → \"{natural_language_query}\"")
    try:
        loop = asyncio.get_event_loop()

        api_key = get_api_key()
        payload = json.dumps({
            "user_id": DEFAULT_USER_ID,
            "query": natural_language_query
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{BASE_URL}/v1/memories/search",
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "Accept": "text/event-stream",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/111.0"
            },
            method="POST"
        )

        def do_query():
            with urllib.request.urlopen(req, timeout=20) as resp:
                body = resp.read().decode("utf-8")
            return body

        body = await loop.run_in_executor(None, do_query)

        lines = body.splitlines()
        seen_final = False
        final_data = None
        for line in lines:
            line = line.strip()
            if line == "event: final":
                seen_final = True
                continue
            if seen_final and line.startswith("data:"):
                try:
                    final_data = json.loads(line[5:].strip())
                except Exception:
                    pass
                break

        if not final_data:
            print("[Parcle] No final event found in search response.")
            return []

        print(f"[Parcle] ✅ queryMemory result → confidence={final_data.get('confidence')} citations={len(final_data.get('citations', []))}")

        results = [{
            "query":      natural_language_query,
            "answer":     final_data.get("answer"),
            "confidence": final_data.get("confidence"),
            "citations":  final_data.get("citations", [])
        }]

        citations = final_data.get("citations", [])
        if len(citations) > 1:
            extras = [{
                "query":      natural_language_query,
                "answer":     final_data.get("answer"),
                "confidence": final_data.get("confidence"),
                "citations":  [c]
            } for c in citations[1:5]]
            results.extend(extras)

        return results[:5]
    except Exception as e:
        print(f"[Parcle] ❌ queryMemory failed: {e}")
        raise

async def list_recent_memories(limit: int = 10):
    print(f"[Parcle] 📋 listRecentMemories → limit={limit}")
    try:
        loop = asyncio.get_event_loop()
        data = await loop.run_in_executor(None, lambda: _make_request(
            f"{BASE_URL}/v1/memories/sources",
            {"user_id": DEFAULT_USER_ID, "type": "session", "order": "desc", "limit": limit, "page": 1}
        ))
        sources = data.get("sources", [])
        sources.sort(key=lambda x: x.get("updated_at") or "", reverse=True)
        return sources
    except Exception as e:
        print(f"[Parcle] ❌ list_recent_memories failed: {e}")
        return []
