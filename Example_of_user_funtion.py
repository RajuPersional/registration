class User:
    def __init__(self, id, register_number, password, name, date_of_birth, email, phone_number):
        self.id = id
        self.register_number = register_number
        self.password = password
        self.name = name
        self.date_of_birth = date_of_birth
        self.email = email
        self.phone_number = phone_number

    def to_dict(self):
        return {
            'id': self.id,
            'register_number': self.register_number,
            'name': self.name,
            'date_of_birth': self.date_of_birth,
            'email': self.email,
            'phone_number': self.phone_number
        }

# Now we manually create a user object (like SQLAlchemy does)
user = User(
    id=1,
    register_number=101,
    password='abc123',
    name='John Doe',
    date_of_birth='2000-01-15',
    email='john@example.com',
    phone_number='1234567890'
)

# Now call the method
print(user.to_dict())
