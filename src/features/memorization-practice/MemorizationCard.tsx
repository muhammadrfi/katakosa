import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WordPair } from '../../features/vocabulary/vocabulary.types';
import { soundEffects } from '../../utils/soundEffects';

interface MemorizationCardProps {
  word: WordPair;
  onRemember: () => void;
  onForgot: () => void;
}

const MemorizationCard: React.FC<MemorizationCardProps> = ({ word, onRemember, onForgot }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    soundEffects.playFlip();
    setIsFlipped(!isFlipped);
  };

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden border border-border shadow-sm rounded-2xl bg-card transition-all duration-200 hover:shadow-md">
      <CardContent className="p-5 flex flex-col h-64">
        {/* 3D Flip Card Container */}
        <div className="flex-1 [perspective:1000px] cursor-pointer" onClick={handleFlip}>
          <div
            className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
            style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* Front Side (bahasaA) */}
            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex flex-col items-center justify-center p-4 bg-muted/30 border border-border/50 rounded-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bahasa Asal</span>
              <p className="text-xl font-bold text-foreground text-center break-words leading-tight">{word.bahasaA}</p>
              <span className="text-[10px] text-muted-foreground mt-4 opacity-75">Klik untuk membalik</span>
            </div>

            {/* Back Side (bahasaB) */}
            <div
              className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex flex-col items-center justify-center p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-xl"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Terjemahan</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 text-center break-words leading-tight">{word.bahasaB}</p>
              {word.bahasaBAlternatives && word.bahasaBAlternatives.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1 text-center italic">
                  Alternatif: {word.bahasaBAlternatives.join(', ')}
                </p>
              )}
              <span className="text-[10px] text-muted-foreground mt-4 opacity-75">Klik untuk melihat asal</span>
            </div>
          </div>
        </div>

        {/* Buttons Action bar */}
        <div className="flex gap-3 mt-4 pt-2 border-t border-border/60">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onForgot();
            }}
            className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-950/20 rounded-xl font-semibold transition-all h-10"
          >
            Lupa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemember();
            }}
            className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-950/20 rounded-xl font-semibold transition-all h-10"
          >
            Ingat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemorizationCard;
