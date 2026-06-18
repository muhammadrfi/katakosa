import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { toast } from 'sonner';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji/Symbol representation
  color: string; // Accent color gradient
}

export const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'first_step',
    name: 'Pahlawan Pertama',
    description: 'Menyelesaikan sesi latihan pertama Anda',
    icon: '🏆',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'speed_demon',
    name: 'Pelari Cepat',
    description: 'Menjawab >= 15 kata dengan benar di Time Attack',
    icon: '⚡',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'golden_ear',
    name: 'Kuping Emas',
    description: 'Menyelesaikan sesi latihan Dikte dengan skor sempurna (100%)',
    icon: '👂',
    color: 'from-yellow-400 to-amber-600',
  },
  {
    id: 'vocab_lover',
    name: 'Pecinta Kosakata',
    description: 'Menyelesaikan sesi latihan proyek dengan >= 50 kata',
    icon: '📚',
    color: 'from-purple-400 to-pink-600',
  },
  {
    id: 'streak_3',
    name: 'Konsistensi Awal',
    description: 'Mencapai 3 hari streak belajar berturut-turut',
    icon: '🔥',
    color: 'from-orange-400 to-red-600',
  }
];

interface GamificationState {
  xp: number;
  level: number;
  badges: string[];
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  historyLogs: { [date: string]: number }; // date -> count of correct answers/sessions
  loading: boolean;

  _finishLoading: () => void;
  addXp: (amount: number) => void;
  addActivity: (count: number) => void;
  unlockBadge: (badgeId: string) => void;
  resetGamification: () => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      badges: [],
      streak: 0,
      lastActiveDate: null,
      historyLogs: {},
      loading: true,

      _finishLoading: () => {
        set({ loading: false });
      },

      addXp: (amount) => {
        const state = get();
        let newXp = state.xp + amount;
        let newLevel = state.level;
        let levelUpgraded = false;

        // Dynamic leveling: Level up threshold = level * 100 XP
        while (newXp >= newLevel * 100) {
          newXp -= newLevel * 100;
          newLevel += 1;
          levelUpgraded = true;
        }

        set({ xp: newXp, level: newLevel });

        if (levelUpgraded) {
          toast.success(`🎉 Selamat! Anda naik ke Level ${newLevel}!`, {
            description: `Ayo pertahankan semangat belajarmu! (+${amount} XP)`,
            duration: 5000,
          });
        } else {
          toast.info(`+${amount} XP didapatkan!`);
        }
      },

      addActivity: (count) => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        // Update historyLogs
        const currentCount = state.historyLogs[today] || 0;
        const updatedLogs = {
          ...state.historyLogs,
          [today]: currentCount + count
        };

        // Calculate streak
        let newStreak = state.streak;
        if (state.lastActiveDate === null) {
          newStreak = 1;
        } else if (state.lastActiveDate === today) {
          // Already active today, streak remains the same
        } else {
          const lastDate = new Date(state.lastActiveDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            newStreak += 1;
            // Check streak badges
            if (newStreak === 3 && !state.badges.includes('streak_3')) {
              setTimeout(() => get().unlockBadge('streak_3'), 500);
            }
          } else if (diffDays > 1) {
            newStreak = 1; // streak reset
          }
        }

        set({
          historyLogs: updatedLogs,
          lastActiveDate: today,
          streak: newStreak
        });

        // Award some XP for activity: 5 XP per action
        get().addXp(count * 5);
      },

      unlockBadge: (badgeId) => {
        const state = get();
        if (state.badges.includes(badgeId)) return;

        const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
        if (!badge) return;

        set({ badges: [...state.badges, badgeId] });
        
        toast.success(`🎖️ Lencana Baru Terbuka: ${badge.name}!`, {
          description: badge.description,
          duration: 6000,
        });

        // Reward extra XP for unlocking a badge
        get().addXp(100);
      },

      resetGamification: () => {
        set({
          xp: 0,
          level: 1,
          badges: [],
          streak: 0,
          lastActiveDate: null,
          historyLogs: {},
        });
        toast.success('Statistik gamifikasi telah direset.');
      }
    }),
    {
      name: 'katakosa-gamification-storage',
      storage: createJSONStorage(() => localforage),
      partialize: (state) => ({
        xp: state.xp,
        level: state.level,
        badges: state.badges,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        historyLogs: state.historyLogs,
      }),
      onRehydrateStorage: () => (state) => {
        state?._finishLoading();
      }
    }
  )
);
