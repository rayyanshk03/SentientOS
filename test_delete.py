import asyncio
from backend.parcle import list_recent_memories, _make_request, BASE_URL, DEFAULT_USER_ID

async def main():
    memories = await list_recent_memories(2)
    if not memories:
        print("No memories to delete")
        return
    mem = memories[0]
    mem_id = mem.get("id")
    print("Trying to delete memory ID:", mem_id)
    try:
        res = _make_request(f"{BASE_URL}/v1/users/{DEFAULT_USER_ID}/sessions/{mem_id}", {}, method="DELETE")
        print("Delete using session path result:", res)
    except Exception as e:
        print("Delete using session path failed:", e)
        try:
            res = _make_request(f"{BASE_URL}/v1/memories/sources/{mem_id}", {"user_id": DEFAULT_USER_ID}, method="DELETE")
            print("Delete using sources path result:", res)
        except Exception as e2:
            print("Delete using sources path failed:", e2)

asyncio.run(main())
