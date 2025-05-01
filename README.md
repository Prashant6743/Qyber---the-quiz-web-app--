# Qyber - The Interactive Quiz Web Application

![Qyber Logo](qyber.png)

## Overview

Qyber is a modern, feature-rich web application designed for creating, managing, and taking quizzes in educational environments. Built with a focus on user experience and functionality, Qyber provides distinct interfaces for faculty members and students, enabling a comprehensive quiz management ecosystem.

Faculty members can create custom quizzes, generate AI-powered questions, and analyze student performance, while students can take quizzes, track their progress, and review their past attempts through an intuitive dashboard.

## 🌟 Key Features

### For Faculty Members

- **Quiz Creation and Management**
  - Create custom quizzes with multiple-choice questions
  - Edit existing quizzes and add new questions at any time
  - Organize quizzes by topic and difficulty level

- **AI-Powered Quiz Generation**
  - Generate quizzes automatically using AI technology
  - Customize AI-generated quizzes by topic, difficulty, and length
  - Edit AI-generated content to fit specific teaching needs

- **Performance Analytics**
  - View detailed quiz results and student performance metrics
  - Track class progress with visual analytics
  - Identify knowledge gaps and areas for improvement

- **Profile Management**
  - Personalized faculty dashboard with customizable settings
  - Update profile information and credentials
  - Manage all created quizzes from a central location

### For Students

- **Interactive Quiz Interface**
  - Take quizzes through a clean, intuitive interface
  - Receive immediate feedback on quiz performance
  - View detailed explanations for correct answers

- **AI Quiz Generation**
  - Generate custom practice quizzes on any topic
  - Select difficulty level and number of questions
  - Access AI-powered learning resources

- **Progress Tracking**
  - View comprehensive score history and performance metrics
  - Track improvement over time with visual progress indicators
  - Review past quiz attempts with detailed feedback

- **Personalized Dashboard**
  - Access all available quizzes from a central dashboard
  - View recent attempts and performance statistics
  - Navigate easily between different sections of the application

## 🛠️ Technology Stack

- **Backend Framework**
  - Python Flask (v2.0.1) - Lightweight and flexible web framework
  - SQLAlchemy (v1.4.23) - SQL toolkit and Object-Relational Mapping (ORM) library

- **Database**
  - SQLite - Embedded relational database for local development
  - Scalable to PostgreSQL or MySQL for production environments

- **Frontend**
  - HTML5, CSS3 for structure and styling
  - JavaScript for interactive elements
  - Font Awesome for iconography
  - Responsive design principles for cross-device compatibility

- **Authentication & Security**
  - Custom session-based authentication system
  - Password hashing with Werkzeug security
  - CSRF protection for form submissions

- **UI/UX**
  - Modern, responsive design with web3-themed elements
  - Intuitive navigation and user-friendly interfaces
  - Consistent visual language across all pages

- **AI Integration**
  - Next.js-based AI Quiz Generator (separate module)
  - Integration with advanced AI models for quiz generation

## 📋 Project Structure

```
qyber-quiz-app/
├── app.py                 # Main application file and routes
├── requirements.txt       # Python dependencies
├── instance/              # Instance-specific data (database)
│   └── quiz.db           # SQLite database
├── static/                # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── img/              # Images and icons
├── templates/             # HTML templates
│   ├── faculty_*.html    # Faculty-specific templates
│   ├── student_*.html    # Student-specific templates
│   └── *.html            # Shared templates
└── ai-quiz-maker-main/   # AI Quiz Generator module (Next.js)
```

## 🚀 Installation and Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 14.x or higher (for AI Quiz Generator)
- npm or yarn (for AI Quiz Generator)

### Main Application Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/qyber-quiz-app.git
   cd qyber-quiz-app
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install required dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database**
   ```bash
   python create_sample_data.py  # Optional: Creates sample quizzes and users
   ```

5. **Run the application**
   ```bash
   python app.py
   ```
   The application will be available at `http://localhost:5003`

### AI Quiz Generator Setup

1. **Navigate to the AI Quiz Generator directory**
   ```bash
   cd ai-quiz-maker-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The AI Quiz Generator will be available at `http://localhost:9002`

## 🔐 Default Login Credentials

### Faculty
- Username: `faculty`
- Password: `password`
- Role: Select "Faculty" when logging in

### Student
- Username: `student`
- Password: `password`
- Role: Select "Student" when logging in

## 📱 Usage Guide

### For Faculty Members

1. **Login** using faculty credentials
2. Navigate to the **Faculty Dashboard**
3. To create a new quiz:
   - Click on "Create Quiz"
   - Fill in quiz details and add questions
   - Save the quiz
4. To generate an AI quiz:
   - Click on "Generate AI Quiz"
   - Enter the topic, difficulty, and number of questions
   - Review and edit the generated quiz
   - Save the quiz
5. To view student performance:
   - Navigate to the "Quiz Results" section
   - Select a specific quiz to view detailed analytics

### For Students

1. **Login** using student credentials
2. Navigate to the **Student Dashboard**
3. To take a quiz:
   - Browse available quizzes
   - Click on "Start Quiz" for your chosen quiz
   - Answer questions and submit
   - View your results
4. To generate an AI practice quiz:
   - Click on the "Create AI Quiz" button
   - Enter your preferred topic, difficulty, and length
   - Take the generated quiz
5. To review past attempts:
   - Navigate to the "My Attempts" section
   - Select an attempt to view detailed feedback

## 🤝 Contributing

Contributions to Qyber are welcome! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact and Support

For questions, feedback, or support, please contact:
- Email: support@qyber-quiz.com
- GitHub Issues: [Create a new issue](https://github.com/yourusername/qyber-quiz-app/issues)

---

© 2025 Qyber Quiz. All rights reserved.

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

- Ai Quiz maker with case base study 
]- Quiz categories and tags
- Advanced analytics for faculty
- Timed quizzes
- Social sharing features
- Mobile application
-tab switch restriction

## License

[MIT License](LICENSE)

## Contributors

- [Your Name](https://github.com/prashant6743)
