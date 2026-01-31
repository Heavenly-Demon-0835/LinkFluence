from pymongo import MongoClient
import os

_db = None

def get_db():
    global _db
    if _db is None:
        MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/linkfluence")
        client = MongoClient(MONGO_URI)
        _db = client.get_database()
    return _db
