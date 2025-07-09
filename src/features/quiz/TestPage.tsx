import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useReviewListStore } from '../review-practice/useReviewListStore';
import useQuizData from './useQuizData';
import { usePracticeProjectStore } from '../practice-projects/usePracticeProjectStore';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import QuizErrorDisplay from './components/QuizErrorDisplay';
import QuizToggleLanguage from './components/QuizToggleLanguage';
import QuizStartScreen from './components/QuizStartScreen';
import QuestionCard from './components/QuestionCard';
import QuizResult from './components/QuizResult';
import { useState, useCallback } from 'react';
import useQuizLogic, { QuizStatus } from './useQuizLogic';
import QuizLoadingDisplay from './components/QuizLoadingDisplay';

import QuizContainer from './components/QuizContainer';

const TestPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const srsFilter = queryParams.get('srsFilter') as 'all' | 'new' | 'learning' | 'due' | 'mastered' | 'forgotten' | null;

  const { projects, loading: projectsLoading } = usePracticeProjectStore();
  const { vocabularySets, loading: vocabLoading } = useVocabularyStore();

  const project = React.useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  const setIds = React.useMemo(() => project?.setIds || [], [project]);

  const { wordsForQuiz, loading } = useQuizData(setIds, srsFilter || undefined);

  const [swapLanguages, setSwapLanguages] = useState(false);
  const { addIncorrectAnswer } = useReviewListStore();
  const { markWordAsRemembered, markWordAsForgotten } = useVocabularyStore();

  const {
    quizStatus, questions, currentQuestionIndex, score, incorrectAnswers,
    prepareQuiz, handleAnswer, handleRestart, setQuizStatus
  } = useQuizLogic(wordsForQuiz, addIncorrectAnswer, swapLanguages, markWordAsRemembered, markWordAsForgotten);

  const currentQuestion = questions[currentQuestionIndex];

  const handleToggleSwapLanguage = useCallback((checked: boolean) => {
    setSwapLanguages(checked);
    // Re-prepare quiz if active to apply language swap immediately
    if (quizStatus === QuizStatus.ACTIVE) {
      prepareQuiz(questions.length); // Use current number of questions
    }
  }, [quizStatus, prepareQuiz, questions.length]);

  if (loading) {
    return <QuizLoadingDisplay />;
  }
  
  if (projectsLoading || vocabLoading) {
    return <QuizLoadingDisplay />;
  }

  if (!projectId || !project || setIds.length === 0) {
    return <QuizErrorDisplay message="Proyek tidak ditemukan atau tidak memiliki set kosakata." />;
  }

  if (wordsForQuiz.length < 4) {
    return <QuizErrorDisplay message={`Mode kuis membutuhkan minimal 4 kata. Set yang Anda pilih memiliki ${wordsForQuiz.length} kata.`} />;
  }
  
  return (
    <QuizContainer className="px-4 overflow-x-hidden">
      {quizStatus === QuizStatus.IDLE && (
        <QuizStartScreen
          maxWordCount={wordsForQuiz.length}
          onStart={prepareQuiz}
        />
      )}

      {quizStatus === QuizStatus.ACTIVE && currentQuestion && (
        <>
          <QuizToggleLanguage
            swapLanguages={swapLanguages}
            onToggleSwapLanguage={handleToggleSwapLanguage}
          />
          <QuestionCard 
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onAnswer={(isCorrect) => handleAnswer(isCorrect ? currentQuestion.correctAnswer : '')} // Mengirimkan jawaban yang benar atau string kosong jika salah
          />
        </>
      )}

      {quizStatus === QuizStatus.FINISHED && (
        <QuizResult
          score={score}
          totalQuestions={questions.length}
          onRestart={handleRestart}
          incorrectAnswers={incorrectAnswers.map(q => ({ ...q, wordId: q.wordId }))} // Memastikan tipe QuizQuestion
        />
      )}
    </QuizContainer>
  );
};

export default TestPage;
