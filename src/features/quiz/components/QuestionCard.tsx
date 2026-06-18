
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizQuestion } from '../quiz';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { soundEffects } from '../../../utils/soundEffects';

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedAnswer: string) => void;
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
    
    if (option === question.correctAnswer) {
      soundEffects.playCorrect();
    } else {
      soundEffects.playIncorrect();
    }

    setTimeout(() => {
      setShowColor(true);
      setShowFeedback(true);
    }, 200); // Show color and feedback after 0.2 seconds
  };

  const handleNextQuestion = () => {
    setShowQuestionContent(false);
    setShowOptionsContent(false);
    soundEffects.playFlip();
    setTimeout(() => {
      onAnswer(selectedAnswer || ''); // Pass the selected answer string
    }, 100); // Match this duration with the fade-out animation
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <Card className={cn(
      "w-full max-w-2xl mx-auto transition-all duration-300 ease-in-out flex flex-col border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl",
      showCard ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
    )}>
      <CardHeader className="pb-2">
        <CardDescription className="text-center font-medium">Pertanyaan {questionNumber} dari {totalQuestions}</CardDescription>
        <CardTitle className="text-2xl md:text-3xl py-4 flex items-center justify-center text-center font-bold text-foreground">
          "{question.questionWord}" artinya...
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow overflow-y-auto px-6">
        {question.options.map((option) => {
          const isCorrectOption = option === question.correctAnswer;
          const isSelectedOption = option === selectedAnswer;
          
          return (
            <Button
              key={option}
              onClick={() => handleAnswerClick(option)}
              disabled={isAnswered}
              variant="outline"
              className={cn(
                "h-auto py-4 px-5 text-base whitespace-normal rounded-xl border border-slate-200 dark:border-slate-800 bg-card text-foreground shadow-sm transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700",
                showColor && isCorrectOption && 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:border-emerald-700 transition-colors duration-300 animate-scale-pulse',
                showColor && isSelectedOption && !isCorrectOption && 'bg-rose-500 border-rose-600 text-white hover:bg-rose-600 dark:bg-rose-600 dark:border-rose-700 transition-colors duration-300 animate-shake',
                isAnswered && !isSelectedOption && !isCorrectOption && 'opacity-60'
              )}
            >
              {option}
            </Button>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4 pt-4 pb-6">
        {showFeedback && (
          <div className='flex flex-col items-center gap-4 animate-fade-in w-full px-6'>
            <div className={cn(
              "flex items-center font-semibold text-center py-2 px-4 rounded-lg",
              isCorrect ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10' : 'text-rose-700 dark:text-rose-400 bg-rose-500/10'
            )}>
              {isCorrect ? <CheckCircle className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />}
              {isCorrect ? 'Jawaban Benar!' : `Jawaban Salah. Yang benar adalah "${question.correctAnswer}"`}
            </div>
            <Button onClick={handleNextQuestion} size="lg" className="w-full sm:w-auto shadow-sm">
              Lanjut <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
