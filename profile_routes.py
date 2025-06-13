from flask import Blueprint, request, jsonify, session
from models import db, User
from datetime import datetime

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/api/profile')
def get_profile():
    if 'user_id' not in session:
        return jsonify({'status': 'fail', 'message': 'Not logged in'}), 401

    user = User.query.get(session['user_id'])
    if user:
        return jsonify({
            'status': 'success',
            'user': user.to_dict()
        })
    return jsonify({'status': 'fail', 'message': 'User not found'}), 404

@profile_bp.route('/api/profile/update', methods=['POST'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({'status': 'fail', 'message': 'Not logged in'}), 401

    data = request.json
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'status': 'fail', 'message': 'User not found'}), 404

    user.name = data.get('name', user.name)
    user.email = data.get('email', user.email)
    user.phone_number = data.get('phone_number', user.phone_number)

    # Date parsing logic
    date_str = data.get('date_of_birth')
    if date_str:
        try:
            user.date_of_birth = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            try:
                user.date_of_birth = datetime.strptime(date_str, '%d/%m/%Y').date()
            except ValueError:
                pass  # Optionally, return an error here

    try:
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Profile updated!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'fail', 'message': str(e)}), 500
