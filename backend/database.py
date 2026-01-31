from pymongo import MongoClient
from pymongo.server_api import ServerApi
import os
import certifi

_db = None

def get_db():
    global _db
    if _db is None:
        MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/linkfluence")
        
        # Use certifi for SSL certificates + ServerApi v1 for robust cloud connection
        # Only apply TLS settings if connected to Atlas (srv)
        if "mongodb+srv" in MONGO_URI:
            client = MongoClient(MONGO_URI, 
                               tlsCAFile=certifi.where(),
                               server_api=ServerApi('1'))
        else:
            client = MongoClient(MONGO_URI)

        try:
            _db = client.get_database()
        except Exception:
            _db = client.get_database("linkfluence")
    return _db
