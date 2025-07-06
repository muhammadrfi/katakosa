import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { toast } from 'sonner';
import { VocabularySet, WordPair } from './vocabulary.types';
import * as vocabActions from './vocabularyActions';

type SrsFilter = 'all' | 'new' | 'learning' | 'due' | 'mastered' | 'forgotten';

interface VocabularyState {
  vocabularySets: VocabularySet[];
  loading: boolean;
  hasLoadingError: boolean;

  // Selectors
  getVocabularyBySetIds: (setIds: string[]) => WordPair[];
  getFilteredWords: (words: WordPair[], filter: SrsFilter) => WordPair[];

  // Actions
  setHasLoadingError: (error: boolean) => void;
  _finishLoading: (error?: boolean) => void; 
  addVocabularySet: (name: string, newWords: Omit<WordPair, 'id'>[]) => void;
  addMultipleVocabularySets: (newSetsInfo: { name: string; words: Omit<WordPair, 'id'>[] }[]) => VocabularySet[];
  clearAllVocabulary: () => void;
  removeVocabularySet: (setId: string) => void;
  removeWord: (id: string) => void;
  editVocabularySet: (setId: string, newName: string) => void;
  editWord: (wordId: string, newWordData: { bahasaA: string; bahasaB:string }) => void;
  addWordToSet: (setId: string, newWord: Omit<WordPair, 'id'>) => void;
  markWordAsRemembered: (wordId: string) => void;
  markWordAsForgotten: (wordId: string) => void;
}

// Definisikan state creator dengan tipe yang benar
const stateCreator: StateCreator<VocabularyState, [], [['zustand/persist', unknown]]> = (set, get) => ({
  // --- State Properties ---
  vocabularySets: [],
  loading: true, // Status awal: loading true hingga rehidrasi selesai
  hasLoadingError: false,

  // --- Selectors ---
  getVocabularyBySetIds: (setIds) => {
    const allSets = get().vocabularySets;
    return allSets
      .filter(set => setIds.includes(set.id))
      .flatMap(set => set.words);
  },

  getFilteredWords: (words, filter) => {
    if (filter === 'all') return words;
    return words.filter(word => {
      switch (filter) {
        case 'new':
          return word.repetition === 0 && word.interval === 0;
        case 'learning':
          return word.repetition > 0 && word.repetition < 3 && word.interval < 7;
        case 'due':
          return word.nextReviewDate !== null && word.nextReviewDate !== undefined && word.nextReviewDate <= Date.now();
        case 'mastered':
          return word.repetition >= 5 && word.interval >= 30;
        case 'forgotten':
          return word.repetition === 0 && word.interval > 0;
        default:
          return true;
      }
    });
  },

  // --- Actions ---
  setHasLoadingError: (error: boolean) => set({ hasLoadingError: error }),
  
  // Action internal untuk memperbarui status loading setelah hidrasi
  _finishLoading: (error = false) => {
    set({ loading: false, hasLoadingError: error });
  },

  addVocabularySet: (name, newWords) => {
    const currentSets = get().vocabularySets;
    const updatedSets = vocabActions.addVocabularySet(currentSets, name, newWords);
    set({ vocabularySets: updatedSets });
  },

  addMultipleVocabularySets: (newSetsInfo) => {
    const newSets = vocabActions.createMultipleVocabularySets(newSetsInfo);
    set(state => ({ vocabularySets: [...state.vocabularySets, ...newSets] }));
    toast.success(`${newSets.length} set kosakata baru berhasil dibuat oleh AI.`);
    return newSets;
  },

  clearAllVocabulary: () => set({ vocabularySets: vocabActions.clearAllVocabulary() }),

  removeVocabularySet: (setId) => set(state => ({
    vocabularySets: vocabActions.removeVocabularySet(state.vocabularySets, setId)
  })),

  removeWord: (id) => set(state => ({
    vocabularySets: vocabActions.removeWord(state.vocabularySets, id)
  })),

  editVocabularySet: (setId, newName) => set(state => ({
    vocabularySets: vocabActions.editVocabularySet(state.vocabularySets, setId, newName)
  })),

  editWord: (wordId, newWordData) => set(state => ({
    vocabularySets: vocabActions.editWord(state.vocabularySets, wordId, newWordData)
  })),
    
  addWordToSet: (setId, newWord) => set(state => ({
    vocabularySets: vocabActions.addWordToSet(state.vocabularySets, setId, newWord)
  })),

  markWordAsRemembered: (wordId: string) => set(state => {
    const updatedSets = state.vocabularySets.map(set => ({
      ...set,
      words: set.words.map(word => {
        if (word.id === wordId) {
          const newRepetition = word.repetition + 1;
          let newInterval: number;
          let newEaseFactor = word.easeFactor;

          if (newRepetition === 1) {
            newInterval = 1;
          } else if (newRepetition === 2) {
            newInterval = 6;
          } else {
            newInterval = Math.round(word.interval * newEaseFactor);
          }

          // Adjust ease factor slightly for good answers (optional, can be more complex)
          newEaseFactor = Math.min(2.5, newEaseFactor + 0.1); 

          const newNextReviewDate = Date.now() + newInterval * 24 * 60 * 60 * 1000; // Convert days to milliseconds

          return {
            ...word,
            repetition: newRepetition,
            interval: newInterval,
            easeFactor: newEaseFactor,
            nextReviewDate: newNextReviewDate,
            history: [...(word.history || []), { date: Date.now(), status: 'remembered' as const }],
          };
        }
        return word;
      }),
    }));
    return { vocabularySets: updatedSets };
  }),

  markWordAsForgotten: (wordId: string) => set(state => {
    const updatedSets = state.vocabularySets.map(set => ({
      ...set,
      words: set.words.map(word => {
        if (word.id === wordId) {
          const newEaseFactor = Math.max(1.3, word.easeFactor - 0.2); // Decrease ease factor, min 1.3
          const newNextReviewDate = Date.now() + 1 * 24 * 60 * 60 * 1000; // Review again tomorrow

          return {
            ...word,
            repetition: 0, // Reset repetition
            interval: 1, // Reset interval to 1 day
            easeFactor: newEaseFactor,
            nextReviewDate: newNextReviewDate,
            history: [...(word.history || []), { date: Date.now(), status: 'forgotten' as const }],
          };
        }
        return word;
      }),
    }));
    return { vocabularySets: updatedSets };
  }),
});

export const useVocabularyStore = create<VocabularyState>()(
  persist(
    stateCreator,
    {
      name: 'katakosa-vocabulary-storage',
      storage: createJSONStorage(() => localforage),
      // Hanya menyimpan properti vocabularySets
      partialize: (state) => ({ vocabularySets: state.vocabularySets }),
      
      // `merge` adalah tempat yang tepat untuk migrasi dan validasi data.
      // Fungsi ini berjalan sebelum state diatur.
      merge: (persistedState, currentState) => {
        console.log('Zustand: Merging persisted state...');
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState; // Tidak ada state yang valid, kembalikan state awal
        }

        const stateFromStorage = persistedState as Partial<VocabularyState>;
        
        // Sanitasi dan migrasi data `vocabularySets`
        const migratedSets = (stateFromStorage.vocabularySets || []).map(set => {
          // Lewati jika 'set' bukan objek yang valid
          if (!set || typeof set !== 'object') return null;

          // Buat 'set' yang valid dengan nilai fallback
          const validSet: VocabularySet = {
            id: set.id || `set-${Date.now()}-${Math.random()}`,
            name: set.name || 'Set Tanpa Nama',
            createdAt: set.createdAt || new Date().toISOString(),
            words: (Array.isArray(set.words) ? set.words : []).map(word => {
              if (!word || typeof word !== 'object') return null;
              return {
                id: word.id || `word-${Date.now()}-${Math.random()}`,
                bahasaA: typeof word.bahasaA === 'string' ? word.bahasaA : '',
                bahasaB: typeof word.bahasaB === 'string' ? word.bahasaB : '',
                repetition: typeof word.repetition === 'number' ? word.repetition : 0,
                interval: typeof word.interval === 'number' ? word.interval : 0,
                easeFactor: typeof word.easeFactor === 'number' ? word.easeFactor : 2.5,
                nextReviewDate: typeof word.nextReviewDate === 'number' ? word.nextReviewDate : undefined,
              };
            }).filter(word => word !== null) as WordPair[],
          };
          return validSet;
        }).filter(set => set !== null) as VocabularySet[];



        return {
          ...currentState,
          vocabularySets: migratedSets,
        };
      },

      // `onRehydrateStorage` untuk efek samping SETELAH hidrasi.
      // Digunakan untuk memicu action yang mengubah `loading` menjadi false.
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Zustand: Rehydration error:', error);
          toast.error('Gagal memuat data tersimpan. Data mungkin rusak dan telah direset.');
          // Gunakan action internal untuk memperbarui state loading/error
          state?._finishLoading(true);
        } else {
          console.log('Zustand: Rehydration successful.');
          // Gunakan action internal untuk memperbarui state loading
          state?._finishLoading(false);
        }
      },
    }
  )
);