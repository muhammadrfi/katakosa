
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WordPair } from '../vocabulary/vocabulary.types';
import { RotateCw } from 'lucide-react';

interface ReviewCardProps {
    word: WordPair;
}

const ReviewCard = ({ word }: ReviewCardProps) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // Reset flip state when the word prop changes
    useEffect(() => {
        setIsFlipped(false);
    }, [word]);

    return (
        <div className="w-full max-w-sm mx-auto">
            <Card className="h-56 flex flex-col items-center justify-center text-center p-6">
                <CardContent className="p-0">
                    {!isFlipped ? (
                        <>
                            <p className="text-muted-foreground text-sm">Kata:</p>
                            <p className="text-2xl md:text-3xl font-bold">{word.bahasaA}</p>
                        </>
                    ) : (
                        <>
                            <p className="text-muted-foreground text-sm">Arti:</p>
                            <p className="text-2xl md:text-3xl font-bold text-primary">{word.bahasaB}</p>
                        </>
                    )}
                </CardContent>
            </Card>
            <div className="flex justify-center mt-4">
                <Button variant="ghost" onClick={() => setIsFlipped(!isFlipped)}>
                    <RotateCw className="mr-2 h-4 w-4" />
                    {isFlipped ? 'Lihat Kata' : 'Lihat Arti'}
                </Button>
            </div>
        </div>
    );
};

export default ReviewCard;
