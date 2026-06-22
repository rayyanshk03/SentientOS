import asyncio
from parcle import list_recent_memories

async def test():
    sources = await list_recent_memories(limit=2)
    for s in sources:
        print("ID:", s.get("id") or s.get("session_id"))
        print("KEYS:", s.keys())
        print("TAG:", s.get("tag"))
        print("CONTENT?:", s.get("content"))
        print("---")

asyncio.run(test())
