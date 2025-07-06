
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

  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowFeedback(false);
  }, [question]);

  const handleAnswerClick = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    setShowFeedback(true); // Tampilkan feedback setelah jawaban dipilih
  };

  const handleNextQuestion = () => {
    onAnswer(isCorrect);
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <CardDescription>Pertanyaan {questionNumber} dari {totalQuestions}</CardDescription>
        <CardTitle className="text-3xl md:text-4xl py-6 min-h-[120px] flex items-center justify-center text-center">
          "{question.questionWord}" artinya...
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options.map((option) => (
          <Button
            key={option}
            onClick={() => handleAnswerClick(option)}
            disabled={isAnswered}
            className={cn(
                "h-auto py-4 text-base whitespace-normal",
                showFeedback && option === question.correctAnswer && 'bg-green-500 hover:bg-green-600 text-white',
                showFeedback && option === selectedAnswer && option !== question.correctAnswer && 'bg-red-500 hover:bg-red-600 text-white',
            )}
            variant={'outline'}
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
            <Button onClick={handleNextQuestion} size="lg">
              Lanjut <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
