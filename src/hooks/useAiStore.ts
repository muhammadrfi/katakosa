import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

interface AiState {
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  history: Message[];
  addMessage: (msg: Message) => void;
  clearHistory: () => void;
}

export const useAiStore = create<AiState>()(
  persist(
    (set) => ({
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),
      selectedModel: 'gemini-1.5-flash', // default
      setSelectedModel: (model) => set({ selectedModel: model }),
      history: [],
      addMessage: (msg) => set((state) => ({ history: [...state.history, msg] })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: 'katakosa_ai_settings' }
  )
);
