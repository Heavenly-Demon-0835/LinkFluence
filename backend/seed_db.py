"""
Linkfluence Database Seeder
Run: python seed_db.py

This script seeds the database with sample data for testing.
"""

import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from werkzeug.security import generate_password_hash
from datetime import datetime
import certifi
from dotenv import load_dotenv
import sys

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
            
        client.admin.command('ping')
        print("✅ Connected to MongoDB!")
        
        db = client.get_database('Linkfluence')
        return db
        
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        sys.exit(1)

def seed_data():
    print("🚀 Starting Database Seeding...")
    
    db = get_db_connection()
    
    # Sample Users
    users = [
        {
            "name": "Demo Creator",
            "email": "creator@demo.com",
            "password": generate_password_hash("demo123"),
            "role": "creator",
            "bio": "I create amazing content for brands!",
            "category": "lifestyle",
            "followers_count": 50000,
            "created_at": datetime.utcnow()
        },
        {
            "name": "Demo Business",
            "email": "business@demo.com",
            "password": generate_password_hash("demo123"),
            "role": "business",
            "business_type": "retail",
            "description": "We connect brands with creators",
            "created_at": datetime.utcnow()
        }
    ]
    
    print("\n📂 Seeding users...", end=" ")
    for user in users:
        existing = db.users.find_one({"email": user["email"]})
        if not existing:
            db.users.insert_one(user)
    print(f"✅ Done ({len(users)} users)")
    
    # Get user IDs for campaigns
    creator = db.users.find_one({"email": "creator@demo.com"})
    business = db.users.find_one({"email": "business@demo.com"})
    
    if business:
        # Sample Campaign
        campaign = {
            "business_id": str(business["_id"]),
            "title": "Summer Campaign 2026",
            "description": "Looking for lifestyle creators to promote our summer collection",
            "budget": 5000,
            "status": "active",
            "created_at": datetime.utcnow()
        }
        
        print("📂 Seeding campaigns...", end=" ")
        existing = db.campaigns.find_one({"title": campaign["title"]})
        if not existing:
            db.campaigns.insert_one(campaign)
        print("✅ Done")
    
    print("\n✨ Seeding Complete!")
    print("\nTest Accounts:")
    print("  Creator: creator@demo.com / demo123")
    print("  Business: business@demo.com / demo123")

if __name__ == "__main__":
    seed_data()
