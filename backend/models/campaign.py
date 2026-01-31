from database import get_db
from bson.objectid import ObjectId
from datetime import datetime

class Campaign:
    @staticmethod
    def create(data):
        db = get_db()
        data['created_at'] = datetime.utcnow()
        data['status'] = 'active'
        result = db.campaigns.insert_one(data)
        return str(result.inserted_id)

    @staticmethod
    def find_all(filters=None):
        db = get_db()
        query = filters or {}
        return list(db.campaigns.find(query).sort("created_at", -1))

    @staticmethod
    def find_by_business(business_id):
        db = get_db()
        return list(db.campaigns.find({"business_id": business_id}).sort("created_at", -1))
    
    @staticmethod
    def find_by_id(campaign_id):
        db = get_db()
        if not ObjectId.is_valid(campaign_id):
            return None
        return db.campaigns.find_one({"_id": ObjectId(campaign_id)})
