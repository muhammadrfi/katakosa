import React, { useState, useEffect } from 'react';
import { MatchingGameData, generateMatchingGameData, generateCardsForPair, MatchingCard, shuffleArray } from './matching-game.utils';
import { WordPair } from '@/features/vocabulary/vocabulary.types';
import { Button } from '@/components/ui/button';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

  const initializeGame = () => {
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
  };

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, [words]);

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
    } else {
      // Second card selected
      setIsChecking(true);
      const prevSelectedCard = [...displayedLeftCards, ...displayedRightCards].find(c => c.id === selectedCardId);

      if (prevSelectedCard && prevSelectedCard.side !== card.side && prevSelectedCard.pairId === card.pairId) {
        // Match found
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
          let currentLeftCards = displayedLeftCards.filter(c => c.pairId !== card.pairId);
          let currentRightCards = displayedRightCards.filter(c => c.pairId !== card.pairId);

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
    <div className="matching-game flex flex-col items-center gap-4">
      <div className="flex justify-center gap-4 w-full">
        <div className="left-column grid grid-cols-1 gap-4 w-1/2">
        {displayedLeftCards.map(card => (
          <Card
            key={card.id}
            className={cn(
              "cursor-pointer p-4 flex items-center justify-center text-center h-24",
              "transition-all duration-200 ease-in-out",
              selectedCardId === card.id && "bg-blue-200 dark:bg-blue-700",
              feedbackCards && feedbackCards[card.id] === 'correct' && "bg-green-500 dark:bg-green-600",
              feedbackCards && feedbackCards[card.id] === 'incorrect' && "bg-red-500 dark:bg-red-600",
              isChecking && selectedCardId !== card.id && "pointer-events-none opacity-70"
            )}
            onClick={() => handleCardClick(card)}
          >
            <CardContent className="p-0 flex items-center justify-center h-full w-full">
              <p className="text-lg font-semibold">{card.text}</p>
            </CardContent>
          </Card>
        ))}
        </div>
        <div className="right-column grid grid-cols-1 gap-4 w-1/2">
        {displayedRightCards.map(card => (
          <Card
            key={card.id}
            className={cn(
              "cursor-pointer p-4 flex items-center justify-center text-center h-24",
              "transition-all duration-200 ease-in-out",
              selectedCardId === card.id && "bg-blue-200 dark:bg-blue-700",
              feedbackCards && feedbackCards[card.id] === 'correct' && "bg-green-500 dark:bg-green-600",
              feedbackCards && feedbackCards[card.id] === 'incorrect' && "bg-red-500 dark:bg-red-600",
              isChecking && selectedCardId !== card.id && "pointer-events-none opacity-70"
            )}
            onClick={() => handleCardClick(card)}
          >
            <CardContent className="p-0 flex items-center justify-center h-full w-full">
              <p className="text-lg font-semibold">{card.text}</p>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <Button onClick={handleShuffle}>Acak Ulang</Button>
        <Button onClick={handleRestart}>Mulai Ulang</Button>
      </div>
    </div>
  );
};