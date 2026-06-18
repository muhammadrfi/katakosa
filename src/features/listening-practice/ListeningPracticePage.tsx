import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { usePracticeProjectStore } from '../practice-projects/usePracticeProjectStore';
import { useReviewListStore } from '../review-practice/useReviewListStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { getShuffledOptions } from '../practice-projects/practiceUtils';
import { useTextToSpeech } from './useTextToSpeech';
import ListeningStartScreen from './components/ListeningStartScreen';
import ListeningQuestionCard from './components/ListeningQuestionCard';
import ListeningResult from './components/ListeningResult';
import { WordPair } from '../vocabulary/vocabulary.types';
import { soundEffects } from '../../utils/soundEffects';

const ListeningPracticePage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const srsFilter = queryParams.get('srsFilter') as 'all' | 'new' | 'learning' | 'due' | 'mastered' | 'forgotten' | null;

    const { vocabularySets, loading: vocabLoading, markWordAsRemembered, markWordAsForgotten, getFilteredWords } = useVocabularyStore();
    const { projects, loading: projectsLoading } = usePracticeProjectStore();
    const { addIncorrectAnswer: addIncorrectAnswerToReviewList } = useReviewListStore();

    const [quizState, setQuizState] = useState<'start' | 'playing' | 'finished'>('start');
    const [quizWords, setQuizWords] = useState<WordPair[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<WordPair | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [options, setOptions] = useState<WordPair[]>([]);
    const [incorrectlyAnsweredWords, setIncorrectlyAnsweredWords] = useState<WordPair[]>([]);

    const { playSound, isSpeaking } = useTextToSpeech();

    const allWords = useMemo(() => {
        if (!projectId || !projects || !vocabularySets) return [];
        const project = projects.find(p => p.id === projectId);
        if (!project || !project.setIds || project.setIds.length === 0) return [];

        let words = vocabularySets
            .filter(set => project.setIds.includes(set.id))
            .flatMap(set => set.words);

        if (srsFilter) {
            words = getFilteredWords(words, srsFilter);
        }
        console.log("All words after filtering:", words);
        return words as WordPair[];
    }, [vocabularySets, projects, projectId, srsFilter, getFilteredWords]);
    
    const addIncorrectAnswer = (word: WordPair) => {
        setIncorrectlyAnsweredWords(prev => {
            if (!prev.some(w => w.id === word.id)) {
                return [...prev, word];
            }
            return prev;
        });
        addIncorrectAnswerToReviewList(word.id);
        markWordAsForgotten(word.id);
    };

    const generateOptions = (correctWord: WordPair) => {
        if (allWords.length > 0) {
            setOptions(getShuffledOptions(allWords, correctWord, Math.min(4, allWords.length)));
        }
    };

    const startQuiz = () => {
        soundEffects.playFlip();
        const shuffledWords = [...allWords].sort(() => 0.5 - Math.random());
        setQuizWords(shuffledWords);
        setCurrentWordIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setIncorrectlyAnsweredWords([]);
        setQuizState('playing');
        if (shuffledWords.length > 0) {
            generateOptions(shuffledWords[0]);
        }
    };

    const handleAnswerSelect = (answer: WordPair) => {
        if (selectedAnswer) return;

        const currentWord = quizWords[currentWordIndex];
        const correct = answer.id === currentWord.id;
        setSelectedAnswer(answer);
        setIsCorrect(correct);
        if (correct) {
            soundEffects.playCorrect();
            setScore(prev => prev + 1);
            toast.success("Jawaban Benar!");
            markWordAsRemembered(currentWord.id);
        } else {
            soundEffects.playIncorrect();
            addIncorrectAnswer(currentWord);
            setIncorrectlyAnsweredWords(prev => [...prev, currentWord]);
            toast.error("Jawaban Salah.", {
                description: `Yang benar: ${currentWord.bahasaB}`
            });
        }
    };

    const handleNextWord = () => {
        soundEffects.playFlip();
        if (currentWordIndex < quizWords.length - 1) {
            const nextIndex = currentWordIndex + 1;
            setCurrentWordIndex(nextIndex);
            generateOptions(quizWords[nextIndex]);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            soundEffects.playLevelUp();
            setQuizState('finished');
        }
    };

    const handlePlaySound = () => {
        if (quizWords.length > 0) {
            playSound(quizWords[currentWordIndex].bahasaA);
        }
    };

    useEffect(() => {
        if (quizState === 'playing' && quizWords.length > 0 && !selectedAnswer) {
            const timer = setTimeout(() => {
                if (!isSpeaking) {
                    playSound(quizWords[currentWordIndex].bahasaA);
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [currentWordIndex, quizState, quizWords, selectedAnswer, playSound, isSpeaking]);

    if (vocabLoading || projectsLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }
    
    if (allWords.length < 4) {
        return (
             <Card className="max-w-xl mx-auto text-center border border-border shadow-sm rounded-2xl bg-card">
                <CardHeader>
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
                    <CardTitle className="text-xl font-bold text-foreground">Kosakata Tidak Cukup</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Mode latihan ini membutuhkan minimal 4 kata dalam proyek Anda.
                    </CardDescription>
                </CardHeader>
                 {projectId && (
                    <CardContent>
                        <Button asChild className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-5 px-6">
                            <Link to={`/latihan/${projectId}/kosakata`}>Tambah Kosakata</Link>
                        </Button>
                    </CardContent>
                 )}
            </Card>
        );
    }
    
    if (quizState === 'start') {
        return <ListeningStartScreen totalWords={allWords.length} onStart={startQuiz} />;
    }

    if (quizState === 'finished') {
        return (
            <ListeningResult 
                score={score}
                totalQuestions={quizWords.length}
                incorrectlyAnsweredWords={incorrectlyAnsweredWords}
                onRestart={startQuiz}
                projectId={projectId}
            />
        );
    }

    const currentWord = quizWords[currentWordIndex];
    if (!currentWord) {
        setQuizState('start');
        return <div className="text-center py-12 text-foreground">Mempersiapkan kuis...</div>;
    }

    return (
        <ListeningQuestionCard
            currentWord={currentWord}
            options={options}
            selectedAnswer={selectedAnswer}
            isCorrect={isCorrect}
            isSpeaking={isSpeaking}
            questionNumber={currentWordIndex + 1}
            totalQuestions={quizWords.length}
            onPlaySound={handlePlaySound}
            onAnswerSelect={handleAnswerSelect}
            onNextWord={handleNextWord}
        />
    );
};

export default ListeningPracticePage;
