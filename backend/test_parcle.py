import asyncio
from parcle import list_recent_memories

async def main():
    res = await list_recent_memories(1)
    print(res)

asyncio.run(main())
