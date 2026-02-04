from flask import Blueprint, request, jsonify
from models.user import User
from models.analytics import Analytics
from bson.objectid import ObjectId

creators_bp = Blueprint('creators', __name__)

@creators_bp.route('/search', methods=['GET'])
def search_creators():
    """Search creators with advanced filters"""
    from database import get_db
    db = get_db()
    
    # Get filter parameters
    category = request.args.get('category')
    follower_tier = request.args.get('follower_tier')
    platforms = request.args.get('platforms')  # comma-separated
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    
    # Base query
    query = {'role': 'creator'}
    
    # Category filter
    if category and category != 'all':
        query['category'] = category
    
    # Follower tier filter
    if follower_tier and follower_tier != 'all':
        if follower_tier == 'nano':
            query['followers'] = {'$lt': 10000}
        elif follower_tier == 'micro':
            query['followers'] = {'$gte': 10000, '$lt': 100000}
        elif follower_tier == 'macro':
            query['followers'] = {'$gte': 100000}
    
    # Platform filter (creators must have at least one of the selected platforms)
    if platforms and platforms != 'all':
        platform_list = [p.strip() for p in platforms.split(',') if p.strip()]
        if platform_list:
            platform_conditions = []
            for platform in platform_list:
                platform_conditions.append({
                    f'social_links.{platform}': {'$exists': True, '$ne': '', '$ne': None}
                })
            query['$or'] = platform_conditions
    
    # Fetch creators
    creators = list(db.users.find(query).limit(200))
    
    # Client-side price filtering (since we need to check service_packages array)
    if min_price or max_price:
        min_p = float(min_price) if min_price else 0
        max_p = float(max_price) if max_price else float('inf')
        
        filtered_creators = []
        for c in creators:
            packages = c.get('service_packages', [])
            if packages:
                # Check if any package falls within the price range
                for pkg in packages:
                    try:
                        price = float(pkg.get('price', 0))
                        if min_p <= price <= max_p:
                            filtered_creators.append(c)
                            break
                    except (ValueError, TypeError):
                        continue
        creators = filtered_creators
    
    # Format results
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
            'portfolio': c.get('portfolio', []),
            'average_rating': c.get('average_rating', 0),
            'review_count': c.get('review_count', 0)
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
