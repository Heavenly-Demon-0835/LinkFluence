from dotenv import load_dotenv
from database import get_db
from werkzeug.security import check_password_hash
import sys
import os

# Ensure we can import from local modules
sys.path.append(os.getcwd())

load_dotenv()

def check_user():
    try:
        print("Starting debug check...")
        db = get_db()
        email = "testuser2@test.com"
        print(f"Looking for user: {email}")
        
        user = db.users.find_one({"email": email})
        
        if not user:
            print(f"❌ User '{email}' NOT FOUND in database.")
            # Let's list all users to see what's there
            print("Current users:")
            users = list(db.users.find({}, {"email": 1, "role": 1}))
            if not users:
                print(" - (No users found in database)")
            for u in users:
                print(f" - {u.get('email')} ({u.get('role')})")
            return

        print(f"✅ User '{email}' FOUND.")
        print(f"Role: {user.get('role')}")
        
        stored_password = user.get('password')
        if not stored_password:
            print("❌ No password field found for user.")
            return

        plain_password = "test222"
        if check_password_hash(stored_password, plain_password):
            print(f"✅ Password '{plain_password}' MATCHES hash.")
        else:
            print(f"❌ Password '{plain_password}' DOES NOT MATCH hash.")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_user()
