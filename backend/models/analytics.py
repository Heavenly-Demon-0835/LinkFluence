from database import get_db
from datetime import datetime

class Analytics:
    @staticmethod
    def log_daily_stats(user_id, stats):
        """
        Log daily impressions for a creator.
        stats: dict like {'instagram': 1000, 'youtube': 500}
        """
        db = get_db()
        entry = {
            "user_id": user_id,
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "stats": stats,
            "timestamp": datetime.utcnow()
        }
        db.analytics.insert_one(entry)

    @staticmethod
    def get_history(user_id):
        db = get_db()
        return list(db.analytics.find({"user_id": user_id}).sort("timestamp", 1))
