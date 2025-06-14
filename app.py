from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
import os
from database import check_login, get_user_data, get_all_users

app = Flask(__name__, static_folder='static')
CORS(app)

# Configure session
app.config['SECRET_KEY'] = 'your-secret-key-here'

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    register_number = data.get('registerNumber')
    password = data.get('password')
    
    try:
        register_number = int(register_number)
    except (ValueError, TypeError):
        return jsonify({'status': 'fail', 'message': 'Invalid registration number'}), 400

    # Check user in database using our new function
    if check_login(register_number, password):
        session['register_number'] = register_number
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'redirect': '/HomePage'
        }), 200
    else:
        return jsonify({'status': 'fail', 'message': 'Invalid credentials'}), 401

@app.route('/')
def home():
    return render_template('Bricks.html')

@app.route('/HomePage')
def homepage():
    if 'register_number' not in session:
        return render_template('Bricks.html')
    return render_template('HomePage.html')

@app.route('/Profile')
def profile():
    if 'register_number' not in session:
        return render_template('Bricks.html')
    
    user_data = get_user_data(session['register_number'])
    if not user_data:
        return render_template('Bricks.html')  # Redirect to login if user not found
    
    return render_template('Profile.html', user=user_data)

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

@app.route('/view-database')
def view_database():
    users = get_all_users()
    return render_template('view_database.html', users=users)

if __name__ == '__main__':
    app.run(debug=True)