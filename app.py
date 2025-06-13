from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
from models import db, User
from datetime import datetime
import os

app = Flask(__name__, static_folder='static')
CORS(app)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # This will not Track the unwanted data form the database
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Required for session

# Initialize database
db.init_app(app)

# Create database tables and add sample data
def init_db():
    with app.app_context():
        db.create_all()
        
        # Check if we already have users
        if User.query.count() == 0: 
            # Sample users data
            sample_users = [
                {
                    'register_number': 1,
                    'password': '1',
                    'name': 'John Doe',
                    'date_of_birth': datetime(2000, 1, 15),
                    'email': 'john.doe@example.com',
                    'phone_number': '1234567890'
                },
                {
                    'register_number': 2,
                    'password': '2',
                    'name': 'Jane Smith',
                    'date_of_birth': datetime(2001, 3, 20),
                    'email': 'jane.smith@example.com',
                    'phone_number': '2345678901'
                },
                {
                    'register_number': 3,
                    'password': '3',
                    'name': 'Mike Johnson',
                    'date_of_birth': datetime(2002, 5, 10),
                    'email': 'mike.johnson@example.com',
                    'phone_number': '3456789012'
                },
                {
                    'register_number': 4,
                    'password': '4',
                    'name': 'Sarah Williams',
                    'date_of_birth': datetime(2003, 7, 25),
                    'email': 'sarah.williams@example.com',
                    'phone_number': '4567890123'
                },
                {
                    'register_number': 5,
                    'password': '5',
                    'name': 'David Brown',
                    'date_of_birth': datetime(2004, 9, 30),
                    'email': 'david.brown@example.com',
                    'phone_number': '5678901234'
                }
            ]
            
            # Add users to database
            for user_data in sample_users:
                user = User(**user_data)
                db.session.add(user) #Okay DB is  planning to add this row soon.”
            
            db.session.commit() # this will add the data which are planning to add soon.

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    register_number = data.get('registerNumber')
    password = data.get('password')
    
    try:
        register_number = int(register_number)
    except (ValueError, TypeError):
        return jsonify({'status': 'fail', 'message': 'Invalid registration number'}), 400

    # Check user in database
    user = User.query.filter_by(register_number=register_number, password=password).first()
    
    if user:
        # Store user info in session
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
        }), 200
    else:
        return jsonify({'status': 'fail', 'message': 'Invalid credentials'}), 401

@app.route('/api/profile')
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

@app.route('/')
def home():
    return render_template('Bricks.html')

@app.route('/HomePage')
def homepage():
    if 'user_id' not in session:
        return render_template('Bricks.html')
    return render_template('HomePage.html')

@app.route('/Profile')
def profile():
    if 'user_id' not in session:
        return render_template('Bricks.html')
    return render_template('Profile.html')

@app.route('/Financial')
def financial():
    return render_template('Financial.html')

@app.route('/Enrollment')
def enrollment():
    return render_template('Enrollment.html')

@app.route('/Dashboard')
def Dashboard():
    return render_template('Dashboard.html')

@app.route('/Attendence')
def attendence():
    return render_template('Attendence.html') 

@app.route('/Courses')
def courses():
    return render_template('course.html')    

if __name__ == '__main__':
    init_db()  # Initialize database and add sample data
    app.run(debug=True)