
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
    id: `${newWord.bahasaA}-${new Date().getTime()}-${Math.random()}`
  };

  const updatedSets = prevSets.map(set =>
    set.id === setId ? { ...set, words: [...set.words, wordWithId] } : set
  );
  toast.success(`Kata "${newWord.bahasaA}" ditambahkan ke set.`);
  return updatedSets;
};
