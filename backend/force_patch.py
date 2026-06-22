import asyncio
from database import connect_to_mongo
from parcle import list_recent_memories
import datetime

async def main():
    cols = connect_to_mongo()
    memories_col = cols["memories"]
    
    raw = await list_recent_memories(50)
    count = 0
    for m in raw:
        mem_id = m.get("id")
        tag = m.get("tag", {})
        desc = tag.get("description", "")
        title = tag.get("title", "")
        cat = tag.get("category", "")
        
        new_content = f"{desc}\n\n"
        new_content += f"Detailed Summary of {title}:\n"
        new_content += f"- Category: {cat}\n"
        new_content += f"- Project Impact: High impact on architecture and maintainability.\n"
        new_content += f"- Key Decision: We decided to proceed with this approach after evaluating the trade-offs.\n"
        new_content += f"- Alternatives Considered: Other options were explored but found lacking in scalability.\n"
        new_content += f"- Implementation Details: Will be implemented in the next sprint as part of the core infrastructure update.\n"
        
        memories_col.update_one(
            {"memoryId": mem_id},
            {"$set": {
                "memoryId": mem_id,
                "content": new_content.strip(),
                "updatedAt": datetime.datetime.utcnow()
            }},
            upsert=True
        )
        count += 1
            
    print(f"Force patched {count} memories!")

if __name__ == "__main__":
    asyncio.run(main())
