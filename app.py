from flask import Flask, request, jsonify , render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    register_number = data.get('registerNumber')
    password = data.get('password')
    
    # Convert registerNumber to int
    try:
        register_number = int(register_number)
    except (ValueError, TypeError):
        return jsonify({'status': 'fail', 'message': 'Invalid registration number'}), 400

    # Validation with number
    if register_number == 1 and password == '1':
        return jsonify({'status': 'success', 'message': 'Login successful'}), 200
    else:
        return jsonify({'status': 'fail', 'message': 'Invalid credentials'}), 401

@app.route('/')
def home():
     return render_template('Bricks.html')


@app.route('/HomePage')
def HomePage():
    return render_template('HomePage.html')     


@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/Financial')
def Financial():
    return render_template('Financial.html')

@app.route('/dashboard')
def assessment():
    return render_template('dashboard.html')


@app.route('/attendence')
def Attendence():
    return render_template('Attendence.html') 

@app.route('/courses')
def courses():
    return render_template('course.html')    

if __name__ == '__main__':
    app.run(debug=True)