import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv("MONGODB_URI"))
db = client.get_database()
conv = db.conversations.find_one({}, sort=[("updatedAt", -1)])
if conv:
    print(f"Session: {conv.get('sessionId')}")
    print(json.dumps(conv.get("messages", []), indent=2))
else:
    print("No conversations found")
