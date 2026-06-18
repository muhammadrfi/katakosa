import React, { useState, useEffect, useMemo } from 'react';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { usePracticeProjectStore } from '../practice-projects/usePracticeProjectStore';
import { useGamificationStore } from '../dashboard/useGamificationStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Shuffle, AlertTriangle, ArrowLeftRight, Award, RotateCcw, BookOpen } from 'lucide-react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { WordPair } from '../vocabulary/vocabulary.types';
import { soundEffects } from '../../utils/soundEffects';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const FlipbookPage = () => {
  const { loading: vocabLoading, getVocabularyBySetIds, getFilteredWords, updateWordSrs } = useVocabularyStore();
  const { projects: practiceProjects, loading: projectsLoading } = usePracticeProjectStore();
  const { addActivity, unlockBadge } = useGamificationStore();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const srsFilter = queryParams.get('srsFilter') as 'all' | 'new' | 'learning' | 'due' | 'mastered' | 'forgotten' | null;

  const wordsForPractice = useMemo(() => {
    if (!projectId || projectsLoading || !practiceProjects) {
      return [];
    }
    const project = practiceProjects.find(p => p.id === projectId);
    if (!project || !project.setIds || project.setIds.length === 0) {
      return [];
    }
    const allWordsInProject = getVocabularyBySetIds(project.setIds);
    return getFilteredWords(allWordsInProject, srsFilter || 'all');
  }, [practiceProjects, projectId, getVocabularyBySetIds, getFilteredWords, projectsLoading, srsFilter]);

  const project = useMemo(() => {
    return practiceProjects?.find(p => p.id === projectId);
  }, [practiceProjects, projectId]);

  // States
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [wordLimit, setWordLimit] = useState<number>(20);
  const [shuffledDeck, setShuffledDeck] = useState<WordPair[]>([]);
  const [initialDeckSize, setInitialDeckSize] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  // Initialize wordLimit based on words count
  useEffect(() => {
    if (wordsForPractice.length > 0) {
      setWordLimit(Math.min(wordsForPractice.length, 20));
    }
  }, [wordsForPractice]);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleStartPractice = () => {
    if (wordsForPractice.length === 0) return;
    soundEffects.playFlip();
    const shuffled = shuffleArray(wordsForPractice);
    const limited = shuffled.slice(0, wordLimit);
    setShuffledDeck(limited);
    setInitialDeckSize(limited.length);
    setCurrentIndex(0);
    setIsFlipped(false);
    setGameState('playing');
  };

  const handleShuffle = () => {
    soundEffects.playFlip();
    const shuffled = shuffleArray(shuffledDeck);
    setShuffledDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    soundEffects.playFlip();
    if (currentIndex < shuffledDeck.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    soundEffects.playFlip();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleGrade = (quality: number, sfxFn: () => void) => {
    if (shuffledDeck.length === 0) return;
    const currentCard = shuffledDeck[currentIndex];
    
    sfxFn();
    updateWordSrs(currentCard.id, quality);
    addActivity(1);
    unlockBadge('first_step');

    if (shuffledDeck.length <= 1) {
      soundEffects.playLevelUp();
      setGameState('finished');
    } else {
      setShuffledDeck(prevDeck => prevDeck.filter(word => word.id !== currentCard.id));
      setCurrentIndex(prevIndex => (prevIndex >= shuffledDeck.length - 1 ? 0 : prevIndex));
      setIsFlipped(false);
    }
  };

  if (vocabLoading || projectsLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background text-foreground">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (wordsForPractice.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-lg text-center mt-20">
        <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-bold text-foreground">Tidak Ada Kata untuk Dilatih</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Proyek atau set yang dipilih tidak memiliki kata atau tidak ditemukan kata yang sesuai filter.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Button onClick={() => navigate('/latihan')} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-5 px-6">
              Kembali Pilih Set
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // START SCREEN (Settings & Selection)
  if (gameState === 'start') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl mt-8">
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
            <span className="text-xs text-muted-foreground block">Mode Flipbook</span>
            <span className="text-sm font-bold text-foreground">{project?.name || 'Proyek Latihan'}</span>
          </div>
        </div>

        <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-4 border-b border-border/40 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
              <BookOpen className="h-6 w-6 text-emerald-500" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">Latihan Flashcard</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Hafalkan kosakata dengan membalik kartu dan memberikan skor penilaian ingatan (SRS).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* Slider word count selector */}
            <div className="space-y-3">
              <Label htmlFor="word-count" className="text-sm font-semibold text-foreground flex justify-between">
                <span>Jumlah Kosakata untuk Dipelajari</span>
                <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-xs font-bold">
                  {wordLimit} Kata
                </span>
              </Label>
              <Slider
                id="word-count"
                min={1}
                max={wordsForPractice.length}
                step={1}
                value={[wordLimit]}
                onValueChange={(val) => setWordLimit(val[0])}
                className="py-2"
              />
              <span className="text-[11px] text-muted-foreground block">
                Total kosakata terfilter di set ini: {wordsForPractice.length} kata
              </span>
            </div>

            {/* Switch for Translation Direction Swap */}
            <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20 border border-border/60 p-4 rounded-xl">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="swap-lang" className="text-sm font-semibold text-foreground">Tukar Bahasa</Label>
                <p className="text-xs text-muted-foreground">Tampilkan terjemahan terlebih dahulu di bagian depan kartu.</p>
              </div>
              <Switch
                id="swap-lang"
                checked={isSwapped}
                onCheckedChange={(checked) => {
                  soundEffects.playFlip();
                  setIsSwapped(checked);
                }}
              />
            </div>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Button onClick={handleStartPractice} className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-sm">
              Mulai Belajar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // FINISHED SCREEN (All cards memorized)
  if (gameState === 'finished') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md mt-16">
        <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden text-center">
          <CardHeader className="pt-8 pb-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <Award className="w-8 h-8 text-emerald-500 animate-bounce" />
            </div>
            <CardTitle className="text-2xl font-black text-foreground">Sesi Selesai!</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Bagus sekali! Semua kartu terpilih telah Anda beri penilaian.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-8 flex flex-col items-center">
            <div className="bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-4 text-center w-full">
              <span className="text-xs text-muted-foreground block mb-1">Total Kata Direview</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{initialDeckSize} Kata</span>
            </div>

            <div className="flex gap-3 w-full">
              <Button
                onClick={() => {
                  soundEffects.playFlip();
                  setGameState('start');
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl py-5 shadow-sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Mulai Lagi
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

  // PLAYING SESSION
  const currentCard = shuffledDeck[currentIndex];
  if (!currentCard) {
    setGameState('start');
    return null;
  }

  const frontText = isSwapped ? currentCard.bahasaB : currentCard.bahasaA;
  const backText = isSwapped ? currentCard.bahasaA : currentCard.bahasaB;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] gap-5 p-4 max-w-lg mx-auto">
      {/* Control panel & Settings */}
      <div className="w-full flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30 border border-border p-2.5 px-4 rounded-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            soundEffects.playFlip();
            setGameState('start');
          }}
          className="text-xs text-muted-foreground hover:bg-muted rounded-lg font-semibold h-8"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Setelan
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            soundEffects.playFlip();
            setIsSwapped(!isSwapped);
          }}
          className="text-xs text-muted-foreground hover:bg-muted rounded-lg font-semibold h-8"
        >
          <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" /> Tukar Arah
        </Button>
      </div>

      {/* 3D Flashcard Deck */}
      <div className="w-full h-80 [perspective:1000px]">
        <div
          className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] cursor-pointer"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onClick={() => { soundEffects.playFlip(); setIsFlipped(!isFlipped); }}
        >
          {/* Front of the card */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] border border-border rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 flex flex-col items-center justify-center p-6 bg-card select-none">
            <p className="text-4xl font-extrabold text-center break-words text-foreground px-4 leading-tight">{frontText}</p>
            <span className="absolute bottom-4 text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-75">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Klik untuk Membalik
            </span>
          </div>

          {/* Back of the card */}
          <div
            className="absolute inset-0 w-full h-full [backface-visibility:hidden] border border-border rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-200 flex flex-col items-center justify-center p-6 bg-card select-none"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <p className="text-4xl font-extrabold text-center break-words text-emerald-600 dark:text-emerald-400 px-4 leading-tight">{backText}</p>
            {currentCard.bahasaBAlternatives && currentCard.bahasaBAlternatives.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2 italic text-center px-4">
                Alternatif: {currentCard.bahasaBAlternatives.join(', ')}
              </p>
            )}
            <span className="absolute bottom-4 text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-75">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Terjemahan
            </span>
          </div>
        </div>
      </div>

      {/* Progress info */}
      <div className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Kartu {currentIndex + 1} dari {shuffledDeck.length} (Total Sesi: {initialDeckSize})
      </div>

      {/* Card navigation (Next / Prev) */}
      <div className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/30 border border-border p-2 rounded-2xl w-full justify-center">
        <Button onClick={handlePrev} disabled={currentIndex === 0} variant="ghost" size="icon" className="hover:bg-muted rounded-xl h-10 w-10 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button onClick={handleShuffle} variant="ghost" className="text-xs font-bold hover:bg-muted text-muted-foreground rounded-xl h-10 px-4">
          <Shuffle className="mr-1.5 h-3.5 w-3.5" /> Acak
        </Button>
        <Button onClick={handleNext} disabled={currentIndex === shuffledDeck.length - 1} variant="ghost" size="icon" className="hover:bg-muted rounded-xl h-10 w-10 text-muted-foreground">
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Spaced Repetition (SRS) grading actions */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-2 w-full">
        <Button 
          variant="outline" 
          className="flex-1 min-w-[70px] border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/20 rounded-xl font-bold h-11"
          onClick={() => handleGrade(0, soundEffects.playIncorrect)}
        >
          Lupa
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 min-w-[70px] border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/20 rounded-xl font-bold h-11"
          onClick={() => handleGrade(3, () => soundEffects.playCorrect(0.9))}
        >
          Sulit
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 min-w-[70px] border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 rounded-xl font-bold h-11"
          onClick={() => handleGrade(4, () => soundEffects.playCorrect(1.0))}
        >
          Biasa
        </Button>
        <Button 
          variant="outline" 
          className="flex-1 min-w-[70px] border-emerald-250 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/20 rounded-xl font-bold h-11"
          onClick={() => handleGrade(5, () => soundEffects.playCorrect(1.15))}
        >
          Mudah
        </Button>
      </div>
    </div>
  );
};

export default FlipbookPage;
