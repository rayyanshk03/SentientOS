import asyncio
from dotenv import load_dotenv
load_dotenv('../.env')

from database import connect_to_mongo, get_collections

async def test():
    cols = connect_to_mongo()
    if not cols:
        print("COLS IS NONE")
        return
    memories_col = cols.get("memories")
    if memories_col is not None:
        doc = memories_col.find_one()
        if doc:
            print("KEYS:", doc.keys())
            print("SAMPLE:", doc)
        else:
            print("No docs in memories")
    else:
        print("No memories col")

asyncio.run(test())
