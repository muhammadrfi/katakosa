import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { usePracticeProjectStore } from '../practice-projects/usePracticeProjectStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Check, X, Award, HelpCircle, RefreshCw, ArrowLeftRight, ArrowLeft } from 'lucide-react';
import { shuffleArray } from '@/lib/utils';
import { soundEffects } from '../../utils/soundEffects';
import { WordPair } from '../vocabulary/vocabulary.types';

const WritingPracticePage: React.FC = () => {
  const [hint, setHint] = useState<string>('');
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getVocabularyBySetIds, markWordAsRemembered, markWordAsForgotten, loading: vocabLoading } = useVocabularyStore();
  const { projects, loading: projectsLoading } = usePracticeProjectStore();

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceWords, setPracticeWords] = useState<WordPair[]>([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [practiceDirection, setPracticeDirection] = useState<'A_to_B' | 'B_to_A'>('A_to_B');
  const [hintCount, setHintCount] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    setRevealedIndices(new Set());
  }, [currentWordIndex]);

  const project = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  const allWordsInProject = useMemo(() => {
    if (!project) return [];
    return getVocabularyBySetIds(project.setIds);
  }, [project, getVocabularyBySetIds]);

  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!projectsLoading && !vocabLoading && project && allWordsInProject.length > 0) {
      setPracticeWords(shuffleArray([...allWordsInProject]));
      setCurrentWordIndex(0);
      setUserInput('');
      setFeedback(null);
      setShowAnswer(false);
      setGameFinished(false);
    }
  }, [projectId, allWordsInProject, navigate, projectsLoading, vocabLoading, project]);

  const currentWord = practiceWords[currentWordIndex];

  const handleShowHint = () => {
    if (!currentWord || hintCount >= 3) return;

    soundEffects.playFlip();
    const correctAnswer = (practiceDirection === 'A_to_B' ? currentWord.bahasaB : currentWord.bahasaA).replace(/,/g, '');
    const currentHintLevel = hintCount;

    const currentRevealed = new Set(revealedIndices);

    switch (currentHintLevel) {
      case 0: {
        const words = correctAnswer.split(' ');
        let currentAbsoluteIndex = 0;
        words.forEach((word) => {
          if (word.length > 0) {
            currentRevealed.add(currentAbsoluteIndex);
          }
          currentAbsoluteIndex += word.length + 1;
        });
        break;
      }
      case 1: {
        let randomIndex1;
        let attempts = 0;
        do {
          randomIndex1 = Math.floor(Math.random() * correctAnswer.length);
          attempts++;
        } while ((currentRevealed.has(randomIndex1) || correctAnswer[randomIndex1] === ' ') && attempts < 100);
        
        if (attempts < 100) {
          currentRevealed.add(randomIndex1);
        }
        break;
      }
      case 2: {
        let revealedCount = 0;
        let attempts = 0;
        while (revealedCount < 2 && attempts < 100) {
          let randomIndex2;
          do {
            randomIndex2 = Math.floor(Math.random() * correctAnswer.length);
            attempts++;
          } while ((currentRevealed.has(randomIndex2) || correctAnswer[randomIndex2] === ' ') && attempts < 100);
          
          if (attempts < 100) {
            currentRevealed.add(randomIndex2);
            revealedCount++;
          }
        }
        break;
      }
      default:
        for (let i = 0; i < correctAnswer.length; i++) {
          currentRevealed.add(i);
        }
        break;
    }

    setRevealedIndices(currentRevealed);

    let newHintString = '';
    for (let i = 0; i < correctAnswer.length; i++) {
      if (currentRevealed.has(i)) {
        newHintString += correctAnswer[i];
      } else if (correctAnswer[i] === ' ') {
        newHintString += ' ';
      } else {
        newHintString += '_';
      }
    }
    setHint(newHintString);
    setHintCount(prev => prev + 1);
  };

  const handleCheckAnswer = () => {
    if (!currentWord || feedback === 'correct') return;

    const normalizedUserInput = userInput.trim().toLowerCase();
    let correctAnswers: string[] = [];

    if (practiceDirection === 'A_to_B') {
      correctAnswers.push(currentWord.bahasaB.trim().toLowerCase());
      if (currentWord.bahasaBAlternatives) {
        correctAnswers = correctAnswers.concat(currentWord.bahasaBAlternatives.map((alt: string) => alt.trim().toLowerCase()));
      }
    } else {
      correctAnswers.push(currentWord.bahasaA.trim().toLowerCase());
    }

    const isCorrect = correctAnswers.some(answer => normalizedUserInput === answer);

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (!isCorrect) {
      soundEffects.playIncorrect();
      setShowAnswer(true);
      markWordAsForgotten(currentWord.id);
    } else {
      soundEffects.playCorrect();
      markWordAsRemembered(currentWord.id);
    }
  };

  const handleNextWord = () => {
    soundEffects.playFlip();
    setUserInput('');
    setFeedback(null);
    setShowAnswer(false);
    setHint('');
    setHintCount(0);
    if (currentWordIndex < practiceWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      soundEffects.playLevelUp();
      setGameFinished(true);
    }
  };

  const handleShuffleWords = () => {
    soundEffects.playFlip();
    setPracticeWords(shuffleArray([...allWordsInProject]));
    setCurrentWordIndex(0);
    setUserInput('');
    setFeedback(null);
    setShowAnswer(false);
    setGameFinished(false);
    setHint('');
    setHintCount(0);
  };

  if (projectsLoading || vocabLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto max-w-md p-6 text-center mt-20">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Proyek Tidak Ditemukan</h1>
        <Button onClick={() => navigate('/dashboard')} className="rounded-xl">Kembali ke Dasbor</Button>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div className="container mx-auto px-4 max-w-xl py-12">
        <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <Award className="h-8 w-8 text-emerald-500 animate-bounce" />
            </div>
            <CardTitle className="text-2xl text-foreground font-black">Latihan Selesai!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Hebat! Anda telah menyelesaikan semua kata di proyek ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center pb-8">
            <div className="bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-4 text-center w-full">
              <span className="text-xs text-muted-foreground block mb-1">Total Kata Dipelajari</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{practiceWords.length} Kata</span>
            </div>

            <div className="flex gap-3 w-full">
              <Button
                onClick={handleShuffleWords}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl py-5"
              >
                Latihan Lagi
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/latihan/${projectId}`)}
                className="flex-1 border-border hover:bg-muted text-muted-foreground font-bold rounded-xl py-5"
              >
                Kembali ke Proyek
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="container mx-auto max-w-md p-6 text-center mt-20">
        <h1 className="text-xl font-bold mb-4 text-foreground">Tidak ada kosakata yang tersedia untuk latihan di proyek ini.</h1>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate(`/project/${projectId}`)} className="rounded-xl">Tambah Kata</Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="rounded-xl">Kembali ke Dasbor</Button>
        </div>
      </div>
    );
  }

  const displayWord = (practiceDirection === 'A_to_B' ? currentWord.bahasaA : currentWord.bahasaB).replace(/,/g, '');
  const correctDisplayAnswer = (practiceDirection === 'A_to_B' ? currentWord.bahasaB : currentWord.bahasaA).replace(/,/g, '');

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/latihan/${projectId}`)}
          className="hover:bg-muted rounded-xl text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <span className="text-xs text-muted-foreground block">Latihan Menulis</span>
          <span className="text-sm font-bold text-foreground">{project.name}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all duration-300"
          style={{ width: `${((currentWordIndex + 1) / practiceWords.length) * 100}%` }}
        />
      </div>

      <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden mb-6">
        <CardHeader className="pb-2 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Kata {currentWordIndex + 1} dari {practiceWords.length}
          </span>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Main Word Display */}
          <div className="text-3xl font-extrabold text-foreground tracking-tight text-center my-4 py-2">
            {displayWord}
          </div>

          {/* Hint Area */}
          {hint && (
            <div className="flex flex-col items-center my-2">
              <span className="text-xs text-muted-foreground mb-1 block">Petunjuk</span>
              <p className="font-mono tracking-[0.2em] text-lg bg-muted border border-border px-4 py-2 rounded-xl text-muted-foreground font-semibold animate-scale-pulse">
                {hint}
              </p>
            </div>
          )}

          {/* Input text field with conditional animation classes */}
          <div className="space-y-2">
            <Input
              type="text"
              value={userInput}
              onChange={(e) => {
                if (feedback !== 'correct') {
                  setUserInput(e.target.value);
                  if (feedback === 'incorrect') {
                    setFeedback(null);
                  }
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (feedback === 'correct' || showAnswer) {
                    handleNextWord();
                  } else {
                    handleCheckAnswer();
                  }
                }
              }}
              placeholder="Ketik terjemahan kata di sini..."
              className={`text-center text-lg h-12 rounded-xl border border-input focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                feedback === 'correct'
                  ? 'bg-emerald-50/50 border-emerald-500 text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-700 animate-scale-pulse'
                  : feedback === 'incorrect'
                  ? 'bg-rose-50/50 border-rose-500 text-rose-950 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-700 animate-shake'
                  : ''
              }`}
              disabled={feedback === 'correct'}
              autoFocus
            />
          </div>

          {/* Bottom Feedback Alerts */}
          {feedback === 'correct' && (
            <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-xl text-emerald-800 dark:text-emerald-300 animate-scale-pulse">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1 rounded-full">
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-sm font-semibold">Jawaban Anda Benar!</div>
            </div>
          )}

          {feedback === 'incorrect' && (
            <div className="space-y-3 animate-shake">
              <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 rounded-xl text-rose-800 dark:text-rose-300">
                <div className="bg-rose-100 dark:bg-rose-900/50 p-1 rounded-full">
                  <X className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="text-sm font-semibold">Jawaban Kurang Tepat. Coba lagi!</div>
              </div>
              {showAnswer && (
                <div className="bg-muted border border-border p-3 px-4 rounded-xl text-xs space-y-1">
                  <span className="text-muted-foreground block">Jawaban yang benar:</span>
                  <span className="font-bold text-foreground text-sm uppercase tracking-wide">{correctDisplayAnswer}</span>
                </div>
              )}
            </div>
          )}

          {/* Practice Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {feedback !== 'correct' && !showAnswer ? (
              <Button
                onClick={handleCheckAnswer}
                disabled={!userInput.trim()}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl py-5"
              >
                Periksa Jawaban
              </Button>
            ) : (
              <Button
                onClick={handleNextWord}
                className="flex-1 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold rounded-xl py-5"
              >
                Lanjutkan
              </Button>
            )}

            <Button
              onClick={handleShowHint}
              variant="outline"
              disabled={hintCount >= 3 || feedback === 'correct'}
              className="border-border hover:bg-muted text-muted-foreground font-bold rounded-xl py-5"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Petunjuk ({hintCount}/3)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mode settings */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
        <Button
          onClick={handleShuffleWords}
          variant="ghost"
          className="text-muted-foreground hover:bg-muted font-semibold rounded-xl text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Acak Kosakata
        </Button>
        <Button
          onClick={() => {
            soundEffects.playFlip();
            setPracticeDirection(prev => prev === 'A_to_B' ? 'B_to_A' : 'A_to_B');
            setUserInput('');
            setFeedback(null);
            setShowAnswer(false);
            setHint('');
            setHintCount(0);
          }}
          variant="ghost"
          className="text-muted-foreground hover:bg-muted font-semibold rounded-xl text-xs"
        >
          <ArrowLeftRight className="h-3.5 w-3.5 mr-2" />
          Ubah Arah ({practiceDirection === 'A_to_B' ? 'A ke B' : 'B ke A'})
        </Button>
      </div>
    </div>
  );
};

export default WritingPracticePage;
