from app import app, db, User, Quiz, Question, Option, QuizAttempt
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

def create_sample_data():
    with app.app_context():
        # Drop all tables and recreate
        db.drop_all()
        db.create_all()
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

        db.session.add(faculty)
        db.session.add(student)
        db.session.commit()

        # Create a sample quiz
        quiz = Quiz(
            title='Python Basics',
            description='Test your knowledge of Python fundamentals',
            creator_id=faculty.id
        )
        db.session.add(quiz)
        db.session.commit()

        # Add questions
        questions = [
            {
                'text': 'What is Python?',
                'correct': 'A high-level programming language',
                'options': [
                    'A high-level programming language',
                    'A snake',
                    'A database system',
                    'An operating system'
                ]
            },
            {
                'text': 'What is the output of print(2 + 2)?',
                'correct': '4',
                'options': ['4', '22', '2 + 2', 'Error']
            }
        ]

        for q_data in questions:
            question = Question(
                quiz_id=quiz.id,
                question_text=q_data['text'],
                correct_answer=q_data['correct']
            )
            db.session.add(question)
            db.session.commit()

            for opt in q_data['options']:
                option = Option(
                    question_id=question.id,
                    option_text=opt
                )
                db.session.add(option)

        # Create some sample attempts
        scores = [85, 92, 78]
        for score in scores:
            attempt = QuizAttempt(
                quiz_id=quiz.id,
                student_id=student.id,
                score=score,
                date_attempted=datetime.utcnow() - timedelta(days=len(scores))
            )
            db.session.add(attempt)

        db.session.commit()
        print("Sample data created successfully!")

if __name__ == '__main__':
    create_sample_data()
