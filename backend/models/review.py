from database import get_db
from bson.objectid import ObjectId
from datetime import datetime

class Review:
    @staticmethod
    def create(data):
        """Create a new review and update creator's average rating"""
        db = get_db()
        
        # Add metadata
        data['created_at'] = datetime.utcnow()
        
        # Check if this reviewer already reviewed this creator
        existing = db.reviews.find_one({
            'creator_id': data['creator_id'],
            'reviewer_id': data['reviewer_id']
        })
        if existing:
            return None  # Already reviewed
        
        # Insert the review
        result = db.reviews.insert_one(data)
        
        # Update creator's cached stats
        Review.update_creator_stats(data['creator_id'])
        
        return str(result.inserted_id)
    
    @staticmethod
    def find_for_creator(creator_id, limit=50):
        """Get all reviews for a creator, newest first"""
        db = get_db()
        reviews = list(db.reviews.find({'creator_id': creator_id})
                      .sort('created_at', -1)
                      .limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for r in reviews:
            r['_id'] = str(r['_id'])
            if 'created_at' in r:
                r['created_at'] = r['created_at'].isoformat()
        
        return reviews
    
    @staticmethod
    def get_stats(creator_id):
        """Get average rating and review count for a creator"""
        db = get_db()
        
        pipeline = [
            {'$match': {'creator_id': creator_id}},
            {'$group': {
                '_id': '$creator_id',
                'average_rating': {'$avg': '$rating'},
                'review_count': {'$sum': 1}
            }}
        ]
        
        result = list(db.reviews.aggregate(pipeline))
        
        if result:
            return {
                'average_rating': round(result[0]['average_rating'], 1),
                'review_count': result[0]['review_count']
            }
        return {'average_rating': 0, 'review_count': 0}
    
    @staticmethod
    def update_creator_stats(creator_id):
        """Update cached rating stats on creator's user document"""
        db = get_db()
        stats = Review.get_stats(creator_id)
        
        db.users.update_one(
            {'_id': ObjectId(creator_id)},
            {'$set': {
                'average_rating': stats['average_rating'],
                'review_count': stats['review_count']
            }}
        )
