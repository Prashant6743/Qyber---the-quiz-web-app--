

'use client';

import { type ReactNode, useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BookOpen,
  ListOrdered,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Loader2,
  Sparkles,
  HelpCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Type,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label'; // Import Label component
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from '@/components/ui/separator';
import { generateQuiz, type GenerateQuizOutput, type QuizQuestion } from '@/ai/flows/generate-quiz';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast"
import { cn } from '@/lib/utils';

// --- Configuration Form Schema ---
const quizConfigSchema = z.object({
  topic: z.string().min(2, 'Topic must be at least 2 characters.'),
  numQuestions: z.coerce
    .number()
    .int()
    .min(1, 'Number of questions must be at least 1.')
    .max(10, 'Number of questions cannot exceed 10.'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questionType: z.enum(['short-answer', 'multiple-choice', 'fill-in-the-blank', 'mixed']),
});
type QuizConfigFormData = z.infer<typeof quizConfigSchema>;

// --- Quiz Answering Form Schema ---
const answerSchema = z.object({
  questionId: z.string(), // To link answer back to question
  userAnswer: z.string().trim(), // User's input/selection
});
type AnswerFormData = z.infer<typeof answerSchema>;

const quizAnswerFormSchema = z.object({
    answers: z.array(answerSchema),
});
type QuizAnswerFormData = z.infer<typeof quizAnswerFormSchema>;


// --- Component State ---
type QuizItem = QuizQuestion & { id: string }; // Use unique string ID

type QuizState = 'configuring' | 'generating' | 'answering' | 'results';

export default function Home() {
  const [quizData, setQuizData] = useState<QuizItem[] | null>(null);
  const [quizState, setQuizState] = useState<QuizState>('configuring');
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // Store user answers { questionId: userAnswer }
  const { toast } = useToast();

  // --- Forms ---
  const configForm = useForm<QuizConfigFormData>({
    resolver: zodResolver(quizConfigSchema),
    defaultValues: {
      topic: '',
      numQuestions: 3,
      difficulty: 'medium',
      questionType: 'mixed',
    },
  });

  const answerForm = useForm<QuizAnswerFormData>({
     resolver: zodResolver(quizAnswerFormSchema),
     defaultValues: {
       answers: [],
     },
  });
   const { fields, append, remove } = useFieldArray({
    control: answerForm.control,
    name: "answers",
    keyName: "fieldId", // Use a different key name than 'id'
  });

   // Sync answer form fields when quizData changes
   useEffect(() => {
    if (quizData) {
      // Clear existing fields
      remove(); // Remove all fields
      // Append new fields based on quizData
      quizData.forEach((q, index) => {
        append({ questionId: q.id, userAnswer: '' });
      });
      setUserAnswers({}); // Reset user answers state
      setShowAnswers(false); // Hide answers when new quiz loads
      setScore(null); // Reset score
    }
  }, [quizData, append, remove]);


  // --- Event Handlers ---
  async function onConfigSubmit(values: QuizConfigFormData) {
    setQuizState('generating');
    setError(null);
    setQuizData(null);
    setScore(null);
    setShowAnswers(false);
    setUserAnswers({});
    answerForm.reset({ answers: [] }); // Reset answer form

    console.log('Generating quiz with values:', values);

    try {
      // Ensure all required fields are present before calling the API
      const validatedValues = quizConfigSchema.parse(values);
      
      // Use the API route instead of direct server action
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedValues),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }
      
      const result = await response.json();
      console.log('API Result:', result);
      if (result && result.quiz && Array.isArray(result.quiz)) {
        if(result.quiz.length !== values.numQuestions) {
            console.warn(`AI returned ${result.quiz.length} questions, but ${values.numQuestions} were requested.`);
            toast({
                title: "Notice",
                description: `The AI generated ${result.quiz.length} questions, although ${values.numQuestions} were requested. Showing the generated questions.`,
                variant: "default", // Or a custom variant for warnings
            });
        }
        if(result.quiz.length === 0) {
             setError('The AI generated an empty quiz. Please try again with different parameters.');
             setQuizState('configuring');
             return;
        }

        // Add unique IDs to quiz items
        const quizWithIds = result.quiz.map((item, index) => ({
          ...item,
          id: `q-${index}-${Date.now()}`, // More robust unique ID
        }));
        setQuizData(quizWithIds);
        setQuizState('answering');
      } else {
         setError('Failed to generate quiz. The AI returned an unexpected format.');
         setQuizState('configuring');
      }
    } catch (err) {
      console.error('Error generating quiz:', err);
       const errorMessage = err instanceof z.ZodError
         ? `Form validation error: ${err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
         : err instanceof Error
           ? err.message
           : 'An unknown error occurred during quiz generation.';
      setError(errorMessage);
      setQuizState('configuring');
       toast({
          title: "Generation Failed",
          description: errorMessage,
          variant: "destructive",
        });
    }
  }

  function onAnswerSubmit(data: QuizAnswerFormData) {
    if (!quizData) return;
     console.log("Submitted answers:", data);

    let correctCount = 0;
    const submittedAnswers: Record<string, string> = {};

    data.answers.forEach((answerInput) => {
       submittedAnswers[answerInput.questionId] = answerInput.userAnswer;
      const question = quizData.find(q => q.id === answerInput.questionId);
      if (question) {
          // Case-insensitive comparison for short-answer and fill-in-the-blank
          const userAnswerProcessed = answerInput.userAnswer.trim();
          const correctAnswerProcessed = question.answer.trim();
          if (userAnswerProcessed.toLowerCase() === correctAnswerProcessed.toLowerCase()) {
              correctCount++;
          }
      }
    });

    setScore(correctCount);
    setUserAnswers(submittedAnswers); // Store submitted answers for display
    setShowAnswers(true); // Immediately show answers after submission
    setQuizState('results');
     toast({
        title: "Quiz Submitted!",
        description: `You scored ${correctCount} out of ${quizData.length}.`,
      });
  }

  function handleStartNewQuiz() {
    setQuizState('configuring');
    setQuizData(null);
    setError(null);
    setScore(null);
    setShowAnswers(false);
    setUserAnswers({});
    configForm.reset(); // Reset config form as well
    answerForm.reset({ answers: [] });
  }

  // --- Helper Components ---
 const DifficultyIcon = ({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) => {
    switch (difficulty) {
      case 'easy': return <SignalLow className="inline-block mr-1 h-4 w-4 text-green-500" aria-label="Easy difficulty"/>;
      case 'medium': return <SignalMedium className="inline-block mr-1 h-4 w-4 text-yellow-500" aria-label="Medium difficulty"/>;
      case 'hard': return <SignalHigh className="inline-block mr-1 h-4 w-4 text-red-500" aria-label="Hard difficulty"/>;
      default: return null;
    }
 };

  const QuestionTypeIcon = ({ type }: { type: QuizConfigFormData['questionType'] | QuizQuestion['type'] }) => {
     switch (type) {
       case 'short-answer': return <Type className="inline-block mr-1 h-4 w-4 text-blue-500" aria-label="Short Answer"/>;
       case 'multiple-choice': return <ListOrdered className="inline-block mr-1 h-4 w-4 text-purple-500" aria-label="Multiple Choice"/>;
       case 'fill-in-the-blank': return <Lightbulb className="inline-block mr-1 h-4 w-4 text-orange-500" aria-label="Fill in the Blank"/>; // Example icon
       case 'mixed': return <Sparkles className="inline-block mr-1 h-4 w-4 text-pink-500" aria-label="Mixed Types"/>;
       default: return null;
     }
  };


  const isLoading = quizState === 'generating';
  const isAnswering = quizState === 'answering';
  const isResults = quizState === 'results';
  const isConfiguring = quizState === 'configuring';

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-background to-secondary/50 p-4 md:p-8">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8" /> Qyber AI quiz  
        </h1>
        <p className="text-lg text-muted-foreground">
          Generate & take custom quizzes instantly!
        </p>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- Configuration Form Section --- */}
        <Card className={cn("shadow-lg", !isConfiguring && "hidden lg:block")}>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary flex items-center">
               <HelpCircle className="mr-2 h-6 w-6" /> Create Your Quiz
            </CardTitle>
            <CardDescription>
              Enter the details below to generate your personalized quiz.
            </CardDescription>
          </CardHeader>
          <Form {...configForm}>
            <form onSubmit={configForm.handleSubmit(onConfigSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={configForm.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-foreground">
                        <BookOpen className="mr-2 h-4 w-4" /> Topic
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., World Capitals, Photosynthesis" {...field} aria-required="true" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={configForm.control}
                    name="numQuestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-foreground">
                          <ListOrdered className="mr-2 h-4 w-4" /> Questions
                        </FormLabel>
                        <FormControl>
                           <Input type="number" min="1" max="10" {...field} aria-required="true" aria-describedby="numQuestions-description"/>
                        </FormControl>
                         <p id="numQuestions-description" className="text-xs text-muted-foreground sr-only">Number of questions (1-10)</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={configForm.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-foreground">
                          <DifficultyIcon difficulty={field.value as 'easy' | 'medium' | 'hard'} />
                          Difficulty
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name} value={field.value}>
                          <FormControl>
                            <SelectTrigger aria-required="true">
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="easy">
                               <SignalLow className="inline-block mr-2 h-4 w-4 text-green-500" /> Easy
                            </SelectItem>
                            <SelectItem value="medium">
                                <SignalMedium className="inline-block mr-2 h-4 w-4 text-yellow-500" /> Medium
                            </SelectItem>
                            <SelectItem value="hard">
                               <SignalHigh className="inline-block mr-2 h-4 w-4 text-red-500" /> Hard
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 {/* Question Type Selector */}
                  <FormField
                    control={configForm.control}
                    name="questionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-foreground">
                          <QuestionTypeIcon type={field.value} />
                           Question Type
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} name={field.name} value={field.value}>
                           <FormControl>
                            <SelectTrigger aria-required="true">
                              <SelectValue placeholder="Select question type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mixed">
                              <QuestionTypeIcon type="mixed" /> Mixed
                            </SelectItem>
                            <SelectItem value="short-answer">
                              <QuestionTypeIcon type="short-answer" /> Short Answer
                            </SelectItem>
                            <SelectItem value="multiple-choice">
                              <QuestionTypeIcon type="multiple-choice" /> Multiple Choice
                            </SelectItem>
                            <SelectItem value="fill-in-the-blank">
                              <QuestionTypeIcon type="fill-in-the-blank" /> Fill in the Blank
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate Quiz
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

         {/* --- Quiz Display & Answering Section --- */}
         <Card className={cn("shadow-lg overflow-hidden h-full flex flex-col", isConfiguring && "hidden lg:block")}>
          <CardHeader>
             <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-semibold text-primary">
                    {isResults ? "Quiz Results" : "Generated Quiz"}
                  </CardTitle>
                  <CardDescription>
                     {isAnswering && `Answer the ${configForm.getValues('difficulty')} questions below on "${configForm.getValues('topic')}":`}
                     {isResults && score !== null && quizData && `You scored ${score} out of ${quizData.length}!`}
                     {isResults && score === null && quizData && `Review your answers for the quiz on "${configForm.getValues('topic')}":`}
                     {(isLoading || (isConfiguring && !error && !isLoading)) && "Your generated quiz will appear here."}
                  </CardDescription>
                </div>
                 {(isAnswering || isResults) && (
                    <Button variant="outline" size="sm" onClick={handleStartNewQuiz}>
                        Start New Quiz
                    </Button>
                )}
            </div>
          </CardHeader>
           <CardContent className="flex-grow overflow-y-auto px-6 pb-6 space-y-6">
             {isLoading && (
              <div className="flex items-center justify-center h-full p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Generating your quiz...</p>
              </div>
            )}
            {error && !isLoading && (
               <div className="p-6">
                  <Alert variant="destructive">
                     <XCircle className="h-4 w-4"/>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                   <Button onClick={handleStartNewQuiz} className="mt-4">Try Again</Button>
                </div>
            )}
             {!isLoading && !error && !quizData && isConfiguring && (
              <div className="flex flex-col items-center justify-center text-center h-full p-6 text-muted-foreground">
                <HelpCircle className="h-12 w-12 mb-4 text-primary/50" />
                <p>Enter your quiz details and click "Generate Quiz" to get started.</p>
              </div>
            )}

            {/* Display Quiz Questions & Answers */}
            {quizData && (isAnswering || isResults) && (
                 <Form {...answerForm}>
                     <form onSubmit={answerForm.handleSubmit(onAnswerSubmit)} className="space-y-6">
                         {fields.map((field, index) => {
                             const question = quizData.find(q => q.id === field.questionId);
                             if (!question) return null; // Should not happen if synced correctly
                             const userAnswer = userAnswers[question.id];
                             const isCorrect = isResults && userAnswer !== undefined && userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();

                             return (
                                 <Card key={field.id} className={cn("p-4", isResults && (isCorrect ? 'border-green-500 bg-green-50/50' : 'border-red-500 bg-red-50/50'))}>
                                     <FormLabel className="font-semibold flex items-center mb-2">
                                         <span className="mr-2 text-primary">{index + 1}.</span>
                                         <QuestionTypeIcon type={question.type} />
                                         {question.question.includes('____') && question.type === 'fill-in-the-blank'
                                            ? (
                                                <span dangerouslySetInnerHTML={{ __html: question.question.replace(/____/g, '<span class="font-bold text-muted-foreground">[...]</span>') }} />
                                            )
                                            : question.question
                                         }

                                     </FormLabel>
                                      <FormField
                                        control={answerForm.control}
                                        name={`answers.${index}.userAnswer`}
                                        render={({ field: answerField }) => (
                                             <FormItem className="mt-2 space-y-3">
                                                  <FormControl>
                                                      <>
                                                        {question.type === 'multiple-choice' && question.options && (
                                                            <RadioGroup
                                                                onValueChange={answerField.onChange}
                                                                defaultValue={answerField.value}
                                                                className="flex flex-col space-y-1"
                                                                disabled={isResults} // Disable after submission
                                                                aria-label={`Options for question ${index + 1}`}
                                                               >
                                                                    {question.options.map((option, optionIndex) => (
                                                                        <FormItem key={`${question.id}-opt-${optionIndex}`} className="flex items-center space-x-3 space-y-0">
                                                                             <FormControl>
                                                                                <RadioGroupItem value={option} id={`${question.id}-opt-${optionIndex}`} />
                                                                             </FormControl>
                                                                            <Label htmlFor={`${question.id}-opt-${optionIndex}`} className="font-normal">{option}</Label>
                                                                        </FormItem>
                                                                    ))}
                                                                </RadioGroup>
                                                         )}

                                                         {(question.type === 'short-answer' || question.type === 'fill-in-the-blank') && (
                                                            <Input
                                                                {...answerField}
                                                                placeholder={question.type === 'fill-in-the-blank' ? "Fill in the blank..." : "Your answer..."}
                                                                disabled={isResults} // Disable after submission
                                                                aria-label={`Answer input for question ${index + 1}`}
                                                             />
                                                         )}
                                                      </>
                                                 </FormControl>
                                                 <FormMessage /> {/* Show validation errors for the answer field if any */}
                                             </FormItem>
                                         )}
                                     />

                                     {/* Show Correct Answer and User Feedback */}
                                     {isResults && showAnswers && (
                                          <div className="mt-3 pt-3 border-t border-border/50">
                                              {isCorrect ? (
                                                 <p className="text-sm font-medium text-green-700 flex items-center"><CheckCircle className="h-4 w-4 mr-1" /> Correct!</p>
                                             ) : (
                                                <>
                                                     <p className="text-sm font-medium text-red-700 flex items-center"><XCircle className="h-4 w-4 mr-1"/> Incorrect.</p>
                                                      <p className="text-sm text-muted-foreground mt-1">Your answer: <span className="font-medium">{userAnswer || <span className="italic">No answer provided</span>}</span></p>
                                                      <p className="text-sm text-foreground mt-1">Correct answer: <span className="font-semibold text-accent">{question.answer}</span></p>
                                                 </>
                                             )}
                                         </div>
                                     )}
                                 </Card>
                             );
                         })}

                        {isAnswering && quizData && quizData.length > 0 && (
                            <Button type="submit" className="w-full mt-6">
                                Submit Answers
                            </Button>
                        )}
                     </form>
                 </Form>
            )}
           </CardContent>
           {isResults && score !== null && quizData && quizData.length > 0 && (
               <CardFooter className="border-t p-4 bg-muted/50 flex justify-center">
                  <p className="text-lg font-semibold">Final Score: {score} / {quizData.length}</p>
               </CardFooter>
            )}
            {isAnswering && quizData && quizData.length > 0 && (
               <CardFooter className="border-t p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground w-full text-center">Answer all questions and click "Submit Answers".</p>
               </CardFooter>
            )}
        </Card>
      </main>
       <footer className="mt-12 text-center text-sm text-muted-foreground">
        powerd by Prashant ✨
      </footer>
    </div>
  );
}
