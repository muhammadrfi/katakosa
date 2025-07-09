
export interface WordPair {
  id: string;
  bahasaA: string;
  bahasaB: string;
  bahasaBAlternatives?: string[];
  createdAt: string;
  // SRS properties
  interval: number; // days until next review
  repetition: number; // number of successful repetitions
  easeFactor: number; // ease factor for calculating next interval
  nextReviewDate?: number | null; // Unix timestamp of the next review date
  history?: { date: number; quality?: 0 | 1 | 2 | 3 | 4 | 5; interval?: number; repetition?: number; easeFactor?: number; status?: 'remembered' | 'forgotten' | 'reset' }[]; // Riwayat review kata
}

export interface VocabularySet {
  id: string;
  name: string;
  createdAt: string;
  words: WordPair[];
}

export interface ReviewWord {
  wordId: string;
  incorrectCount: number;
  lastIncorrectAt: string;
}
