from flask import Blueprint, request, jsonify
from models.notification import Notification

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
def get_notifications():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    
    notifications = Notification.find_for_user(user_id)
    
    for n in notifications:
        n['_id'] = str(n['_id'])
        n['created_at'] = n['created_at'].isoformat()
    
    return jsonify({
        "notifications": notifications,
        "unread_count": Notification.count_unread(user_id)
    })

@notifications_bp.route('/<notification_id>/read', methods=['POST'])
def mark_read(notification_id):
    Notification.mark_as_read(notification_id)
    return jsonify({"message": "Marked as read"})
