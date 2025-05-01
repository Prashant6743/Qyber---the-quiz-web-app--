# AI Quiz Maker

![AI Quiz Maker](https://img.shields.io/badge/AI%20Quiz%20Maker-v1.0-6600cc)
![Next.js](https://img.shields.io/badge/Next.js-15.2.3-0099ff)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.0-38B2AC)

## Overview

AI Quiz Maker is a powerful Next.js application designed to generate intelligent, customized quizzes using advanced AI technology. This application serves as a companion to the Qyber Quiz platform, providing students with the ability to create personalized quizzes on any topic of their choice.

## Features

- **AI-Powered Quiz Generation**: Create quizzes on any topic with intelligent question and answer generation
- **Customizable Difficulty Levels**: Set the difficulty of your quiz from beginner to expert
- **Flexible Question Count**: Choose how many questions you want in your quiz
- **Modern UI/UX**: Clean, responsive interface built with Tailwind CSS and Radix UI
- **Real-time Preview**: See your quiz as it's being generated
- **Export Options**: Save or share your generated quizzes

## Technology Stack

- **Frontend Framework**: Next.js 15.2.3 with Turbopack
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: Radix UI
- **AI Integration**: Genkit AI
- **Development Tools**: TypeScript, ESLint

## Installation

### Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn package manager

### Setup Instructions

1. Clone the repository or navigate to the AI Quiz Maker directory:
   ```bash
   cd /path/to/ai-quiz-maker-main
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your API keys (if required):
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Running the Application

### Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:9002

### Production Build

To create a production build:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## Integration with Qyber Quiz

The AI Quiz Maker is designed to work seamlessly with the Qyber Quiz platform. Students can access this application directly from the Qyber Quiz student dashboard by clicking on the "Create AI Quiz" button or using the "AI Quiz" option in the navigation bar.

## Usage Guide

1. **Start a New Quiz**: Click on "Create New Quiz" on the homepage
2. **Enter Quiz Details**: 
   - Topic: What the quiz should be about
   - Difficulty: Select from Easy, Medium, or Hard
   - Number of Questions: Choose how many questions you want
3. **Generate Quiz**: Click "Generate" and wait for the AI to create your quiz
4. **Review and Edit**: Go through the generated questions and make any necessary adjustments
5. **Save or Export**: Save your quiz or export it in your preferred format

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or support, please contact the development team at support@qyberquiz.com
