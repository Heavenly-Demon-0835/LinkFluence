from pymongo import MongoClient
from pymongo.server_api import ServerApi
import os
import certifi

_db = None

def get_db():
    global _db
    if _db is None:
        MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/linkfluence")
        
        # Standard, Secure Connection
        # We use certifi to ensure we have the latest root certificates
        # We use ServerApi('1') to ensure compatibility with Atlas
        if "mongodb+srv" in MONGO_URI:
            print("🔌 Connecting to Atlas (Secure Mode)...")
            client = MongoClient(MONGO_URI, 
                               tlsCAFile=certifi.where(),
                               server_api=ServerApi('1'))
        else:
            print("🔌 Connecting to Local DB...")
            client = MongoClient(MONGO_URI)

        try:
            # Force a connection check
            client.admin.command('ping')
            print("✅ Connected to MongoDB!")
            
            try:
                # 1. Try to get database from URI
                db_name_from_uri = client.get_database().name
                _db = client.get_database(db_name_from_uri)
            except:
                # 2. Fallback: Check if 'linkfluence' exists in any case
                target_db = 'linkfluence'
                try:
                    existing_dbs = client.list_database_names()
                    for db_name in existing_dbs:
                        if db_name.lower() == target_db.lower():
                            target_db = db_name
                            break
                except:
                    pass
                
                print(f"⚠️ Using database: '{target_db}'")
                _db = client.get_database(target_db)
                
        except Exception as e:
            print(f"❌ Connection Failed: {e}")
            raise e

    return _db
