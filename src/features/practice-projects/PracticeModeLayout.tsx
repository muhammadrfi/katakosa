import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Bot, FileQuestion, Library, Volume2, Puzzle, BrainCircuit, Pencil } from 'lucide-react';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { usePracticeProjectStore } from './usePracticeProjectStore';

const practiceModes = [
  { name: 'Kuis', path: '/practice/quiz', icon: FileQuestion, minWords: 4 },
  { name: 'Flipbook', path: '/practice/flipbook', icon: BookOpen, minWords: 1 },
  { name: 'Latihan Mendengar', path: '/practice/listening', icon: Volume2, minWords: 4 },
  { name: 'Latihan Mencocokkan', path: '/practice/matching', icon: Puzzle, minWords: 4 },
  { name: 'Latihan Menulis', path: '/practice/writing', icon: Pencil, minWords: 1 },
  { name: 'Menghafal', path: '/practice/memorization', icon: BrainCircuit, minWords: 1 },
  { name: 'Ulasan', path: '/practice/review', icon: Library, minWords: 1 },
];

const PracticeModeLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { vocabularySets, loading: vocabLoading } = useVocabularyStore();
  const { projects, loading: projectsLoading } = usePracticeProjectStore();
  const project = useMemo(() => projects.find(p => p.id === projectId), [projects, projectId]);

  const totalWords = useMemo(() => {

    if (!project) {
      return 0;
    }
    const setIds = project.setIds || [];
    if (!setIds.length) {
      return 0;
    }
    const wordsCount = vocabularySets
      .filter(set => setIds.includes(set.id))
      .flatMap(set => set.words).length;
    return wordsCount;
  }, [vocabularySets, project, projectId]);

  const pathSegments = location.pathname.split('/').filter(Boolean); // Remove empty strings from split
  let currentMode = 'quiz'; // Default mode
  if (pathSegments.length >= 3) { // e.g., ['practice', 'projectId', 'quiz']
    currentMode = pathSegments[pathSegments.length - 1];
  }

  const handleTabChange = (mode: string) => {
    navigate(mode); // Navigate relatively within the nested route
  };

  if (vocabLoading) {
    return <div className="container mx-auto py-12 px-6 text-center">Memuat data...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-6" data-project-id={projectId} data-total-words={totalWords}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(projectId ? `/latihan/${projectId}` : '/dashboard')} className="self-start -ml-4">
          <ArrowLeft />
          Kembali
        </Button>
        
        <Tabs value={currentMode} onValueChange={handleTabChange} className="w-full sm:w-auto">
          <TabsList className="w-full overflow-x-auto justify-start sm:w-auto sm:justify-center">
            {practiceModes.map((mode) => {
              const isEnabled = totalWords >= mode.minWords;
              const modeValue = mode.path.split('/').pop();

              return (
                <TabsTrigger key={mode.path} value={modeValue} disabled={!isEnabled} title={!isEnabled ? `Butuh min. ${mode.minWords} kata` : mode.name}>







                  <mode.icon className="mr-2 h-4 w-4" />
                  {mode.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PracticeModeLayout;
