import json
import os
import re
from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect, validate_csrf, CSRFError,generate_csrf
from dotenv import load_dotenv
from Flash_App.reset_password import reset_password_bp, init_mail
from Flash_App.database import db_manager
load_dotenv()

# Create app instance
# Define the absolute path to the project root
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

app = Flask(__name__, 
            template_folder=os.path.join(BASE_DIR, 'templates'), 
            static_folder=os.path.join(BASE_DIR, 'static'))

# Initialize database before routes
with app.app_context():
    db_manager.initialize_database()

# Production configuration
app.config['ENV'] = 'production'
app.config['DEBUG'] = False

# Configure static file serving
app.config['STATIC_URL_PATH'] = '/static'
app.config['STATIC_FOLDER'] = os.path.join(os.path.dirname(__file__), '..', 'static')

# Logging configuration
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Initialize extensions
init_mail(app)
CORS(app, supports_credentials=True)
csrf = CSRFProtect(app)

# Initialize database
with app.app_context():
    db_manager.initialize_database()

valid_pages = {
    'dashboard': 'dashboard.html',
    'financial': 'financial.html',
    'course': 'course.html',
    'attendance': 'attendance.html',
    'enrollment': 'enrollment.html',
    'homepage': 'homepage.html',
    'profile': 'profile.html'
}

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
ATTENDANCE_FILE = os.path.join('static', 'File_Data', 'attendance.json')
 
app.register_blueprint(reset_password_bp) #You tell Flask to include it 

def load_attendance_data():
    """Load existing attendance JSON if file exists."""
    if not os.path.exists(ATTENDANCE_FILE):
        return None
    with open(ATTENDANCE_FILE, 'r') as f:
        return json.load(f)   #json.load(f) in Python converts JSON to dict.



@app.before_request
def check_csrf_for_json():
    if request.method in ['POST', 'PUT', 'DELETE']:
        # Only apply CSRF check for JSON requests
        if request.is_json:
            csrf_token = request.headers.get('X-CSRFToken')
            try:
                validate_csrf(csrf_token)
            except CSRFError:
                abort(400, "Invalid or missing CSRF token.")


@app.route("/get-csrf-token", methods=["GET"])
def get_csrf_token():
    response = jsonify({'csrf_token': generate_csrf()})
    response.headers.set("Access-Control-Allow-Credentials", "true")  # If using CORS
    return response

@app.route('/')
def home():
    return render_template('bricks.html')

@app.route('/verfy')
def verfy():
    return render_template('verfy.html')# i have to create the serperate Route for this beacuse there is no Session is created at this point to this will Give an error

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    register_number = data.get('registerNumber')
    password = data.get('password')
   

    try:
        register_number = int(register_number)
    except (ValueError, TypeError):
        return jsonify({'status': 'fail', 'message': 'Invalid registration number'}), 400

    if db_manager.check_login(register_number, password):
        session['register_number'] = register_number
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'redirect': '/homepage'
        }), 200
    else:
        return jsonify({'status': 'fail', 'message': 'Invalid credentials'}), 401


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'status': 'success', 'message': 'Logged out successfully'}), 200

@app.route('/<page_name>')
def dynamic_page(page_name):
    if 'register_number' not in session:
        return render_template('bricks.html')  # or redirect

    # Fetch user data to pass to the template, similar to the /Profile route
    user_data = db_manager.get_user_data(session['register_number'], None)
    if not user_data:
        # If user not found, clear session and redirect to login
        # session.clear()
        return render_template('bricks.html')

    template = valid_pages.get(page_name.lower())
    if not template:
        return "❌ Page not found", 404
    
    # Pass user data to the template, which is required by Dashboard, Courses, etc.
    return render_template(template, user=user_data)


@app.route('/view-database')
def view_database():
    if 'register_number' not in session:
        return jsonify({'status': 'fail', 'message': 'Not logged in'}), 401
    users = db_manager.get_all_users()
    print(users)
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
    temp_data = session.get('temp_enrollment', {})#in the First click the temp_enrollment is empty
    # Combine courses
    merged_courses = permanent_data.get('courses', {}).copy() #If 'courses' does not exist, it returns an empty dictionary {} instead (as a fallback).
    merged_courses.update(temp_data)  # temp overrides permanent

    return jsonify({
        "courses": merged_courses,
        "attendance": permanent_data.get('attendance', {})
    })


@app.route('/reset-attendance', methods=['POST'])
@csrf.exempt # we added this beacuse it has the post request but the  navigator.sendBeacon('/reset-attendance') dont carry the post request to we need to we need to tell the meachiine not to apply the csrf Protection for this Request 
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
        # Update profile using DatabaseManager
        success = db_manager.update_profile(
            register_number=register_number,
            name=data['name'],
            email=data['email'],
            phone_number=data['phone_number'],
            date_of_birth=data['date_of_birth']
        )

        if success:
            return jsonify({'status': 'success', 'message': 'Profile updated successfully'}), 200
        else:
            return jsonify({'status': 'fail', 'message': 'Failed to update profile'}), 500
            
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'status': 'error', 'message': 'An error occurred'}), 500


# Error handler for production

if __name__ == '__main__':
    app.run()