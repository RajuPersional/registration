# reset_password.py (Blueprint + Mail config using .env)

import os
import random
from flask import Blueprint, request, jsonify,session,render_template
from flask_mail import Mail, Message
from dotenv import load_dotenv
from Flash_App.database import db_manager # Relative import # Import your DB checker

# Load environment variables from .env
load_dotenv()

# Create Blueprint
reset_password_bp = Blueprint('reset_password_bp', __name__)

# Initialize Flask-Mail object (not bound yet)
mail = Mail()

# In-memory OTP store
otp_store = {}

# Function to configure mail for the main app
def init_mail(app):
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    mail.init_app(app)


@reset_password_bp.route('/verify-register', methods=['POST'])
def verify_register():
    data = request.get_json()
    register_number = data.get('register_number')

    if not register_number:
        return jsonify({'status': 'fail', 'message': 'Register number required'}), 400

    if not db_manager.is_registered_user(register_number):
        return jsonify({'status': 'fail', 'message': 'You are not registered'}), 404
    
    session['verified_reset_user'] = register_number

    return jsonify({'status': 'success', 'message': 'Register number verified'}), 200


# Send OTP API
@reset_password_bp.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    email = data.get('email')  # This must be added!

    if not email:
        return jsonify({'status': 'fail', 'message': 'Register number and email are required'}), 400
    otp = str(random.randint(100000, 999999))
    otp_store[email] = otp
    print(otp_store)

    try:
        msg = Message('Reset Password OTP',
                      sender=os.getenv('MAIL_USERNAME'),
                      recipients=[email],
                      body=f"Your OTP is: {otp}")
        mail.send(msg)
        return jsonify({'status': 'success', 'message': 'OTP sent'}), 200
    except Exception as e:
        return jsonify({'status': 'fail', 'message': str(e)}), 500


# Verify OTP API
@reset_password_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    otp = data.get('otp')
    email=data.get('email')

    if  not otp:
        return jsonify({'status': 'fail', 'message': 'Email and OTP are required'}), 400

    if otp_store.get(email) == otp:
        return jsonify({'status': 'success', 'message': 'OTP verified'}), 200
    else:
        return jsonify({'status': 'fail', 'message': 'Invalid OTP'}), 401


@reset_password_bp.route('/update/password', methods=['POST'])
def update_password_route():
    data =  request.get_json()
    new_password = str(data.get('password'))
    registration =str(session.get('verified_reset_user'))
    print(registration)
    
    if not data :
        return jsonify({'status': 'fail', 'message': 'Invalid OTP'}), 401
    
    if not db_manager.update_password(new_password,registration):
        return jsonify({'status': 'fail', 'message': 'You are not registered'}), 404
    else:
        return jsonify({'status': 'success', 'redirect': '/'})
