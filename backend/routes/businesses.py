from flask import Blueprint, request, jsonify
from models.user import User

businesses_bp = Blueprint('businesses', __name__)

@businesses_bp.route('/search', methods=['GET'])
def search_businesses():
    """Search businesses with text search and category filter"""
    from database import get_db
    db = get_db()
    
    category = request.args.get('category')
    q = request.args.get('q')  # Text search query
    
    query = {'role': 'business'}
    
    and_conditions = []
    
    # Text search filter (name, description, business_type)
    if q and q.strip():
        search_regex = {'$regex': q.strip(), '$options': 'i'}
        and_conditions.append({'$or': [
            {'name': search_regex},
            {'description': search_regex},
            {'business_type': search_regex}
        ]})
    
    if category and category != 'all':
        and_conditions.append({'business_type': category})
    
    if and_conditions:
        query['$and'] = and_conditions
    
    businesses = list(db.users.find(query).limit(100))
    
    results = []
    for b in businesses:
        results.append({
            '_id': str(b['_id']),
            'name': b.get('name', 'Business'),
            'email': b.get('email', ''),
            'description': b.get('description', ''),
            'business_type': b.get('business_type', 'other'),
            'logo_url': b.get('logo_url', ''),
            'banner_url': b.get('banner_url', '')
        })
    
    return jsonify(results)

@businesses_bp.route('/<user_id>', methods=['GET'])
def get_business_profile(user_id):
    user = User.find_by_id(user_id)
    if not user or user.get('role') != 'business':
        return jsonify({"error": "Business not found"}), 404
    
    user['_id'] = str(user['_id'])
    return jsonify(user)

@businesses_bp.route('/<user_id>', methods=['PUT'])
def update_business_profile(user_id):
    from bson.objectid import ObjectId
    from app import mongo
    
    data = request.json
    user = User.find_by_id(user_id)
    if not user or user.get('role') != 'business':
        return jsonify({"error": "Business not found"}), 404
    
    # Update allowed fields
    update_fields = {}
    for field in ['name', 'description', 'business_type', 'logo_url', 'banner_url']:
        if field in data:
            update_fields[field] = data[field]
    
    if update_fields:
        mongo.db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_fields}
        )
    
    return jsonify({"message": "Profile updated"})

@businesses_bp.route('/<user_id>/recommendations', methods=['GET'])
def get_recommendations(user_id):
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Get filters from query params or use user's preferences
    industry = request.args.get('industry', user.get('industry'))
    max_budget = request.args.get('budget_max')
    
    filters = {}
    if industry:
        filters['industry'] = industry
    if max_budget:
        try:
            filters['max_budget'] = float(max_budget)
        except:
            pass
            
    # Use User model to search
    creators = User.search_creators(filters)
    
    # Format for response
    results = []
    for c in creators:
        c['_id'] = str(c['_id'])
        # Add 'match_score' mock
        c['match_score'] = 95 if c.get('industry') == industry else 70
        results.append(c)
        
    # Sort by match score
    results.sort(key=lambda x: x['match_score'], reverse=True)
    
    return jsonify(results)
