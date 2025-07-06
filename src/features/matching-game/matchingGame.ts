import { WordPair } from '../vocabulary/vocabulary.types';

export interface MatchingPair {
  id: string;
  textA: string;
  textB: string;
}

export interface MatchingCard {
  id: string;
  pairId: string;
  text: string;
  type: 'A' | 'B'; // 'A' for left column, 'B' for right column
  side: 'left' | 'right';
}

export interface MatchingGameData {
  pairs: MatchingPair[];
  leftCards: MatchingCard[];
  rightCards: MatchingCard[];
}

export function generateCardsForPair(pair: MatchingPair): { leftCard: MatchingCard; rightCard: MatchingCard } {
  const leftCard: MatchingCard = {
    id: `${pair.id}-A`,
    pairId: pair.id,
    text: pair.textA,
    type: 'A',
    side: 'left',
  };
  const rightCard: MatchingCard = {
    id: `${pair.id}-B`,
    pairId: pair.id,
    text: pair.textB,
    type: 'B',
    side: 'right',
  };
  return { leftCard, rightCard };
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateMatchingGameData(wordPairs: WordPair[]): MatchingGameData {
  const pairs: MatchingPair[] = wordPairs.map(pair => ({
    id: pair.id,
    textA: pair.bahasaA,
    textB: pair.bahasaB,
  }));

  let leftCards: MatchingCard[] = [];
  let rightCards: MatchingCard[] = [];

  pairs.forEach(pair => {
    const { leftCard, rightCard } = generateCardsForPair(pair);
    leftCards.push(leftCard);
    rightCards.push(rightCard);
  });

  leftCards = shuffleArray(leftCards);
  rightCards = shuffleArray(rightCards);

  return {
    pairs,
    leftCards,
    rightCards,
  };
}