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
        from pymongo.server_api import ServerApi
        
        # Connect using certifi for valid SSL certificates + ServerApi v1
        atlas_client = MongoClient(atlas_uri, 
                                 tlsCAFile=certifi.where(),
                                 server_api=ServerApi('1'))
                                 
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
        print(f"❌ Failed to connect to Atlas: {e}")
        print("   Tip 1: Whitelist your IP in Atlas Network Access (0.0.0.0/0)")
        print("   Tip 2: Ensure your credentials do not contain unescaped special characters.")
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
