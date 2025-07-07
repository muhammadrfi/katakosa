
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizQuestion } from '../quiz';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean) => void;
}

const QuestionCard = ({ question, questionNumber, totalQuestions, onAnswer }: QuestionCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [showCard, setShowCard] = useState(true);
  const [showQuestionContent, setShowQuestionContent] = useState(true);
  const [showOptionsContent, setShowOptionsContent] = useState(true);

  useEffect(() => {
    setShowCard(true);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowFeedback(false);
    setShowColor(false);
  }, [question]);

  const handleAnswerClick = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
      setTimeout(() => {
        setShowColor(true);
        setShowFeedback(true);
      }, 200); // Show color and feedback after 0.2 seconds
  };

  const handleNextQuestion = (isCorrect: boolean) => {
    setShowQuestionContent(false);
    setShowOptionsContent(false);
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 100); // Match this duration with the fade-out animation
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <Card className={cn(
      "w-full max-w-2xl mx-auto transition-all duration-300 ease-in-out flex flex-col",
      showCard ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
    )}>
      <CardHeader>
        <CardDescription>Pertanyaan {questionNumber} dari {totalQuestions}</CardDescription>
        <CardTitle className="text-3xl md:text-4xl py-6 min-h-[120px] flex items-center justify-center text-center">
          "{question.questionWord}" artinya...
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow overflow-y-auto">
        {question.options.map((option) => (
          <Button
            key={option}
            onClick={() => handleAnswerClick(option)}
            disabled={isAnswered}
            variant="outline"
            className={cn(
                "h-auto py-4 text-base whitespace-normal",
                showColor && option === question.correctAnswer && 'bg-green-500 hover:bg-green-600 text-white transition-colors duration-300',
                showColor && option === selectedAnswer && option !== question.correctAnswer && 'bg-red-500 hover:bg-red-600 text-white transition-colors duration-300'
            )}
          >
            {option}
          </Button>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4 pt-6">
        {showFeedback && (
          <div className='flex flex-col items-center gap-4 animate-fade-in'>
            <div className={`flex items-center font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? <CheckCircle className="mr-2" /> : <XCircle className="mr-2" />}
                {isCorrect ? 'Jawaban Benar!' : `Jawaban Salah. Yang benar adalah "${question.correctAnswer}"`}
            </div>
            <Button onClick={() => handleNextQuestion(isCorrect)} size="lg">
              Lanjut <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
