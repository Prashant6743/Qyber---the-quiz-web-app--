from app import app, db, User
from werkzeug.security import generate_password_hash

def create_test_users():
    with app.app_context():
        # Create faculty user
        faculty = User(
            username='faculty1',
            email='faculty1@example.com',
            password=generate_password_hash('faculty123'),
            role='faculty'
        )

        # Create student user
        student = User(
            username='student1',
            email='student1@example.com',
            password=generate_password_hash('student123'),
            role='student'
        )

        # Add users to database
        db.session.add(faculty)
        db.session.add(student)
        db.session.commit()

if __name__ == '__main__':
    create_test_users()
    print("Test users created successfully!")
    print("\nLogin Credentials:")
    print("\nFaculty:")
    print("Username: faculty1")
    print("Password: faculty123")
    print("\nStudent:")
    print("Username: student1")
    print("Password: student123")
