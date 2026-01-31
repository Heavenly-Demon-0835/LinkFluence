from flask import Blueprint, request, jsonify
from models.message import Message
from models.user import User

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('/', methods=['POST'])
def send_message():
    data = request.json
    # Validation
    required = ['campaign_id', 'sender_id', 'receiver_id', 'content']
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
        
    msg_id = Message.send(data)
    return jsonify({"message": "Sent", "message_id": msg_id}), 201

@messages_bp.route('/conversation', methods=['GET'])
def get_conversation():
    campaign_id = request.args.get('campaign_id')
    creator_id = request.args.get('creator_id')
    business_id = request.args.get('business_id')
    
    if not all([campaign_id, creator_id, business_id]):
        return jsonify({"error": "Missing params"}), 400
        
    msgs = Message.get_conversation(campaign_id, creator_id, business_id)
    for m in msgs:
        m['_id'] = str(m['_id'])
        m['timestamp'] = m['timestamp'].isoformat()
        
    return jsonify(msgs)
