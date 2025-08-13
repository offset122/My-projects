from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Transaction, db
from datetime import datetime
import requests
import os
import uuid
import base64

payments_bp = Blueprint('payments', __name__)

class MPESAIntegration:
    def __init__(self):
        self.consumer_key = os.getenv('MPESA_CONSUMER_KEY')
        self.consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
        self.shortcode = os.getenv('MPESA_SHORTCODE')
        self.passkey = os.getenv('MPESA_PASSKEY')
        self.environment = os.getenv('MPESA_ENVIRONMENT', 'sandbox')
        
        if self.environment == 'sandbox':
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'
    
    def get_access_token(self):
        """Get M-PESA access token"""
        try:
            if not self.consumer_key or not self.consumer_secret:
                return None
            
            auth_url = f'{self.base_url}/oauth/v1/generate?grant_type=client_credentials'
            
            # Create basic auth header
            credentials = f'{self.consumer_key}:{self.consumer_secret}'
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_credentials}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(auth_url, headers=headers)
            
            if response.status_code == 200:
                return response.json().get('access_token')
            else:
                return None
                
        except Exception as e:
            print(f"M-PESA auth error: {e}")
            return None
    
    def send_money(self, phone_number, amount, transaction_id):
        """Send money via M-PESA B2C"""
        try:
            access_token = self.get_access_token()
            if not access_token:
                return {'success': False, 'error': 'Failed to get access token'}
            
            # Mock response for development
            if self.environment == 'sandbox' and not self.shortcode:
                return {
                    'success': True,
                    'transaction_id': f'mock_{transaction_id}',
                    'message': 'Mock M-PESA transaction successful'
                }
            
            # Actual M-PESA B2C implementation would go here
            b2c_url = f'{self.base_url}/mpesa/b2c/v1/paymentrequest'
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'InitiatorName': 'EarnQuest',
                'SecurityCredential': 'your_security_credential',
                'CommandID': 'BusinessPayment',
                'Amount': amount,
                'PartyA': self.shortcode,
                'PartyB': phone_number,
                'Remarks': f'EarnQuest withdrawal - {transaction_id}',
                'QueueTimeOutURL': 'https://your-app.com/api/payments/mpesa/timeout',
                'ResultURL': 'https://your-app.com/api/payments/mpesa/result',
                'Occasion': 'Withdrawal'
            }
            
            response = requests.post(b2c_url, json=payload, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'transaction_id': result.get('ConversationID'),
                    'message': 'M-PESA transaction initiated'
                }
            else:
                return {
                    'success': False,
                    'error': 'M-PESA transaction failed'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

class PayPalIntegration:
    def __init__(self):
        self.client_id = os.getenv('PAYPAL_CLIENT_ID')
        self.client_secret = os.getenv('PAYPAL_CLIENT_SECRET')
        self.environment = os.getenv('PAYPAL_ENVIRONMENT', 'sandbox')
        
        if self.environment == 'sandbox':
            self.base_url = 'https://api.sandbox.paypal.com'
        else:
            self.base_url = 'https://api.paypal.com'
    
    def get_access_token(self):
        """Get PayPal access token"""
        try:
            if not self.client_id or not self.client_secret:
                return None
            
            auth_url = f'{self.base_url}/v1/oauth2/token'
            
            credentials = f'{self.client_id}:{self.client_secret}'
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_credentials}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            data = 'grant_type=client_credentials'
            
            response = requests.post(auth_url, headers=headers, data=data)
            
            if response.status_code == 200:
                return response.json().get('access_token')
            else:
                return None
                
        except Exception as e:
            print(f"PayPal auth error: {e}")
            return None
    
    def send_payout(self, email, amount, transaction_id):
        """Send payout via PayPal"""
        try:
            access_token = self.get_access_token()
            if not access_token:
                return {'success': False, 'error': 'Failed to get access token'}
            
            # Mock response for development
            if not self.client_id:
                return {
                    'success': True,
                    'transaction_id': f'mock_paypal_{transaction_id}',
                    'message': 'Mock PayPal payout successful'
                }
            
            payout_url = f'{self.base_url}/v1/payments/payouts'
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            # Convert KES to USD (approximate rate)
            usd_amount = round(amount / 130, 2)  # Rough KES to USD conversion
            
            payload = {
                'sender_batch_header': {
                    'sender_batch_id': transaction_id,
                    'email_subject': 'EarnQuest Withdrawal',
                    'email_message': 'You have received a payment from EarnQuest!'
                },
                'items': [{
                    'recipient_type': 'EMAIL',
                    'amount': {
                        'value': str(usd_amount),
                        'currency': 'USD'
                    },
                    'receiver': email,
                    'note': f'EarnQuest withdrawal - {transaction_id}',
                    'sender_item_id': transaction_id
                }]
            }
            
            response = requests.post(payout_url, json=payload, headers=headers)
            
            if response.status_code == 201:
                result = response.json()
                return {
                    'success': True,
                    'transaction_id': result.get('batch_header', {}).get('payout_batch_id'),
                    'message': 'PayPal payout initiated'
                }
            else:
                return {
                    'success': False,
                    'error': 'PayPal payout failed'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

mpesa = MPESAIntegration()
paypal = PayPalIntegration()

@payments_bp.route('/methods', methods=['GET'])
@jwt_required()
def get_payment_methods():
    """Get available payment methods"""
    methods = [
        {
            'id': 'mpesa',
            'name': 'M-PESA',
            'description': 'Withdraw to your M-PESA account',
            'min_amount': 50.0,
            'max_amount': 70000.0,
            'currency': 'KES',
            'processing_time': '5-10 minutes',
            'available': True
        },
        {
            'id': 'paypal',
            'name': 'PayPal',
            'description': 'Withdraw to your PayPal account',
            'min_amount': 100.0,
            'max_amount': 50000.0,
            'currency': 'USD',
            'processing_time': '1-3 business days',
            'available': True
        }
    ]
    
    return jsonify({'payment_methods': methods}), 200

@payments_bp.route('/withdraw', methods=['POST'])
@jwt_required()
def withdraw_funds():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        method = data.get('method')
        amount = float(data.get('amount', 0))
        
        # Validate withdrawal method
        if method not in ['mpesa', 'paypal']:
            return jsonify({'error': 'Invalid payment method'}), 400
        
        # Validate amount
        if method == 'mpesa' and (amount < 50 or amount > 70000):
            return jsonify({'error': 'M-PESA withdrawal amount must be between 50 and 70,000 KES'}), 400
        
        if method == 'paypal' and (amount < 100 or amount > 50000):
            return jsonify({'error': 'PayPal withdrawal amount must be between 100 and 50,000 KES'}), 400
        
        # Check if user has sufficient balance
        if user.available_balance < amount:
            return jsonify({'error': 'Insufficient balance'}), 400
        
        # Generate transaction ID
        transaction_id = str(uuid.uuid4())
        
        # Create transaction record
        transaction = Transaction(
            user_id=user_id,
            transaction_id=transaction_id,
            type='withdrawal',
            method=method,
            amount=amount,
            status='pending'
        )
        
        db.session.add(transaction)
        # Commit the pending transaction first for audit trail
        db.session.commit()
        
        # Process payment based on method
        if method == 'mpesa':
            phone_number = data.get('phone_number')
            if not phone_number:
                return jsonify({'error': 'Phone number is required for M-PESA'}), 400
            
            result = mpesa.send_money(phone_number, amount, transaction_id)
            
        elif method == 'paypal':
            email = data.get('email')
            if not email:
                return jsonify({'error': 'Email is required for PayPal'}), 400
            
            result = paypal.send_payout(email, amount, transaction_id)
        
        if result['success']:
            # Update transaction to completed
            transaction.status = 'completed'
            transaction.external_reference = result.get('transaction_id')
            transaction.completed_at = datetime.utcnow()
            
            # Deduct from user balance
            user.available_balance -= amount
            
            db.session.commit()
            
            return jsonify({
                'message': 'Withdrawal processed successfully',
                'transaction': transaction.to_dict(),
                'new_balance': user.available_balance
            }), 200
        else:
            # Update transaction as failed (keep record for audit)
            transaction.status = 'failed'
            db.session.commit()
            
            return jsonify({'error': result.get('error', 'Payment processing failed')}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        transaction_type = request.args.get('type')
        
        query = Transaction.query.filter_by(user_id=user_id)
        
        if transaction_type:
            query = query.filter_by(type=transaction_type)
        
        transactions = query.order_by(Transaction.created_at.desc())\
                           .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'transactions': [transaction.to_dict() for transaction in transactions.items],
            'total': transactions.total,
            'pages': transactions.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """Handle M-PESA callback"""
    try:
        data = request.get_json()
        
        # Process M-PESA callback
        # This would handle the actual callback from Safaricom
        
        return jsonify({'message': 'Callback processed'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@payments_bp.route('/paypal/webhook', methods=['POST'])
def paypal_webhook():
    """Handle PayPal webhook"""
    try:
        data = request.get_json()
        
        # Process PayPal webhook
        # This would handle the actual webhook from PayPal
        
        return jsonify({'message': 'Webhook processed'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
