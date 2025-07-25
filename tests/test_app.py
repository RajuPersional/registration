import pytest
from Flash_App import app
import json
import os
import sqlite3
from Flash_App.database import create_database

@pytest.fixture(scope='session')
def setup_database():
    """Create a test database with sample data"""
    # Create test database with different name
    test_db = 'test_users.db'
    create_database(db_name=test_db)
    yield
    # Clean up after tests
    if os.path.exists(test_db):
        os.remove(test_db)

@pytest.fixture
def client(setup_database):
    """Create a test client with a test database"""
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['SECRET_KEY'] = 'RajuLucky@1432'
    
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