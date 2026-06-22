import asyncio
from parcle import query_memory

async def test():
    results = await query_memory("Database and Backend Framework Choice")
    for r in results:
        print("ANSWER:", r.get("answer"))
        print("CITATIONS:", r.get("citations"))
        break

asyncio.run(test())
