import asyncio
from backend.parcle import save_memory, query_memory

async def main():
    print("Saving memory...")
    sid = await save_memory("Bug Fix: CORS Error", "Root Cause: Missing origins in FastAPI. Solution: Added http://localhost:5173 to allow_origins", category="Bug Fix")
    print("Saved memory ID:", sid)
    print("Querying memory...")
    res = await query_memory("How do we fix the CORS issue?")
    print("Query result:", res)

asyncio.run(main())
