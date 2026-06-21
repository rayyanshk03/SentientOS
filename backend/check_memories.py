import asyncio
from parcle import list_recent_memories
from database import get_collections

async def main():
    memories = await list_recent_memories(100)
    print("Memories count:", len(memories))
    if len(memories) > 0:
        print("Sample:", memories[0])
        
    cols = get_collections()
    if cols and cols["conversations"]:
        convos = list(cols["conversations"].find({}))
        queries = sum(len(c.get("messages", [])) // 2 for c in convos) # approx user queries
        print("Queries:", queries)

asyncio.run(main())
