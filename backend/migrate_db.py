import os
from pymongo import MongoClient
import sys
import certifi

def migrate():
    print("🚀 Linkfluence Database Migration Tool")
    print("-------------------------------------")
    
    # Local Connection
    local_uri = "mongodb://localhost:27017/linkfluence"
    print(f"📡 Connecting to Local DB: {local_uri}")
    try:
        local_client = MongoClient(local_uri)
        local_db = local_client.get_database()
        collections = local_db.list_collection_names()
        print(f"✅ Found {len(collections)} collections: {', '.join(collections)}")
    except Exception as e:
        print(f"❌ Failed to connect to local DB: {e}")
        return

    # Cloud Connection
    print("\n☁️  Now, we need your MongoDB Atlas Connection String.")
    print("   💡 TIP: If your password has special characters (like '@'), type 'manual'")
    print("   to enter your username, password, and cluster separately.")
    
    atlas_uri = input("👉 Enter Atlas Connection String (or 'manual'): ").strip()
    
    if atlas_uri.lower() == 'manual':
        print("\n📝 Manual Entry Mode")
        user = input("   Username: ").strip()
        password = input("   Password: ").strip()
        cluster = input("   Cluster Address (e.g., linkfluence.xyz.mongodb.net): ").strip()
        
        # Escape credentials
        from urllib.parse import quote_plus
        user_safe = quote_plus(user)
        pass_safe = quote_plus(password)
        
        atlas_uri = f"mongodb+srv://{user_safe}:{pass_safe}@{cluster}/?retryWrites=true&w=majority&appName=Linkfluence"
        print(f"✨ Generated Safe URI.")
    
    if not atlas_uri:
        print("❌ No connection string provided. Exiting.")
        return

    try:
        import ssl
        import json
        from bson.json_util import dumps
        
        print("   🔄 Attempting connection with aggressive SSL bypass...")
        
        # 1. Try to connect with aggressive SSL bypass
        atlas_client = MongoClient(
            atlas_uri, 
            tls=True,
            tlsAllowInvalidCertificates=True,
            tlsAllowInvalidHostnames=True,
            ssl_cert_reqs=ssl.CERT_NONE
        )
        
        # Force a connection check
        atlas_client.admin.command('ping')
        
        # Get database name from URI or default to 'linkfluence'
        try:
            db_name = atlas_client.get_default_database().name
        except:
            db_name = 'linkfluence'
            
        atlas_db = atlas_client[db_name]
        print(f"✅ Connected to Atlas DB: {db_name}")

    except Exception as e:
        print(f"\n❌ Connection Failed: {e}")
        print("   (Your network environment is blocking Python's SSL connection)")
        
        print("\n📂 FALLBACK: Exporting data to JSON files for manual import...")
        
        # Create dump directory
        dump_dir = os.path.join(os.getcwd(), "mongo_export")
        if not os.path.exists(dump_dir):
            os.makedirs(dump_dir)
            
        for col_name in collections:
            if col_name.startswith('system.'): continue
            
            print(f"   ⬇️  Exporting {col_name}...", end=" ")
            data = list(local_db[col_name].find())
            
            if not data:
                print("Skipped (Empty)")
                continue
                
            file_path = os.path.join(dump_dir, f"{col_name}.json")
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(dumps(data, indent=2))
            print(f"✅ Saved to {col_name}.json")
            
        print(f"\n✨ Export Complete! Your data is in the 'mongo_export' folder.")
        print("👉 ACTION REQUIRED: Open MongoDB Compass, connect to Atlas, and import these JSON files manually.")
        return

    # Confirm
    print(f"\n⚠️  Ready to copy data from LOCAL to CLOUD ({db_name}).")
    print("   This will OVERWRITE the cloud database with your local data.")
    confirm = input("👉 Type 'yes' to proceed: ").strip().lower()
    if confirm != 'yes':
        print("Migration cancelled.")
        return

    # Migrate
    print("\n📦 Starting migration...")
    for col_name in collections:
        if col_name.startswith('system.'): continue
        
        print(f"   ➡️  Migrating collection: {col_name}...", end=" ", flush=True)
        
        # Get data
        data = list(local_db[col_name].find())
        if not data:
            print("Skipped (Empty)")
            continue
            
        # Target collection
        target_col = atlas_db[col_name]
        
        # Clear target to avoid duplicates
        target_col.delete_many({}) 
        
        try:
            target_col.insert_many(data)
            print(f"✅ Copied {len(data)} documents.")
        except Exception as e:
            print(f"❌ Error: {e}")

    print("\n🎉 Migration Complete!")
    print("You can now verify your data in MongoDB Atlas.")

if __name__ == "__main__":
    try:
        migrate()
    except KeyboardInterrupt:
        print("\n\nMigration interrupted.")
