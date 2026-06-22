import asyncio
import urllib.request
import json
from parcle import get_api_key, BASE_URL, list_recent_memories

async def test():
    sources = await list_recent_memories(limit=1)
    if not sources: return
    sess_id = sources[0].get("id") or sources[0].get("session_id")
    api_key = get_api_key()
    
    url = f"{BASE_URL}/v1/memories/session?session_id={sess_id}"
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {api_key}"},
        method="GET"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print("SESSION DATA KEYS:", data.keys())
            if "messages" in data:
                print("MESSAGES:", data["messages"][:2])
    except Exception as e:
        print("ERROR:", e)

asyncio.run(test())
