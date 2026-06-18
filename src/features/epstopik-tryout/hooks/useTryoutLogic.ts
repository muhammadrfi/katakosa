import { useState, useCallback, useMemo, useEffect } from "react";
import { Question, TryoutMode, TryoutResults, TryoutType, CbtSection, CbtDurationMode, TryoutHistoryItem, TryoutSession } from "../types";
import { soundEffects } from "../../../utils/soundEffects";
import { toast } from "sonner";

export const useTryoutLogic = (allQuestions: Question[]) => {
  const [mode, setMode] = useState<TryoutMode>("setup");
  const [chapterSelectionMode, setChapterSelectionMode] = useState<"all" | "range">("all");
  const [selectedChapters, setSelectedChapters] = useState<number[]>(Array.from({ length: 5 }, (_, i) => i + 1));
  const [selectedSection, setSelectedSection] = useState<"all" | "reading" | "listening">("all");
  
  // Multiple question type selections
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "image",
    "blank",
    "passage",
    "grammar"
  ]);

  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isExamMode, setIsExamMode] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);
  const [isBlankOptions, setIsBlankOptions] = useState<boolean>(false);

  // CBT Mode States
  const [tryoutType, setTryoutType] = useState<TryoutType>("practice");
  const [cbtSection, setCbtSection] = useState<CbtSection>("mix");
  const [cbtQuestionCount, setCbtQuestionCount] = useState<number>(40);
  const [cbtDurationMode, setCbtDurationMode] = useState<CbtDurationMode>("official");

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [answeredState, setAnsweredState] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<TryoutResults | null>(null);

  // Active session and completed history states
  const [savedSession, setSavedSession] = useState<TryoutSession | null>(null);
  const [historyList, setHistoryList] = useState<TryoutHistoryItem[]>([]);

  const [answerOverrides, setAnswerOverrides] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem("epstopik_answer_overrides");
    return stored ? JSON.parse(stored) : {};
  });

  // --- HELPERS & CALLBACKS (Hoisted up to avoid ReferenceErrors) ---

  const getActiveCorrectAnswer = useCallback((q: Question) => {
    if (q.correct_answer === null) {
      return answerOverrides[q.id] !== undefined ? answerOverrides[q.id] : null;
    }
    return q.correct_answer;
  }, [answerOverrides]);

  const finishQuiz = useCallback(() => {
    setMode("result");
    setIsTimerActive(false);
    if (soundEffects.playLevelUp) soundEffects.playLevelUp();
  }, []);

  const handleSaveAnswerOverride = useCallback((id: string, ans: number) => {
    const newOverrides = { ...answerOverrides, [id]: ans };
    setAnswerOverrides(newOverrides);
    localStorage.setItem("epstopik_answer_overrides", JSON.stringify(newOverrides));
    toast.success("Kunci jawaban berhasil diperbarui.");
  }, [answerOverrides]);

  const clearAllOverrides = useCallback(() => {
    localStorage.removeItem("epstopik_answer_overrides");
    setAnswerOverrides({});
    toast.success("Semua kunci jawaban telah direset ke setelan pabrik.");
  }, []);

  // --- EFFECTS ---

  // Load saved session and history on mount
  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem("katakosa_tryout_active_session");
      if (sessionStr) {
        setSavedSession(JSON.parse(sessionStr));
      }
      const historyStr = localStorage.getItem("katakosa_tryout_history");
      if (historyStr) {
        setHistoryList(JSON.parse(historyStr));
      }
    } catch (e) {
      console.error("Failed to load tryout localStorage state:", e);
    }
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, finishQuiz]);

  // Compute results when mode becomes "result"
  useEffect(() => {
    if (mode === "result" && quizQuestions.length > 0 && !results) {
      const items = quizQuestions.map((q, idx) => {
        const userAns = selectedAnswers[idx];
        const correctAns = getActiveCorrectAnswer(q);
        return {
          q,
          userAns,
          correctAns,
          isCorrect: userAns === correctAns
        };
      });

      const correctCount = items.filter(i => i.isCorrect).length;
      const score = Number(((correctCount / quizQuestions.length) * 100).toFixed(1));
 
      setResults({ score, correctCount, items });

      // Save to completed history list
      try {
        const historyItem: TryoutHistoryItem = {
          id: `tryout-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          date: new Date().toLocaleString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
          tryoutType,
          section: tryoutType === 'cbt' ? cbtSection : selectedSection,
          totalQuestions: quizQuestions.length,
          correctCount,
          score
        };
        
        setHistoryList(prev => {
          const newList = [historyItem, ...prev].slice(0, 50); // limit to 50 items
          localStorage.setItem("katakosa_tryout_history", JSON.stringify(newList));
          return newList;
        });
      } catch (e) {
        console.error("Failed to save tryout history:", e);
      }
    } else if (mode === "setup") {
      setResults(null);
    }
  }, [mode, quizQuestions, selectedAnswers, getActiveCorrectAnswer, results, tryoutType, cbtSection, selectedSection]);

  // Auto-save active kuis session to localStorage
  useEffect(() => {
    try {
      if (mode === "quiz" && quizQuestions.length > 0) {
        const session: TryoutSession = {
          quizQuestions,
          currentIndex,
          selectedAnswers,
          answeredState,
          timeLeft,
          isTimerActive,
          tryoutType,
          instantFeedback,
          isBlankOptions,
          isExamMode
        };
        localStorage.setItem("katakosa_tryout_active_session", JSON.stringify(session));
      } else if (mode === "setup" || mode === "result") {
        // Clear active session when kuis ends
        localStorage.removeItem("katakosa_tryout_active_session");
        setSavedSession(null);
      }
    } catch (e) {
      console.error("Failed to save tryout session:", e);
    }
  }, [mode, quizQuestions, currentIndex, selectedAnswers, answeredState, timeLeft, isTimerActive, tryoutType, instantFeedback, isBlankOptions, isExamMode]);

  // --- REMAINING LOGIC ---

  const getQuestionType = (q: Question): string => {
    // A question is "image" type ONLY if it actually has image file references,
    // NOT based on text keywords or image_type metadata alone
    const hasImageData = (q.images && q.images.some(img => img && img.length > 0)) || (q.image && q.image.length > 0);
    if (hasImageData) {
      return "image";
    }
    const ownText = (q.question_text || "").toLowerCase();
    const combined = ((q.group_instruction || "") + " " + ownText).toLowerCase();
    if (combined.includes("빈칸")) {
      return "blank";
    }
    if (combined.includes("글을 읽고")) {
      return "passage";
    }
    if (combined.includes("밑줄")) {
      return "grammar";
    }
    return "grammar";
  };

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      // Filter out invalid/transcript questions with no options
      if (!q.options || q.options.length === 0) return false;

      if (chapterSelectionMode === "range") {
        if (!selectedChapters.includes(q.chapter)) return false;
      }
      if (selectedSection !== "all" && q.section !== selectedSection) return false;
      const qType = getQuestionType(q);
      if (!selectedTypes.includes(qType)) return false;
      return true;
    });
  }, [allQuestions, chapterSelectionMode, selectedChapters, selectedSection, selectedTypes]);

  const handleStartQuiz = useCallback(() => {
    let finalQuestions: Question[] = [];

    if (tryoutType === "cbt") {
      // CBT Mode: random from all bab 1-60
      const readingPool = allQuestions.filter(q => q.section === "reading" && q.options && q.options.length > 0);
      const listeningPool = allQuestions.filter(q => q.section === "listening" && q.options && q.options.length > 0);

      const targetCount = cbtQuestionCount;

      if (cbtSection === "reading") {
        const shuffled = [...readingPool].sort(() => 0.5 - Math.random());
        finalQuestions = shuffled.slice(0, Math.min(targetCount, shuffled.length));
      } else if (cbtSection === "listening") {
        const shuffled = [...listeningPool].sort(() => 0.5 - Math.random());
        finalQuestions = shuffled.slice(0, Math.min(targetCount, shuffled.length));
      } else {
        // Mix mode: balance reading & listening
        const targetReading = Math.floor(targetCount / 2);
        const targetListening = targetCount - targetReading;

        const shuffledReading = [...readingPool].sort(() => 0.5 - Math.random()).slice(0, targetReading);
        const shuffledListening = [...listeningPool].sort(() => 0.5 - Math.random()).slice(0, targetListening);

        // Put reading first, then listening
        finalQuestions = [...shuffledReading, ...shuffledListening];
      }

      if (finalQuestions.length === 0) {
        toast.error("Tidak ada soal yang tersedia untuk simulasi CBT.");
        return;
      }

      setQuizQuestions(finalQuestions);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setAnsweredState({});
      setMode("quiz");

      // Calculate time limit
      let durationSeconds = 0;
      if (cbtDurationMode === "official") {
        durationSeconds = finalQuestions.length * 75; // 75 seconds per question
      } else {
        durationSeconds = parseInt(cbtDurationMode) * 60; // Minutes to seconds
      }

      setTimeLeft(durationSeconds);
      setIsTimerActive(true);
      setInstantFeedback(false);
      setIsExamMode(true);

      // Clean saved session on new start
      localStorage.removeItem("katakosa_tryout_active_session");
      setSavedSession(null);
    } else {
      // Practice Mode (original selection logic)
      if (filteredQuestions.length === 0) {
        toast.error("Tidak ada soal yang sesuai kriteria.");
        return;
      }
      const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
      finalQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));
      setQuizQuestions(finalQuestions);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setAnsweredState({});
      setMode("quiz");

      // Clean saved session on new start
      localStorage.removeItem("katakosa_tryout_active_session");
      setSavedSession(null);

      if (isExamMode) {
        setTimeLeft(finalQuestions.length * 75);
        setIsTimerActive(true);
        setInstantFeedback(false);
      } else {
        setIsTimerActive(false);
      }
    }

    if (soundEffects.playFlip) soundEffects.playFlip();
  }, [allQuestions, filteredQuestions, tryoutType, cbtSection, cbtQuestionCount, cbtDurationMode, questionCount, isExamMode]);

  const handleOptionClick = (choiceNum: number) => {
    if (answeredState[currentIndex] && instantFeedback) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: choiceNum }));
    if (soundEffects.playFlip) soundEffects.playFlip();

    if (instantFeedback) {
      const currentQ = quizQuestions[currentIndex];
      const correct = getActiveCorrectAnswer(currentQ);
      if (correct !== null) {
        if (choiceNum === correct) {
          if (soundEffects.playCorrect) soundEffects.playCorrect();
        } else {
          if (soundEffects.playIncorrect) soundEffects.playIncorrect();
        }
      }
      setAnsweredState(prev => ({ ...prev, [currentIndex]: true }));
    }
  };

  const restoreSession = useCallback(() => {
    if (!savedSession) return;
    setQuizQuestions(savedSession.quizQuestions);
    setCurrentIndex(savedSession.currentIndex);
    setSelectedAnswers(savedSession.selectedAnswers);
    setAnsweredState(savedSession.answeredState || {});
    setTimeLeft(savedSession.timeLeft);
    setIsTimerActive(savedSession.isTimerActive);
    setTryoutType(savedSession.tryoutType);
    setInstantFeedback(savedSession.instantFeedback);
    setIsBlankOptions(savedSession.isBlankOptions);
    setIsExamMode(savedSession.isExamMode);
    setMode("quiz");
    toast.success("Sesi kuis berhasil dilanjutkan!");
  }, [savedSession]);

  const clearActiveSession = useCallback(() => {
    localStorage.removeItem("katakosa_tryout_active_session");
    setSavedSession(null);
    toast.info("Sesi tersimpan telah dibersihkan.");
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistoryList(prev => {
      const newList = prev.filter(item => item.id !== id);
      localStorage.setItem("katakosa_tryout_history", JSON.stringify(newList));
      toast.success("Riwayat berhasil dihapus.");
      return newList;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem("katakosa_tryout_history");
    setHistoryList([]);
    toast.success("Semua riwayat berhasil dibersihkan.");
  }, []);

  return {
    mode, setMode,
    chapterSelectionMode, setChapterSelectionMode,
    selectedChapters, setSelectedChapters,
    selectedSection, setSelectedSection,
    selectedTypes, setSelectedTypes,
    questionCount, setQuestionCount,
    isExamMode, setIsExamMode,
    timeLeft, isTimerActive,
    instantFeedback, setInstantFeedback,
    quizQuestions, currentIndex, setCurrentIndex,
    selectedAnswers, answeredState, results,
    filteredQuestionsCount: filteredQuestions.length,
    handleStartQuiz, handleOptionClick, finishQuiz, clearAllOverrides,
    getActiveCorrectAnswer, handleSaveAnswerOverride,
    isBlankOptions, setIsBlankOptions,
    tryoutType, setTryoutType,
    cbtSection, setCbtSection,
    cbtQuestionCount, setCbtQuestionCount,
    cbtDurationMode, setCbtDurationMode,
    savedSession, restoreSession, clearActiveSession,
    historyList, deleteHistoryItem, clearHistory
  };
};
