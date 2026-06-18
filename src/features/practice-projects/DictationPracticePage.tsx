import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { usePracticeProjectStore } from './usePracticeProjectStore';
import { useGamificationStore } from '../dashboard/useGamificationStore';
import { useTextToSpeech } from '../listening-practice/useTextToSpeech';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Headphones, Play, RotateCcw, Volume2, HelpCircle, Check, X, Award, ShieldAlert } from 'lucide-react';
import { WordPair } from '../vocabulary/vocabulary.types';
import { cn } from '@/lib/utils';
import { soundEffects } from '../../utils/soundEffects';

export default function DictationPracticePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getVocabularyBySetIds, loading: vocabLoading } = useVocabularyStore();
  const { projects, loading: projectsLoading } = usePracticeProjectStore();
  const { addXp, addActivity, unlockBadge } = useGamificationStore();
  const { playSound, isSpeaking } = useTextToSpeech();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [words, setWords] = useState<WordPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  
  // Hint states
  const [showTranslationHint, setShowTranslationHint] = useState(false);
  const [showFirstLetterHint, setShowFirstLetterHint] = useState(false);
  
  // Verification states
  const [hasVerified, setHasVerified] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [perfectSession, setPerfectSession] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

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

  const currentWord = useMemo(() => {
    if (words.length === 0 || currentIndex >= words.length) return null;
    return words[currentIndex];
  }, [words, currentIndex]);

  // Play sound when current word changes
  useEffect(() => {
    if (gameState === 'playing' && currentWord) {
      // Small timeout to let voices load
      const t = setTimeout(() => {
        playSound(currentWord.bahasaA, 'en-US'); // Default to English TTS, fallback handles others
      }, 400);
      return () => clearTimeout(t);
    }
  }, [currentIndex, gameState, currentWord, playSound]);

  const handleStartGame = () => {
    if (allWords.length === 0) return;
    
    soundEffects.playFlip();
    // Shuffle words for practice
    const shuffled = [...allWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setWords(shuffled);
    setCurrentIndex(0);
    setUserInput('');
    setScore(0);
    setPerfectSession(true);
    setHasVerified(false);
    setShowTranslationHint(false);
    setShowFirstLetterHint(false);
    setGameState('playing');
  };

  const handlePlayAudio = () => {
    if (currentWord) {
      playSound(currentWord.bahasaA, 'en-US');
    }
  };

  const handleVerify = () => {
    if (!currentWord || hasVerified) return;

    const normalizedUser = userInput.trim().toLowerCase();
    const normalizedTarget = currentWord.bahasaA.trim().toLowerCase();

    // Tolerant check (case insensitive & spaces ignored)
    const correct = normalizedUser === normalizedTarget;

    setIsCurrentCorrect(correct);
    setHasVerified(true);

    if (correct) {
      soundEffects.playCorrect();
      setScore(prev => prev + 1);
      addActivity(1); // Gain XP per correct answer
    } else {
      soundEffects.playIncorrect();
      setPerfectSession(false);
    }
  };

  const handleNext = () => {
    soundEffects.playFlip();
    setUserInput('');
    setHasVerified(false);
    setShowTranslationHint(false);
    setShowFirstLetterHint(false);

    if (currentIndex + 1 >= words.length) {
      handleFinishGame();
    } else {
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleFinishGame = () => {
    setGameState('finished');
    soundEffects.playLevelUp();
    
    // Sesi selesai reward +50 XP
    addXp(50);
    
    // Badge checks
    unlockBadge('first_step');

    // If 100% correct and perfect session (no errors/hints used)
    const successRate = score / words.length;
    if (successRate === 1 && perfectSession) {
      unlockBadge('golden_ear');
    }

    if (words.length >= 50) {
      unlockBadge('vocab_lover');
    }
  };

  // Render character-by-character diff comparison
  const renderDiff = () => {
    if (!currentWord) return null;
    
    const target = currentWord.bahasaA;
    const user = userInput;
    const diffs: React.ReactNode[] = [];

    const maxLength = Math.max(target.length, user.length);

    for (let i = 0; i < maxLength; i++) {
      const targetChar = target[i];
      const userChar = user[i];

      if (targetChar !== undefined && userChar !== undefined) {
        if (targetChar.toLowerCase() === userChar.toLowerCase()) {
          // Correct character
          diffs.push(
            <span key={i} className="text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-500/40">
              {targetChar}
            </span>
          );
        } else {
          // Wrong character
          diffs.push(
            <span key={i} className="text-red-600 dark:text-red-400 font-bold border-b-2 border-red-500/60 bg-red-500/10 px-[1px] rounded" title={`Ketik: ${userChar}, Seharusnya: ${targetChar}`}>
              {targetChar}
            </span>
          );
        }
      } else if (targetChar !== undefined) {
        // Missing character in user input
        diffs.push(
          <span key={i} className="text-muted-foreground font-bold border-b-2 border-dashed border-muted bg-muted/30 px-[2px] rounded">
            {targetChar}
          </span>
        );
      } else if (userChar !== undefined) {
        // Extra character typed by user
        diffs.push(
          <span key={i} className="text-red-500 font-bold line-through border-b-2 border-red-400/40 px-[1px] bg-red-500/10">
            {userChar}
          </span>
        );
      }
    }

    return (
      <div className="flex flex-wrap justify-center gap-0.5 text-2xl tracking-wide select-none py-3 px-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto">
        {diffs}
      </div>
    );
  };

  if (projectsLoading || vocabLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="ml-2 text-slate-400">Memuat modul Dikte...</p>
      </div>
    );
  }

  if (!projectId || !project) {
    return (
      <div className="text-center py-12">
        <ShieldAlert className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Proyek Tidak Ditemukan</h2>
        <p className="text-slate-400">Silakan kembali ke dashboard.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-6">
      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Headphones className="h-7 w-7 text-amber-400 animate-bounce" />
          Latihan Dikte: {project.name}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Dengarkan kata yang dibacakan, lalu ketik ejaannya dengan benar.
        </p>
      </div>

      {/* START VIEW */}
      {gameState === 'start' && (
        <Card className="bg-card border border-border shadow-md overflow-hidden rounded-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Headphones className="h-8 w-8 text-amber-500" />
            </div>
            <CardTitle className="text-xl text-foreground">Mulai Latihan Dikte</CardTitle>
            <CardDescription className="text-muted-foreground">
              Uji ketepatan mendengar dan menulis ejaan Anda untuk **{allWords.length} kata** dalam proyek ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-8">
            <div className="text-left text-xs bg-muted/50 p-4 rounded-xl border border-border space-y-2 mb-6 max-w-sm w-full">
              <p className="text-muted-foreground leading-relaxed">
                1. Klik tombol putar untuk mendengarkan audio pengucapan kata.<br />
                2. Ketik kata tersebut di kolom yang disediakan.<br />
                3. Gunakan bantuan terjemahan/huruf awal jika ragu (mengurangi peluang lencana sempurna).
              </p>
            </div>
            <Button
              onClick={handleStartGame}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 font-bold text-white shadow-sm px-8 py-6 rounded-xl hover:scale-102 transition-all"
            >
              Mulai Sesi Dikte
            </Button>
          </CardContent>
        </Card>
      )}

      {/* PLAYING VIEW */}
      {gameState === 'playing' && currentWord && (
        <div className="space-y-6">
          {/* PROGRESS HEADER */}
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="text-xs text-muted-foreground">
              Kata ke-<span className="font-bold text-amber-500">{currentIndex + 1}</span> dari <span className="font-bold text-foreground">{words.length}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Akurasi: <span className="font-bold text-emerald-600 dark:text-emerald-400">{score} Benar</span>
            </div>
          </div>

          {/* AUDIO CONTROLLER CARD */}
          <Card className="bg-card border border-border shadow-sm py-8 relative overflow-hidden rounded-xl">
            <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
              <Button
                onClick={handlePlayAudio}
                size="lg"
                disabled={isSpeaking}
                className={cn(
                  "w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all duration-300 hover:scale-105",
                  isSpeaking && "animate-pulse ring-4 ring-amber-500/30"
                )}
              >
                <Volume2 className="h-10 w-10 fill-white" />
              </Button>
              <span className="text-xs font-semibold text-muted-foreground">
                {isSpeaking ? "Memutar audio..." : "Klik untuk Mendengarkan"}
              </span>
            </CardContent>
          </Card>

          {/* INPUT & ACTION BOX */}
          <Card className="bg-card border border-border p-6 rounded-xl space-y-6 shadow-sm">
            {!hasVerified ? (
              <div className="space-y-4">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Ketik kata yang Anda dengar..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && userInput.trim() && handleVerify()}
                  className="bg-background border border-input text-foreground text-center text-xl font-bold py-6 rounded-xl focus:border-amber-500 focus:ring-amber-500"
                  autoComplete="off"
                  autoFocus
                />
                
                <div className="flex gap-2 justify-between">
                  {/* Hints Trigger */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        soundEffects.playFlip();
                        setShowTranslationHint(true);
                        setPerfectSession(false);
                      }}
                      disabled={showTranslationHint}
                      className="text-xs text-muted-foreground hover:text-amber-500 h-9"
                    >
                      <HelpCircle className="h-4 w-4 mr-1" />
                      Petunjuk Arti
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        soundEffects.playFlip();
                        setShowFirstLetterHint(true);
                        setPerfectSession(false);
                      }}
                      disabled={showFirstLetterHint}
                      className="text-xs text-muted-foreground hover:text-amber-500 h-9"
                    >
                      Huruf Pertama
                    </Button>
                  </div>

                  <Button
                    onClick={handleVerify}
                    disabled={!userInput.trim()}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 rounded-xl h-9"
                  >
                    Periksa
                  </Button>
                </div>

                {/* Hint Messages */}
                {showTranslationHint && (
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl text-center text-sm text-amber-700 dark:text-amber-400">
                    Terjemahan kata ini: <span className="font-bold">{currentWord.bahasaB}</span>
                  </div>
                )}
                {showFirstLetterHint && (
                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl text-center text-sm text-amber-700 dark:text-amber-400">
                    Huruf awal kata ini: <span className="font-bold uppercase tracking-widest">{currentWord.bahasaA.charAt(0)}...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 text-center">
                {/* Result Feedback */}
                {isCurrentCorrect ? (
                  <div className="space-y-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 mb-2 animate-scale-pulse">
                      <Check className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Hebat! Ejaan Anda Benar</h3>
                    <p className="text-foreground font-semibold text-lg">{currentWord.bahasaA}</p>
                    <p className="text-xs text-muted-foreground mt-1">{currentWord.bahasaB}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 animate-shake">
                      <X className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Ejaan Kurang Tepat</h3>
                    
                    {/* Character Diff block */}
                    {renderDiff()}
                    
                    <div className="text-xs text-muted-foreground mt-2 space-y-1">
                      <div>Terjemahan: <span className="font-bold text-foreground">{currentWord.bahasaB}</span></div>
                      <div>Input Anda: <span className="font-bold text-red-500">{userInput}</span></div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center pt-2">
                  <Button
                    onClick={handleNext}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-5 rounded-xl hover:scale-102 transition-all w-full max-w-xs"
                  >
                    Lanjutkan
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* FINISHED VIEW */}
      {gameState === 'finished' && (
        <Card className="bg-card border border-border shadow-md overflow-hidden rounded-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Award className="h-8 w-8 text-amber-500 animate-bounce" />
            </div>
            <CardTitle className="text-2xl text-foreground">Sesi Dikte Selesai!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Bagus sekali! Evaluasi latihan Dikte Anda:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center pb-8">
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-4 text-center">
                <span className="text-xs text-muted-foreground block mb-1">Benar</span>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{score} / {words.length}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-4 text-center">
                <span className="text-xs text-muted-foreground block mb-1">XP Diperoleh</span>
                <span className="text-3xl font-black text-amber-500">+{score * 10 + 50} XP</span>
              </div>
            </div>

            {/* Perfect Session Reward badge info */}
            {score === words.length && perfectSession && (
              <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50 p-3 px-4 rounded-xl max-w-sm w-full">
                <Award className="h-8 w-8 text-yellow-500 animate-pulse" />
                <div className="text-left">
                  <div className="text-xs font-bold text-foreground">Lencana Terbuka: Kuping Emas</div>
                  <div className="text-[10px] text-muted-foreground">Menyelesaikan Dikte 100% benar tanpa menggunakan bantuan (hints) atau membuat kesalahan.</div>
                </div>
              </div>
            )}

            <div className="flex gap-3 w-full max-w-sm">
              <Button
                onClick={handleStartGame}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl py-6 shadow-sm"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Ulangi
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/latihan/${projectId}`)}
                className="flex-1 border-border hover:bg-muted text-muted-foreground font-bold rounded-xl py-6"
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
