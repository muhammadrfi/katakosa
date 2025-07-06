import { useState, useCallback } from 'react';
import { generateQuizQuestions, QuizQuestion } from './quiz';
import { WordPair } from '@/types/vocabulary';

export enum QuizStatus {
  IDLE = 'idle',
  ACTIVE = 'active',
  FINISHED = 'finished',
}

const useQuizLogic = (wordsForQuiz: WordPair[], addIncorrectAnswer: (wordId: string) => void, swapLanguages: boolean) => {
  const [quizStatus, setQuizStatus] = useState<QuizStatus>(QuizStatus.IDLE);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<QuizQuestion[]>([]);

  const prepareQuiz = useCallback((questionCount: number) => {
    const quizQuestions = generateQuizQuestions(wordsForQuiz, questionCount, swapLanguages);
    setQuestions(quizQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setIncorrectAnswers([]);
    setQuizStatus(QuizStatus.ACTIVE);
  }, [wordsForQuiz, swapLanguages]);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      const wrongQuestion = questions[currentQuestionIndex];
      setIncorrectAnswers(prev => [...prev, wrongQuestion]);
      addIncorrectAnswer(wrongQuestion.wordId);
    }

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setQuizStatus(QuizStatus.FINISHED);
    }
  }, [questions, currentQuestionIndex, addIncorrectAnswer]);

  const handleRestart = useCallback(() => {
    setQuizStatus(QuizStatus.IDLE);
    setIncorrectAnswers([]);
  }, []);

  return {
    quizStatus, questions, currentQuestionIndex, score, incorrectAnswers,
    prepareQuiz, handleAnswer, handleRestart, setQuizStatus
  };
};

export default useQuizLogic;