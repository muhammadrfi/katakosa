
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WordPair } from '../../features/vocabulary/vocabulary.types';

interface MemorizationCardProps {
  word: WordPair;
  onRemember: () => void;
  onForgot: () => void;
}

const MemorizationCard: React.FC<MemorizationCardProps> = ({ word, onRemember, onForgot }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Card className="w-full max-w-md mx-auto my-4">
      <CardContent className="p-6 text-center">
        <div
          className="min-h-[150px] flex items-center justify-center cursor-pointer"
          onClick={handleFlip}
        >
          {isFlipped ? (
            <p className="text-2xl font-bold text-primary">{word.bahasaB}</p>
          ) : (
            <p className="text-2xl font-bold">{word.bahasaA}</p>
          )}
        </div>
        <div className="flex justify-around mt-6">
          <Button variant="destructive" onClick={onForgot}>Lupa</Button>
          <Button variant="default" onClick={onRemember}>Ingat</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemorizationCard;
