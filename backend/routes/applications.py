from flask import Blueprint, request, jsonify
from models.application import Application
from models.notification import Notification
from models.campaign import Campaign

applications_bp = Blueprint('applications', __name__)

@applications_bp.route('/', methods=['POST'])
def create_application():
    """Submit a new application to a campaign"""
    data = request.json
    
    # Validate required fields
    required = ['campaign_id', 'creator_id', 'creator_name']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Create application
    app_id = Application.create({
        'campaign_id': data['campaign_id'],
        'creator_id': data['creator_id'],
        'creator_name': data.get('creator_name', 'Creator'),
        'cover_letter': data.get('cover_letter', ''),
        'bid_amount': data.get('bid_amount', 0)
    })
    
    if app_id is None:
        return jsonify({'error': 'You have already applied to this campaign'}), 409
    
    # Get campaign details for notification
    campaign = Campaign.find_by_id(data['campaign_id'])
    if campaign:
        # Create notification for business owner
        Notification.create({
            'user_id': campaign['business_id'],
            'type': 'new_application',
            'title': 'New Application!',
            'message': f"{data.get('creator_name', 'A creator')} applied for your campaign: {campaign.get('title', 'Untitled')}",
            'campaign_id': data['campaign_id'],
            'creator_id': data['creator_id']
        })
    
    return jsonify({'message': 'Application submitted successfully!', 'application_id': app_id}), 201


@applications_bp.route('/campaign/<campaign_id>', methods=['GET'])
def get_campaign_applications(campaign_id):
    """Get all applications for a campaign"""
    applications = Application.find_by_campaign(campaign_id)
    return jsonify(applications)


@applications_bp.route('/creator/<creator_id>', methods=['GET'])
def get_creator_applications(creator_id):
    """Get all applications by a creator"""
    applications = Application.find_by_creator(creator_id)
    return jsonify(applications)


@applications_bp.route('/<app_id>/status', methods=['PATCH'])
def update_application_status(app_id):
    """Update application status (accept/reject)"""
    data = request.json
    status = data.get('status')
    
    if status not in ['pending', 'accepted', 'rejected']:
        return jsonify({'error': 'Invalid status. Must be: pending, accepted, or rejected'}), 400
    
    success = Application.update_status(app_id, status)
    
    if success:
        # Optionally create notification for creator
        app = Application.find_by_id(app_id)
        if app:
            campaign = Campaign.find_by_id(app['campaign_id'])
            if campaign:
                status_msg = 'accepted' if status == 'accepted' else 'was reviewed'
                Notification.create({
                    'user_id': app['creator_id'],
                    'type': 'application_update',
                    'title': f'Application {status.capitalize()}',
                    'message': f"Your application for '{campaign.get('title', 'Campaign')}' {status_msg}!",
                    'campaign_id': app['campaign_id']
                })
        
        return jsonify({'message': f'Application {status}'}), 200
    
    return jsonify({'error': 'Application not found'}), 404
