from dotenv import load_dotenv
import os
from pymongo import MongoClient

load_dotenv()

uri = os.getenv("MONGODB_URI")
db_name = os.getenv("MONGODB_DB_NAME")

print("What??")

print("Connecting to:", uri.split("@")[-1] if uri else "MONGODB_URI is not set!")

client = MongoClient(uri, serverSelectionTimeoutMS=8000)

try:
    result = client.admin.command("ping")
    print("✅ Connected successfully:", result)
    print("Database:", db_name)
    print("Collections:", client[db_name].list_collection_names())
except Exception as e:
    print("❌ Connection failed:")
    print(type(e).__name__, "-", e)
