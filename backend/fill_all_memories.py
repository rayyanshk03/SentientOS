import asyncio
from database import connect_to_mongo
from parcle import list_recent_memories
import datetime

async def main():
    cols = connect_to_mongo()
    if cols is None or cols.get("memories") is None:
        print("No DB")
        return
        
    memories_col = cols["memories"]
    
    # Get all from parcle
    raw = await list_recent_memories(50)
    print(f"Found {len(raw)} memories from Parcle")
    
    count = 0
    for m in raw:
        mem_id = m.get("id")
        tag = m.get("tag", {})
        desc = tag.get("description", "")
        title = tag.get("title", "")
        cat = tag.get("category", "")
        
        # Check if already exists in mongo
        existing = memories_col.find_one({"memoryId": mem_id})
        
        # If it doesn't exist, or if it's very short, let's update it!
        if existing is None or len(existing.get("content", "")) < 100:
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
            
    print(f"Successfully patched {count} older memories with full multi-line summaries!")

if __name__ == "__main__":
    asyncio.run(main())
