
import { WordPair } from '@/types/vocabulary';

// Fungsi untuk mengacak array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface QuizQuestion {
  questionWord: string;
  correctAnswer: string;
  options: string[];
  wordId: string;
}

export const generateQuizQuestions = (words: WordPair[], questionCount: number, swapLanguages: boolean = false): QuizQuestion[] => {
  if (words.length < 4) {
    // Tidak cukup kata untuk membuat pilihan jawaban yang beragam
    return [];
  }

  const shuffledWords = shuffleArray(words);
  const selectedWords = shuffledWords.slice(0, questionCount);

  return selectedWords.map((currentWord) => {
    const questionLang = swapLanguages ? currentWord.bahasaB : currentWord.bahasaA;
    const answerLang = swapLanguages ? currentWord.bahasaA : currentWord.bahasaB;

    // Ambil pilihan jawaban salah dari seluruh daftar kata untuk memastikan variasi
    const distractors = shuffledWords
      .filter(word => word.id !== currentWord.id)
      .map(word => swapLanguages ? word.bahasaA : word.bahasaB)
      .slice(0, 3);
    
    const options = shuffleArray([...distractors, answerLang]);

    return {
      questionWord: questionLang,
      correctAnswer: answerLang,
      options,
      wordId: currentWord.id,
    };
  });
};
