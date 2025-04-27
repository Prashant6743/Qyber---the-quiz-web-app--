# Qyber - The Quiz Web App

Qyber is a modern web application for creating, managing, and taking quizzes. It provides separate interfaces for faculty members and students, allowing faculty to create quizzes and view results while students can take quizzes and track their performance.

## Features

### For Faculty
- Create and manage quizzes with multiple-choice questions
- Edit existing quizzes and add new questions
- View detailed quiz results and student performance
- Personalized faculty dashboard with profile management
- AI-powered quiz generation

### For Students
- Take quizzes with an intuitive interface
- View quiz scores and performance metrics
- Review past quiz attempts
- Track progress over time

## Technology Stack

- **Backend**: Python Flask
- **Database**: SQLAlchemy with SQLite
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: Custom session-based authentication
- **UI**: Modern, responsive design with web3-themed elements

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd qyber-quiz-app
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Initialize the database:
   ```
   python app.py
   ```

## Usage

1. Start the application:
   ```
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5002
   ```

3. Log in using your credentials:
   - For faculty access, use faculty role
   - For student access, use student role

## Project Structure

```
/qyber-quiz-app
    /static
        /css          # Stylesheets
        /js           # JavaScript files
    /templates        # HTML templates
    /instance         # Database files
    app.py            # Main application file
    requirements.txt  # Dependencies
```

## Database Schema

- **User**: Stores user information and credentials
- **Quiz**: Contains quiz metadata and relationships
- **Question**: Stores questions for each quiz
- **Option**: Contains options for each question
- **QuizAttempt**: Records student quiz attempts and scores

## Future Enhancements

- Quiz categories and tags
- Advanced analytics for faculty
- Timed quizzes
- Social sharing features
- Mobile application
-tab switch restriction

## License

[MIT License](LICENSE)

## Contributors

- [Your Name](https://github.com/prashant6743)
