
import { ReviewWord, WordPair } from '../vocabulary/vocabulary.types';
import { toast } from 'sonner';

export const addIncorrectAnswer = (prevList: ReviewWord[], wordId: string): ReviewWord[] => {
  const existingEntryIndex = prevList.findIndex(item => item.wordId === wordId);
  let newList;
  if (existingEntryIndex > -1) {
    newList = [...prevList];
    const entry = newList[existingEntryIndex];
    newList[existingEntryIndex] = {
      ...entry,
      incorrectCount: entry.incorrectCount + 1,
      lastIncorrectAt: new Date().toISOString(),
    };
  } else {
    newList = [...prevList, { wordId, incorrectCount: 1, lastIncorrectAt: new Date().toISOString() }];
  }
  // Sort by most incorrect count
  return newList.sort((a, b) => b.incorrectCount - a.incorrectCount);
};

export const clearReviewList = (): ReviewWord[] => {
  toast.success("Daftar kosakata untuk diulas telah dikosongkan.");
  return [];
};

export const removeWordFromReviewList = (
  prevList: ReviewWord[], 
  wordId: string,
  vocabulary: WordPair[]
): ReviewWord[] => {
  const wordToRemove = vocabulary.find(w => w.id === wordId);
  if (wordToRemove) {
    toast.success(`"${wordToRemove.bahasaA}" ditandai sudah tahu dan dihapus dari daftar ulasan.`);
  }
  return prevList.filter(item => item.wordId !== wordId);
};
