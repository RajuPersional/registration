import sqlite3

def create_database():
    """Create the database and tables if they don't exist, and add missing columns"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # Create the user table if it doesn't exist with the desired schema
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user (
        register_number INTEGER PRIMARY KEY,
        password TEXT NOT NULL,
        name TEXT,
        email TEXT,
        phone_number TEXT,
        date_of_birth DATE
    )
    ''')
    
    # Add missing columns if they don't exist in an older database schema
    # Check for 'phone_number' column
    cursor.execute("PRAGMA table_info(user)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'phone_number' not in columns:
        cursor.execute("ALTER TABLE user ADD COLUMN phone_number TEXT;")
        print("Added 'phone_number' column to user table.")

    # Check for 'date_of_birth' column (if it might also be missing or in wrong type)
    # This assumes date_of_birth was already there, but adding check for robustness
    if 'date_of_birth' not in columns:
        cursor.execute("ALTER TABLE user ADD COLUMN date_of_birth DATE;")
        print("Added 'date_of_birth' column to user table.")

    # Add some sample users if the table is empty (will not re-add if users exist)
    cursor.execute("SELECT COUNT(*) FROM user")
    if cursor.fetchone()[0] == 0:
        sample_users = [
            (1, '1', 'Raju', 'raju@gmail.com', '9121159199', '2000-01-15'),
            (2, '2', 'Jane Smith', 'jane.smith@example.com', '2345678901', '2001-03-20'),
            (3, '3', 'Mike Johnson', 'mike.johnson@example.com', '3456789012', '2002-05-10')
        ]
        cursor.executemany('INSERT INTO user VALUES (?, ?, ?, ?, ?, ?)', sample_users)
    
    conn.commit()
    conn.close()
    print("Database created successfully (or updated)!\n")

def check_login(register_number, password):
    """Check if login credentials are correct"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT * FROM user WHERE register_number = ? AND password = ?',
                      (register_number, password))
        user = cursor.fetchone()
        return user is not None
    except sqlite3.Error as e:
        print(f"Error during login: {e}")
        return False
    finally:
        conn.close()

def get_all_users():
    """Get all users from database"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT * FROM user')
        users = cursor.fetchall()
        return users
    except sqlite3.Error as e:
        print(f"Error getting users: {e}")
        return []
    finally:
        conn.close()

def get_user_data(register_number, password=None):
    """Get user data by registration number and optionally verify password
    
    Args:
        register_number (int): The user's registration number
        password (str, optional): The user's password for verification
        
    Returns:
        dict: User data if found and password matches (if provided), None otherwise
    """
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    try:
        # If password is provided, verify both registration number and password
        if password is not None:
            cursor.execute('SELECT * FROM user WHERE register_number = ? AND password = ?',
                         (register_number, password))
        else:
            cursor.execute('SELECT * FROM user WHERE register_number = ?', (register_number,))
            
        user = cursor.fetchone()
        if user:
            print(f"DEBUG: Raw user data from DB: {user}")
           
            return {
                'id': user[0],              
                'register_number': user[1], 
                'name': user[3],            
                'email': user[5],           
                'phone_number': user[6] ,
                'date_of_birth': user[4]    
            }
        
        
        return None
    except sqlite3.Error as e:
        print(f"Error getting user data: {e}")
        return None
    finally:
        conn.close()

# Create the database when this file is run directly
if __name__ == '__main__':
    create_database() 