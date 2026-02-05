from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from database import get_db

load_dotenv()

app = Flask(__name__)
app.url_map.strict_slashes = False  # Prevent trailing slash redirects
CORS(app, resources={r"/*": {"origins": "*"}})

# Database connection is handled lazily in routes/models to ensure fork-safety with Gunicorn
# Do not initialize get_db() here at module level

# Import and register blueprints
from routes.auth import auth_bp
from routes.creators import creators_bp
from routes.businesses import businesses_bp
from routes.campaigns import campaigns_bp
from routes.messages import messages_bp
from routes.notifications import notifications_bp
from routes.reviews import reviews_bp
from routes.applications import applications_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(creators_bp, url_prefix='/api/creators')
app.register_blueprint(businesses_bp, url_prefix='/api/businesses')
app.register_blueprint(campaigns_bp, url_prefix='/api/campaigns')
app.register_blueprint(messages_bp, url_prefix='/api/messages')
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
app.register_blueprint(applications_bp, url_prefix='/api/applications')

@app.route('/')
def hello():
    return jsonify({"message": "Linkfluence Backend Running", "status": "success"})

# Auto-seed database if empty (for automated deployments)
try:
    from seed_db import seed_data
    print("🌱 Checking database state...")
    seed_data()
except Exception as e:
    print(f"⚠️ Auto-seeding skipped: {e}")

if __name__ == '__main__':
    print("Starting Linkfluence Backend on http://0.0.0.0:5000")
    print("Registered routes:", app.url_map)
    app.run(debug=True, port=5000, host='0.0.0.0')

