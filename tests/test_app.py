import pytest
from app import app
import json
import os

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['SECRET_KEY'] = 'test-secret-key'  # Add secret key for session
    with app.test_client() as client:
        with app.app_context():
            yield client

def test_home_page(client):
    """Test if home page loads successfully"""
    response = client.get('/')
    assert response.status_code == 200
    assert b'Bricks.html' in response.data

def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = client.post('/api/login',
                          json={'registerNumber': '12345', 'password': 'wrongpass'},
                          content_type='application/json')
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['status'] == 'fail'
    assert 'Invalid credentials' in data['message']

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
    assert b'Bricks.html' in response.data  # Should redirect to login page

def test_update_profile_validation(client):
    """Test profile update validation"""
    # First login and store the session
    login_response = client.post('/api/login',
                               json={'registerNumber': '12345', 'password': 'testpass'},
                               content_type='application/json')
    assert login_response.status_code == 200  # Make sure login succeeds
    
    # Get the session cookie
    session_cookie = login_response.headers.get('Set-Cookie')
    assert session_cookie is not None, "No session cookie received after login"
    
    # Test with invalid email
    response = client.post('/api/update-profile',
                          json={
                              'name': 'Test User',
                              'email': 'invalid-email',
                              'phone_number': '1234567890',
                              'date_of_birth': '2000-01-01'
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
                              'name': 'Test User',
                              'email': 'test@example.com',
                              'phone_number': '123',  # Invalid phone number
                              'date_of_birth': '2000-01-01'
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
                               json={'registerNumber': '12345', 'password': 'testpass'},
                               content_type='application/json')
    assert login_response.status_code == 200
    
    session_cookie = login_response.headers.get('Set-Cookie')
    assert session_cookie is not None, "No session cookie received after login"
    
    # Test routes that require authentication
    routes = ['/HomePage', '/Financial', '/Enrollment', '/Dashboard', '/Attendence', '/Courses']
    for route in routes:
        response = client.get(route, headers={'Cookie': session_cookie})
        assert response.status_code == 200, f"Route {route} failed with status {response.status_code}" 