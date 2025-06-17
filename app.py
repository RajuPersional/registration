from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
import os
from database import check_login, get_user_data, get_all_users
import sqlite3

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
    if check_login(register_number, password): # the return will be  like this if (true)
        session['register_number'] = register_number
        session['password'] = password  # Store password in session for verification
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
    if 'register_number' not in session: #even though the user data is in the database is because the session acts as proof that the user is currently logged in
        return render_template('Bricks.html')
    
    user_data = get_user_data(session['register_number'], session['password'])
    return render_template('HomePage.html', user=user_data) if user_data else render_template('Bricks.html')# this is get the data form the db for displying the name , that  data will be direcly accessed in the html page 

@app.route('/Profile')
def profile():
    if 'register_number' not in session or 'password' not in session:
        return render_template('Bricks.html')
    
    user_data = get_user_data(session['register_number'], session['password'])
    if not user_data:
        # Clear session if user data is not found or password doesn't match
        session.clear()
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

@app.route('/api/update-profile', methods=['POST'])
def update_profile():
    if 'register_number' not in session:
        return jsonify({'status': 'fail', 'message': 'Not logged in'}), 401
    
    data = request.json
    register_number = session['register_number']
    
    # Basic required field check (keep this for security)
    required_fields = ['name', 'email', 'phone_number', 'date_of_birth']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'status': 'fail', 'message': f'{field.replace("_", " ").title()} is required'}), 400
    
    # You can remove the email and phone validation from here since Profile.js handles it
    # But keep basic validation for security
    
    try:
        # Update user data in database
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE user 
            SET name = ?, email = ?, phone_number = ?, date_of_birth = ?
            WHERE register_number = ?
        ''', (
            data['name'],
            data['email'],
            data['phone_number'],
            data['date_of_birth'],
            register_number
        ))
        
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({
                'status': 'fail',
                'message': 'User not found'
            }), 404
            
        return jsonify({
            'status': 'success',
            'message': 'Profile updated successfully'
        })
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({
            'status': 'fail',
            'message': 'Database error occurred'
        }), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)