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
        <div className="container mx-auto px-4 py-8 max-w-xl">
            <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="text-center pb-4 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/30">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Pertanyaan {questionNumber} dari {totalQuestions}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                        Dengarkan kata berikut dan pilih terjemahan yang benar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    {/* Audio Player Button */}
                    <div className="flex justify-center py-4">
                        <Button
                            onClick={onPlaySound}
                            disabled={isSpeaking}
                            size="lg"
                            className="w-full max-w-xs h-14 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            {isSpeaking ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Volume2 className="h-5 w-5" />
                            )}
                            Putar Suara Kata
                        </Button>
                    </div>
                    
                    {/* Options Grid */}
                    <div className="grid grid-cols-1 gap-3">
                        {options.map((opt) => {
                            const isSelected = selectedAnswer?.id === opt.id;
                            const isTheCorrectAnswer = currentWord.id === opt.id;

                            return (
                                <Button
                                    key={opt.id}
                                    variant="outline"
                                    size="lg"
                                    className={cn(
                                        "justify-between text-left h-auto py-4 px-4 rounded-xl border border-border hover:bg-muted font-medium transition-all text-sm sm:text-base", 
                                        isSelected && isCorrect === true && "bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-700 animate-scale-pulse",
                                        isSelected && isCorrect === false && "bg-rose-50 border-rose-500 text-rose-900 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-700 animate-shake",
                                        selectedAnswer && isTheCorrectAnswer && "bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-700"
                                    )}
                                    onClick={() => onAnswerSelect(opt)}
                                    disabled={!!selectedAnswer}
                                >
                                    <span>{opt.bahasaB}</span>
                                    {selectedAnswer && isSelected && (
                                        isCorrect ? (
                                            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 ml-2" />
                                        )
                                    )}
                                    {selectedAnswer && !isSelected && isTheCorrectAnswer && (
                                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
                
                {selectedAnswer && (
                    <CardFooter className="pb-6 px-6 border-t border-border/40 pt-4 bg-slate-50/20 dark:bg-slate-900/10">
                        <Button
                            onClick={onNextWord}
                            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-sm"
                        >
                            {questionNumber < totalQuestions ? 'Lanjutkan' : 'Lihat Hasil Latihan'}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default ListeningQuestionCard;
