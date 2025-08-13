from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Survey, Reward, db
from datetime import datetime
import requests
import os

surveys_bp = Blueprint('surveys', __name__)

class CPXResearchAPI:
    def __init__(self):
        self.api_key = os.getenv('CPX_RESEARCH_API_KEY')
        self.app_id = os.getenv('CPX_RESEARCH_APP_ID')
        self.base_url = os.getenv('CPX_RESEARCH_BASE_URL', 'https://api.cpx-research.com')
    
    def get_available_surveys(self, user_id):
        """Get available surveys from CPX Research API"""
        try:
            # Mock data for development - replace with actual API call
            if not self.api_key:
                return self._get_mock_surveys()
            
            # Actual API implementation would go here
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            params = {
                'app_id': self.app_id,
                'user_id': user_id,
                'country': 'KE'  # Kenya
            }
            
            response = requests.get(f'{self.base_url}/surveys', headers=headers, params=params)
            
            if response.status_code == 200:
                return response.json().get('surveys', [])
            else:
                return self._get_mock_surveys()
                
        except Exception as e:
            print(f"CPX Research API error: {e}")
            return self._get_mock_surveys()
    
    def _get_mock_surveys(self):
        """Mock survey data for development"""
        return [
            {
                'id': 'cpx_001',
                'title': 'Consumer Shopping Habits in Kenya',
                'description': 'Share your shopping preferences and earn rewards',
                'reward': 50.0,
                'estimated_time': 15,
                'category': 'Shopping'
            },
            {
                'id': 'cpx_002',
                'title': 'Mobile Banking Usage Survey',
                'description': 'Tell us about your mobile banking experience',
                'reward': 75.0,
                'estimated_time': 20,
                'category': 'Finance'
            },
            {
                'id': 'cpx_003',
                'title': 'Food Delivery Preferences',
                'description': 'Help us understand food delivery trends in Kenya',
                'reward': 40.0,
                'estimated_time': 10,
                'category': 'Food & Dining'
            },
            {
                'id': 'cpx_004',
                'title': 'Technology Usage Survey',
                'description': 'Share your thoughts on technology and digital services',
                'reward': 60.0,
                'estimated_time': 18,
                'category': 'Technology'
            },
            {
                'id': 'cpx_005',
                'title': 'Healthcare Access Survey',
                'description': 'Help improve healthcare services in Kenya',
                'reward': 80.0,
                'estimated_time': 25,
                'category': 'Healthcare'
            }
        ]

cpx_api = CPXResearchAPI()

@surveys_bp.route('/available', methods=['GET'])
@jwt_required()
def get_available_surveys():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get surveys from CPX Research API
        cpx_surveys = cpx_api.get_available_surveys(user_id)
        
        # Filter out surveys user has already completed
        completed_survey_ids = [s.cpx_survey_id for s in user.surveys if s.status == 'completed']
        available_surveys = [s for s in cpx_surveys if s['id'] not in completed_survey_ids]
        
        return jsonify({
            'surveys': available_surveys,
            'total_available': len(available_surveys)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@surveys_bp.route('/start/<survey_id>', methods=['POST'])
@jwt_required()
def start_survey(survey_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if survey already exists for this user
        existing_survey = Survey.query.filter_by(
            user_id=user_id,
            cpx_survey_id=survey_id
        ).first()
        
        if existing_survey:
            if existing_survey.status == 'completed':
                return jsonify({'error': 'Survey already completed'}), 400
            elif existing_survey.status == 'started':
                return jsonify({'error': 'Survey already in progress'}), 400
        
        # Get survey details from CPX Research
        cpx_surveys = cpx_api.get_available_surveys(user_id)
        survey_data = next((s for s in cpx_surveys if s['id'] == survey_id), None)
        
        if not survey_data:
            return jsonify({'error': 'Survey not found'}), 404
        
        # Create survey record
        survey = Survey(
            user_id=user_id,
            cpx_survey_id=survey_id,
            title=survey_data['title'],
            description=survey_data['description'],
            reward_amount=survey_data['reward'],
            estimated_time=survey_data['estimated_time'],
            status='started',
            started_at=datetime.utcnow()
        )
        
        db.session.add(survey)
        db.session.commit()
        
        return jsonify({
            'message': 'Survey started successfully',
            'survey': survey.to_dict(),
            'redirect_url': f'https://cpx-research.com/survey/{survey_id}?user_id={user_id}'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@surveys_bp.route('/complete/<survey_id>', methods=['POST'])
@jwt_required()
def complete_survey(survey_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Find the survey
        survey = Survey.query.filter_by(
            user_id=user_id,
            cpx_survey_id=survey_id,
            status='started'
        ).first()
        
        if not survey:
            return jsonify({'error': 'Survey not found or not started'}), 404
        
        # Mark survey as completed
        survey.status = 'completed'
        survey.completed_at = datetime.utcnow()
        
        # Create reward
        reward = Reward(
            user_id=user_id,
            survey_id=survey.id,
            amount=survey.reward_amount,
            type='survey_completion',
            description=f'Completed survey: {survey.title}',
            status='approved'  # Auto-approve for now
        )
        
        # Update user stats
        user.surveys_completed += 1
        user.total_earnings += survey.reward_amount
        user.available_balance += survey.reward_amount
        
        db.session.add(reward)
        db.session.commit()
        
        return jsonify({
            'message': 'Survey completed successfully',
            'survey': survey.to_dict(),
            'reward': reward.to_dict(),
            'new_balance': user.available_balance
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@surveys_bp.route('/history', methods=['GET'])
@jwt_required()
def get_survey_history():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        surveys = Survey.query.filter_by(user_id=user_id)\
                             .order_by(Survey.created_at.desc())\
                             .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'surveys': [survey.to_dict() for survey in surveys.items],
            'total': surveys.total,
            'pages': surveys.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@surveys_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_survey_stats():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get survey statistics
        total_surveys = Survey.query.filter_by(user_id=user_id).count()
        completed_surveys = Survey.query.filter_by(user_id=user_id, status='completed').count()
        started_surveys = Survey.query.filter_by(user_id=user_id, status='started').count()
        
        # Calculate completion rate
        completion_rate = (completed_surveys / total_surveys * 100) if total_surveys > 0 else 0
        
        return jsonify({
            'total_surveys': total_surveys,
            'completed_surveys': completed_surveys,
            'started_surveys': started_surveys,
            'completion_rate': round(completion_rate, 2),
            'total_earnings': user.total_earnings,
            'available_balance': user.available_balance
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
