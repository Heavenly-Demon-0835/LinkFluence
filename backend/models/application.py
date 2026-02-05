from database import get_db
from bson.objectid import ObjectId
from datetime import datetime

class Application:
    @staticmethod
    def create(data):
        """Create a new application"""
        db = get_db()
        
        # Add metadata
        data['created_at'] = datetime.utcnow()
        data['status'] = 'pending'  # pending, accepted, rejected
        
        # Check if already applied
        existing = db.applications.find_one({
            'campaign_id': data['campaign_id'],
            'creator_id': data['creator_id']
        })
        if existing:
            return None  # Already applied
        
        result = db.applications.insert_one(data)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_campaign(campaign_id):
        """Get all applications for a campaign"""
        db = get_db()
        apps = list(db.applications.find({'campaign_id': campaign_id})
                   .sort('created_at', -1))
        
        # Convert ObjectId to string
        for app in apps:
            app['_id'] = str(app['_id'])
            if 'created_at' in app:
                app['created_at'] = app['created_at'].isoformat()
        
        return apps
    
    @staticmethod
    def find_by_creator(creator_id):
        """Get all applications by a creator"""
        db = get_db()
        apps = list(db.applications.find({'creator_id': creator_id})
                   .sort('created_at', -1))
        
        for app in apps:
            app['_id'] = str(app['_id'])
            if 'created_at' in app:
                app['created_at'] = app['created_at'].isoformat()
        
        return apps
    
    @staticmethod
    def update_status(app_id, status):
        """Update application status (pending, accepted, rejected)"""
        db = get_db()
        
        if not ObjectId.is_valid(app_id):
            return False
        
        result = db.applications.update_one(
            {'_id': ObjectId(app_id)},
            {'$set': {'status': status, 'updated_at': datetime.utcnow()}}
        )
        
        return result.modified_count > 0
    
    @staticmethod
    def find_by_id(app_id):
        """Find application by ID"""
        db = get_db()
        
        if not ObjectId.is_valid(app_id):
            return None
        
        app = db.applications.find_one({'_id': ObjectId(app_id)})
        if app:
            app['_id'] = str(app['_id'])
            if 'created_at' in app:
                app['created_at'] = app['created_at'].isoformat()
        
        return app
