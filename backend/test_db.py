import os
import sys
from dotenv import load_dotenv

load_dotenv("../.env")

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from database import connect_to_mongo, get_collections

connect_to_mongo()
cols = get_collections()

if cols and cols.get("memories") is not None:
    docs = list(cols["memories"].find({}).limit(5))
    print(f"Found {len(docs)} memories.")
    for doc in docs:
        print(f"MemoryId: {doc.get('memoryId')}")
        print("Keys:", doc.keys())
        print("Content sample:", repr(doc.get("content", ""))[:100])
        print("---")
else:
    print("Failed to get memories collection")
