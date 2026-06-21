import os
import certifi
from pymongo import MongoClient

client = None
db = None
collections = {
    "conversations": None,
    "projects": None,
    "agent_logs": None,
    "uploads": None,
    "users": None,
    "deleted_memories": None
}

def connect_to_mongo():
    global client, db
    uri = os.getenv("MONGODB_URI")
    if not uri:
        print("[MongoDB] ⚠️  MONGODB_URI is not set in .env. MongoDB features disabled.")
        return None

    try:
        client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=2000)
        # Force a connection check so we fail fast if IP is not whitelisted
        client.admin.command('ping')
        db = client.get_database("sentient_os")
        
        collections["conversations"] = db.get_collection("conversations")
        collections["projects"] = db.get_collection("projects")
        collections["agent_logs"] = db.get_collection("agent_logs")
        collections["uploads"] = db.get_collection("uploads")
        collections["users"] = db.get_collection("users")
        collections["deleted_memories"] = db.get_collection("deleted_memories")

        print("[MongoDB] ✅ Connected to MongoDB Atlas (sentient_os)")
        return collections
    except Exception as e:
        print(f"[MongoDB] ❌ Connection error: {e}")
        return None

def get_collections():
    return collections
