# Bricks Student Portal

A comprehensive web-based student management system built with Flask, SQLite, and modern web technologies. This application provides a complete solution for managing student information, attendance, and academic records.

## Features

- **User Authentication**
  - Secure login system with password hashing
  - Session management for secure access
  - Profile management and updates

- **Dashboard**
  - Interactive student dashboard
  - Course and attendance tracking
  - Financial records management

- **Course Management**
  - Course enrollment tracking
  - Attendance monitoring
  - Grade management

- **Profile Management**
  - Personal information updates
  - Email and contact management
  - Date of birth tracking

- **Attendance System**
  - Real-time attendance tracking
  - Course-wise attendance statistics
  - JSON data storage for attendance records

## Project Structure

```
bricks/
├── Flash_App/
│   ├── app.py          # Main Flask application
│   ├── database.py     # Database operations
│   └── reset_password/ # Password reset functionality
├── static/
│   ├── css/           # CSS files
│   ├── js_files/      # JavaScript files
│   └── File_Data/     # JSON data files
└── templates/         # HTML templates
```

## Requirements

- Python 3.8+
- Flask
- SQLite
- Flask-WTF
- Flask-CORS
- Flask-Mail
- Werkzeug
- Gunicorn (for production)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bricks.git
cd bricks
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Running Locally

```bash
python -m Flash_App.app
```

## Deployment

1. Push to GitHub:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

2. Deploy to Render:
- Create a new Web Service on Render
- Set the Start Command to: `gunicorn Flash_App.app:app`
- Set environment variables as needed

## Security Features

- CSRF protection
- Password hashing
- Secure session management
- Input validation
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For support or questions, please contact:
- Email: your.email@example.com
- GitHub: @yourusername