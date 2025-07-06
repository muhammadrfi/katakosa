import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReviewWord, WordPair } from '../vocabulary/vocabulary.types';
import * as reviewActions from './reviewListActions';

interface ReviewListState {
  reviewList: ReviewWord[];

  addIncorrectAnswer: (wordId: string) => void;
  clearReviewList: () => void;
  removeWordFromReviewList: (wordId: string, currentVocabulary: WordPair[]) => void;
}

export const useReviewListStore = create<ReviewListState>()(
  persist(
    (set, get) => ({
      reviewList: [],

      addIncorrectAnswer: (wordId) => set(state => ({
        reviewList: reviewActions.addIncorrectAnswer(state.reviewList, wordId)
      })),
      clearReviewList: () => set({ reviewList: reviewActions.clearReviewList() }),
      removeWordFromReviewList: (wordId, currentVocabulary) => set(state => ({
        reviewList: reviewActions.removeWordFromReviewList(state.reviewList, wordId, currentVocabulary)
      })),
    }),
    {
      name: 'katakosa-review-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ reviewList: state.reviewList }),
    }
  )
);