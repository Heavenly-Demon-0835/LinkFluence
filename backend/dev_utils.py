"""
Development Utilities for Linkfluence Backend
Run: python dev_utils.py

Available commands:
  python dev_utils.py status   - Show database contents
  python dev_utils.py clear    - Clear all database data
  python dev_utils.py test     - Test API endpoints
"""

import sys
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/linkfluence")


def get_db():
    client = MongoClient(MONGO_URI)
    return client.get_database()


def show_status():
    """Show database contents"""
    print(f"Connecting to: {MONGO_URI}")
    db = get_db()
    
    print("\n=== USERS ===")
    users = list(db.users.find())
    print(f"Total: {len(users)}")
    for u in users:
        print(f"  - {u.get('name')} ({u.get('email')}) - {u.get('role')}")
    
    print("\n=== CAMPAIGNS ===")
    campaigns = list(db.campaigns.find())
    print(f"Total: {len(campaigns)}")
    for c in campaigns:
        print(f"  - {c.get('title')} (Applicants: {len(c.get('applicants', []))})")
    
    print("\n=== NOTIFICATIONS ===")
    notifications = list(db.notifications.find())
    print(f"Total: {len(notifications)}")


def clear_database():
    """Clear all data from database"""
    print(f"Connecting to: {MONGO_URI}")
    db = get_db()
    
    confirm = input("Are you sure you want to clear ALL data? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Aborted.")
        return
    
    collections = db.list_collection_names()
    print(f"\nClearing {len(collections)} collections...")
    
    for coll in collections:
        count = db[coll].count_documents({})
        db[coll].delete_many({})
        print(f"  [OK] Cleared '{coll}' - {count} documents")
    
    print("\n[SUCCESS] Database cleared!")


def test_api():
    """Test API endpoints"""
    try:
        import requests
    except ImportError:
        print("requests library not installed. Run: pip install requests")
        return
    
    BASE = "http://127.0.0.1:5000"
    
    print("Testing API endpoints...\n")
    
    try:
        # Test root
        r = requests.get(f"{BASE}/", timeout=5)
        print(f"1. Root: {r.status_code} - {r.json().get('status', 'unknown')}")
        
        # Test campaigns
        r = requests.get(f"{BASE}/api/campaigns", timeout=5)
        print(f"2. Campaigns: {r.status_code} - {len(r.json())} campaigns")
        
        # CORS check
        cors = r.headers.get('Access-Control-Allow-Origin', 'NOT SET')
        print(f"3. CORS Header: {cors}")
        
        print("\n[SUCCESS] API is working!")
        
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to API. Is the backend running?")


def show_help():
    print(__doc__)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        show_help()
        sys.exit(0)
    
    command = sys.argv[1].lower()
    
    if command == 'status':
        show_status()
    elif command == 'clear':
        clear_database()
    elif command == 'test':
        test_api()
    else:
        print(f"Unknown command: {command}")
        show_help()
