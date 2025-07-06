import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';

export interface PracticeProject {
  id: string;
  name: string;
  setIds: string[];
  createdAt: string;
}

interface PracticeProjectState {
  projects: PracticeProject[];
  loading: boolean;

  _finishLoading: (error?: boolean) => void;
  addProject: (name: string, setIds: string[]) => void;
  removeProject: (projectId: string) => void;
  addSetsToProject: (projectId: string, setIds: string[]) => void;
  editProject: (projectId: string, newName: string, newSetIds: string[]) => void;
}

export const usePracticeProjectStore = create<PracticeProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      loading: true, // Status awal: loading true hingga rehidrasi selesai

      _finishLoading: (error = false) => {
        set({ loading: false });
      },

      addProject: (name, setIds) => {
        const newProject: PracticeProject = {
          id: `project-${Date.now()}`,
          name,
          setIds,
          createdAt: new Date().toISOString(),
        };
        set(state => ({ projects: [newProject, ...state.projects] }));
        toast.success(`Proyek "${name}" berhasil dibuat.`);
      },
      removeProject: (projectId) => {
        const projectToRemove = get().projects.find(p => p.id === projectId);
        set(state => ({ projects: state.projects.filter(p => p.id !== projectId) }));
        if (projectToRemove) {
          toast.success(`Proyek "${projectToRemove.name}" telah dihapus.`);
        }
      },
      addSetsToProject: (projectId, newSetIds) => {
        set(state => ({
          projects: state.projects.map(p => {
            if (p.id === projectId) {
              const updatedSetIds = [...new Set([...p.setIds, ...newSetIds])];
              return { ...p, setIds: updatedSetIds };
            }
            return p;
          })
        }));
        toast.success(`${newSetIds.length} set baru ditambahkan ke proyek.`);
      },
      editProject: (projectId, newName, newSetIds) => {
        set(state => ({
          projects: state.projects.map(p => {
            if (p.id === projectId) {
              return { ...p, name: newName, setIds: newSetIds };
            }
            return p;
          })
        }));
        toast.success(`Proyek "${newName}" berhasil diperbarui.`);
      },
    }),
    {
      name: 'katakosa-projects-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ projects: state.projects }),
      onRehydrateStorage: () => (state) => {
        state?._finishLoading(false);
      },
    }
  )
);