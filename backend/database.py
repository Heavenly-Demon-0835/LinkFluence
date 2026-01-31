from pymongo import MongoClient
import os
import certifi

_db = None

def get_db():
    global _db
    if _db is None:
        MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/linkfluence")
        print(f"🔌 Connecting to MongoDB (Mode: Insecure Bypass)...")
        
        # Direct Connection with SSL Bypass
        # This has proven to be the only method that works in this environment
        # We skip the "Secure" attempt to save 5s of latency
        client = MongoClient(MONGO_URI, 
                           tls=True,
                           tlsAllowInvalidCertificates=True,
                           serverSelectionTimeoutMS=10000) # 10s timeout
                           
        try:
            # Force a quick check to see if we can talk to the server
            # This triggers the topology discovery immediately
            client.admin.command('ping')
            print("✅ Connected to MongoDB!")
            
            try:
                _db = client.get_database()
            except Exception:
                # Fallback if URI doesn't have db name
                db_name = MongoClient(MONGO_URI).get_default_database().name
                _db = client.get_database(db_name or "linkfluence")
                
        except Exception as e:
            print(f"❌ Connection Failed: {e}")
            raise e

    return _db
