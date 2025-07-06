import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Volume2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WordPair } from '../vocabulary/vocabulary.types';

interface ListeningQuestionCardProps {
    currentWord: WordPair;
    options: WordPair[];
    selectedAnswer: WordPair | null;
    isCorrect: boolean | null;
    isSpeaking: boolean;
    questionNumber: number;
    totalQuestions: number;
    onPlaySound: () => void;
    onAnswerSelect: (answer: WordPair) => void;
    onNextWord: () => void;
}

const ListeningQuestionCard = ({
    currentWord,
    options,
    selectedAnswer,
    isCorrect,
    isSpeaking,
    questionNumber,
    totalQuestions,
    onPlaySound,
    onAnswerSelect,
    onNextWord
}: ListeningQuestionCardProps) => {
    return (
        <Card className="max-w-xl mx-auto">
            <CardHeader>
                <CardTitle>Pertanyaan {questionNumber} dari {totalQuestions}</CardTitle>
                <CardDescription>Dengarkan kata berikut dan pilih terjemahan yang benar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Button onClick={onPlaySound} disabled={isSpeaking} size="lg" className="w-full">
                    {isSpeaking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Volume2 className="mr-2 h-5 w-5" />}
                    Dengarkan Kata
                </Button>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {options.map((opt) => {
                        const isSelected = selectedAnswer?.id === opt.id;
                        const isTheCorrectAnswer = currentWord.id === opt.id;

                        return (
                            <Button
                                key={opt.id}
                                variant="outline"
                                size="lg"
                                className={cn("justify-start text-left h-auto py-3", 
                                    isSelected && isCorrect === true && "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300",
                                    isSelected && isCorrect === false && "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300",
                                    selectedAnswer && isTheCorrectAnswer && "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300"
                                )}
                                onClick={() => onAnswerSelect(opt)}
                                disabled={!!selectedAnswer}
                            >
                                {opt.bahasaB}
                                {selectedAnswer && isSelected && (isCorrect ? <CheckCircle className="ml-auto text-green-600" /> : <XCircle className="ml-auto text-red-600" />)}
                                {selectedAnswer && !isSelected && isTheCorrectAnswer && <CheckCircle className="ml-auto text-green-600" />}
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
            {selectedAnswer && (
                <CardFooter>
                    <Button onClick={onNextWord} className="w-full">
                        {questionNumber < totalQuestions ? 'Lanjut' : 'Lihat Hasil'}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default ListeningQuestionCard;
