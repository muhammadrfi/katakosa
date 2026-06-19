import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { askGemini } from '@/lib/gemini';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  type: 'general' | 'tryout' | 'vocab' | 'culture';
  messages: Message[];
  createdAt: number;
}

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
};

interface AiState {
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  history: Message[];
  addMessage: (msg: Message) => void;
  clearHistory: () => void;
  
  // Sidebar Session Management
  sessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  createSession: (title: string, type: ChatSession['type']) => string;
  deleteSession: (id: string) => void;
  clearAllSessions: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isSidebarLoading: boolean;
  setSidebarLoading: (loading: boolean) => void;
  askSidebar: (userDisplayMsg: string, hiddenPrompt: string) => Promise<void>;
  askSidebarActive: (userMsg: string) => Promise<void>;
}

export const useAiStore = create<AiState>()(
  persist(
    (set, get) => ({
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),
      selectedModel: 'gemini-2.5-flash', // default
      setSelectedModel: (model) => set({ selectedModel: model }),
      history: [],
      addMessage: (msg) => set((state) => ({ history: [...state.history, msg] })),
      clearHistory: () => set({ history: [] }),
      
      // Sidebar implementation
      sessions: [],
      activeSessionId: null,
      setActiveSessionId: (id) => set({ activeSessionId: id }),
      createSession: (title, type) => {
        const id = `session_${Date.now()}`;
        const newSession: ChatSession = {
          id,
          title,
          type,
          messages: [],
          createdAt: Date.now()
        };
        set((s) => ({
          sessions: [newSession, ...s.sessions],
          activeSessionId: id
        }));
        return id;
      },
      deleteSession: (id) => set((s) => {
        const filtered = s.sessions.filter((sess) => sess.id !== id);
        let nextActive = s.activeSessionId;
        if (s.activeSessionId === id) {
          nextActive = filtered.length > 0 ? filtered[0].id : null;
        }
        return {
          sessions: filtered,
          activeSessionId: nextActive
        };
      }),
      clearAllSessions: () => set({ sessions: [], activeSessionId: null }),
      isSidebarOpen: false,
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      isSidebarLoading: false,
      setSidebarLoading: (loading) => set({ isSidebarLoading: loading }),
      
      // Ask contextual AI
      askSidebar: async (userDisplayMsg, hiddenPrompt) => {
        const { apiKey, selectedModel, activeSessionId } = get();
        if (!apiKey || !activeSessionId) return;
        const userMessage: Message = { role: 'user', content: userDisplayMsg };

        // Add user clean display message
        set((s) => ({
          sessions: s.sessions.map((sess) => 
            sess.id === activeSessionId 
              ? { ...sess, messages: [...sess.messages, userMessage] }
              : sess
          ),
          isSidebarLoading: true
        }));

        try {
          const finalPrompt = `${hiddenPrompt}
          
PENTING:
1. Berikan penjelasan secara terstruktur dengan jarak spasi yang cukup antar paragraf atau poin (gunakan baris baru ganda) agar nyaman dibaca dan tidak rapat/dempet.
2. Jawab secara padat, jelas, langsung ke inti.
3. JANGAN memberikan tips umum atau strategi generik saja. Jika menganalisis opsi jawaban tryout, berikan analisis detail per pilihan opsi dengan rujukan letak kata/kalimat yang sangat spesifik (misal: 'Lihat opsi jawaban 1, kata ini ada di awal paragraf...', 'Opsi 3 salah karena di kalimat ke-2 tertulis...', dll).`;
          
          const aiRes = await askGemini(apiKey, selectedModel, finalPrompt, []);
          set((s) => ({
            sessions: s.sessions.map((sess) => 
              sess.id === activeSessionId 
                ? { ...sess, messages: [...sess.messages, { role: 'model', content: aiRes }] } 
                : sess
            )
          }));
        } catch (err: unknown) {
          set((s) => ({
            sessions: s.sessions.map((sess) => 
              sess.id === activeSessionId 
                ? { ...sess, messages: [...sess.messages, { role: 'model', content: `Error: ${getErrorMessage(err)}` }] } 
                : sess
            )
          }));
        } finally {
          set({ isSidebarLoading: false });
        }
      },

      // Follow-up chat inside active session
      askSidebarActive: async (userMsg) => {
        const { apiKey, selectedModel, activeSessionId, sessions } = get();
        if (!apiKey || !activeSessionId) return;

        const session = sessions.find((s) => s.id === activeSessionId);
        if (!session) return;

        const updatedMessages: Message[] = [...session.messages, { role: 'user', content: userMsg }];

        set((s) => ({
          sessions: s.sessions.map((sess) => 
            sess.id === activeSessionId ? { ...sess, messages: updatedMessages } : sess
          ),
          isSidebarLoading: true
        }));

        try {
          const systemPrompt = `Anda adalah Asisten Belajar Bahasa Korea Katakosa yang mahir.
PENTING:
1. Berikan penjelasan secara terstruktur dengan jarak spasi yang cukup antar paragraf atau poin (gunakan baris baru ganda) agar nyaman dibaca dan tidak rapat/dempet.
2. Jawab secara padat, jelas, langsung ke inti.
3. JANGAN memberikan tips umum atau strategi generik saja. Jika menjelaskan strategi/tips pengerjaan kuis/soal, berikan analisis detail per pilihan opsi dengan rujukan letak kata/kalimat yang sangat spesifik (misal: 'Lihat opsi jawaban A, kata ini ada di awal paragraf...', 'Opsi B salah karena di kalimat ke-2 tertulis...', dll).

Pertanyaan User: ${userMsg}`;

          const aiRes = await askGemini(apiKey, selectedModel, systemPrompt, session.messages);
          set((s) => ({
            sessions: s.sessions.map((sess) => 
              sess.id === activeSessionId 
                ? { ...sess, messages: [...updatedMessages, { role: 'model', content: aiRes }] } 
                : sess
            )
          }));
        } catch (err: unknown) {
          set((s) => ({
            sessions: s.sessions.map((sess) => 
              sess.id === activeSessionId 
                ? { ...sess, messages: [...updatedMessages, { role: 'model', content: `Error: ${getErrorMessage(err)}` }] } 
                : sess
            )
          }));
        } finally {
          set({ isSidebarLoading: false });
        }
      }
    }),
    { name: 'katakosa_ai_settings' }
  )
);
