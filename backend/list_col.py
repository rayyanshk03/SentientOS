from database import connect_to_mongo
db = connect_to_mongo()
from pymongo import MongoClient
import os
import certifi
client = MongoClient(os.getenv("MONGODB_URI"), tlsCAFile=certifi.where())
print(client.get_database("sentient_os").list_collection_names())
