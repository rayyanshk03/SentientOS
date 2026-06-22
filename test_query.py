import asyncio
from backend.parcle import query_memory

async def main():
    q = "How do we fix the CORS issue?"
    print(f"Querying Parcle with: {q}")
    res = await query_memory(q)
    print("Result:", res)

asyncio.run(main())
