from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this to a secure secret key
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quiz.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Add this to suppress the warning
db = SQLAlchemy(app)

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'faculty' or 'student'
    quizzes_created = db.relationship('Quiz', backref='creator', lazy=True)
    attempts = db.relationship('QuizAttempt', backref='student', lazy=True)

# Quiz Model
class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    questions = db.relationship('Question', backref='quiz', lazy=True)
    attempts = db.relationship('QuizAttempt', backref='quiz', lazy=True)

# Question Model
class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    correct_answer = db.Column(db.String(255), nullable=False)
    options = db.relationship('Option', backref='question', lazy=True)

# Option Model
class Option(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    option_text = db.Column(db.String(255), nullable=False)

# Quiz Attempt Model
class QuizAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)
    date_attempted = db.Column(db.DateTime, default=datetime.utcnow)

@app.route('/')
def home():
    return render_template('loading.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        role = request.form.get('role')
        
        print(f"Login attempt - Username: {username}, Role: {role}")
        
        user = User.query.filter_by(username=username).first()
        
        if user:
            print(f"User found: {user.username}, Role: {user.role}")
            password_correct = check_password_hash(user.password, password)
            print(f"Password check: {password_correct}")
            role_match = user.role == role
            print(f"Role match: {role_match}")
            
            if password_correct and role_match:
                session['user_id'] = user.id
                session['role'] = user.role
                flash('Logged in successfully!', 'success')
                if role == 'faculty':
                    return redirect(url_for('faculty_dashboard'))
                else:
                    return redirect(url_for('student_dashboard'))
            elif not password_correct:
                flash('Invalid password!', 'error')
            elif not role_match:
                flash('Selected role does not match your account!', 'error')
        else:
            print(f"User not found: {username}")
            flash('User not found!', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully!', 'success')
    return redirect(url_for('login'))

@app.route('/faculty-profile')
def faculty_profile():
    if session.get('role') != 'faculty':
        return redirect(url_for('login'))
    
    current_user = User.query.get(session['user_id'])
    
    # Get quizzes created by the faculty
    my_quizzes = Quiz.query.filter_by(creator_id=current_user.id).all()
    
    # Get some basic stats
    total_quizzes = len(my_quizzes)
    total_questions = Question.query.join(Quiz).filter(Quiz.creator_id == current_user.id).count()
    total_attempts = QuizAttempt.query.join(Quiz).filter(Quiz.creator_id == current_user.id).count()
    
    # Calculate average score if there are attempts
    if total_attempts > 0:
        avg_score = db.session.query(db.func.avg(QuizAttempt.score))\
            .join(Quiz).filter(Quiz.creator_id == current_user.id).scalar() or 0
    else:
        avg_score = 0
    
    return render_template('faculty_profile.html',
                         current_user=current_user,
                         stats={
                             'total_quizzes': total_quizzes,
                             'total_questions': total_questions,
                             'total_attempts': total_attempts,
                             'avg_score': round(avg_score, 1)
                         })

@app.route('/edit-faculty-profile', methods=['GET', 'POST'])
def edit_faculty_profile():
    if session.get('role') != 'faculty':
        return redirect(url_for('login'))
    
    current_user = User.query.get(session['user_id'])
    
    if request.method == 'POST':
        # Update user information
        current_user.username = request.form.get('username')
        current_user.email = request.form.get('email')
        
        # If password is provided, update it
        new_password = request.form.get('new_password')
        if new_password and len(new_password) > 0:
            current_user.password = generate_password_hash(new_password)
        
        # Save changes
        db.session.commit()
        
        # Flash a success message
        flash('Profile updated successfully!', 'success')
        
        # Redirect back to profile page
        return redirect(url_for('faculty_profile'))
    
    return render_template('edit_faculty_profile.html', current_user=current_user)

@app.route('/faculty-dashboard')
def faculty_dashboard():
    if session.get('role') != 'faculty':
        return redirect(url_for('login'))
    
    current_user = User.query.get(session['user_id'])
    
    # Get quizzes created by the faculty
    my_quizzes = Quiz.query.filter_by(creator_id=current_user.id).all()
    
    # Get recent quiz attempts for quizzes created by this faculty
    recent_attempts = QuizAttempt.query.join(Quiz).filter(Quiz.creator_id == current_user.id)\
        .order_by(QuizAttempt.date_attempted.desc()).limit(5).all()
    
    # Get some basic stats
    total_quizzes = len(my_quizzes)
    total_questions = Question.query.join(Quiz).filter(Quiz.creator_id == current_user.id).count()
    total_attempts = QuizAttempt.query.join(Quiz).filter(Quiz.creator_id == current_user.id).count()
    
    # Calculate average score if there are attempts
    if total_attempts > 0:
        avg_score = db.session.query(db.func.avg(QuizAttempt.score))\
            .join(Quiz).filter(Quiz.creator_id == current_user.id).scalar() or 0
    else:
        avg_score = 0
    
    return render_template('faculty_dashboard.html',
                         current_user=current_user,
                         my_quizzes=my_quizzes,
                         recent_attempts=recent_attempts,
                         stats={
                             'total_quizzes': total_quizzes,
                             'total_questions': total_questions,
                             'total_attempts': total_attempts,
                             'avg_score': round(avg_score, 1)
                         })

@app.route('/student-dashboard')
def student_dashboard():
    if session.get('role') != 'student':
        return redirect(url_for('login'))
    
    current_user = User.query.get(session['user_id'])
    
    # Get available quizzes
    available_quizzes = Quiz.query.all()
    
    # Get recent attempts for the current student
    recent_attempts = QuizAttempt.query.filter_by(student_id=current_user.id)\
        .order_by(QuizAttempt.date_attempted.desc()).limit(5).all()
    
    return render_template('student_dashboard.html',
                         current_user=current_user,
                         available_quizzes=available_quizzes,
                         recent_attempts=recent_attempts)

@app.route('/take-quiz/<int:quiz_id>', methods=['GET', 'POST'])
def take_quiz(quiz_id):
    if session.get('role') != 'student':
        return redirect(url_for('login'))
        
    current_user = User.query.get(session['user_id'])
    quiz = Quiz.query.get_or_404(quiz_id)
    questions = Question.query.filter_by(quiz_id=quiz.id).all()
    
    if not questions:
        flash('This quiz has no questions yet.', 'error')
        return redirect(url_for('student_dashboard'))
        
    if request.method == 'POST':
        # Calculate score
        score = 0
        total_questions = len(questions)
        
        for question in questions:
            selected_answer = request.form.get(f'question_{question.id}')
            if selected_answer and selected_answer == question.correct_answer:
                score += 1
        
        # Calculate percentage score
        percentage_score = (score / total_questions) * 100
        
        # Save attempt
        attempt = QuizAttempt(
            quiz_id=quiz.id,
            student_id=session['user_id'],
            score=percentage_score
        )
        
        db.session.add(attempt)
        db.session.commit()
        
        flash(f'Quiz completed! Your score: {percentage_score:.1f}%', 'success')
        return redirect(url_for('view_attempt', attempt_id=attempt.id))
    
    # Prepare questions with options for display
    quiz_questions = []
    for question in questions:
        options = Option.query.filter_by(question_id=question.id).all()
        quiz_questions.append({
            'id': question.id,
            'text': question.question_text,
            'options': options
        })
    
    return render_template('take_quiz.html', quiz=quiz, questions=quiz_questions, current_user=current_user)

@app.route('/view-attempt/<int:attempt_id>')
def view_attempt(attempt_id):
    if session.get('role') != 'student':
        return redirect(url_for('login'))
        
    current_user = User.query.get(session['user_id'])
    attempt = QuizAttempt.query.get_or_404(attempt_id)
    
    # Security check - make sure the student can only view their own attempts
    if attempt.student_id != session['user_id']:
        flash('You are not authorized to view this attempt.', 'error')
        return redirect(url_for('student_dashboard'))
    
    quiz = Quiz.query.get(attempt.quiz_id)
    questions = Question.query.filter_by(quiz_id=quiz.id).all()
    
    # Prepare questions with options for display
    quiz_questions = []
    for question in questions:
        options = Option.query.filter_by(question_id=question.id).all()
        quiz_questions.append({
            'id': question.id,
            'text': question.question_text,
            'options': options,
            'correct_answer': question.correct_answer
        })
    
    return render_template('view_attempt.html', 
                           attempt=attempt, 
                           quiz=quiz, 
                           questions=quiz_questions,
                           current_user=current_user)

@app.route('/generate-ai-quiz', methods=['POST'])
def generate_ai_quiz():
    if session.get('role') != 'faculty':
        return redirect(url_for('login'))
    
    topic = request.form.get('topic')
    difficulty = request.form.get('difficulty')
    num_questions = int(request.form.get('num_questions', 10))
    
    # Generate quiz title and description
    title = f"{topic.title()} Quiz ({difficulty.title()} Level)"
    description = f"AI-generated quiz about {topic} with {num_questions} questions at {difficulty} difficulty."
    
    # Create new quiz
    new_quiz = Quiz(
        title=title,
        description=description,
        creator_id=session['user_id']
    )
    
    db.session.add(new_quiz)
    db.session.commit()
    
    # Sample questions based on topic (in a real app, this would use an AI API)
    sample_questions = {
        'python': [
            {'question': 'What is Python?', 'correct': 'A high-level programming language', 
             'options': ['A snake species', 'A text editor', 'A high-level programming language', 'A database']},
            {'question': 'Which symbol is used for comments in Python?', 'correct': '#', 
             'options': ['/', '//', '#', '/*']},
            {'question': 'What is the output of print(2**3)?', 'correct': '8', 
             'options': ['6', '8', '9', '16']},
        ],
        'java': [
            {'question': 'What is Java?', 'correct': 'A programming language', 
             'options': ['A coffee type', 'An island', 'A programming language', 'An OS']},
        ],
        'default': [
            {'question': f'Question about {topic}?', 'correct': 'Correct answer', 
             'options': ['Wrong answer', 'Also wrong', 'Correct answer', 'Still wrong']},
        ]
    }
    
    # Get questions for the topic or use default
    questions_pool = sample_questions.get(topic.lower(), sample_questions['default'])
    
    # Add questions to the quiz
    for q_data in questions_pool[:num_questions]:
        question = Question(
            quiz_id=new_quiz.id,
            question_text=q_data['question'],
            correct_answer=q_data['correct']
        )
        db.session.add(question)
        db.session.commit()
        
        # Add options for the question
        for opt in q_data['options']:
            option = Option(
                question_id=question.id,
                option_text=opt
            )
            db.session.add(option)
    
    db.session.commit()
    flash('AI-generated quiz created successfully!', 'success')
    return redirect(url_for('edit_quiz', quiz_id=new_quiz.id))

@app.route('/create-quiz', methods=['GET', 'POST'])
def create_quiz():
    if session.get('role') != 'faculty':
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        
        # Create new quiz
        new_quiz = Quiz(
            title=title,
            description=description,
            creator_id=session['user_id']
        )
        
        db.session.add(new_quiz)
        db.session.commit()
        
        # Handle questions and options
        questions_data = request.form.getlist('questions[]')
        options_data = request.form.getlist('options[]')
        
        # Get correct answers from form data
        correct_answers = []
        for i in range(len(questions_data)):
            correct_answer = request.form.get(f'correct_answers[{i}]')
            if correct_answer is not None:
                correct_answers.append(correct_answer)
            else:
                correct_answers.append('0')  # Default to first option if not specified
        
        # Group options by question (assuming 4 options per question)
        options_per_question = 4
        
        for i, q_text in enumerate(questions_data):
            # Create question
            question = Question(
                quiz_id=new_quiz.id,
                question_text=q_text,
                correct_answer=correct_answers[i]
            )
            db.session.add(question)
            db.session.commit()
            
            # Add options for this question
            start_idx = i * options_per_question
            end_idx = start_idx + options_per_question
            question_options = options_data[start_idx:end_idx]
            
            for opt_text in question_options:
                if opt_text.strip():  # Only add non-empty options
                    option = Option(
                        question_id=question.id,
                        option_text=opt_text
                    )
                    db.session.add(option)
        
        db.session.commit()
        flash('Quiz created successfully!', 'success')
        return redirect(url_for('faculty_dashboard'))
    
    return render_template('create_quiz.html')

@app.route('/edit-quiz/<int:quiz_id>', methods=['GET', 'POST'])
def edit_quiz(quiz_id):
    if session.get('role') != 'faculty':
        return redirect(url_for('login'))
    
    quiz = Quiz.query.get_or_404(quiz_id)
    
    # Ensure the faculty owns this quiz
    if quiz.creator_id != session['user_id']:
        flash('You do not have permission to edit this quiz', 'error')
        return redirect(url_for('faculty_dashboard'))
    
    questions = Question.query.filter_by(quiz_id=quiz_id).all()
    
    return render_template('edit_quiz.html', quiz=quiz, questions=questions)

@app.route('/add-question/<int:quiz_id>', methods=['POST'])
def add_question(quiz_id):
    if session.get('role') != 'faculty':
        return redirect(url_for('login'))
    
    quiz = Quiz.query.get_or_404(quiz_id)
    
    # Ensure the faculty owns this quiz
    if quiz.creator_id != session['user_id']:
        flash('You do not have permission to edit this quiz', 'error')
        return redirect(url_for('faculty_dashboard'))
    
    question_text = request.form.get('question_text')
    correct_answer = request.form.get('correct_answer')
    options = request.form.getlist('options')
    
    # Create new question
    new_question = Question(
        quiz_id=quiz_id,
        question_text=question_text,
        correct_answer=correct_answer
    )
    
    db.session.add(new_question)
    db.session.commit()
    
    # Add options
    for option_text in options:
        if option_text.strip():
            option = Option(question_id=new_question.id, option_text=option_text)
            db.session.add(option)
    
    db.session.commit()
    
    flash('Question added successfully!', 'success')
    return redirect(url_for('edit_quiz', quiz_id=quiz_id))

@app.route('/view-quiz-results/<int:quiz_id>')
def view_quiz_results(quiz_id):
    if session.get('role') != 'faculty':
        return redirect(url_for('login'))
    
    quiz = Quiz.query.get_or_404(quiz_id)
    
    # Ensure the faculty owns this quiz
    if quiz.creator_id != session['user_id']:
        flash('You do not have permission to view this quiz\'s results', 'error')
        return redirect(url_for('faculty_dashboard'))
    
    attempts = QuizAttempt.query.filter_by(quiz_id=quiz_id).order_by(QuizAttempt.date_attempted.desc()).all()
    
    return render_template('quiz_results.html', quiz=quiz, attempts=attempts)

@app.route('/view-attempt-details/<int:attempt_id>')
def view_attempt_details(attempt_id):
    if session.get('role') != 'faculty' and session.get('role') != 'student':
        return redirect(url_for('login'))
    
    attempt = QuizAttempt.query.get_or_404(attempt_id)
    quiz = Quiz.query.get(attempt.quiz_id)
    
    # Ensure the user has permission to view this attempt
    if session.get('role') == 'faculty' and quiz.creator_id != session['user_id']:
        flash('You do not have permission to view this attempt', 'error')
        return redirect(url_for('faculty_dashboard'))
    
    if session.get('role') == 'student' and attempt.student_id != session['user_id']:
        flash('You do not have permission to view this attempt', 'error')
        return redirect(url_for('student_dashboard'))
    
    # Get student answers from the attempt data
    # In a real application, this would be stored in a separate table
    # For this example, we'll simulate it with some sample data
    
    # This would normally come from a database table of student responses
    # Format: {question_id: student_answer}
    student_answers = {
        1: "Python is an interpreted language",
        2: "Lists",
        3: "__init__"
    }
    
    # Determine which questions were answered correctly
    correct_answers = set()
    for question in quiz.questions:
        if question.id in student_answers and student_answers[question.id] == question.correct_answer:
            correct_answers.add(question.id)
    
    return render_template('attempt_details.html', 
                           attempt=attempt, 
                           quiz=quiz,
                           student_answers=student_answers,
                           correct_answers=correct_answers)

@app.route('/delete-quiz/<int:quiz_id>', methods=['POST'])
def delete_quiz(quiz_id):
    if session.get('role') != 'faculty':
        return jsonify({'success': False, 'message': 'Unauthorized access'}), 401
    
    quiz = Quiz.query.get_or_404(quiz_id)
    
    # Ensure the faculty owns this quiz
    if quiz.creator_id != session['user_id']:
        return jsonify({'success': False, 'message': 'You do not have permission to delete this quiz'}), 403
    
    try:
        # First, delete all options for each question
        for question in quiz.questions:
            Option.query.filter_by(question_id=question.id).delete()
        
        # Next, delete all questions
        Question.query.filter_by(quiz_id=quiz.id).delete()
        
        # Next, delete all attempts
        QuizAttempt.query.filter_by(quiz_id=quiz.id).delete()
        
        # Finally, delete the quiz itself
        db.session.delete(quiz)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Quiz deleted successfully'})
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting quiz: {e}")
        return jsonify({'success': False, 'message': 'An error occurred while deleting the quiz'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5004)
