import sqlite3

def create_database():
    """Create the database and tables with sample data"""
    conn = sqlite3.connect('users.db') # This is used to connet it to the database
    cursor = conn.cursor()             # Cursor is the once  helps to Write the sqlite3 command 
    
    # Create the user table with all required columns
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
    
    # Add sample users if table is empty
    cursor.execute("SELECT COUNT(*) FROM user")
    if cursor.fetchone()[0] == 0:
        sample_users = [
            (1, '1', 'Raju', 'raju@gmail.com', '9121159199', '2000-01-15'),
            (2, '2', 'Jane Smith', 'jane.smith@example.com', '2345678901', '2001-03-20'),
            (3, '3', 'Mike Johnson', 'mike.johnson@example.com', '3456789012', '2002-05-10')
        ]
        cursor.executemany('INSERT INTO user VALUES (?, ?, ?, ?, ?, ?)', sample_users) # inserts all data in the given Formate
    
    conn.commit()
    conn.close()
    print("Database created successfully!")

def check_login(register_number, password):
    """Check if login credentials are correct"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('SELECT * FROM user WHERE register_number = ? AND password = ?',(register_number, password))
        user = cursor.fetchone() # the fetchone will give the First output if i use the fetchall() it will give all the outputs form the Query
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


def is_registered_user(register_number):
    try:
        conn = sqlite3.connect('users.db')  # DB file
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user WHERE register_number = ?", (register_number,))
        user = cursor.fetchone()
        conn.close()
        return bool(user)  # ✅ Returns True if user exists, else False
    except Exception as e:
        print(f"DB error during validation: {e}")
        return False

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
                'register_number': user[0],
                'name': user[2],
                'email': user[3],
                'phone_number': user[4],
                'date_of_birth': user[5]
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