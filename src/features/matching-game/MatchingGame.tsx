import React, { useState, useEffect } from 'react';
import { MatchingGameData, generateMatchingGameData, generateCardsForPair, MatchingCard, shuffleArray } from './matching-game.utils';
import { WordPair } from '@/features/vocabulary/vocabulary.types';
import { Button } from '@/components/ui/button';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { soundEffects } from '../../utils/soundEffects';

interface MatchingGameProps {
  words: WordPair[];
  onGameFinish: () => void;
}

export const MatchingGame: React.FC<MatchingGameProps> = ({ words, onGameFinish }: MatchingGameProps) => {
  const { markWordAsRemembered, markWordAsForgotten } = useVocabularyStore();
  const [displayedLeftCards, setDisplayedLeftCards] = useState<MatchingCard[]>([]);
  const [displayedRightCards, setDisplayedRightCards] = useState<MatchingCard[]>([]);
  const [remainingWordPairs, setRemainingWordPairs] = useState<WordPair[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  const [allMatchedWordPairIds, setAllMatchedWordPairIds] = useState<string[]>([]); // All matched pairs throughout the game
  const [isChecking, setIsChecking] = useState(false);
  const [feedbackCards, setFeedbackCards] = useState<{ [cardId: string]: 'correct' | 'incorrect' } | null>(null);

  const MAX_DISPLAYED_PAIRS = 10;

  const initializeGame = React.useCallback(() => {
    if (words && words.length > 0) {
      console.log('MatchingGame: Initializing with words:', words);
      const shuffledWords = shuffleArray([...words]); // Shuffle all words
      const initialPairs = shuffledWords.slice(0, MAX_DISPLAYED_PAIRS);
      const remaining = shuffledWords.slice(MAX_DISPLAYED_PAIRS);

      const { leftCards, rightCards } = generateMatchingGameData(initialPairs);
      setDisplayedLeftCards(leftCards);
      setDisplayedRightCards(rightCards);
      setRemainingWordPairs(remaining);
      setAllMatchedWordPairIds([]);
      setSelectedCardId(null);
      setIsChecking(false);
      setFeedbackCards(null);
    }
  }, [words]);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Check for game finish
  useEffect(() => {
    if (words.length > 0 && allMatchedWordPairIds.length === words.length) {
      onGameFinish();
    }
  }, [allMatchedWordPairIds, words, onGameFinish]);

  const handleCardClick = (card: MatchingCard) => {
    if (isChecking || selectedCardId === card.id) {
      return;
    }

    if (!selectedCardId) {
      // First card selected
      setSelectedCardId(card.id);
      soundEffects.playFlip();
    } else {
      // Second card selected
      setIsChecking(true);
      const prevSelectedCard = [...displayedLeftCards, ...displayedRightCards].find(c => c.id === selectedCardId);

      if (prevSelectedCard && prevSelectedCard.side !== card.side && prevSelectedCard.pairId === card.pairId) {
        // Match found
        soundEffects.playCorrect();
        setFeedbackCards({
          [prevSelectedCard.id]: 'correct',
          [card.id]: 'correct',
        });

        setTimeout(() => {
          setAllMatchedWordPairIds(prev => [...prev, card.pairId]);
          setSelectedCardId(null);
          setFeedbackCards(null);

          // Mark word as remembered
          markWordAsRemembered(card.pairId);

          // Filter out the matched cards
          const currentLeftCards = displayedLeftCards.filter(c => c.pairId !== card.pairId);
          const currentRightCards = displayedRightCards.filter(c => c.pairId !== card.pairId);

          // Add new cards if available until MAX_DISPLAYED_PAIRS is reached or remaining words are exhausted
          while (currentLeftCards.length < MAX_DISPLAYED_PAIRS && remainingWordPairs.length > 0) {
            const nextWordPair = remainingWordPairs[0];
            if (nextWordPair) {
              const nextMatchingPair = {
                id: nextWordPair.id,
                textA: nextWordPair.bahasaA,
                textB: nextWordPair.bahasaB,
              };
              const { leftCard, rightCard } = generateCardsForPair(nextMatchingPair);
              currentLeftCards.push(leftCard);
              currentRightCards.push(rightCard);
              setRemainingWordPairs(prev => prev.slice(1));
            } else {
              break; // Should not happen if remainingWordPairs.length > 0
            }
          }

          // Shuffle the remaining and new cards
          setDisplayedLeftCards(shuffleArray(currentLeftCards));
          setDisplayedRightCards(shuffleArray(currentRightCards));
          setIsChecking(false);

          // Check if all words from the initial 'words' prop have been matched
          if (allMatchedWordPairIds.length + 1 === words.length) { // +1 because current match is not yet in allMatchedWordPairIds
            onGameFinish();
          }
        }, 700); // Show green for a short duration
      } else {
        // No match or same side selection
        soundEffects.playIncorrect();
        setFeedbackCards({
          [prevSelectedCard!.id]: 'incorrect',
          [card.id]: 'incorrect',
        });
        // Mark word as forgotten
        markWordAsForgotten(prevSelectedCard!.pairId);
        setTimeout(() => {
          setSelectedCardId(null);
          setFeedbackCards(null);
          setIsChecking(false);
        }, 1000); // Show red for a short duration
      }
    }
  };

  const handleShuffle = () => {
    initializeGame(); // Re-initialize game to shuffle all words and pick new ones
  };

  const handleRestart = () => {
    initializeGame();
  };

  if (displayedLeftCards.length === 0 && displayedRightCards.length === 0 && words.length > 0) {
    return <div className="text-center">Memuat permainan mencocokkan...</div>;
  }

  return (
    <div className="matching-game flex flex-col items-center gap-4 w-full">
      <div className="flex justify-center gap-4 w-full max-w-4xl px-2 md:px-0">
        <div className="left-column grid grid-cols-1 gap-3 w-1/2">
        {displayedLeftCards.map(card => (
          <Card
            key={card.id}
            className={cn(
              "cursor-pointer p-4 flex items-center justify-center text-center h-20 md:h-24 select-none",
              "border border-slate-200 dark:border-slate-800 bg-card text-card-foreground shadow-sm rounded-xl",
              "transition-all duration-200 ease-in-out hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px]",
              selectedCardId === card.id && "border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-inner",
              feedbackCards && feedbackCards[card.id] === 'correct' && "bg-emerald-500 border-emerald-600 text-white dark:bg-emerald-600 dark:border-emerald-700 animate-scale-pulse",
              feedbackCards && feedbackCards[card.id] === 'incorrect' && "bg-rose-500 border-rose-600 text-white dark:bg-rose-600 dark:border-rose-700 animate-shake",
              isChecking && selectedCardId !== card.id && "pointer-events-none opacity-60"
            )}
            onClick={() => handleCardClick(card)}
          >
            <CardContent className="p-0 flex items-center justify-center h-full w-full">
              <p className="text-sm md:text-lg font-semibold break-words leading-tight">{card.text}</p>
            </CardContent>
          </Card>
        ))}
        </div>
        <div className="right-column grid grid-cols-1 gap-3 w-1/2">
        {displayedRightCards.map(card => (
          <Card
            key={card.id}
            className={cn(
              "cursor-pointer p-4 flex items-center justify-center text-center h-20 md:h-24 select-none",
              "border border-slate-200 dark:border-slate-800 bg-card text-card-foreground shadow-sm rounded-xl",
              "transition-all duration-200 ease-in-out hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-[1px]",
              selectedCardId === card.id && "border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-inner",
              feedbackCards && feedbackCards[card.id] === 'correct' && "bg-emerald-500 border-emerald-600 text-white dark:bg-emerald-600 dark:border-emerald-700 animate-scale-pulse",
              feedbackCards && feedbackCards[card.id] === 'incorrect' && "bg-rose-500 border-rose-600 text-white dark:bg-rose-600 dark:border-rose-700 animate-shake",
              isChecking && selectedCardId !== card.id && "pointer-events-none opacity-60"
            )}
            onClick={() => handleCardClick(card)}
          >
            <CardContent className="p-0 flex items-center justify-center h-full w-full">
              <p className="text-sm md:text-lg font-semibold break-words leading-tight">{card.text}</p>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <Button onClick={handleShuffle} variant="outline">Acak Ulang</Button>
        <Button onClick={handleRestart} variant="secondary">Mulai Ulang</Button>
      </div>
    </div>
  );
};