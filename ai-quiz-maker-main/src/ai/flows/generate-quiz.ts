
// src/ai/flows/generate-quiz.ts
'use server';

/**
 * @fileOverview Generates a quiz based on the given topic, number of questions, difficulty level, and desired question types.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const QuestionTypeSchema = z.enum([
  'short-answer',
  'multiple-choice',
  'fill-in-the-blank',
]);
type QuestionType = z.infer<typeof QuestionTypeSchema>;

const GenerateQuizInputSchema = z.object({
  topic: z.string().describe('The topic of the quiz.'),
  numQuestions: z.number().int().min(1).max(10).describe('The number of questions in the quiz (1-10).'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the quiz.'),
  questionType: z
    .enum(['short-answer', 'multiple-choice', 'fill-in-the-blank', 'mixed'])
    .describe('The desired type of questions (short-answer, multiple-choice, fill-in-the-blank, or mixed).'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;


const QuizQuestionSchema = z.object({
      type: QuestionTypeSchema.describe('The type of the question.'),
      question: z.string().describe('The quiz question text. For fill-in-the-blank, this should contain "____" placeholder(s).'),
      answer: z.string().describe('The correct answer to the question.'),
      options: z.array(z.string()).optional().describe('An array of possible answer choices (only for multiple-choice questions). The correct answer must be one of the options.'),
    });

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

const GenerateQuizOutputSchema = z.object({
  quiz: z
    .array(QuizQuestionSchema)
    .describe('The generated quiz questions, answers, and options (if applicable).'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  // Add input validation maybe? Or rely on the flow's schema validation.
  try {
    const result = await generateQuizFlow(input);
    // Add output validation
    const parsedResult = GenerateQuizOutputSchema.parse(result);
    return parsedResult;
  } catch (error) {
    console.error("Error in generateQuiz flow execution or validation:", error);
    // Re-throw or handle error appropriately
    if (error instanceof z.ZodError) {
      throw new Error(`AI returned invalid data structure: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error; // Re-throw other errors
  }
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: GenerateQuizOutputSchema },
  prompt: `You are an AI quiz generator. Generate a quiz with the following specifications:

Topic: {{{topic}}}
Number of Questions: {{{numQuestions}}}
Difficulty: {{{difficulty}}}
Requested Question Type: {{{questionType}}}

Instructions:
1. Generate exactly {{{numQuestions}}} questions.
2. Adhere to the specified {{{difficulty}}} level.
3. For each question, determine its type based on the 'Requested Question Type':
    - If 'short-answer', generate only short-answer questions.
    - If 'multiple-choice', generate only multiple-choice questions.
    - If 'fill-in-the-blank', generate only fill-in-the-blank questions.
    - If 'mixed', generate a variety of question types from short-answer, multiple-choice, and fill-in-the-blank. Try to include at least one of each if possible and the number of questions allows.
4. Format the output STRICTLY as a JSON object with a "quiz" field, which is an array of question objects.
5. Each question object in the "quiz" array MUST have the following fields:
    - "type": (string) The type of question. Must be one of: "short-answer", "multiple-choice", "fill-in-the-blank".
    - "question": (string) The text of the question.
        - For "fill-in-the-blank" questions, use "____" (four underscores) to indicate the blank space(s).
    - "answer": (string) The correct answer.
    - "options": (array of strings, OPTIONAL) Include this field ONLY for "multiple-choice" questions. It should be an array of strings containing several plausible options, INCLUDING the correct "answer". Do NOT include "options" for "short-answer" or "fill-in-the-blank" types.

Example Output Snippet (Mixed):
{
  "quiz": [
    {
      "type": "short-answer",
      "question": "What is the capital of France?",
      "answer": "Paris"
    },
    {
      "type": "multiple-choice",
      "question": "Which planet is known as the Red Planet?",
      "answer": "Mars",
      "options": ["Earth", "Mars", "Jupiter", "Venus"]
    },
    {
      "type": "fill-in-the-blank",
      "question": "The formula for water is ____.",
      "answer": "H2O"
    }
  ]
}

Generate the quiz now based on the user's request. Ensure the output is valid JSON matching the described structure precisely.
`,
});

const generateQuizFlow = ai.defineFlow<typeof GenerateQuizInputSchema, typeof GenerateQuizOutputSchema>(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async (input) => {
     console.log("Calling generateQuizFlow with input:", input);
    try {
        const { output } = await prompt(input);
        console.log("Raw AI output:", JSON.stringify(output, null, 2)); // Log raw output for debugging

        if (!output || !Array.isArray(output.quiz)) {
             console.error("Invalid output structure received from AI:", output);
             throw new Error('AI returned an invalid or empty quiz structure.');
        }

        // Validate each question structure (basic check, Zod parsing is done in the wrapper)
         output.quiz.forEach((q, index) => {
            if (!q || typeof q !== 'object') {
                 console.error(`Invalid item at index ${index}: not an object`, q);
                 throw new Error(`AI returned an invalid item at index ${index}. Expected an object.`);
            }
            if (!q.type || !q.question || !q.answer) {
                 console.error(`Invalid question object at index ${index}:`, q);
                 throw new Error(`AI returned an invalid question object at index ${index}. Missing required fields.`);
            }
            if (q.type === 'multiple-choice' && (!q.options || !Array.isArray(q.options) || q.options.length < 2 || !q.options.includes(q.answer))) {
                 console.error(`Invalid multiple-choice question object at index ${index}:`, q);
                throw new Error(`AI returned an invalid multiple-choice question object at index ${index}. Check options and answer.`);
            }
             if (q.type === 'fill-in-the-blank' && !q.question.includes('____')) {
                  console.warn(`Fill-in-the-blank question at index ${index} might be missing '____':`, q);
                 // Don't throw error, but warn. AI might format slightly differently.
             }
         });

        console.log("Validated AI output:", output);
        return output; // Output should already conform to GenerateQuizOutputSchema if the prompt worked
    } catch (error) {
         console.error("Error during AI prompt execution:", error);
         throw new Error(`Failed to generate quiz content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
);
