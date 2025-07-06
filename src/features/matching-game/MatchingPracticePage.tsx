import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { usePracticeProjectStore } from '../practice-projects/usePracticeProjectStore';
import { MatchingGame } from './MatchingGame.tsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const MatchingPracticePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const srsFilter = queryParams.get('srsFilter') as 'all' | 'new' | 'learning' | 'due' | 'mastered' | 'forgotten' | null;
  const { getVocabularyBySetIds, getFilteredWords, loading: vocabLoading } = useVocabularyStore();
  const { projects, loading: projectsLoading } = usePracticeProjectStore();

  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  const project = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  const allWordsInProject = useMemo(() => {
    if (!project) return [];
    return getVocabularyBySetIds(project.setIds);
  }, [project, getVocabularyBySetIds]);

  const wordsForPractice = useMemo(() => {
    return getFilteredWords(allWordsInProject, srsFilter || 'all');
  }, [allWordsInProject, getFilteredWords, srsFilter]);

  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard', { replace: true });
    }
  }, [projectId, navigate]);



  const handleGameStart = () => {
    setGameStarted(true);
    setGameFinished(false);
  };

  const handleGameFinish = () => {
    setGameFinished(true);
  };

  const handlePlayAgain = () => {
    setGameStarted(false);
    setGameFinished(false);
  };

  if (projectsLoading || vocabLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Memuat...</p>
      </div>
    );
  }

  if (!projectId || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Latihan Mencocokkan: {project.name}</h1>

      {!gameStarted && !gameFinished && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Mulai Permainan Mencocokkan</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Siap untuk menguji ingatan Anda?</p>
            <Button onClick={handleGameStart}>Mulai Permainan</Button>
          </CardContent>
        </Card>
      )}

      {gameStarted && !gameFinished && wordsForPractice.length > 0 && (
        <MatchingGame words={wordsForPractice} onGameFinish={handleGameFinish} />
      )}

      {gameFinished && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Permainan Selesai!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Selamat, Anda telah menyelesaikan permainan mencocokkan.</p>
            <Button onClick={handlePlayAgain} className="mr-2">Main Lagi</Button>
            <Button onClick={() => navigate('/dashboard')} variant="outline">Kembali ke Dashboard</Button>
          </CardContent>
        </Card>
      )}

      {gameStarted && wordsForPractice.length === 0 && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Tidak Ada Kata</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Set kosakata ini tidak memiliki kata-kata untuk dimainkan.</p>
            <Button onClick={() => navigate('/dashboard')} variant="outline">Kembali ke Dashboard</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchingPracticePage;