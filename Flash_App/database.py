import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)# this will set the level of the Logging
logger = logging.getLogger(__name__)

class DatabaseManager:
    """
    A class to manage all database operations.
    This makes the code more organized and easier to maintain.
    """
    
    def __init__(self):
        """Initialize the database connection"""
        self.db_path = os.path.join(os.path.dirname(__file__), 'users.db')
        
    def initialize_database(self):
        """
        Create the database and tables if they don't exist.
        Adds sample data if the database is empty.
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    register_number INTEGER PRIMARY KEY,
                    plain_password TEXT, -- for development only
                    password TEXT NOT NULL,
                    name TEXT,
                    email TEXT,
                    phone_number TEXT,
                    date_of_birth DATE
                )
            ''')
            
            # Check if table is empty
            cursor.execute("SELECT COUNT(*) FROM users")
            if cursor.fetchone()[0] == 0:
                # Add sample users
                sample_users = [
                    (1, '1', generate_password_hash('1'), 'Raju', 'raju@gmail.com', '9121159199', '2000-01-15'),
                    (2, '2', generate_password_hash('2'), 'Jane Smith', 'jane.smith@example.com', '2345678901', '2001-03-20'),
                    (3, '3', generate_password_hash('3'), 'Mike Johnson', 'mike.johnson@example.com', '3456789012', '2002-05-10')
                ]
                cursor.executemany('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)', sample_users)
                logger.info("Sample users added to database")
            
            conn.commit()
            logger.info("Database initialized successfully")
            
        except sqlite3.Error as e:
            logger.error(f"Error initializing database: {e}")
            raise
        finally:
            conn.close()
            
    def check_login(self, register_number, password):
        """
        Verify user login credentials.
        
        Args:
            register_number (int): User's registration number
            password (str): User's password
            
        Returns:
            bool: True if login is successful, False otherwise
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('SELECT password FROM users WHERE register_number = ?', (register_number,))
            row = cursor.fetchone()
            
            if row and check_password_hash(row[0], password):
                logger.info(f"Successful login for register number: {register_number}")
                return True
                
            logger.info(f"Failed login attempt for register number: {register_number}")
            return False
            
        except sqlite3.Error as e:
            logger.error(f"Error during login: {e}")
            return False
        finally:
            conn.close()

    def get_all_users(self):
        """
        Retrieve all users from the database.
        
        Returns:
            list: A list of tuples containing user data
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM users')
            users = cursor.fetchall()
            return users
            
        except sqlite3.Error as e:
            logger.error(f"Error getting users: {e}")
            return []
        finally:
            conn.close()

    def is_registered_user(self, register_number):
        """
        Check if a user is registered.
        
        Args:
            register_number (int): User's registration number
            
        Returns:
            bool: True if user is registered, False otherwise
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM users WHERE register_number = ?", (register_number,))
            user = cursor.fetchone()
            return bool(user)
            
        except sqlite3.Error as e:
            logger.error(f"Error checking user registration: {e}")
            return False
        finally:
            conn.close()

    def get_user_data(self, register_number, password=None):
        """
        Retrieve user data.
        
        Args:
            register_number (int): User's registration number
            password (str): User's password (optional)
            
        Returns:
            dict: A dictionary containing user data
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM users WHERE register_number = ?', (register_number,))
            user = cursor.fetchone()
            
            if user:
                if password is None or check_password_hash(user[2], password):
                    return {
                        'register_number': user[0],
                        'name': user[3],
                        'email': user[4],
                        'phone_number': user[5],
                        'date_of_birth': user[6]
                    }
            return None
            
        except sqlite3.Error as e:
            logger.error(f"Error getting user data: {e}")
            return None
        finally:
            conn.close()

    def update_password(self, password, registration):
        """
        Update a user's password.
        
        Args:
            password (str): New password
            registration (int): User's registration number
            
        Returns:
            bool: True if password update is successful, False otherwise
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            hashed_password = generate_password_hash(password)
            cursor.execute(
                "UPDATE users SET password = ? WHERE register_number = ?",
                (hashed_password, registration)
            )
            conn.commit()
            
            if cursor.rowcount == 0:
                logger.info("No user found with that registration number.")
                return False
            else:
                logger.info("Password updated successfully.")
                return True
                
        except sqlite3.Error as e:
            logger.error(f"Error updating password: {e}")
            return False
        finally:
            conn.close()
            
    def update_profile(self, register_number, name, email, phone_number, date_of_birth):
        """
        Update a user's profile information.
        
        Args:
            register_number (int): User's registration number
            name (str): User's full name
            email (str): User's email address
            phone_number (str): User's phone number
            date_of_birth (str): User's date of birth (YYYY-MM-DD format)
            
        Returns:
            bool: True if update was successful, False otherwise
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE users 
                SET name = ?, email = ?, phone_number = ?, date_of_birth = ?
                WHERE register_number = ?
            ''', (
                name,
                email,
                phone_number,
                date_of_birth,
                register_number
            ))
            
            conn.commit()
            
            if cursor.rowcount == 0:
                logger.warning(f"No user found with register number: {register_number}")
                return False
                
            logger.info(f"Successfully updated profile for user: {register_number}")
            return True
            
        except sqlite3.Error as e:
            logger.error(f"Error updating profile: {e}")
            return False
        finally:
            conn.close()

# Initialize the database manager
db_manager = DatabaseManager()

if __name__ == '__main__':
    # This will only run when the script is executed directly
    try:
        db_manager.initialize_database()
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
