import os
import json
import re
from reset_password import reset_password_bp,init_mail
import sqlite3
from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
from database import check_login, get_user_data, get_all_users
from dotenv import load_dotenv

load_dotenv()

app = Flask( __name__, static_folder=os.path.join(os.path.dirname(__file__), '..', 'static'),# Path for the static file  'C:/Users/raj/Desktop/BRICKS/static'
    template_folder=os.path.join(os.path.dirname(__file__), '..', 'templates'))# Path for the temaplate Files  'C:/Users/raj/Desktop/BRICKS/template

init_mail(app)
CORS(app, supports_credentials=True)


app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
ATTENDANCE_FILE = os.path.join('static', 'File_Data', 'Attendence.json')
 
app.register_blueprint(reset_password_bp) #You tell Flask to include it 

def load_attendance_data():
    """Load existing attendance JSON if file exists."""
    if not os.path.exists(ATTENDANCE_FILE):
        return None
    with open(ATTENDANCE_FILE, 'r') as f:
        return json.load(f)   #json.load(f) in Python converts JSON to dict.


@app.route('/')
def home():
    return render_template('Bricks.html')


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    register_number = data.get('registerNumber')
    password = data.get('password')
   

    try:
        register_number = int(register_number)
    except (ValueError, TypeError):
        return jsonify({'status': 'fail', 'message': 'Invalid registration number'}), 400

    if check_login(register_number, password):
        session['register_number'] = register_number
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'redirect': '/HomePage'
        }), 200
    else:
        return jsonify({'status': 'fail', 'message': 'Invalid credentials'}), 401


@app.route('/HomePage')
def homepage():
    if 'register_number' not in session:
        return render_template('Bricks.html')

    user_data = get_user_data(session['register_number'], None)
    return render_template('HomePage.html', user=user_data) if user_data else render_template('Bricks.html')


@app.route('/Profile')
def profile():
    if 'register_number' not in session:
        return render_template('Bricks.html')

    user_data = get_user_data(session['register_number'], None)
    if not user_data:
        session.clear()
        return render_template('Bricks.html')
    
    return render_template('Profile.html', user=user_data)


@app.route('/verfy')
def verfy():
    return render_template('verfy.html')


@app.route('/Financial')
def financial():
    if 'register_number' not in session:
        return jsonify({'status': 'fail', 'message': 'Not logged in'}), 401
    return render_template('Financial.html')


@app.route('/Enrollment')
def enrollment():
    if 'register_number' not in session:
        return jsonify({'status': 'fail', 'message': 'Not logged in'}), 401
    return render_template('Enrollment.html')


@app.route('/Attendence')
def attendence():
    if 'register_number' not in session:
        return jsonify({'status': 'fail', 'message': 'Not logged in'}), 401
    return render_template('Attendence.html')


@app.route('/Dashboard')
def dashboard():
    if 'register_number' not in session:
        return jsonify({'status': 'fail', 'message': 'Not logged in'}), 401
    return render_template('Dashboard.html')


@app.route('/Courses')
def courses():
    if 'register_number' not in session:
        return jsonify({'status': 'fail', 'message': 'Not logged in'}), 401
    return render_template('course.html')


@app.route('/view-database')
def view_database():
    if 'register_number' not in session:
        return jsonify({'status': 'fail', 'message': 'Not logged in'}), 401
    users = get_all_users()
    return render_template('view_database.html', users=users)


@app.route('/save-attendance', methods=['POST'])
def save_attendance():
    data = request.get_json()
    code = data.get('code')
    subject = data.get('subject')

    if not code:
        return jsonify({"status": "fail", "message": "❌ Missing course code"}), 400
    if not subject:
        return jsonify({"status": "fail", "message": "❌ Missing subject name"}), 400

    temp_data = session.get('temp_enrollment', {})
    if code not in temp_data:
        temp_data[code] = {
            "CourseName": subject,
            "ClassAttended": 0,
            "AttendedHours": 0,
            "TotalClass": 0,
            "TotalHours": 0,
            "Percentage": "0%"
        }
        session['temp_enrollment'] = temp_data

    return jsonify({'status': 'success', 'message': '✅ Enrollment temporarily saved'}), 200


@app.route('/api/merged-attendance')
def merged_attendance():
    permanent_data = load_attendance_data() # this will get the courses data from teh json 
    temp_data = session.get('temp_enrollment', {})

    # Combine courses
    merged_courses = permanent_data.get('courses', {}).copy()
    merged_courses.update(temp_data)  # temp overrides permanent

    return jsonify({
        "courses": merged_courses,
        "attendance": permanent_data.get('attendance', {})
    })


@app.route('/reset-attendance', methods=['POST'])
def reset_attendance():
    session.pop('temp_enrollment', None)  # Clear temp session
    return "✅ Attendance reset", 200



@app.route('/api/update-profile', methods=['POST'])
def update_profile():
    if 'register_number' not in session:
        return jsonify({'status': 'fail', 'message': 'Not logged in'}), 401

    data = request.get_json()
    register_number = session['register_number']

    required_fields = ['name', 'email', 'phone_number', 'date_of_birth']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'status': 'fail', 'message': f'{field.replace("_", " ").title()} is required'}), 400

    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    if not email_pattern.match(data['email']):
        return jsonify({'status': 'fail', 'message': 'Invalid email format'}), 400

    phone_pattern = re.compile(r'^\d{10}$')
    if not phone_pattern.match(data['phone_number']):
        return jsonify({'status': 'fail', 'message': 'Phone number must be 10 digits'}), 400

    try:
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
            return jsonify({'status': 'fail', 'message': 'User not found'}), 404

        return jsonify({'status': 'success', 'message': 'Profile updated successfully'}), 200

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({'status': 'fail', 'message': 'Database error occurred'}), 500
    finally:
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)
