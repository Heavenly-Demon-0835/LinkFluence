from database import get_db
from bson.objectid import ObjectId
from datetime import datetime

class User:
    @staticmethod
    def create_user(data):
        """
        Creates a new user (Creator or Business).
        data: dict containing user details.
        """
        db = get_db()
        data['created_at'] = datetime.utcnow()
        result = db.users.insert_one(data)
        return str(result.inserted_id)

    @staticmethod
    def find_by_email(email):
        db = get_db()
        return db.users.find_one({"email": email})

    @staticmethod
    def find_by_id(user_id):
        db = get_db()
        if not ObjectId.is_valid(user_id):
            return None
        return db.users.find_one({"_id": ObjectId(user_id)})

    @staticmethod
    def update_user(user_id, updates):
        db = get_db()
        db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})

    # Specific to Business
    @staticmethod
    def search_creators(filters):
        """
        Search for creators based on filters (price, industry, etc.)
        """
        db = get_db()
        query = {"role": "creator"}
        
        if "industry" in filters:
            query["industry"] = filters["industry"]
        
        # Example budget filtering (assuming rates are stored in 'pricing')
        # if "max_budget" in filters:
        #    query["pricing.max_rate"] = {"$lte": filters["max_budget"]}
            
        return list(db.users.find(query))
