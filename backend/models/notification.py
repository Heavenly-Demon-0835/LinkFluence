from database import get_db
from bson.objectid import ObjectId
from datetime import datetime

class Notification:
    @staticmethod
    def create(data):
        db = get_db()
        data['created_at'] = datetime.utcnow()
        data['read'] = False
        result = db.notifications.insert_one(data)
        return str(result.inserted_id)

    @staticmethod
    def find_for_user(user_id):
        db = get_db()
        return list(db.notifications.find({"user_id": user_id}).sort("created_at", -1).limit(50))

    @staticmethod
    def mark_as_read(notification_id):
        db = get_db()
        if not ObjectId.is_valid(notification_id):
            return False
        db.notifications.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"read": True}}
        )
        return True

    @staticmethod
    def count_unread(user_id):
        db = get_db()
        return db.notifications.count_documents({"user_id": user_id, "read": False})
