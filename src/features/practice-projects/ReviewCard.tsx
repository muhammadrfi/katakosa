
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WordPair } from '../vocabulary/vocabulary.types';
import { RotateCw } from 'lucide-react';

interface ReviewCardProps {
    word: WordPair;
    isFlipped: boolean;
    onFlip: (flipped: boolean) => void;
}

const ReviewCard = ({ word, isFlipped, onFlip }: ReviewCardProps) => {
    return (
        <div className="w-full max-w-sm mx-auto">
            <Card className="h-56 flex flex-col items-center justify-center text-center p-6 bg-card border border-border shadow-sm rounded-2xl relative overflow-hidden transition-all duration-300">
                <CardContent className="p-0 select-none">
                    {!isFlipped ? (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Kata (Korea)</p>
                            <p className="text-3xl font-extrabold text-foreground tracking-tight">{word.bahasaA}</p>
                        </div>
                    ) : (
                        <div className="space-y-2 animate-in fade-in duration-200">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Arti (Indonesia)</p>
                            <p className="text-3xl font-extrabold text-primary tracking-tight">{word.bahasaB}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="flex justify-center mt-4">
                <Button 
                    variant="ghost" 
                    type="button"
                    onClick={() => onFlip(!isFlipped)}
                    className="font-bold text-xs text-muted-foreground hover:text-foreground rounded-xl"
                >
                    <RotateCw className="mr-2 h-4 w-4 text-muted-foreground" />
                    {isFlipped ? 'Lihat Kata' : 'Lihat Arti'}
                </Button>
            </div>
        </div>
    );
};

export default ReviewCard;
