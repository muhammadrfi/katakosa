
import { VocabularySet, WordPair } from './vocabulary.types';
import { toast } from 'sonner';

export const addVocabularySet = (
  prevSets: VocabularySet[],
  name: string,
  newWords: Omit<WordPair, 'id'>[]
): VocabularySet[] => {
  const sets = Array.isArray(prevSets) ? prevSets : [];
  const wordsWithIds = newWords.map(word => ({
    ...word,
    id: `${word.bahasaA}-${new Date().getTime()}-${Math.random()}`
  }));

  const newSet: VocabularySet = {
    id: `set-${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
    words: wordsWithIds,
  };
  
  toast.success(`Set "${name}" dengan ${wordsWithIds.length} kata berhasil dibuat.`);
  return [...sets, newSet];
};

export const createMultipleVocabularySets = (newSetsInfo: { name: string; words: Omit<WordPair, 'id'>[] }[]): VocabularySet[] => {
    return newSetsInfo.map(newSetInfo => {
        const wordsWithIds = newSetInfo.words.map(word => ({
            ...word,
            id: `${word.bahasaA}-${new Date().getTime()}-${Math.random()}`
        }));
        return {
            id: `set-${Date.now()}-${Math.random()}`,
            name: newSetInfo.name,
            createdAt: new Date().toISOString(),
            words: wordsWithIds,
        };
    });
};

export const clearAllVocabulary = (): VocabularySet[] => {
  toast.success("Semua set kosakata telah dihapus.");
  return [];
};

export const removeVocabularySet = (prevSets: VocabularySet[], setId: string): VocabularySet[] => {
  const sets = prevSets || [];
  const setToRemove = sets.find(set => set.id === setId);
  const newSets = sets.filter(set => set.id !== setId);

  if (setToRemove) {
      toast.success(`Set "${setToRemove.name}" telah dihapus.`);
  }
  return newSets;
};

export const removeWord = (prevSets: VocabularySet[], id: string): VocabularySet[] => {
  let wordToRemove: WordPair | undefined;
  
  const newSets = prevSets.map(set => {
      const originalLength = set.words.length;
      const filteredWords = set.words.filter(word => {
          if (word.id === id) {
              wordToRemove = word;
              return false;
          }
          return true;
      });

      if (originalLength > filteredWords.length) {
          return { ...set, words: filteredWords };
      }
      return set;
  }).filter(set => set.words.length > 0);

  if (wordToRemove) {
    toast.success(`Kata "${wordToRemove.bahasaA}" telah dihapus.`);
    if (newSets.length < prevSets.length) {
      toast.info("Sebuah set kosakata yang kosong telah dihapus.");
    }
  }
  return newSets;
};

export const editVocabularySet = (prevSets: VocabularySet[], setId: string, newName: string): VocabularySet[] => {
  const updatedSets = prevSets.map(set =>
    set.id === setId ? { ...set, name: newName } : set
  );
  toast.success(`Nama set diubah menjadi "${newName}".`);
  return updatedSets;
};

export const editWord = (
  prevSets: VocabularySet[],
  wordId: string,
  newWordData: Partial<WordPair>
): VocabularySet[] => {
  let updatedWord: WordPair | undefined;
  const updatedSets = prevSets.map(set => ({
    ...set,
    words: set.words.map(word => {
      if (word.id === wordId) {
        updatedWord = { ...word, ...newWordData as WordPair };
        return updatedWord;
      }
      return word;
    }),
  }));
  if (updatedWord) {
    toast.success(`Kata "${updatedWord.bahasaA}" berhasil diperbarui.`);
  }
  return updatedSets;
};

export const addWordToSet = (prevSets: VocabularySet[], setId: string, newWord: Omit<WordPair, 'id'>): VocabularySet[] => {
  const wordWithId = {
    ...newWord,
    id: `${newWord.bahasaA}-${new Date().getTime()}-${Math.random()}`,
    // Inisialisasi properti SRS
    interval: 0,
    repetition: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().getTime(),
    history: [],
  };

  const updatedSets = prevSets.map(set =>
    set.id === setId ? { ...set, words: [...set.words, wordWithId] } : set
  );
  toast.success(`Kata "${newWord.bahasaA}" ditambahkan ke set.`);
  return updatedSets;
};

// Fungsi untuk memperbarui properti SRS (SuperMemo-2 algorithm)
export const updateSrsProperties = (word: WordPair, quality: 0 | 1 | 2 | 3 | 4 | 5): WordPair => {
  let { interval, repetition, easeFactor, history } = word;

  if (quality >= 3) { // Correct answer
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition++;
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else { // Incorrect answer
    repetition = 0;
    interval = 1;
  }

  if (easeFactor < 1.3) { // Minimum ease factor
    easeFactor = 1.3;
  }

  const nextReviewDate = new Date().getTime() + interval * 24 * 60 * 60 * 1000; // Convert days to milliseconds

  const newHistoryEntry = {
    date: new Date().getTime(),
    quality: quality,
    interval: interval,
    repetition: repetition,
    easeFactor: easeFactor,
  };

  return {
    ...word,
    interval,
    repetition,
    easeFactor,
    nextReviewDate,
    history: [...history, newHistoryEntry],
  };
};

export const markWordAsRemembered = (prevSets: VocabularySet[], wordId: string): VocabularySet[] => {
  return prevSets.map(set => ({
    ...set,
    words: set.words.map(word => {
      if (word.id === wordId) {
        // Asumsi kualitas 5 untuk 'diingat' (jawaban benar sempurna)
        return updateSrsProperties(word, 5);
      }
      return word;
    }),
  }));
};

export const markWordAsForgotten = (prevSets: VocabularySet[], wordId: string): VocabularySet[] => {
  return prevSets.map(set => ({
    ...set,
    words: set.words.map(word => {
      if (word.id === wordId) {
        // Asumsi kualitas 0 untuk 'dilupakan' (jawaban salah total)
        return updateSrsProperties(word, 0);
      }
      return word;
    }),
  }));
};
