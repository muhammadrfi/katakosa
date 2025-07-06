
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { VocabularySet, WordPair, ReviewWord } from '@/features/vocabulary/vocabulary.types';
import * as vocabActions from '../features/vocabulary/vocabularyActions';
import * as reviewActions from '../features/review-practice/reviewListActions';

export const useVocabularyStore = () => {
  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([]);
  const [reviewList, setReviewList] = useState<ReviewWord[]>([]);
  const [loading, setLoading] = useState(true);

  const vocabulary = useMemo(() => vocabularySets.flatMap(set => set.words), [vocabularySets]);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('vocabularySets');
      if (storedData) {
        const parsedData: VocabularySet[] = JSON.parse(storedData);
        console.log('useVocabularyStore: Parsed data from localStorage:', parsedData);
        const migratedData = parsedData.map(set => {
          // Pastikan setiap kata memiliki ID dan properti bahasa yang valid
          const words = set.words.map(word => {
            // Jika word.id tidak ada atau null, buat ID baru
            const id = word.id || crypto.randomUUID();
            // Pastikan bahasaA dan bahasaB ada dan bukan string kosong
            const bahasaA = word.bahasaA || '';
            const bahasaB = word.bahasaB || '';
            return { ...word, id, bahasaA, bahasaB };
          });
          return { ...set, words };
        });
        setVocabularySets(migratedData);
        console.log('useVocabularyStore: Migrated data before setting state:', migratedData);
      }
      const storedReviewList = localStorage.getItem('reviewList');
      if (storedReviewList) {
        setReviewList(JSON.parse(storedReviewList));
      }
    } catch (error) {
      console.error("Gagal memuat data dari localStorage", error);
      toast.error("Gagal memuat data. Data mungkin korup.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      if (!loading) {
        localStorage.setItem('vocabularySets', JSON.stringify(vocabularySets));
        localStorage.setItem('reviewList', JSON.stringify(reviewList));
      }
    } catch (error) {
      console.error("Gagal menyimpan data ke localStorage", error);
      toast.error("Gagal menyimpan perubahan.");
    }
  }, [vocabularySets, reviewList, loading]);

  const addVocabularySet = (name: string, newWords: Omit<WordPair, 'id'>[]) => {
    setVocabularySets(prev => vocabActions.addVocabularySet(prev, name, newWords));
  };

  const addMultipleVocabularySets = (newSetsInfo: { name: string; words: Omit<WordPair, 'id'>[] }[]): VocabularySet[] => {
    const newSets = vocabActions.createMultipleVocabularySets(newSetsInfo);
    setVocabularySets(prev => [...prev, ...newSets]);
    toast.success(`${newSets.length} set kosakata baru berhasil dibuat oleh AI.`);
    return newSets;
  };

  const clearAllVocabulary = () => {
    setVocabularySets(vocabActions.clearAllVocabulary());
  };
  
  const removeVocabularySet = (setId: string) => {
    setVocabularySets(prev => vocabActions.removeVocabularySet(prev, setId));
  };

  const removeWord = (id: string) => {
    setVocabularySets(prev => vocabActions.removeWord(prev, id));
  };

  const editVocabularySet = (setId: string, newName: string) => {
    setVocabularySets(prev => vocabActions.editVocabularySet(prev, setId, newName));
  };

  const editWord = (wordId: string, newWordData: { bahasaA: string; bahasaB: string }) => {
    setVocabularySets(prev => vocabActions.editWord(prev, wordId, newWordData));
  };

  const addWordToSet = (setId: string, newWord: Omit<WordPair, 'id'>) => {
    setVocabularySets(prev => vocabActions.addWordToSet(prev, setId, newWord));
  };

  const addIncorrectAnswer = (wordId: string) => {
    setReviewList(prev => reviewActions.addIncorrectAnswer(prev, wordId));
  };

  const clearReviewList = () => {
    setReviewList(reviewActions.clearReviewList());
  };

  const removeWordFromReviewList = (wordId: string) => {
    setReviewList(prev => reviewActions.removeWordFromReviewList(prev, wordId, vocabulary));
  };

  return { 
    vocabularySets, 
    vocabulary, 
    addVocabularySet, 
    addMultipleVocabularySets, 
    clearAllVocabulary, 
    removeVocabularySet, 
    removeWord, 
    loading, 
    editVocabularySet, 
    editWord, 
    addWordToSet, 
    reviewList, 
    addIncorrectAnswer, 
    clearReviewList,
    removeWordFromReviewList 
  };
};
