from database import get_db
from datetime import datetime
from bson.objectid import ObjectId

class Message:
    @staticmethod
    def send(data):
        db = get_db()
        data['timestamp'] = datetime.utcnow()
        result = db.messages.insert_one(data)
        return str(result.inserted_id)

    @staticmethod
    def get_conversation(campaign_id, creator_id, business_id):
        db = get_db()
        query = {
            "campaign_id": campaign_id,
            "$or": [
                {"sender_id": creator_id, "receiver_id": business_id},
                {"sender_id": business_id, "receiver_id": creator_id}
            ]
        }
        return list(db.messages.find(query).sort("timestamp", 1))

    @staticmethod
    def get_chats_for_user(user_id):
        # Find unique conversations for a user (simplified)
        db = get_db()
        pipeline = [
            {"$match": {"$or": [{"sender_id": user_id}, {"receiver_id": user_id}]}},
            {"$group": {
                "_id": "$campaign_id", 
                "last_message": {"$last": "$$ROOT"},
                "participants": {"$addToSet": "$sender_id"} # Crude way to get participants
            }},
            {"$sort": {"last_message.timestamp": -1}}
        ]
        return list(db.messages.aggregate(pipeline))
