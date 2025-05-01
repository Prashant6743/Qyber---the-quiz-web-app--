import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz } from '@/ai/flows/generate-quiz';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate input
    if (!body.topic || !body.numQuestions || !body.difficulty || !body.questionType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Call the AI function to generate the quiz
    const result = await generateQuiz({
      topic: body.topic,
      numQuestions: body.numQuestions,
      difficulty: body.difficulty,
      questionType: body.questionType,
    });
    
    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in generate-quiz API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
