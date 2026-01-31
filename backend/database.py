from pymongo import MongoClient
from pymongo.server_api import ServerApi
import os
import certifi

_db = None

def get_db():
    global _db
    if _db is None:
        MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/linkfluence")
        
        # Strategy 1: Try Secure Connection (Certifi + ServerApi)
        if "mongodb+srv" in MONGO_URI:
            try:
                print("🔌 Connecting to Atlas with Secure SSL...")
                client = MongoClient(MONGO_URI, 
                                   tlsCAFile=certifi.where(),
                                   server_api=ServerApi('1'),
                                   serverSelectionTimeoutMS=5000) # 5s timeout for fast failover
                # Force check
                client.admin.command('ping')
                print("✅ Secure Connection Successful")
            except Exception as e:
                print(f"⚠️ Secure Connection Failed: {e}")
                print("🔄 Retrying with Insecure SSL (Bypass)...")
                # Strategy 2: Fallback to Insecure (Bypass)
                client = MongoClient(MONGO_URI, 
                                   tls=True,
                                   tlsAllowInvalidCertificates=True,
                                   serverSelectionTimeoutMS=30000)
        else:
            client = MongoClient(MONGO_URI)

        try:
            _db = client.get_database()
        except Exception:
            try:
                # Try to get database from URI
                db_name = MongoClient(MONGO_URI).get_default_database().name
                _db = client.get_database(db_name)
            except:
                _db = client.get_database("linkfluence")
    return _db
