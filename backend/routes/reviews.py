from flask import Blueprint, request, jsonify
from models.review import Review

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/', methods=['POST'])
def submit_review():
    """Submit a new review for a creator"""
    data = request.json
    
    # Validate required fields
    required = ['creator_id', 'reviewer_id', 'reviewer_name', 'rating']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate rating range
    rating = data.get('rating')
    if not isinstance(rating, (int, float)) or rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400
    
    # Create the review
    review_id = Review.create({
        'creator_id': data['creator_id'],
        'reviewer_id': data['reviewer_id'],
        'reviewer_name': data['reviewer_name'],
        'rating': int(rating),
        'comment': data.get('comment', '')
    })
    
    if review_id is None:
        return jsonify({'error': 'You have already reviewed this creator'}), 409
    
    return jsonify({'message': 'Review submitted', 'review_id': review_id}), 201


@reviews_bp.route('/creator/<creator_id>', methods=['GET'])
def get_creator_reviews(creator_id):
    """Get all reviews for a specific creator"""
    reviews = Review.find_for_creator(creator_id)
    stats = Review.get_stats(creator_id)
    
    return jsonify({
        'reviews': reviews,
        'average_rating': stats['average_rating'],
        'review_count': stats['review_count']
    })
