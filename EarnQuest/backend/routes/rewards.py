from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Reward, db
from datetime import datetime, timedelta

rewards_bp = Blueprint('rewards', __name__)

@rewards_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_rewards_dashboard():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get recent rewards (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_rewards = Reward.query.filter_by(user_id=user_id)\
                                   .filter(Reward.created_at >= thirty_days_ago)\
                                   .order_by(Reward.created_at.desc())\
                                   .limit(10).all()
        
        # Calculate monthly earnings
        monthly_earnings = sum(r.amount for r in recent_rewards if r.status == 'approved')
        
        # Get total rewards by type
        reward_types = db.session.query(
            Reward.type,
            db.func.sum(Reward.amount).label('total'),
            db.func.count(Reward.id).label('count')
        ).filter_by(user_id=user_id, status='approved')\
         .group_by(Reward.type).all()
        
        return jsonify({
            'user_stats': {
                'total_earnings': user.total_earnings,
                'available_balance': user.available_balance,
                'surveys_completed': user.surveys_completed,
                'monthly_earnings': monthly_earnings
            },
            'recent_rewards': [reward.to_dict() for reward in recent_rewards],
            'reward_breakdown': [
                {
                    'type': rt.type,
                    'total_amount': rt.total,
                    'count': rt.count
                } for rt in reward_types
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rewards_bp.route('/history', methods=['GET'])
@jwt_required()
def get_rewards_history():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        reward_type = request.args.get('type')
        status = request.args.get('status')
        
        query = Reward.query.filter_by(user_id=user_id)
        
        if reward_type:
            query = query.filter_by(type=reward_type)
        
        if status:
            query = query.filter_by(status=status)
        
        rewards = query.order_by(Reward.created_at.desc())\
                      .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'rewards': [reward.to_dict() for reward in rewards.items],
            'total': rewards.total,
            'pages': rewards.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rewards_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        # Get top earners (anonymized)
        top_earners = db.session.query(
            User.first_name,
            User.county,
            User.total_earnings,
            User.surveys_completed
        ).filter(User.is_active == True)\
         .order_by(User.total_earnings.desc())\
         .limit(10).all()
        
        leaderboard = []
        for i, earner in enumerate(top_earners, 1):
            leaderboard.append({
                'rank': i,
                'name': f"{earner.first_name[0]}***",  # Anonymize name
                'county': earner.county,
                'total_earnings': earner.total_earnings,
                'surveys_completed': earner.surveys_completed
            })
        
        return jsonify({'leaderboard': leaderboard}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rewards_bp.route('/referral', methods=['POST'])
@jwt_required()
def create_referral_reward():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        referred_user_id = data.get('referred_user_id')
        
        if not referred_user_id:
            return jsonify({'error': 'Referred user ID is required'}), 400
        
        # Check if referred user exists
        referred_user = User.query.get(referred_user_id)
        if not referred_user:
            return jsonify({'error': 'Referred user not found'}), 404
        
        # Check if referral reward already exists
        existing_reward = Reward.query.filter_by(
            user_id=user_id,
            type='referral',
            description=f'Referral bonus for user {referred_user_id}'
        ).first()
        
        if existing_reward:
            return jsonify({'error': 'Referral reward already claimed'}), 400
        
        # Create referral reward (e.g., 100 KES)
        referral_amount = 100.0
        reward = Reward(
            user_id=user_id,
            amount=referral_amount,
            type='referral',
            description=f'Referral bonus for user {referred_user_id}',
            status='approved'
        )
        
        # Update user balance
        user.total_earnings += referral_amount
        user.available_balance += referral_amount
        
        db.session.add(reward)
        db.session.commit()
        
        return jsonify({
            'message': 'Referral reward created successfully',
            'reward': reward.to_dict(),
            'new_balance': user.available_balance
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@rewards_bp.route('/bonus', methods=['POST'])
@jwt_required()
def daily_bonus():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user already claimed daily bonus today
        today = datetime.utcnow().date()
        existing_bonus = Reward.query.filter_by(
            user_id=user_id,
            type='bonus'
        ).filter(
            db.func.date(Reward.created_at) == today
        ).first()
        
        if existing_bonus:
            return jsonify({'error': 'Daily bonus already claimed today'}), 400
        
        # Create daily bonus (e.g., 10 KES)
        bonus_amount = 10.0
        reward = Reward(
            user_id=user_id,
            amount=bonus_amount,
            type='bonus',
            description='Daily login bonus',
            status='approved'
        )
        
        # Update user balance
        user.total_earnings += bonus_amount
        user.available_balance += bonus_amount
        
        db.session.add(reward)
        db.session.commit()
        
        return jsonify({
            'message': 'Daily bonus claimed successfully',
            'reward': reward.to_dict(),
            'new_balance': user.available_balance
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
