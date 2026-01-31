from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role') # 'creator' or 'business'
    
    if not email or not password or not role:
        return jsonify({"error": "Missing required fields"}), 400
        
    if User.find_by_email(email):
        return jsonify({"error": "User already exists"}), 409
        
    hashed_password = generate_password_hash(password)
    user_data = {
        "email": email,
        "password": hashed_password,
        "role": role,
        "name": data.get('name', ''),
        # Business specific
        "industry": data.get('industry', ''),
        "budget": data.get('budget', {}), # {min, max} or single value
        # Creator specific
        "categories": data.get('categories', []), # ['fashion', 'fitness']
        "social_handles": data.get('social_handles', {}) # {'instagram': 'handle'}
    }
    
    user_id = User.create_user(user_data)
    
    return jsonify({"message": "User created", "user_id": user_id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = User.find_by_email(email)
    
    # Check if user exists and has a password field
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    
    stored_password = user.get('password')
    if not stored_password:
        return jsonify({"error": "Account issue - please re-register"}), 401
        
    if not check_password_hash(stored_password, password):
        return jsonify({"error": "Invalid credentials"}), 401
        
    return jsonify({
        "message": "Login successful",
        "user_id": str(user['_id']),
        "role": user['role'],
        "name": user.get('name')
    }), 200
