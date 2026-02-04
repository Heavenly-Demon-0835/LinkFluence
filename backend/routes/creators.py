from flask import Blueprint, request, jsonify
from models.user import User
from models.analytics import Analytics
from bson.objectid import ObjectId

creators_bp = Blueprint('creators', __name__)

@creators_bp.route('/search', methods=['GET'])
def search_creators():
    """Search creators with optional category filter"""
    from database import get_db
    db = get_db()
    
    category = request.args.get('category')
    
    query = {'role': 'creator'}
    if category and category != 'all':
        query['category'] = category
    
    creators = list(db.users.find(query).limit(50))
    
    results = []
    for c in creators:
        results.append({
            '_id': str(c['_id']),
            'name': c.get('name', 'Creator'),
            'email': c.get('email', ''),
            'bio': c.get('bio', ''),
            'category': c.get('category', 'Other'),
            'followers': c.get('followers', 0),
            'social_links': c.get('social_links', {}),
            'service_packages': c.get('service_packages', []),
            'portfolio': c.get('portfolio', [])
        })
    
    return jsonify(results)

@creators_bp.route('/<user_id>', methods=['GET'])
def get_creator_profile(user_id):
    user = User.find_by_id(user_id)
    if not user or user.get('role') != 'creator':
        return jsonify({"error": "Creator not found"}), 404
        
    # Get Analytics
    history = Analytics.get_history(user_id)
    # Convert ObjectIds to str for JSON serialization
    for h in history:
        h['_id'] = str(h['_id'])
        h['timestamp'] = h['timestamp'].isoformat()
    
    user['_id'] = str(user['_id'])
    return jsonify({"profile": user, "analytics": history})

@creators_bp.route('/<user_id>', methods=['PUT'])
def update_creator_profile(user_id):
    data = request.json
    user = User.find_by_id(user_id)
    if not user or user.get('role') != 'creator':
        return jsonify({"error": "Creator not found"}), 404
    
    # Update allowed fields
    update_fields = {}
    if 'name' in data:
        update_fields['name'] = data['name']
    if 'bio' in data:
        update_fields['bio'] = data['bio']
    if 'category' in data:
        update_fields['category'] = data['category']
    if 'social_links' in data:
        update_fields['social_links'] = data['social_links']
    if 'service_packages' in data:
        update_fields['service_packages'] = data['service_packages']
    if 'portfolio' in data:
        update_fields['portfolio'] = data['portfolio']
    
    if update_fields:
        from database import get_db
        db = get_db()
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_fields}
        )
    
    return jsonify({"message": "Profile updated"})

@creators_bp.route('/<user_id>/growth-prediction', methods=['GET'])
def predict_growth(user_id):
    # Mock prediction logic
    import random
    
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Simple mock: predict next month's growth based on random factor + categories
    # In real app, this would use ML model
    
    current_impressions = 10000 # Mock base
    growth_rate = random.uniform(0.05, 0.20) # 5% to 20%
    
    predicted = int(current_impressions * (1 + growth_rate))
    
    return jsonify({
        "current_impressions": current_impressions,
        "predicted_growth_rate": f"{growth_rate*100:.1f}%",
        "predicted_impressions_next_month": predicted
    })
