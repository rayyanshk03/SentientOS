import asyncio
from parcle import list_recent_memories
from database import connect_to_mongo
from datetime import datetime

async def main():
    cols = connect_to_mongo()
    del_col = cols["deleted_memories"]
    raw = await list_recent_memories(100)
    count = 0
    for i, m in enumerate(raw):
        tag = m.get("tag", {})
        title = tag.get("title", f"Memory {i + 1}")
        if title.startswith("Memory "):
            try:
                num = int(title.replace("Memory ", "").strip())
                if 22 <= num <= 48:
                    mem_id = m.get("id")
                    del_col.update_one(
                        {"memoryId": mem_id},
                        {"$set": {"memoryId": mem_id, "deletedAt": datetime.utcnow()}},
                        upsert=True
                    )
                    count += 1
            except ValueError:
                pass
    print("Deleted", count)

if __name__ == "__main__":
    asyncio.run(main())
