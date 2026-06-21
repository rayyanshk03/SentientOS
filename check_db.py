import os
import certifi
from pymongo import MongoClient

uri = os.environ.get("MONGODB_URI", "mongodb+srv://Rayyan:rayyan1234@cluster0.fl3tod7.mongodb.net/?appName=Cluster0")
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client.get_database("sentient_os")
cols = db.get_collection("conversations")
docs = list(cols.find({}))
print(f"Total conversations: {len(docs)}")
if docs:
    print(f"Sample conversation keys: {docs[0].keys()}")
    print(f"Sample projectId: {docs[0].get('projectId')}")
