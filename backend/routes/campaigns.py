from flask import Blueprint, request, jsonify
from models.campaign import Campaign
from models.user import User

campaigns_bp = Blueprint('campaigns', __name__)

@campaigns_bp.route('/', methods=['POST'])
def create_campaign():
    data = request.json
    # Validation simplified
    required = ['business_id', 'title', 'description', 'budget']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
        
    campaign_id = Campaign.create(data)
    return jsonify({"message": "Campaign created", "campaign_id": campaign_id}), 201

@campaigns_bp.route('/', methods=['GET'])
def get_campaigns():
    business_id = request.args.get('business_id')
    print(f"[DEBUG] GET /campaigns - business_id: {business_id}")
    
    if business_id:
        campaigns = Campaign.find_by_business(business_id)
        print(f"[DEBUG] Found {len(campaigns)} campaigns for business {business_id}")
    else:
        campaigns = Campaign.find_all()
        print(f"[DEBUG] Found {len(campaigns)} total campaigns")
    
    # Cache for business info to avoid repeated lookups
    business_cache = {}
    
    for c in campaigns:
        c['_id'] = str(c['_id'])
        if 'created_at' in c:
            c['created_at'] = c['created_at'].isoformat()
        
        # Add business info
        biz_id = c.get('business_id')
        if biz_id and biz_id not in business_cache:
            biz = User.find_by_id(biz_id)
            if biz:
                business_cache[biz_id] = {
                    'name': biz.get('name', 'Business'),
                    'type': biz.get('business_type', 'Company')
                }
        
        if biz_id and biz_id in business_cache:
            c['business_name'] = business_cache[biz_id]['name']
            c['business_type'] = business_cache[biz_id]['type']
        
    return jsonify(campaigns)

@campaigns_bp.route('/<campaign_id>', methods=['GET'])
def get_campaign(campaign_id):
    campaign = Campaign.find_by_id(campaign_id)
    if not campaign:
         return jsonify({"error": "Not found"}), 404
         
    campaign['_id'] = str(campaign['_id'])
    campaign['created_at'] = campaign['created_at'].isoformat()
    return jsonify(campaign)

# NOTE: Apply endpoint moved to /api/applications/ for better status tracking

@campaigns_bp.route('/<campaign_id>', methods=['PATCH'])
def update_campaign(campaign_id):
    data = request.json
    campaign = Campaign.find_by_id(campaign_id)
    if not campaign:
        return jsonify({"error": "Campaign not found"}), 404
    
    from database import get_db
    from bson.objectid import ObjectId
    db = get_db()
    
    update_fields = {}
    if 'title' in data:
        update_fields['title'] = data['title']
    if 'description' in data:
        update_fields['description'] = data['description']
    if 'budget' in data:
        update_fields['budget'] = data['budget']
    
    if update_fields:
        db.campaigns.update_one(
            {'_id': ObjectId(campaign_id)},
            {'$set': update_fields}
        )
    
    return jsonify({"message": "Campaign updated"})

@campaigns_bp.route('/<campaign_id>', methods=['DELETE'])
def delete_campaign(campaign_id):
    campaign = Campaign.find_by_id(campaign_id)
    if not campaign:
        return jsonify({"error": "Campaign not found"}), 404
    
    from database import get_db
    from bson.objectid import ObjectId
    db = get_db()
    
    db.campaigns.delete_one({'_id': ObjectId(campaign_id)})
    
    return jsonify({"message": "Campaign deleted"}), 200
