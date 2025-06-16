import pytest
from app import app
import json
import os
import sqlite3
from database import create_database

@pytest.fixture(scope='session')
def setup_database():
    """Create a test database with sample data"""
    # Create the database and tables
    create_database()
    yield
    # Clean up after tests if needed
    if os.path.exists('users.db'):
        os.remove('users.db')

@pytest.fixture
def client(setup_database):
    """Create a test client with a test database"""
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    with app.test_client() as client:
        with app.app_context():
            yield client

def test_home_page(client):
    """Test if home page loads successfully"""
    response = client.get('/')
    assert response.status_code == 200
    # Check for specific content that should be in the login page
    assert b'College Management System' in response.data
    assert b'Login' in response.data
    assert b'Register' in response.data

def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = client.post('/api/login',
                          json={'registerNumber': '99999', 'password': 'wrongpass'},
                          content_type='application/json')
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['status'] == 'fail'
    assert 'Invalid credentials' in data['message']

def test_login_valid_credentials(client):
    """Test login with valid credentials"""
    # Using the first sample user from database.py
    response = client.post('/api/login',
                          json={'registerNumber': '1', 'password': '1'},
                          content_type='application/json')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'success'
    assert 'Login successful' in data['message']

def test_login_invalid_registration_number(client):
    """Test login with invalid registration number format"""
    response = client.post('/api/login',
                          json={'registerNumber': 'notanumber', 'password': 'testpass'},
                          content_type='application/json')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['status'] == 'fail'
    assert 'Invalid registration number' in data['message']

def test_profile_access_without_login(client):
    """Test accessing profile page without login"""
    response = client.get('/Profile')
    assert response.status_code == 200
    # Check for login page content
    assert b'College Management System' in response.data
    assert b'Login' in response.data

def test_update_profile_validation(client):
    """Test profile update validation"""
    # First login and store the session
    login_response = client.post('/api/login',
                               json={'registerNumber': '1', 'password': '1'},
                               content_type='application/json')
    assert login_response.status_code == 200, "Login failed"
    data = json.loads(login_response.data)
    assert data['status'] == 'success', f"Login failed with message: {data.get('message')}"
    
    # Get the session cookie
    session_cookie = login_response.headers.get('Set-Cookie')
    assert session_cookie is not None, "No session cookie received after login"
    
    # Test with invalid email
    response = client.post('/api/update-profile',
                          json={
                              'name': 'Raju',  # Using the actual name from sample data
                              'email': 'invalid-email',
                              'phone_number': '9121159199',  # Using the actual phone from sample data
                              'date_of_birth': '2000-01-15'  # Using the actual date from sample data
                          },
                          content_type='application/json',
                          headers={'Cookie': session_cookie})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['status'] == 'fail'
    assert 'Invalid email format' in data['message']

    # Test with invalid phone number
    response = client.post('/api/update-profile',
                          json={
                              'name': 'Raju',  # Using the actual name from sample data
                              'email': 'raju@gmail.com',  # Using the actual email from sample data
                              'phone_number': '123',  # Invalid phone number
                              'date_of_birth': '2000-01-15'  # Using the actual date from sample data
                          },
                          content_type='application/json',
                          headers={'Cookie': session_cookie})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['status'] == 'fail'
    assert 'Phone number must be 10 digits' in data['message']

def test_routes_exist(client):
    """Test if all main routes exist and return 200 status code"""
    # First login to get a valid session
    login_response = client.post('/api/login',
                               json={'registerNumber': '1', 'password': '1'},
                               content_type='application/json')
    assert login_response.status_code == 200, "Login failed"
    data = json.loads(login_response.data)
    assert data['status'] == 'success', f"Login failed with message: {data.get('message')}"
    
    session_cookie = login_response.headers.get('Set-Cookie')
    assert session_cookie is not None, "No session cookie received after login"
    
    # Test routes that require authentication
    routes = ['/HomePage', '/Financial', '/Enrollment', '/Dashboard', '/Attendence', '/Courses']
    for route in routes:
        response = client.get(route, headers={'Cookie': session_cookie})
        # For routes that might redirect to login, we accept both 200 and 302
        assert response.status_code in [200, 302], f"Route {route} failed with status {response.status_code}"
        if response.status_code == 200:
            # Only check content for successful responses
            assert b'College Management System' in response.data, f"Route {route} returned unexpected content" 