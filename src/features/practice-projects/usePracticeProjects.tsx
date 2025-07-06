import { createContext, useContext, ReactNode } from 'react';
import { usePracticeProjectStore, PracticeProject } from './usePracticeProjectStore';

interface PracticeProjectsContextType {
  projects: PracticeProject[];
  addProject: (name: string, setIds: string[]) => void;
  removeProject: (projectId: string) => void;
  addSetsToProject: (projectId: string, setIds: string[]) => void;
}

const PracticeProjectsContext = createContext<PracticeProjectsContextType | undefined>(undefined);

export const PracticeProjectsProvider = ({ children }: { children: ReactNode }) => {
  const { projects, addProject, removeProject, addSetsToProject } = usePracticeProjectStore();

  return (
    <PracticeProjectsContext.Provider value={{ projects, addProject, removeProject, addSetsToProject }}>
      {children}
    </PracticeProjectsContext.Provider>
  );
};

export const usePracticeProjects = () => {
  const context = useContext(PracticeProjectsContext);
  if (context === undefined) {
    throw new Error('usePracticeProjects harus digunakan di dalam PracticeProjectsProvider');
  }
  return context;
};
