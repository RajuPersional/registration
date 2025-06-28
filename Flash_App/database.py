import sqlite3
from werkzeug.security import generate_password_hash,check_password_hash

def create_database():
    """Create the database and tables with sample data"""
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Create the user table with all required columns
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user (
            register_number INTEGER PRIMARY KEY,
            plain_password TEXT, -- for dev only
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
        (1, '1', generate_password_hash('1'), 'Raju', 'raju@gmail.com', '9121159199', '2000-01-15'),
        (2, '2', generate_password_hash('2'), 'Jane Smith', 'jane.smith@example.com', '2345678901', '2001-03-20'),
        (3, '3', generate_password_hash('3'), 'Mike Johnson', 'mike.johnson@example.com', '3456789012', '2002-05-10')
    ]

        cursor.executemany('INSERT INTO user VALUES (?, ?, ?, ?, ?, ?,?)', sample_users)

    conn.commit()
    conn.close()
    print("Database created successfully!")

def check_login(register_number, password):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT password FROM user WHERE register_number = ?', (register_number,))
        row = cursor.fetchone()
        if row and check_password_hash(row[0], password):
            return True
        return False
    except sqlite3.Error as e:
        print(f"Error during login: {e}")
        return False
    finally:
        conn.close()

def get_all_users():
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
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user WHERE register_number = ?", (register_number,))
        user = cursor.fetchone()
        conn.close()
        return bool(user)
    except Exception as e:
        print(f"DB error during validation: {e}")
        return False

def get_user_data(register_number, password=None):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT * FROM user WHERE register_number = ?', (register_number,))
        user = cursor.fetchone()
        print(user)
        if user:
            if password is None or check_password_hash(user[2], password):
                return {
                    'register_number': user[0],
                    'name': user[3],
                    'email': user[4],
                    'phone_number': user[5],
                    'date_of_birth': user[6]  # Index should be 5, not 6

                }
        return None
    except sqlite3.Error as e:
        print(f"Error getting user data: {e}")
        return None
    finally:
        conn.close()

def update_password(password, registration):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    try:
        hashed_password = generate_password_hash(password)
        cursor.execute(
            "UPDATE user SET password = ? WHERE register_number = ?",
            (hashed_password, registration)
        )
        conn.commit()

        if cursor.rowcount == 0:
            print("❌ No user found with that registration number.")
            return False
        else:
            print("✅ Password updated successfully.")
            return True

    except sqlite3.Error as e:
        print(f"Error updating password: {e}")
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    create_database()
