import React, { useState, useEffect } from 'react';
import { useTryoutLogic } from './hooks/useTryoutLogic';
import TryoutSetup from './components/TryoutSetup';
import TryoutQuiz from './components/TryoutQuiz';
import TryoutResult from './components/TryoutResult';
import { Loading } from '@/components/ui/Loading';
import { Question } from './types';

const TryoutPage = () => {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [dictionary, setDictionary] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);

  const {
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
    filteredQuestionsCount,
    handleStartQuiz, handleOptionClick, finishQuiz, clearAllOverrides,
    getActiveCorrectAnswer, handleSaveAnswerOverride,
    isBlankOptions, setIsBlankOptions,
    tryoutType, setTryoutType,
    cbtSection, setCbtSection,
    cbtQuestionCount, setCbtQuestionCount,
    cbtDurationMode, setCbtDurationMode,
    savedSession, restoreSession, clearActiveSession,
    historyList, deleteHistoryItem, clearHistory
  } = useTryoutLogic(allQuestions);

  useEffect(() => {
    Promise.all([
      fetch('/data/soal_epstopik.json?v=6.3').then(res => res.json()),
      fetch('/data/dictionary.json?v=6.3').then(res => res.json())
    ]).then(([questions, dict]) => {
      setAllQuestions(questions);
      setDictionary(dict);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load tryout data:", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Loading fullScreen text="Memuat Bank Soal & Kamus v6.3..." />;
  }

  const handleStartQuizWithReset = () => {
    setIsReviewMode(false);
    handleStartQuiz();
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {mode === 'setup' && (
        <TryoutSetup 
          allQuestionsCount={allQuestions.length}
          chapterSelectionMode={chapterSelectionMode}
          setChapterSelectionMode={setChapterSelectionMode}
          selectedChapters={selectedChapters}
          setSelectedChapters={setSelectedChapters}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          isExamMode={isExamMode}
          setIsExamMode={setIsExamMode}
          instantFeedback={instantFeedback}
          setInstantFeedback={setInstantFeedback}
          filteredQuestionsCount={filteredQuestionsCount}
          onStart={handleStartQuizWithReset}
          onResetOverrides={clearAllOverrides}
          isBlankOptions={isBlankOptions}
          setIsBlankOptions={setIsBlankOptions}
          tryoutType={tryoutType}
          setTryoutType={setTryoutType}
          cbtSection={cbtSection}
          setCbtSection={setCbtSection}
          cbtQuestionCount={cbtQuestionCount}
          setCbtQuestionCount={setCbtQuestionCount}
          cbtDurationMode={cbtDurationMode}
          setCbtDurationMode={setCbtDurationMode}
          savedSession={savedSession}
          restoreSession={restoreSession}
          clearActiveSession={clearActiveSession}
          historyList={historyList}
          deleteHistoryItem={deleteHistoryItem}
          clearHistory={clearHistory}
        />
      )}

      {mode === 'quiz' && quizQuestions.length > 0 && (
        <TryoutQuiz 
          quizQuestions={quizQuestions}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          selectedAnswers={selectedAnswers}
          answeredState={answeredState}
          instantFeedback={instantFeedback}
          timeLeft={timeLeft}
          isTimerActive={isTimerActive}
          isExamMode={isExamMode}
          dictionary={dictionary}
          handleOptionClick={handleOptionClick}
          getActiveCorrectAnswer={getActiveCorrectAnswer}
          handleSaveAnswerOverride={handleSaveAnswerOverride}
          finishQuiz={finishQuiz}
          onBack={() => {
            if (isReviewMode) {
              setMode('result');
            } else {
              setMode('setup');
            }
          }}
          isReviewMode={isReviewMode}
          isBlankOptions={isBlankOptions}
          setIsBlankOptions={setIsBlankOptions}
          tryoutType={tryoutType}
        />
      )}

      {mode === 'result' && results && (
        <TryoutResult 
          results={results}
          onRestart={handleStartQuizWithReset}
          onMenu={() => {
            setIsReviewMode(false);
            setMode('setup');
          }}
          onReview={(index) => {
            setIsReviewMode(true);
            setCurrentIndex(index);
            setMode('quiz');
          }}
          tryoutType={tryoutType}
        />
      )}
    </div>
  );
};

export default TryoutPage;
