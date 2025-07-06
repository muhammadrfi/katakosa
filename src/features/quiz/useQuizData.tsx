import { useMemo } from 'react';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';

const useQuizData = (setIds: string[], srsFilter?: 'all' | 'new' | 'learning' | 'due' | 'mastered' | 'forgotten') => {
  const { vocabularySets, loading, getFilteredWords } = useVocabularyStore();

  const wordsForQuiz = useMemo(() => {
    if (!setIds || setIds.length === 0) {
      return [];
    }
    const allWords = vocabularySets.filter(set => setIds && setIds.includes(set.id)).flatMap(set => set.words);
    if (srsFilter) {
      return getFilteredWords(allWords, srsFilter);
    }
    return allWords;
  }, [vocabularySets, setIds, srsFilter, getFilteredWords]);

  return { wordsForQuiz, loading };
};

export default useQuizData;