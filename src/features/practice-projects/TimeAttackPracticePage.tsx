import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { usePracticeProjectStore } from './usePracticeProjectStore';
import { useGamificationStore } from '../dashboard/useGamificationStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Timer, Zap, Trophy, Play, RotateCcw, ShieldAlert, Award } from 'lucide-react';
import { WordPair } from '../vocabulary/vocabulary.types';
import { cn } from '@/lib/utils';
import { soundEffects } from '../../utils/soundEffects';

export default function TimeAttackPracticePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getVocabularyBySetIds, loading: vocabLoading } = useVocabularyStore();
  const { projects, loading: projectsLoading } = usePracticeProjectStore();
  const { addXp, addActivity, unlockBadge } = useGamificationStore();

  const [gameState, setGameState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState<WordPair | null>(null);
  const [options, setOptions] = useState<WordPair[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; selectedId: string | null }>({ type: null, selectedId: null });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const project = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  const allWords = useMemo(() => {
    if (!project) return [];
    return getVocabularyBySetIds(project.setIds);
  }, [project, getVocabularyBySetIds]);

  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard', { replace: true });
    }
  }, [projectId, navigate]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (gameState === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const generateQuestion = (targetWords: WordPair[]) => {
    if (targetWords.length < 4) return;
    
    // Pick a random word as the target
    const targetIdx = Math.floor(Math.random() * targetWords.length);
    const target = targetWords[targetIdx];
    setCurrentWord(target);

    // Pick 3 distractors
    const distractors: WordPair[] = [];
    const pool = targetWords.filter(w => w.id !== target.id);
    
    while (distractors.length < 3 && pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      const chosen = pool.splice(idx, 1)[0];
      distractors.push(chosen);
    }

    // Combine and shuffle options
    const allOptions = [target, ...distractors];
    // Fisher-Yates Shuffle
    for (let i = allOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }
    
    setOptions(allOptions);
  };

  const handleStartGame = () => {
    soundEffects.playFlip();
    setScore(0);
    setTimeLeft(30);
    setGameState('running');
    setFeedback({ type: null, selectedId: null });
    generateQuestion(allWords);
  };

  const handleGameOver = () => {
    soundEffects.playLevelUp();
    setGameState('finished');
    
    // Award completion XP: +50 XP
    addXp(50);
    
    // Track daily activity (total correct answers in this run)
    if (score > 0) {
      addActivity(score);
    }

    // Award "first_step" badge for completing a practice session
    unlockBadge('first_step');

    // Award "speed_demon" badge if score >= 15
    if (score >= 15) {
      unlockBadge('speed_demon');
    }

    // Award "vocab_lover" badge if project size >= 50
    if (allWords.length >= 50) {
      unlockBadge('vocab_lover');
    }
  };

  const handleAnswer = (selectedId: string) => {
    if (feedback.type !== null || !currentWord) return;

    const isCorrect = selectedId === currentWord.id;

    if (isCorrect) {
      soundEffects.playCorrect();
      setFeedback({ type: 'correct', selectedId });
      setScore(prev => prev + 1);
      setTimeLeft(prev => prev + 2); // Add 2s
      
      setTimeout(() => {
        setFeedback({ type: null, selectedId: null });
        generateQuestion(allWords);
      }, 500);
    } else {
      soundEffects.playIncorrect();
      setFeedback({ type: 'wrong', selectedId });
      setTimeLeft(prev => Math.max(0, prev - 3)); // Deduct 3s

      setTimeout(() => {
        setFeedback({ type: null, selectedId: null });
        generateQuestion(allWords);
      }, 600);
    }
  };

  const handlePlayAgain = () => {
    handleStartGame();
  };

  if (projectsLoading || vocabLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="ml-2 text-slate-500">Memuat modul Time Attack...</p>
      </div>
    );
  }

  if (!projectId || !project) {
    return (
      <div className="text-center py-12">
        <ShieldAlert className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Proyek Tidak Ditemukan</h2>
        <p className="text-slate-500">Silakan kembali ke dashboard.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4">
      {/* HEADER CARD */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Zap className="h-7 w-7 text-indigo-600 dark:text-indigo-400 fill-indigo-500/10" />
          Time Attack: {project.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kuis kosakata cepat. Benar (+2d), Salah (-3d). Raih skor tertinggi!
        </p>
      </div>

      {/* IDLE VIEW */}
      {gameState === 'idle' && (
        <Card className="bg-card border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700">
              <Zap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-xl text-slate-900 dark:text-white">Siap Berpacu dengan Waktu?</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Anda memiliki waktu awal **30 detik** untuk menerjemahkan kata sebanyak-banyaknya.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-8">
            <div className="text-left text-sm bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 mb-6 max-w-sm w-full">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Benar:</span>
                <span className="text-slate-700 dark:text-slate-300">+2 Detik & +10 XP</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-rose-600 dark:text-rose-400 font-bold">✗ Salah:</span>
                <span className="text-slate-700 dark:text-slate-300">-3 Detik</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-600 dark:text-amber-500 font-bold">🎖️ Lencana:</span>
                <span className="text-slate-700 dark:text-slate-300 text-xs">Skor &gt;= 15 membuka lencana **Pelari Cepat**!</span>
              </div>
            </div>
            <Button
              onClick={handleStartGame}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm px-8 py-6 rounded-xl hover:-translate-y-[1px] transition-all"
            >
              <Play className="mr-2 h-5 w-5 fill-white" />
              Mulai Time Attack
            </Button>
          </CardContent>
        </Card>
      )}

      {/* GAME RUNNING */}
      {gameState === 'running' && currentWord && (
        <div className="space-y-6">
          {/* STATS BAR */}
          <div className="flex justify-between items-center gap-4 bg-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Score */}
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500 fill-amber-500/10" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Skor Benar</div>
                <div className="text-lg font-black text-slate-950 dark:text-white">{score}</div>
              </div>
            </div>

            {/* Timer with shaking logic */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 border transition-all duration-300",
                timeLeft < 10
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 animate-bounce"
                  : "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-800 dark:text-indigo-400"
              )}
            >
              <Timer className="h-5 w-5" />
              <span className="text-xl font-extrabold tracking-mono">{timeLeft}s</span>
            </div>
          </div>

          {/* QUESTION BOX */}
          <Card className="bg-card border border-slate-200 dark:border-slate-800 shadow-sm py-8 relative overflow-hidden rounded-2xl">
            <CardContent className="text-center pt-2 space-y-4">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900">
                Terjemahkan kata ini:
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-wide pt-2 select-none">
                {currentWord.bahasaA}
              </h2>
            </CardContent>
          </Card>

          {/* MULTIPLE CHOICE OPTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option) => {
              const isSelected = feedback.selectedId === option.id;
              const isCorrect = option.id === currentWord.id;

              let buttonStyle = "bg-card border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700";
              if (feedback.type !== null) {
                if (isCorrect) {
                  buttonStyle = "bg-emerald-500 border-emerald-600 text-white dark:bg-emerald-600 dark:border-emerald-700 animate-scale-pulse transition-colors duration-300";
                } else if (isSelected) {
                  buttonStyle = "bg-rose-500 border-rose-600 text-white dark:bg-rose-600 dark:border-rose-700 animate-shake transition-colors duration-300";
                } else {
                  buttonStyle = "bg-card border-slate-100 dark:border-slate-900 opacity-50";
                }
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  disabled={feedback.type !== null}
                  className={cn(
                    "w-full text-left p-5 rounded-2xl border font-bold transition-all duration-200 flex items-center justify-between shadow-sm select-none",
                    buttonStyle
                  )}
                >
                  <span className="text-base md:text-lg">{option.bahasaB}</span>
                  {feedback.type !== null && isCorrect && (
                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded border border-white/30 text-white">
                      +2s
                    </span>
                  )}
                  {feedback.type !== null && isSelected && !isCorrect && (
                    <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded border border-white/30 text-white">
                      -3s
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GAME FINISHED VIEW */}
      {gameState === 'finished' && (
        <Card className="bg-card border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900">
              <Trophy className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-bounce" />
            </div>
            <CardTitle className="text-2xl text-slate-900 dark:text-white">Sesi Latihan Selesai!</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Waktu Anda telah habis. Berikut adalah performa Anda:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center pb-8">
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Skor Jawaban</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{score} kata</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">XP Didapatkan</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">+{score * 10 + 50} XP</span>
              </div>
            </div>

            {/* Earned Badge Notification inside the screen */}
            {score >= 15 && (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-3 px-4 rounded-xl max-w-sm w-full">
                <Award className="h-8 w-8 text-amber-500 animate-pulse" />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Lencana Terbuka: Pelari Cepat</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Menjawab &gt;= 15 kata benar dalam satu sesi.</div>
                </div>
              </div>
            )}

            <div className="flex gap-3 w-full max-w-sm">
              <Button
                onClick={handlePlayAgain}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl py-6 shadow-sm"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Main Lagi
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/latihan/${projectId}`)}
                className="flex-1 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-bold rounded-xl py-6"
              >
                Kembali ke Proyek
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
