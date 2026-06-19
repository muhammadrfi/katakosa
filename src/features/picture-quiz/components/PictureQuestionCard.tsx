import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PictureQuizQuestion, PictureQuizOption } from '../types';
import { cn } from '@/lib/utils';
import { X, Maximize2 } from 'lucide-react';

interface PictureQuestionCardProps {
  question: PictureQuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  onAnswer: (value: string) => void;
  instantFeedback: boolean;
}

const PictureQuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  instantFeedback,
}: PictureQuestionCardProps) => {
  const [mounted, setMounted] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, [question.id]);

  useEffect(() => {
    // Close zoom when changing question
    setZoomedImage(null);
  }, [question.id]);

  const isImageToText = question.type === 'image-to-text';

  const getOptionState = (opt: PictureQuizOption) => {
    if (selectedAnswer === undefined) return 'default';
    if (instantFeedback) {
      const isCorrect = opt.value === question.correctAnswer;
      const isSelected = opt.value === selectedAnswer;
      if (isCorrect) return 'correct';
      if (isSelected && !isCorrect) return 'incorrect';
      return 'dimmed';
    } else {
      if (opt.value === selectedAnswer) return 'selected';
      return 'dimmed';
    }
  };

  return (
    <div className="w-full">
      {/* Zoom Fullscreen Overlay - Mounted using fixed container at the absolute root */}
      {zoomedImage && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200" 
          onClick={() => setZoomedImage(null)}
        >
          <img 
            src={zoomedImage} 
            alt="Zoomed View" 
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl transition-transform duration-300 scale-100" 
          />
          <button 
            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors z-[10000]"
            onClick={(e) => {
              e.stopPropagation();
              setZoomedImage(null);
            }}
          >
            <X className="h-8 w-8" />
          </button>
        </div>,
        document.body
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-1 md:p-4 flex-grow">
        {/* Left Side: Question (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6 justify-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full border text-[10px] font-black uppercase tracking-tighter text-zinc-500">
              Bab {question.item.chapter} • Soal {questionNumber} / {totalQuestions}
            </div>
            
            <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
              {isImageToText ? 'Apa arti gambar berikut ini?' : 'Pilih gambar yang sesuai dengan kosakata di bawah:'}
            </h2>
          </div>

          <div className="w-full flex-grow flex items-center justify-center">
            {isImageToText ? (
              // IMAGE → TEXT: show big image as question
              <div className="relative group max-w-xl mx-auto w-full animate-in zoom-in-95 duration-300">
                <div 
                  className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border flex justify-center shadow-inner cursor-zoom-in min-h-[220px] items-center" 
                  onClick={() => setZoomedImage(question.questionDisplay)}
                >
                  <img
                    src={question.questionDisplay}
                    alt={question.item.korean}
                    className="max-h-56 max-w-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                </div>
                <button 
                  onClick={() => setZoomedImage(question.questionDisplay)} 
                  className="absolute top-3.5 right-3.5 p-2 bg-white/90 dark:bg-zinc-800/90 rounded-xl shadow border opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Maximize2 className="h-4.5 w-4.5 text-zinc-600 dark:text-zinc-300" />
                </button>
              </div>
            ) : (
              // TEXT → IMAGE: show text as question
              <div className="flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-2xl border min-h-[200px] max-w-xl mx-auto w-full shadow-inner">
                <p className="text-4xl lg:text-5xl font-black text-foreground tracking-tight font-sans text-center">{question.questionDisplay}</p>
                <p className="text-xs text-muted-foreground mt-4 font-semibold">Pilih satu dari opsi gambar di sebelah kanan</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Options (5 columns) with Subtle Left Border on Desktop */}
        <div className="lg:col-span-5 lg:border-l lg:border-zinc-100 lg:dark:border-zinc-800/80 lg:pl-8 flex flex-col gap-5 justify-center">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Pilihan Jawaban</span>
              <div className="flex items-center gap-1.5 opacity-30">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                <span className="text-[9px] font-mono text-zinc-400 uppercase">{question.id}</span>
              </div>
            </div>

            {isImageToText ? (
              // TEXT OPTIONS GRID
              <div className="grid grid-cols-1 gap-2.5">
                {question.options.map((opt, index) => {
                  const state = getOptionState(opt);
                  const isSel = state === 'selected';
                  const isCorrect = state === 'correct';
                  const isIncorrect = state === 'incorrect';
                  
                  let btnClass = 'border-zinc-200 dark:border-zinc-800 hover:bg-muted bg-card hover:border-zinc-300 hover:shadow-sm';
                  if (isSel) btnClass = 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/10';
                  if (isCorrect) btnClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-md ring-2 ring-emerald-500/10';
                  if (isIncorrect) btnClass = 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-400 shadow-md ring-2 ring-rose-500/10';

                  let circleClass = 'text-zinc-400 border-zinc-200 dark:border-zinc-800';
                  if (isSel) circleClass = 'bg-primary border-primary text-primary-foreground';
                  if (isCorrect) circleClass = 'bg-emerald-500 border-emerald-500 text-white';
                  if (isIncorrect) circleClass = 'bg-rose-500 border-rose-500 text-white';

                  return (
                    <button
                      key={opt.value}
                      onClick={() => onAnswer(opt.value)}
                      disabled={selectedAnswer !== undefined && instantFeedback}
                      className={cn(
                        'w-full flex items-center gap-4 transition-all text-left border rounded-2xl p-4 md:p-5 group hover:scale-[1.005] active:scale-[0.995] duration-200 disabled:cursor-not-allowed',
                        btnClass
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 transition-colors',
                        circleClass
                      )}>
                        {index + 1}
                      </div>
                      <span className="text-zinc-800 dark:text-zinc-200 font-semibold text-sm flex-grow">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              // IMAGE OPTIONS 2x2 GRID
              <div className="grid grid-cols-2 gap-3">
                {question.options.map((opt, index) => {
                  const state = getOptionState(opt);
                  const isSel = state === 'selected';
                  const isCorrect = state === 'correct';
                  const isIncorrect = state === 'incorrect';

                  let btnClass = 'border-border hover:border-primary/50 hover:scale-[1.01] bg-slate-50 dark:bg-slate-900/50';
                  if (isSel) btnClass = 'border-primary ring-2 ring-primary ring-offset-1 scale-[1.02]';
                  if (isCorrect) btnClass = 'border-emerald-500 ring-2 ring-emerald-500 ring-offset-1 scale-[1.02] bg-emerald-500/5';
                  if (isIncorrect) btnClass = 'border-rose-500 ring-2 ring-rose-500 ring-offset-1 scale-[1.02] bg-rose-500/5';

                  let circleClass = 'bg-background text-zinc-400 border-zinc-200 dark:border-zinc-800';
                  if (isSel) circleClass = 'bg-primary border-primary text-primary-foreground';
                  if (isCorrect) circleClass = 'bg-emerald-500 border-emerald-500 text-white';
                  if (isIncorrect) circleClass = 'bg-rose-500 border-rose-500 text-white';

                  return (
                    <div key={opt.value} className="relative group">
                      <button
                        onClick={() => onAnswer(opt.value)}
                        disabled={selectedAnswer !== undefined && instantFeedback}
                        className={cn(
                          'relative w-full rounded-xl border-2 overflow-hidden aspect-square flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed',
                          btnClass
                        )}
                      >
                        <img
                          src={opt.value}
                          alt={opt.label}
                          className="w-full h-full object-contain p-2"
                          loading="lazy"
                        />
                        <div className={cn(
                          'absolute top-2 left-2 w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 transition-colors shadow-sm',
                          circleClass
                        )}>
                          {index + 1}
                        </div>
                      </button>
                      
                      {/* Tiny Zoom Icon Button */}
                      <button 
                        type="button"
                        className="absolute bottom-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedImage(opt.value);
                        }}
                        title="Perbesar Gambar"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PictureQuestionCard;
