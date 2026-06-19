import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loading } from '@/components/ui/Loading';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, ChevronLeft, ChevronRight, LayoutGrid, Award, ArrowRight } from 'lucide-react';
import useTextbookVisualData from './useTextbookVisualData';
import usePictureQuizLogic from './usePictureQuizLogic';
import PictureQuizStartScreen from './components/PictureQuizStartScreen';
import PictureQuestionCard from './components/PictureQuestionCard';
import PictureQuizResult from './components/PictureQuizResult';
import { cn } from '@/lib/utils';

interface PictureQuizPageProps {
  embeddedMode?: boolean;
}

const PictureQuizPage = ({ embeddedMode = false }: PictureQuizPageProps) => {
  const navigate = useNavigate();
  
  // Chapter selection state (like tryout)
  const [chapterSelectionMode, setChapterSelectionMode] = useState<'all' | 'range'>('all');
  const [selectedChapters, setSelectedChapters] = useState<number[]>(
    Array.from({ length: 60 }, (_, i) => i + 1)
  );

  const { items, loading, error } = useTextbookVisualData(
    chapterSelectionMode === 'all' ? undefined : selectedChapters
  );

  const {
    status,
    setStatus,
    questions,
    currentIndex,
    setCurrentIndex,
    score,
    incorrectItems,
    selectedAnswers,
    answeredState,
    startQuiz,
    handleAnswer,
    goNext,
    goPrev,
    finishQuiz,
    restart,
    instantFeedback,
  } = usePictureQuizLogic(items);

  const [isGridOpen, setIsGridOpen] = useState(false);

  // Keyboard Shortcuts (Arrow keys & 1-4 selection)
  useEffect(() => {
    if (status !== 'active') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (e.key === 'ArrowRight') {
        goNext();
      } else if (e.key >= '1' && e.key <= '4') {
        const q = questions[currentIndex];
        if (q) {
          const index = parseInt(e.key) - 1;
          const opt = q.options[index];
          if (opt) handleAnswer(opt.value);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, currentIndex, questions, goPrev, goNext, handleAnswer]);

  if (loading) {
    return <Loading fullScreen text="Memuat Kosakata Gambar..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-4">
        <p className="text-rose-500 text-sm">{error}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Kembali</Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const renderBox = (idx: number) => {
    const isCurrent = idx === currentIndex;
    const isAnswered = selectedAnswers[idx] !== undefined;

    let boxStyle = "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900";
    if (isAnswered) {
      boxStyle = "bg-primary border-primary text-primary-foreground hover:bg-primary/95 shadow-sm";
    }

    return (
      <button
        key={idx}
        onClick={() => {
          setCurrentIndex(idx);
          setIsGridOpen(false);
        }}
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center font-black transition-all border-2 text-xs shrink-0",
          isCurrent 
            ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-950 scale-105 border-transparent" 
            : "",
          boxStyle
        )}
      >
        {idx + 1}
      </button>
    );
  };

  return (
    <div className="container mx-auto py-4 px-0 max-w-5xl">
      {/* Back button on Start & Result Screen */}
      {status !== 'active' && !embeddedMode && (
        <div className="px-4 md:px-0">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="font-bold text-muted-foreground hover:text-primary gap-2 rounded-xl mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </div>
      )}

      {/* CBT Sheet Dialog Popup */}
      <Dialog open={isGridOpen} onOpenChange={setIsGridOpen}>
        <DialogContent className="max-w-md sm:max-w-lg sm:rounded-3xl bg-card border text-card-foreground p-6 shadow-2xl">
          <DialogHeader className="shrink-0">
            <DialogTitle className="font-extrabold text-xl flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              <span>Lembar CBT</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Klik nomor kotak untuk melompat ke pertanyaan.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto my-4 pr-1.5 custom-scrollbar max-h-[50vh]">
            <div className="flex flex-wrap gap-2.5 justify-center py-2">
              {questions.map((_, idx) => renderBox(idx))}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t shrink-0">
            <Button onClick={() => setIsGridOpen(false)} className="rounded-xl h-10 px-5 font-bold">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {status === 'idle' && (
        <PictureQuizStartScreen
          totalItems={items.length}
          onStart={startQuiz}
          chapterSelectionMode={chapterSelectionMode}
          setChapterSelectionMode={setChapterSelectionMode}
          selectedChapters={selectedChapters}
          setSelectedChapters={setSelectedChapters}
        />
      )}

      {status === 'active' && currentQuestion && (
        <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto px-4">
          <Card className="border-0 md:border shadow-none md:shadow-lg rounded-none md:rounded-3xl overflow-hidden bg-card text-card-foreground flex flex-col w-full">
            {/* Header Bar Inside Card */}
            <div className="border-b bg-card p-3.5 md:p-5 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center justify-between gap-4 w-full md:w-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => setStatus('idle')} 
                  className="text-zinc-500 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl h-9 px-3"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Keluar
                </Button>
                
                <div className="flex gap-2 md:hidden">
                  <Button size="icon" variant="outline" onClick={() => setIsGridOpen(true)} className="rounded-xl h-9 w-9" title="Lembar CBT">
                    <LayoutGrid className="h-4 w-4 text-zinc-500" />
                  </Button>
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" onClick={goPrev} disabled={currentIndex === 0} className="rounded-xl h-9 w-9">
                      <ChevronLeft className="h-4.5 w-4.5" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={goNext} disabled={currentIndex === questions.length - 1} className="rounded-xl h-9 w-9">
                      <ChevronRight className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex-grow flex flex-col gap-1 w-full md:max-w-md md:px-6">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-400">
                  <span>Progress Kuis Gambar</span>
                  <span>{currentIndex + 1} / {questions.length}</span>
                </div>
                <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-1.5 rounded-full" />
              </div>

              <div className="hidden md:flex items-center gap-3">
                <Button variant="outline" onClick={() => setIsGridOpen(true)} className="rounded-xl h-10 px-4 font-bold flex items-center gap-2 shadow-sm">
                  <LayoutGrid className="h-4 w-4 text-zinc-500" />
                  <span>Lembar CBT</span>
                </Button>
                <div className="flex gap-1">
                  <Button size="icon" variant="outline" onClick={goPrev} disabled={currentIndex === 0} className="rounded-xl h-10 w-10">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={goNext} disabled={currentIndex === questions.length - 1} className="rounded-xl h-10 w-10">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <PictureQuestionCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={questions.length}
                selectedAnswer={selectedAnswers[currentIndex]}
                onAnswer={handleAnswer}
                instantFeedback={instantFeedback}
              />
            </div>

            {/* Bottom Actions for CBT Submission */}
            <div className="border-t bg-zinc-50/50 dark:bg-zinc-900/20 p-4 md:p-5 md:px-8 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                     <div className="hidden sm:flex flex-col">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Keyboard</span>
                        <span className="text-[10px] font-bold text-zinc-500">
                          [1-4] Pilih • [Panah Kiri / Kanan] Geser
                        </span>
                     </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Button 
                    variant="outline"
                    onClick={finishQuiz} 
                    className="border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-black uppercase tracking-widest px-5 py-5 rounded-xl text-xs flex-grow sm:flex-grow-0 justify-center h-10"
                  >
                    Kirim & Selesai
                  </Button>
                  
                  <Button 
                    onClick={goNext} 
                    disabled={currentIndex === questions.length - 1}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-widest px-8 py-5 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 text-xs flex-grow sm:flex-grow-0 justify-center h-10"
                  >
                    Lanjut
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
            </div>
          </Card>
        </div>
      )}

      {status === 'finished' && (
        <div className="max-w-2xl mx-auto px-4">
          <PictureQuizResult
            score={score}
            totalQuestions={questions.length}
            incorrectItems={incorrectItems}
            onRestart={restart}
          />
        </div>
      )}
    </div>
  );
};

export default PictureQuizPage;
