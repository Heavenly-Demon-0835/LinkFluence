import os
import json
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId, json_util
import certifi
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

def get_db_connection():
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/linkfluence")
    
    try:
        if "mongodb+srv" in MONGO_URI:
            print("🔌 Connecting to Atlas (Secure Mode)...")
            client = MongoClient(MONGO_URI, 
                               tlsCAFile=certifi.where(),
                               server_api=ServerApi('1'))
        else:
            print("🔌 Connecting to Local DB...")
            client = MongoClient(MONGO_URI)
            
        # Verify connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB!")
        
        # Get database
        try:
            # 1. Try to get database from URI
            db_name = client.get_database().name
            db = client.get_database(db_name)
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
            db = client.get_database(target_db)
             
        return db
        
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        sys.exit(1)

def seed_data():
    print("🚀 Starting Automated Data Seeding...")
    
    db = get_db_connection()
    export_dir = os.path.join(os.path.dirname(__file__), "mongo_export")
    
    if not os.path.exists(export_dir):
        print(f"❌ Export directory not found: {export_dir}")
        return

    # Files to import
    files = [f for f in os.listdir(export_dir) if f.endswith('.json')]
    
    if not files:
        print("⚠️ No JSON files found to import.")
        return

    for filename in files:
        collection_name = filename.replace('.json', '')
        file_path = os.path.join(export_dir, filename)
        
        print(f"\n📂 Processing {collection_name}...", end=" ")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                # Use json_util to handle MongoDB specific types like $oid, $date
                data = json_util.loads(f.read())
                
            if not data:
                print("Skipped (Empty File)")
                continue
                
            collection = db[collection_name]
            
            # Upsert operations to avoid duplicates but ensure data is there
            count = 0
            for doc in data:
                # If _id exists, use it as filter for upsert
                if '_id' in doc:
                    filter_query = {'_id': doc['_id']}
                    collection.replace_one(filter_query, doc, upsert=True)
                    count += 1
                else:
                    # If no _id (unlikely for export), just insert
                    collection.insert_one(doc)
                    count += 1
            
            print(f"✅ Synced {count} documents.")
            
        except Exception as e:
            print(f"❌ Error importing {filename}: {str(e)}")

    print("\n✨ Seeding Complete!")

if __name__ == "__main__":
    seed_data()
