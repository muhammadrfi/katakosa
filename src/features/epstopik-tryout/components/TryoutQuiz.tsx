import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Volume2, CheckCircle2, XCircle, HelpCircle, ArrowLeft, ArrowRight, Timer, Maximize2, X, ChevronLeft, ChevronRight, LayoutGrid, Play, Pause, RotateCcw, FileText, BookOpen, Headphones, Sparkles } from "lucide-react";
import { Question } from "../types";
import { parseQuestionContent } from "../utils";
import AnalyzedText from "./AnalyzedText";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAiStore } from "@/hooks/useAiStore";

interface TryoutQuizProps {
  quizQuestions: Question[];
  currentIndex: number;
  setCurrentIndex: (val: number) => void;
  selectedAnswers: Record<number, number>;
  answeredState: Record<number, boolean>;
  instantFeedback: boolean;
  timeLeft: number;
  isTimerActive: boolean;
  isExamMode: boolean;
  dictionary: Record<string, string>;
  handleOptionClick: (choiceNum: number) => void;
  getActiveCorrectAnswer: (q: Question) => number | null;
  handleSaveAnswerOverride: (id: string, ans: number) => void;
  finishQuiz: () => void;
  onBack: () => void;
  isReviewMode?: boolean;
  isBlankOptions: boolean;
  setIsBlankOptions: (val: boolean) => void;
  tryoutType: 'practice' | 'cbt';
}

const TryoutQuiz: React.FC<TryoutQuizProps> = ({
  quizQuestions, currentIndex, setCurrentIndex,
  selectedAnswers, answeredState, instantFeedback,
  timeLeft, isTimerActive, isExamMode, dictionary,
  handleOptionClick, getActiveCorrectAnswer, handleSaveAnswerOverride,
  finishQuiz, onBack, isReviewMode = false,
  isBlankOptions, setIsBlankOptions, tryoutType
}) => {
  const currentQuestion = quizQuestions[currentIndex];
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempCorrectAnswer, setTempCorrectAnswer] = useState<number | null>(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(false);

  const { setSidebarOpen, createSession, askSidebar } = useAiStore();

  const handleTanyaAI = async () => {
    createSession(`Tanya AI: Soal #${currentIndex + 1}`, 'tryout');
    setSidebarOpen(true);
    
    const correctAns = getActiveCorrectAnswer(currentQuestion);
    const selectedAns = selectedAnswers[currentIndex];
    const { instruction, prompt } = parseQuestionContent(currentQuestion);
    
    const formattedOptions = currentQuestion.options.map((opt, idx) => {
      return `${idx + 1}. ${opt || ''}`;
    }).join('\n');

    const userDisplayMsg = `Tolong jelaskan soal Nomor ${currentIndex + 1} (${currentQuestion.section === 'reading' ? 'Membaca' : 'Mendengar'}) bab ini.`;
    
    const hiddenPrompt = `Anda adalah Asisten Belajar Bahasa Korea Katakosa yang mahir. Analisis dan jelaskan soal tryout EPS-TOPIK berikut ini dengan sangat meyakinkan, tegas, terstruktur, dan akurat. Jangan gunakan kata-kata ragu seperti "kemungkinan besar" atau "biasanya" karena data soal di bawah ini sudah lengkap dan pasti.

DATA SOAL NYATA:
- Bab: ${currentQuestion.chapter}
- Tipe: ${currentQuestion.section === 'reading' ? 'Membaca (Reading)' : 'Mendengar (Listening)'}
- Instruksi Soal: "${instruction}"
- Teks Paragraf / Soal: "${prompt || '(Lihat gambar atau transkrip)'}"
${currentQuestion.transcript ? `- Transkrip Audio Percakapan: "${currentQuestion.transcript}"` : ''}
- Pilihan Jawaban:
${formattedOptions}

STATUS JAWABAN:
- Kunci Jawaban Benar: Opsi ${correctAns || 'Belum ditentukan'}
- Jawaban Terpilih User: ${selectedAns ? `Opsi ${selectedAns}` : 'Belum memilih'}

Format Penjelasan yang Wajib Diikuti:
1. TERJEMAHAN SOAL (Tuliskan terjemahan instruksi dan teks paragraf/soal secara jelas).

2. PENJELASAN RINGKAS JAWABAN BENAR & SALAH (Tuliskan di awal secara tegas mana opsi yang benar dan mengapa benar, lalu mengapa opsi lainnya salah. Berikan rujukan kalimat/kata spesifik dari teks soal, misal: 'Opsi 2 BENAR karena kalimat terakhir menyatakan X...', 'Opsi 1 SALAH karena di kalimat pertama tertulis Y...').

3. ARTI KATA KUNCI PER OPSI (Berikan terjemahan kata per kata dari setiap opsi jawaban).

4. KOSAKATA & TATA BAHASA PENTING (Jelaskan 2-3 kosakata atau pola tata bahasa penting yang muncul pada soal ini).

PENTING: Gunakan jarak spasi baris baru ganda antar bagian agar tidak rapat/dempet dan nyaman dibaca.`;

    await askSidebar(userDisplayMsg, hiddenPrompt);
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioPlayCount, setAudioPlayCount] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const replayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatAudioTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAudioPlayCount(0);
    setShowTranscript(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }

    return () => {
      if (replayTimerRef.current) clearTimeout(replayTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentIndex, currentQuestion.section]);

  const handlePrevQuestion = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }, [currentIndex, setCurrentIndex]);

  const handleNextQuestion = useCallback(() => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (!isReviewMode) {
        finishQuiz();
      } else {
        onBack(); // Exit review mode
      }
    }
  }, [currentIndex, quizQuestions.length, setCurrentIndex, finishQuiz, isReviewMode, onBack]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingKey) return;
      if (isZoomed) {
          if (e.key === "Escape") setIsZoomed(false);
          return;
      }
      if (isReviewMode) {
        if (e.key === "Enter") handleNextQuestion();
        else if (e.key === "ArrowLeft") handlePrevQuestion();
        else if (e.key === "ArrowRight") handleNextQuestion();
        return;
      }
      if (e.key >= "1" && e.key <= "4") {
        handleOptionClick(parseInt(e.key));
      } else if (e.key === "Enter") {
        if (selectedAnswers[currentIndex] || !instantFeedback) handleNextQuestion();
      } else if (e.key === "ArrowLeft") handlePrevQuestion();
      else if (e.key === "ArrowRight") handleNextQuestion();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isEditingKey, isZoomed, selectedAnswers, instantFeedback, handleOptionClick, handleNextQuestion, handlePrevQuestion, isReviewMode]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const { instruction, prompt } = parseQuestionContent(currentQuestion);
  const questionImages = currentQuestion.images || [];
  const hasExplicitImage = questionImages.length > 0;
  const imageType = currentQuestion.image_type;
  const isImageOptions = imageType === "options" && questionImages.length >= 4;

  const imagePath = hasExplicitImage && !isImageOptions
    ? (questionImages[0].startsWith("http") ? questionImages[0] : `/images/epstopik/${questionImages[0]}`)
    : null;

  const isAudioDisabled = isExamMode && audioPlayCount >= 2;

  // Logic from June 3rd Spec
  const isShortPrompt = useMemo(() => (prompt?.length || 0) < 25, [prompt]);

  const renderOption = (option: string, index: number) => {
    const choiceNum = index + 1;
    const isSelected = selectedAnswers[currentIndex] === choiceNum;
    const correct = getActiveCorrectAnswer(currentQuestion);
    const isLocked = isReviewMode || answeredState[currentIndex];

    let btnStyle = "border-zinc-200 dark:border-zinc-800 hover:bg-muted bg-card hover:border-zinc-300 hover:shadow-sm";
    let icon = null;

    if (isReviewMode) {
      if (choiceNum === correct) {
        btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 shadow-sm ring-2 ring-emerald-500/10";
        icon = <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
      } else if (isSelected) {
        btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300 shadow-sm ring-2 ring-rose-500/10";
        icon = <XCircle className="h-5 w-5 text-rose-600 shrink-0" />;
      }
    } else {
      if (isSelected) {
        if (instantFeedback) {
          if (correct === null) btnStyle = "border-zinc-400 bg-muted shadow-inner";
          else if (choiceNum === correct) {
            btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 shadow-sm";
            icon = <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
          } else {
            btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300 shadow-sm";
            icon = <XCircle className="h-5 w-5 text-rose-600 shrink-0" />;
          }
        } else {
          btnStyle = "border-primary bg-primary/5 shadow-md ring-2 ring-primary/10";
        }
      } else if (instantFeedback && isLocked && correct !== null && choiceNum === correct) {
        btnStyle = "border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10";
      }
    }

    const optImagePath = isImageOptions && questionImages[index] ? `/images/epstopik/${questionImages[index]}` : null;

    return (
      <button
        key={index}
        onClick={() => handleOptionClick(choiceNum)}
        disabled={isLocked && (!isReviewMode && instantFeedback)}
        className={cn(
            "w-full flex transition-all text-left border rounded-2xl p-3.5 md:p-5 group hover:scale-[1.005] active:scale-[0.995] duration-200",
            isImageOptions ? "flex-col items-center gap-3" : "items-center justify-between",
            btnStyle
        )}
      >
        <div className="flex items-center gap-4 w-full">
            <div className={cn(
                "w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 transition-colors",
                isSelected ? "bg-primary border-primary text-primary-foreground" : "text-zinc-400 border-zinc-200 dark:border-zinc-800"
            )}>
                {choiceNum}
            </div>
            {!isImageOptions && (
                isBlankOptions && (!currentQuestion.images || currentQuestion.images.length === 0) && !isReviewMode ? (
                  <div className="flex-grow min-h-6 flex items-center">
                    <span className="text-zinc-300 dark:text-zinc-700 font-medium text-xs tracking-wider select-none">···············</span>
                  </div>
                ) : (
                  <AnalyzedText 
                      text={option} 
                      dictionary={dictionary} 
                      enabled={!isExamMode}
                      className="text-zinc-800 dark:text-zinc-200 font-semibold text-base md:text-lg flex-grow" 
                  />
                )
            )}
        </div>
        {isImageOptions && optImagePath && (
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 group-hover:border-blue-200 transition-colors w-full flex justify-center">
                <img src={optImagePath} alt={`Opsi ${choiceNum}`} className="max-h-24 md:max-h-32 object-contain" />
            </div>
        )}
        {icon}
      </button>
    );
  };

  const renderBox = (q: Question, idx: number) => {
    const isCurrent = idx === currentIndex;
    const isAnswered = selectedAnswers[idx] !== undefined;

    let boxStyle = "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900";
    
    if (isReviewMode) {
      const correct = getActiveCorrectAnswer(q);
      const userAns = selectedAnswers[idx];
      const isCorrect = userAns === correct;
      boxStyle = isCorrect
        ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25"
        : "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-400 hover:bg-rose-500/25";
    } else {
      if (isAnswered) {
        boxStyle = "bg-primary border-primary text-primary-foreground hover:bg-primary/95 shadow-sm";
      }
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
            ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950 scale-105 border-transparent" 
            : "",
          boxStyle
        )}
      >
        {idx + 1}
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isZoomed && imagePath && createPortal(
          <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setIsZoomed(false)}>
              <img src={imagePath} alt="Zoom" className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl transition-transform duration-300 scale-100" />
              <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[10000]"><X className="h-10 w-10" /></button>
          </div>,
          document.body
      )}

      {/* CBT Sheet Dialog Popup */}
      <Dialog open={isGridOpen} onOpenChange={setIsGridOpen}>
        <DialogContent className="max-w-md sm:max-w-lg sm:rounded-3xl bg-card border text-card-foreground p-6 shadow-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="font-extrabold text-xl flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              <span>{isReviewMode ? "Peta Review Soal" : "Lembar CBT"}</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              {isReviewMode 
                ? "Klik nomor kotak untuk langsung meninjau soal." 
                : "Klik nomor kotak untuk melompat ke pertanyaan."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto my-4 pr-1.5 custom-scrollbar min-h-[150px] max-h-[50vh]">
            {tryoutType === 'cbt' ? (
              <div className="space-y-6">
                {/* Check if there are reading questions */}
                {quizQuestions.some(q => q.section === 'reading') && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 border-b pb-1.5 justify-start">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Seksi Membaca (Reading)</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5 justify-start py-1">
                      {quizQuestions.map((q, idx) => {
                        if (q.section !== 'reading') return null;
                        return renderBox(q, idx);
                      })}
                    </div>
                  </div>
                )}

                {/* Check if there are listening questions */}
                {quizQuestions.some(q => q.section === 'listening') && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 border-b pb-1.5 justify-start">
                      <Headphones className="h-4 w-4 text-purple-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Seksi Mendengar (Listening)</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5 justify-start py-1">
                      {quizQuestions.map((q, idx) => {
                        if (q.section !== 'listening') return null;
                        return renderBox(q, idx);
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5 justify-center py-2">
                {quizQuestions.map((q, idx) => renderBox(q, idx))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-3 border-t shrink-0">
            <Button onClick={() => setIsGridOpen(false)} className="rounded-xl h-10 px-5 font-bold">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unified Card Workspace */}
      <Card className="border-0 md:border shadow-none md:shadow-lg rounded-none md:rounded-3xl overflow-hidden bg-card text-card-foreground flex flex-col w-full">
        {/* Header Bar inside Card */}
        <div className="border-b bg-card p-3.5 md:p-5 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between gap-4 w-full md:w-auto">
            <Button variant="ghost" onClick={onBack} className="text-zinc-500 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl h-9 px-3">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> {isReviewMode ? "Kembali ke Hasil" : "Keluar"}
            </Button>
            
            {isTimerActive && !isReviewMode && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-100 dark:border-blue-900/30 rounded-xl font-black text-xs bg-blue-50/50 dark:bg-blue-950/20 md:hidden">
                <Timer className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-mono text-blue-600 dark:text-blue-400">{formatTime(timeLeft)}</span>
              </div>
            )}

            {isReviewMode && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-amber-100 dark:border-amber-900/30 rounded-xl font-black text-xs bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 md:hidden">
                Review Mode
              </div>
            )}
            
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => setIsGridOpen(true)} className="rounded-xl h-9 w-9 md:hidden" title="Lembar CBT">
                <LayoutGrid className="h-4 w-4 text-zinc-500" />
              </Button>
              <div className="flex gap-1 md:hidden">
                <Button size="icon" variant="outline" onClick={handlePrevQuestion} disabled={currentIndex === 0} className="rounded-xl h-9 w-9">
                  <ChevronLeft className="h-4.5 w-4.5" />
                </Button>
                <Button size="icon" variant="outline" onClick={handleNextQuestion} className="rounded-xl h-9 w-9">
                  <ChevronRight className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex-grow flex flex-col gap-1 w-full md:max-w-md md:px-6">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-400">
              <span>{isReviewMode ? "Peninjauan Soal" : "Progress Latihan"}</span>
              <span>{currentIndex + 1} / {quizQuestions.length}</span>
            </div>
            <Progress value={((currentIndex + 1) / quizQuestions.length) * 100} className="h-1.5 rounded-full" />
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isTimerActive && !isReviewMode && (
              <div className="flex items-center gap-2 px-4 py-2 border border-blue-100 dark:border-blue-900/30 rounded-xl font-black text-sm bg-blue-50/50 dark:bg-blue-950/20">
                <Timer className="h-4 w-4 text-blue-500" />
                <span className="font-mono text-blue-600 dark:text-blue-400">{formatTime(timeLeft)}</span>
              </div>
            )}
            {isReviewMode && (
              <div className="flex items-center gap-2 px-4 py-2 border border-amber-100 dark:border-amber-900/30 rounded-xl font-black text-sm bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400">
                Review Mode
              </div>
            )}
            <Button variant="outline" onClick={() => setIsGridOpen(true)} className="rounded-xl h-10 px-4 font-bold flex items-center gap-2 shadow-sm">
              <LayoutGrid className="h-4 w-4 text-zinc-500" />
              <span>{isReviewMode ? "Peta Review" : "Lembar CBT"}</span>
            </Button>
            <div className="flex gap-1">
              <Button size="icon" variant="outline" onClick={handlePrevQuestion} disabled={currentIndex === 0} className="rounded-xl h-10 w-10">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="outline" onClick={handleNextQuestion} className="rounded-xl h-10 w-10">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Review Mode Banner */}
        {isReviewMode && (
          <div className={cn(
            "p-3.5 md:p-5 md:px-8 border-b flex flex-col sm:flex-row justify-between items-center gap-3 font-bold text-sm text-white transition-colors",
            selectedAnswers[currentIndex] === getActiveCorrectAnswer(currentQuestion)
              ? "bg-emerald-600 dark:bg-emerald-700"
              : "bg-rose-600 dark:bg-rose-700"
          )}>
            <div className="flex items-center gap-2">
              {selectedAnswers[currentIndex] === getActiveCorrectAnswer(currentQuestion) ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0" />
              )}
              <span>
                SOAL #{currentIndex + 1}: {selectedAnswers[currentIndex] === getActiveCorrectAnswer(currentQuestion) ? "BENAR" : "SALAH"}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-black">
              <span>Jawaban Anda: Opsi {selectedAnswers[currentIndex] || "—"}</span>
              <span>Kunci Jawaban: Opsi {getActiveCorrectAnswer(currentQuestion) || "—"}</span>
            </div>
          </div>
        )}

        {/* CBT Section Banner */}
        {tryoutType === 'cbt' && (
          <div className={cn(
            "p-3 md:px-8 border-b flex items-center gap-2 font-black text-xs uppercase tracking-wider select-none",
            currentQuestion.section === 'reading'
              ? "bg-blue-500/10 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
              : "bg-purple-500/10 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400"
          )}>
            {currentQuestion.section === 'reading' ? (
              <>
                <BookOpen className="h-4 w-4 shrink-0 text-blue-500" />
                <span>📘 Seksi Membaca (Reading Section)</span>
              </>
            ) : (
              <>
                <Headphones className="h-4 w-4 shrink-0 text-purple-500" />
                <span>🎧 Seksi Mendengar (Listening Section)</span>
              </>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-5 md:p-8 lg:p-10 flex-grow">
            {/* Left Side: Soal & Teks (7 columns) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-full border text-[10px] font-black uppercase tracking-tighter text-zinc-500">
                       Chapter {currentQuestion.chapter} • Question {currentQuestion.question_number}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleTanyaAI}
                      className="rounded-full h-8 px-3 text-xs font-bold flex items-center gap-1.5 border-primary/20 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                      <span className="text-primary">Tanya AI</span>
                    </Button>
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-zinc-900 dark:text-white leading-tight">
                      {instruction}
                  </h2>
                </div>

                <div className="space-y-6">
                  {prompt && (
                    <AnalyzedText 
                      text={prompt} 
                      dictionary={dictionary} 
                      enabled={!isExamMode}
                      className={cn(
                          "leading-[1.8] whitespace-pre-line text-zinc-800 dark:text-zinc-100 font-semibold break-words",
                          isShortPrompt 
                            ? "text-2xl md:text-3xl lg:text-4xl text-center py-4 w-full" 
                            : "text-base md:text-lg lg:text-xl"
                      )} 
                    />
                  )}

                  {imagePath && (
                    <div className="relative group max-w-xl mx-auto animate-in zoom-in-95 duration-300">
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border flex justify-center shadow-inner cursor-zoom-in" onClick={() => setIsZoomed(true)}>
                          <img src={imagePath} alt="Soal" className="max-h-[240px] md:max-h-[280px] object-contain transition-transform duration-300 group-hover:scale-[1.01]" />
                      </div>
                      <button onClick={() => setIsZoomed(true)} className="absolute top-3.5 right-3.5 p-2 bg-white/90 dark:bg-zinc-800/90 rounded-xl shadow border opacity-0 group-hover:opacity-100 transition-all">
                          <Maximize2 className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                      </button>
                    </div>
                  )}

                  {currentQuestion.section === 'listening' && (
                    <div className="space-y-4 w-full">
                      {/* Hidden HTML5 Audio Element */}
                      <audio
                        ref={audioRef}
                        src={`/audio/epstopik/ch${String(currentQuestion.chapter).padStart(2, "0")}_l${String(currentQuestion.question_number).padStart(2, "0")}.mp3`}
                        onTimeUpdate={() => {
                          if (audioRef.current) {
                            setCurrentTime(audioRef.current.currentTime);
                          }
                        }}
                        onLoadedMetadata={() => {
                          if (audioRef.current) {
                            setDuration(audioRef.current.duration);
                          }
                        }}
                        onEnded={() => {
                          if (isReviewMode) {
                            setIsPlaying(false);
                            setCurrentTime(0);
                            return;
                          }
                          if (audioPlayCount < 2) {
                            setIsPlaying(false);
                            if (replayTimerRef.current) clearTimeout(replayTimerRef.current);
                            replayTimerRef.current = setTimeout(() => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                audioRef.current.play()
                                  .then(() => {
                                    setIsPlaying(true);
                                    setAudioPlayCount(2);
                                  })
                                  .catch(err => {
                                    console.log("Second play failed:", err);
                                  });
                              }
                            }, 1700);
                          } else {
                            setIsPlaying(false);
                            setCurrentTime(0);
                          }
                        }}
                        className="hidden"
                      />

                      {/* Custom Audio Player Card */}
                      <div className="w-full max-w-md mx-auto p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/10 flex flex-col gap-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                              <Volume2 className={cn("h-5 w-5", isPlaying ? "animate-pulse" : "")} />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">Audio Soal Mendengar</h4>
                              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Bab {currentQuestion.chapter} • Soal {currentQuestion.question_number}</p>
                            </div>
                          </div>
                          
                          <span className="font-mono text-xs font-bold text-zinc-500">
                            {formatAudioTime(currentTime)} / {formatAudioTime(duration || 0)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div 
                          className="relative w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 cursor-pointer overflow-hidden"
                          onClick={(e) => {
                            if (isAudioDisabled || !audioRef.current || !duration) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            const width = rect.width;
                            const newTime = (clickX / width) * duration;
                            audioRef.current.currentTime = newTime;
                            setCurrentTime(newTime);
                          }}
                        >
                          <div 
                            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-100"
                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                          />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4">
                          <Button
                            variant="outline"
                            size="icon"
                            disabled={isAudioDisabled}
                            onClick={() => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                audioRef.current.play()
                                  .then(() => {
                                    setIsPlaying(true);
                                    if (audioPlayCount === 0) setAudioPlayCount(1);
                                  })
                                  .catch(() => {});
                              }
                            }}
                            className="h-10 w-10 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Ulangi Audio"
                          >
                            <RotateCcw className="h-4.5 w-4.5" />
                          </Button>

                          <Button
                            disabled={isAudioDisabled}
                            onClick={() => {
                              if (!audioRef.current) return;
                              if (isPlaying) {
                                audioRef.current.pause();
                                setIsPlaying(false);
                              } else {
                                audioRef.current.play()
                                  .then(() => {
                                    setIsPlaying(true);
                                    if (audioPlayCount === 0) setAudioPlayCount(1);
                                  })
                                  .catch(() => {});
                              }
                            }}
                            className={cn(
                              "h-12 w-12 rounded-full shadow transition-all duration-200 active:scale-95 flex items-center justify-center border disabled:opacity-30 disabled:cursor-not-allowed",
                              isPlaying 
                                ? "bg-rose-500 hover:bg-rose-600 border-rose-500 text-white" 
                                : "bg-blue-500 hover:bg-blue-600 border-blue-500 text-white"
                            )}
                          >
                            {isPlaying ? (
                              <Pause className="h-5 w-5 fill-current shrink-0" />
                            ) : (
                              <Play className="h-5 w-5 fill-current ml-0.5 shrink-0" />
                            )}
                          </Button>
                          
                          {!isExamMode && currentQuestion.transcript ? (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setShowTranscript(!showTranscript)}
                              className={cn(
                                "h-10 w-10 rounded-full transition-all border border-zinc-200 dark:border-zinc-800",
                                showTranscript 
                                  ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600" 
                                  : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              )}
                              title={showTranscript ? "Sembunyikan Transkrip" : "Tampilkan Transkrip"}
                            >
                              <FileText className="h-4.5 w-4.5" />
                            </Button>
                          ) : (
                            <div className="w-10 h-10" />
                          )}
                        </div>
                      </div>

                      {/* Subtitle / Transcript display */}
                      {showTranscript && currentQuestion.transcript && (
                        <div className="p-4 bg-blue-50/15 dark:bg-blue-950/5 border border-blue-100/40 dark:border-blue-900/10 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-500/80 block mb-1">Transkrip Percakapan</span>
                          <AnalyzedText 
                            text={currentQuestion.transcript} 
                            dictionary={dictionary} 
                            enabled={!isExamMode}
                            className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed" 
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
            </div>

            {/* Right Side: Opsi Jawaban (5 columns) with Subtle Left Border on Desktop */}
            <div className="lg:col-span-5 lg:border-l lg:border-zinc-100 lg:dark:border-zinc-800/80 lg:pl-8 flex flex-col gap-5 justify-center">
                <div className="space-y-5">
                  <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Pilihan Jawaban</span>
                      <div className="flex items-center gap-4">
                          {!isExamMode && !isReviewMode && currentQuestion.section === 'listening' && (!currentQuestion.images || currentQuestion.images.length === 0) && (
                              <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 select-none">Blank Opsi</span>
                                  <Switch 
                                      checked={isBlankOptions} 
                                      onCheckedChange={setIsBlankOptions} 
                                      className="scale-75 origin-right"
                                  />
                              </div>
                          )}
                          <div className="flex items-center gap-1.5 opacity-30 hover:opacity-100 transition-opacity">
                              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                              <span className="text-[9px] font-mono text-zinc-400 uppercase">{currentQuestion.id}</span>
                          </div>
                      </div>
                  </div>

                  <div className={cn(
                      "grid gap-3",
                      isImageOptions ? "grid-cols-2" : "grid-cols-1"
                  )}>
                      {currentQuestion.options.map((option, index) => renderOption(option, index))}
                  </div>

                  {getActiveCorrectAnswer(currentQuestion) === null && !isReviewMode && (
                      <div className="p-4 rounded-xl border border-dashed border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10 text-yellow-800 dark:text-yellow-400 text-xs font-bold flex items-center justify-between gap-4 shadow-sm">
                          <span className="flex items-center gap-2">
                              <HelpCircle className="h-4 w-4 text-yellow-600 shrink-0" />
                              <span>Kunci jawaban belum diset.</span>
                          </span>
                          <div className="flex items-center gap-2">
                              {isEditingKey ? (
                                  <>
                                      <select value={tempCorrectAnswer || 1} onChange={(e) => setTempCorrectAnswer(Number(e.target.value))} className="p-1 rounded border border-yellow-300 text-xs bg-white text-zinc-900 outline-none">
                                          {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                                      </select>
                                      <Button size="sm" onClick={() => { handleSaveAnswerOverride(currentQuestion.id, tempCorrectAnswer || 1); setIsEditingKey(false); }} className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg h-8 px-3 text-xs">Simpan</Button>
                                  </>
                              ) : (
                                  <Button size="sm" onClick={() => setIsEditingKey(true)} className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg h-8 px-3 text-xs">Set Kunci</Button>
                              )}
                          </div>
                      </div>
                  )}
                </div>
            </div>
        </div>

        {/* Footer inside same Card */}
        <div className="border-t bg-zinc-50/50 dark:bg-zinc-900/20 p-4 md:p-5 md:px-8 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
                 <div className="hidden sm:flex flex-col">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Keyboard</span>
                    <span className="text-[10px] font-bold text-zinc-500">
                      {isReviewMode ? "[Enter] Lanjut • [<- / ->] Geser" : "[1-4] Pilih • [Enter] Lanjut • [<- / ->] Geser"}
                    </span>
                 </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {!isReviewMode && (
                <Button 
                  variant="outline"
                  onClick={finishQuiz} 
                  className="border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-black uppercase tracking-widest px-5 py-5 rounded-xl text-xs flex-grow sm:flex-grow-0 justify-center h-10"
                >
                  Kirim & Selesai
                </Button>
              )}
              <Button 
                  onClick={handleNextQuestion} 
                  disabled={!isReviewMode && !selectedAnswers[currentIndex] && instantFeedback}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-black uppercase tracking-widest px-8 py-5 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 text-xs flex-grow sm:flex-grow-0 justify-center h-10"
              >
                  {currentIndex === quizQuestions.length - 1 ? (isReviewMode ? "Selesai Review" : "Selesai") : "Lanjut"}
                  <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
        </div>
      </Card>

      {/* Prefetch audio for the next question */}
      {currentIndex < quizQuestions.length - 1 && quizQuestions[currentIndex + 1].section === 'listening' && (
        <audio 
          key={`prefetch-${currentIndex + 1}`}
          src={`/audio/epstopik/ch${String(quizQuestions[currentIndex + 1].chapter).padStart(2, "0")}_l${String(quizQuestions[currentIndex + 1].question_number).padStart(2, "0")}.mp3`}
          preload="auto"
          className="hidden"
        />
      )}
    </div>
  );
};

export default TryoutQuiz;
