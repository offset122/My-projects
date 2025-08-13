from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import bcrypt
import requests

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///earnquest.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

# Import models and initialize extensions
from models import db, User, Survey, Reward, Transaction
db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)
CORS(app)
from routes.auth import auth_bp
from routes.surveys import surveys_bp
from routes.rewards import rewards_bp
from routes.payments import payments_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(surveys_bp, url_prefix='/api/surveys')
app.register_blueprint(rewards_bp, url_prefix='/api/rewards')
app.register_blueprint(payments_bp, url_prefix='/api/payments')

@app.route('/')
def index():
    return jsonify({
        'message': 'Welcome to EarnQuest API',
        'version': '1.0.0',
        'description': 'Kenyan Survey & Rewards Platform'
    })

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })

# Create database tables (for quick prototyping - use Flask-Migrate for production)
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
