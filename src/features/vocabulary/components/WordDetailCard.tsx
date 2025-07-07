import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WordPair } from '../vocabulary.types';

interface WordDetailCardProps {
  word: WordPair;
}

const WordDetailCard: React.FC<WordDetailCardProps> = ({ word }) => {
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle>{word.bahasaA}</CardTitle>
        <CardDescription>{word.bahasaB}</CardDescription>
      </CardHeader>
      <CardContent>
        <p><strong>Repetisi:</strong> {word.repetition}</p>
        <p><strong>Interval:</strong> {word.interval}</p>
        <p><strong>Faktor Kemudahan:</strong> {word.easeFactor}</p>
        <p><strong>Tanggal Review Berikutnya:</strong> {new Date(word.nextReviewDate).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  );
};

export default WordDetailCard;