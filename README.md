# Qyber - Interactive Quiz Web Application

![Qyber Logo](qyber.png)

## Overview
build for our capstone project 

Qyber is a modern web application for creating, managing, and taking quizzes in educational environments. It provides distinct interfaces for faculty members and students, enabling a comprehensive quiz management ecosystem.

## Key Features

### For Faculty
- Create and manage custom quizzes
- Generate AI-powered questions
- Analyze student performance
- Manage faculty profile

### For Students
- Take quizzes through an intuitive interface
- Generate custom practice quizzes with AI
- Track progress and performance
- Access personalized dashboard

## Technology Stack

- **Backend**: Python Flask, SQLAlchemy
- **Database**: SQLite (scalable to PostgreSQL/MySQL)
- **Frontend**: HTML5, CSS3, JavaScript
- **AI Integration**: Next.js-based AI Quiz Generator

## How to Run

### Main Application
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the application
python3 app.py
```
Access at: http://localhost:5004

### AI Quiz Generator
```bash
# In a separate terminal
cd ai-quiz-maker-main
npm install
npm run dev
```
Access at: http://localhost:9003

## Default Login Credentials

- **Faculty**: Username: `faculty`, Password: `password`
- **Student**: Username: `student`, Password: `password`

## Clear Database Cache

To reset the database:
```bash
python3 clear_db_cache.py
```

## Author

**Prashant Kumar**

## Contact

Email: prashantcodezz@gmail.com

## License

MIT

## Note on Running the Application

This application requires running two environments simultaneously:
1. The main Flask application for the quiz system
2. The AI Quiz Generator component

After starting both servers, copy the AI Quiz Generator URL (http://localhost:9003) and paste it in the student panel's redirect link to enable AI quiz functionality.

---

© 2025 Qyber Quiz | Developed by Prashant Kumar
