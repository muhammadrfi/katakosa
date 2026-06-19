import { useState, useCallback } from 'react';
import {
  VocabImageItem,
  PictureQuizQuestion,
  PictureQuizOption,
  PictureQuizMode,
  PictureQuizQuestionType,
  PictureQuizStatus,
  PictureQuizLang,
} from './types';
import { soundEffects } from '../../utils/soundEffects';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestion(
  item: VocabImageItem,
  allItems: VocabImageItem[],
  type: PictureQuizQuestionType,
  lang: PictureQuizLang,
): PictureQuizQuestion {
  const id = `pq-${item.chapter}-${item.korean}-${type}`;

  // Pick 3 wrong items (different from correct)
  const others = shuffleArray(allItems.filter(x => x.image !== item.image)).slice(0, 3);

  if (type === 'image-to-text') {
    // Question: show image → choose correct text label
    const correctText = lang === 'indonesian' ? item.indonesian : item.korean;
    const options: PictureQuizOption[] = shuffleArray([
      { value: correctText, label: correctText, isImage: false },
      ...others.map(o => {
        const t = lang === 'indonesian' ? o.indonesian : o.korean;
        return { value: t, label: t, isImage: false };
      }),
    ]);
    return {
      id,
      type,
      item,
      correctAnswer: correctText,
      questionDisplay: item.image,
      options,
    };
  } else {
    // text-to-image: show text label → choose correct image
    const questionText = lang === 'indonesian' ? item.indonesian : item.korean;
    const options: PictureQuizOption[] = shuffleArray([
      { value: item.image, label: item.korean, isImage: true },
      ...others.map(o => ({ value: o.image, label: o.korean, isImage: true })),
    ]);
    return {
      id,
      type,
      item,
      correctAnswer: item.image,
      questionDisplay: questionText,
      options,
    };
  }
}

export function generateQuestions(
  items: VocabImageItem[],
  count: number,
  mode: PictureQuizMode,
  lang: PictureQuizLang,
): PictureQuizQuestion[] {
  if (items.length < 4) return [];
  const picked = shuffleArray(items).slice(0, count);
  return picked.map((item, idx) => {
    let type: PictureQuizQuestionType;
    if (mode === 'image-to-text') type = 'image-to-text';
    else if (mode === 'text-to-image') type = 'text-to-image';
    else type = idx % 2 === 0 ? 'image-to-text' : 'text-to-image';
    return generateQuestion(item, items, type, lang);
  });
}

interface UsePictureQuizLogicReturn {
  status: PictureQuizStatus;
  setStatus: (val: PictureQuizStatus) => void;
  questions: PictureQuizQuestion[];
  currentIndex: number;
  setCurrentIndex: (val: number) => void;
  score: number;
  incorrectItems: PictureQuizQuestion[];
  selectedAnswers: Record<number, string>;
  answeredState: Record<number, boolean>;
  startQuiz: (count: number, mode: PictureQuizMode, lang: PictureQuizLang, instantFeedback: boolean) => void;
  handleAnswer: (selectedValue: string) => void;
  goNext: () => void;
  goPrev: () => void;
  finishQuiz: () => void;
  restart: () => void;
  instantFeedback: boolean;
}

const usePictureQuizLogic = (items: VocabImageItem[]): UsePictureQuizLogicReturn => {
  const [status, setStatus] = useState<PictureQuizStatus>('idle');
  const [questions, setQuestions] = useState<PictureQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [incorrectItems, setIncorrectItems] = useState<PictureQuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [answeredState, setAnsweredState] = useState<Record<number, boolean>>({});
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);
  const [quizParams, setQuizParams] = useState<{ count: number; mode: PictureQuizMode; lang: PictureQuizLang; instantFeedback: boolean } | null>(null);

  const startQuiz = useCallback((count: number, mode: PictureQuizMode, lang: PictureQuizLang, instantFeedbackSetting: boolean) => {
    const qs = generateQuestions(items, count, mode, lang);
    setQuizParams({ count, mode, lang, instantFeedback: instantFeedbackSetting });
    setInstantFeedback(instantFeedbackSetting);
    setQuestions(qs);
    setCurrentIndex(0);
    setScore(0);
    setIncorrectItems([]);
    setSelectedAnswers({});
    setAnsweredState({});
    setStatus('active');
  }, [items]);

  const handleAnswer = useCallback((selectedValue: string) => {
    // If instant feedback is active and already answered, do not allow changing answer
    if (answeredState[currentIndex] && instantFeedback) return;

    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: selectedValue
    }));
    setAnsweredState(prev => ({
      ...prev,
      [currentIndex]: true
    }));
    
    // Play sound instantly based on correctness if instant feedback is enabled
    if (instantFeedback) {
      const q = questions[currentIndex];
      if (q && selectedValue === q.correctAnswer) {
        soundEffects.playCorrect?.();
      } else {
        soundEffects.playIncorrect?.();
      }
    } else {
      soundEffects.playFlip?.();
    }
  }, [currentIndex, questions, answeredState, instantFeedback]);

  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      soundEffects.playFlip?.();
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, questions.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      soundEffects.playFlip?.();
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex]);

  const finishQuiz = useCallback(() => {
    // Calculate score & wrong items at submission time
    let correctCount = 0;
    const wrgItems: PictureQuizQuestion[] = [];
    
    questions.forEach((q, idx) => {
      const userAns = selectedAnswers[idx];
      if (userAns === q.correctAnswer) {
        correctCount += 1;
      } else {
        wrgItems.push(q);
      }
    });

    setScore(correctCount);
    setIncorrectItems(wrgItems);
    setStatus('finished');
  }, [questions, selectedAnswers]);

  const restart = useCallback(() => {
    if (!quizParams) return;
    startQuiz(quizParams.count, quizParams.mode, quizParams.lang, quizParams.instantFeedback);
  }, [quizParams, startQuiz]);

  return {
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
    instantFeedback
  };
};

export default usePictureQuizLogic;
