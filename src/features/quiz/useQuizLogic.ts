import { useState, useEffect, useCallback } from 'react';
import { WordPair } from '../vocabulary/vocabulary.types';

export enum QuizStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  FINISHED = 'finished',
}

export interface QuizQuestion {
  questionWord: string;
  correctAnswer: string;
  options: string[];
  wordId: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const generateQuizQuestions = (words: WordPair[], swapLanguages: boolean): QuizQuestion[] => {
  return words.map(word => {
    const questionText = swapLanguages ? word.bahasaB : word.bahasaA;
    const correctAnswer = swapLanguages ? word.bahasaA : word.bahasaB;
    
    // Generate 3 random incorrect options
    const incorrectOptions = shuffleArray(words.filter(w => w.id !== word.id))
      .slice(0, 3)
      .map(w => swapLanguages ? w.bahasaA : w.bahasaB);

    const options = shuffleArray([...incorrectOptions, correctAnswer]);

    return {
      id: word.id,
      questionWord: questionText,
      correctAnswer,
      options,
      wordId: word.id,
    };
  });
};

const useQuizLogic = (
  words: WordPair[],
  addIncorrectAnswer: (wordId: string) => void,
  swapLanguages: boolean,
  markWordAsRemembered: (wordId: string) => void,
  markWordAsForgotten: (wordId: string) => void,
  projectId?: string,
  srsFilter?: string | null,
) => {
  const [quizStatus, setQuizStatus] = useState<QuizStatus>(QuizStatus.IDLE);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<QuizQuestion[]>([]);

  // Load saved session on mount or when projectId/srsFilter changes
  useEffect(() => {
    if (!projectId) return;
    const sessionKey = `katakosa_vocab_quiz_session_${projectId}`;
    const saved = localStorage.getItem(sessionKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Verify if it matches the current srsFilter and contains questions
        if (parsed.srsFilter === (srsFilter || null) && parsed.questions && parsed.questions.length > 0) {
          setQuestions(parsed.questions);
          setCurrentQuestionIndex(parsed.currentQuestionIndex);
          setScore(parsed.score);
          setIncorrectAnswers(parsed.incorrectAnswers || []);
          setQuizStatus(QuizStatus.ACTIVE);
        }
      } catch (e) {
        console.error("Failed to restore kuis session from localStorage", e);
      }
    }
  }, [projectId, srsFilter]);

  // Auto-save kuis session to localStorage
  useEffect(() => {
    if (!projectId) return;
    const sessionKey = `katakosa_vocab_quiz_session_${projectId}`;
    if (quizStatus === QuizStatus.ACTIVE) {
      const session = {
        srsFilter: srsFilter || null,
        questions,
        currentQuestionIndex,
        score,
        incorrectAnswers,
        timestamp: Date.now()
      };
      localStorage.setItem(sessionKey, JSON.stringify(session));
    } else if (quizStatus === QuizStatus.FINISHED) {
      localStorage.removeItem(sessionKey);
    }
  }, [projectId, quizStatus, questions, currentQuestionIndex, score, incorrectAnswers, srsFilter]);

  const prepareQuiz = useCallback((numQuestions: number) => {
    const shuffledWords = shuffleArray(words).slice(0, numQuestions);
    setQuestions(generateQuizQuestions(shuffledWords, swapLanguages));
    setCurrentQuestionIndex(0);
    setScore(0);
    setIncorrectAnswers([]);
    setQuizStatus(QuizStatus.ACTIVE);
  }, [words, swapLanguages]);

  const handleAnswer = useCallback((selectedAnswer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      markWordAsRemembered(currentQuestion.wordId);
    } else {
      setIncorrectAnswers(prev => [...prev, currentQuestion]);
      addIncorrectAnswer(currentQuestion.wordId);
      markWordAsForgotten(currentQuestion.wordId);
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setQuizStatus(QuizStatus.FINISHED);
    }
  }, [questions, currentQuestionIndex, addIncorrectAnswer, markWordAsRemembered, markWordAsForgotten]);

  const handleRestart = useCallback(() => {
    // Clear session first then prepare new quiz
    if (projectId) {
      localStorage.removeItem(`katakosa_vocab_quiz_session_${projectId}`);
    }
    prepareQuiz(questions.length); // Restart with the same number of questions
  }, [prepareQuiz, questions.length, projectId]);

  useEffect(() => {
    // Reset quiz if words or swapLanguages change while idle
    if (quizStatus === QuizStatus.IDLE) {
      setQuestions(generateQuizQuestions(words, swapLanguages));
    }
  }, [words, swapLanguages, quizStatus]);

  return {
    quizStatus, questions, currentQuestionIndex, score, incorrectAnswers,
    prepareQuiz, handleAnswer, handleRestart, setQuizStatus
  };
};

export default useQuizLogic;
