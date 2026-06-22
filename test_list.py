import asyncio
from backend.parcle import list_recent_memories
import json

async def main():
    res = await list_recent_memories(10)
    print("Recent memories:")
    for m in res:
        print(m.get("id"), m.get("tag", {}).get("title"), m.get("tag", {}).get("category"))

asyncio.run(main())
