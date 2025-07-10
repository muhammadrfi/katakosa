import React, { useState, useEffect, useMemo } from 'react';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { usePracticeProjectStore } from '../practice-projects/usePracticeProjectStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Shuffle, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WordPair } from '../vocabulary/vocabulary.types';

// Fisher-Yates Shuffle Algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const FlipbookPage = () => {
  const { loading: vocabLoading, getVocabularyBySetIds, getFilteredWords, markWordAsRemembered, markWordAsForgotten } = useVocabularyStore();
  const { projects: practiceProjects, loading: projectsLoading } = usePracticeProjectStore(); // Menggunakan alias 'projects' menjadi 'practiceProjects'
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const srsFilter = queryParams.get('srsFilter') as 'all' | 'new' | 'learning' | 'due' | 'mastered' | 'forgotten' | null;

  const wordsForPractice = useMemo(() => {
    console.log('FlipbookPage (useMemo): projectId', projectId);
    console.log('FlipbookPage (useMemo): practiceProjects', practiceProjects);
    console.log('FlipbookPage (useMemo): projectsLoading', projectsLoading);

    if (!projectId || projectsLoading || !practiceProjects) { // Memastikan practiceProjects tidak undefined
      console.log('FlipbookPage (useMemo): projectId, projectsLoading, or practiceProjects is an issue');
      return [];
    }

    console.log('FlipbookPage (useMemo): Attempting to find project with ID:', projectId);
    const project = practiceProjects.find(p => p.id === projectId);
    console.log('FlipbookPage (useMemo): Found project:', project);
    console.log('FlipbookPage (useMemo): Available projects:', practiceProjects);

    if (!project || !project.setIds || project.setIds.length === 0) {
      console.log('FlipbookPage (useMemo): Project not found, or no sets in project');
      return [];
    }

    const allWordsInProject = getVocabularyBySetIds(project.setIds);
    const filteredWords = getFilteredWords(allWordsInProject, srsFilter || 'all');

    console.log('FlipbookPage: wordsForPractice count', filteredWords.length);
    return filteredWords;
  }, [practiceProjects, projectId, getVocabularyBySetIds, getFilteredWords, projectsLoading]);

  const [shuffledDeck, setShuffledDeck] = useState<WordPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  useEffect(() => {
    console.log('FlipbookPage (useEffect): practiceProjects', practiceProjects);
    console.log('FlipbookPage (useEffect): projectsLoading', projectsLoading);
    if (wordsForPractice.length > 0) {
      setShuffledDeck(shuffleArray(wordsForPractice));
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [wordsForPractice, practiceProjects, projectsLoading]);

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleShuffle = () => {
    setShuffledDeck(shuffleArray(wordsForPractice));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (currentIndex < shuffledDeck.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (vocabLoading || projectsLoading) {
    return <div className="container mx-auto py-12 px-6 text-center">Memuat data...</div>;
  }

  if (wordsForPractice.length === 0) {
    return (
      <div className="container mx-auto py-12 px-6 text-center">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Tidak Ada Kata untuk Dilatih</CardTitle>
            <CardDescription>
              Set yang dipilih tidak memiliki kata atau tidak ditemukan. Silakan kembali dan pilih set lain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to={'/latihan/proyek/baru'}>Kembali Pilih Set</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (shuffledDeck.length === 0) {
    return <div className="container mx-auto py-12 px-6 text-center">Mempersiapkan kartu...</div>;
  }

  const currentCard = shuffledDeck[currentIndex];
  const frontText = isSwapped ? currentCard.bahasaB : currentCard.bahasaA;
  const backText = isSwapped ? currentCard.bahasaA : currentCard.bahasaB;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] gap-4 p-4">
      <div className="w-full max-w-md flex justify-end">
        <Button onClick={() => setIsSwapped(!isSwapped)} variant="outline" size="icon" title="Tukar Bahasa">
          <ArrowLeftRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="w-full max-w-lg h-80 [perspective:1000px]">
        <div
          className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of the card */}
          <div className="absolute w-full h-full [backface-visibility:hidden] border rounded-lg shadow-lg flex items-center justify-center p-6">
            <p className="text-4xl font-bold text-center break-words">{frontText}</p>
          </div>

          {/* Back of the card */}
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] border rounded-lg shadow-lg flex items-center justify-center p-6 bg-card">
            <p className="text-4xl font-bold text-center break-words">{backText}</p>
          </div>
        </div>
      </div>

      <div className="text-center text-muted-foreground">
        Kartu {currentIndex + 1} dari {shuffledDeck.length}
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handlePrev} disabled={currentIndex === 0} variant="outline" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button onClick={handleShuffle} variant="secondary">
          <Shuffle className="mr-2 h-5 w-5" /> Acak Kartu
        </Button>
        <Button onClick={handleNext} disabled={currentIndex === shuffledDeck.length - 1} variant="outline" size="icon">
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <Button variant="destructive" onClick={() => {
          markWordAsForgotten(currentCard.id);
          setShuffledDeck(prevDeck => prevDeck.filter(word => word.id !== currentCard.id));
          setCurrentIndex(prevIndex => (prevIndex >= shuffledDeck.length - 1 ? 0 : prevIndex)); // Stay on current index or reset to 0 if last card
          setIsFlipped(false);
        }}>Lupa</Button>
        <Button variant="default" onClick={() => {
          markWordAsRemembered(currentCard.id);
          setShuffledDeck(prevDeck => prevDeck.filter(word => word.id !== currentCard.id));
          setCurrentIndex(prevIndex => (prevIndex >= shuffledDeck.length - 1 ? 0 : prevIndex)); // Stay on current index or reset to 0 if last card
          setIsFlipped(false);
        }}>Ingat</Button>
      </div>
    </div>
  );
};

export default FlipbookPage;
