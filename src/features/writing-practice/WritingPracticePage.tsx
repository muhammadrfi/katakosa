import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { usePracticeProjectStore } from '../practice-projects/usePracticeProjectStore'; // Import usePracticeProjectStore
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { shuffleArray } from '@/lib/utils'; // Assuming utils.ts has shuffleArray

const WritingPracticePage: React.FC = () => {
  const [hint, setHint] = useState<string>('');
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getVocabularyBySetIds, markWordAsRemembered, markWordAsForgotten, loading: vocabLoading } = useVocabularyStore();
  const { projects, loading: projectsLoading } = usePracticeProjectStore(); // Dapatkan projects dan loading dari store

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceWords, setPracticeWords] = useState<any[]>([]); // Using any for now, will refine type
  const [gameFinished, setGameFinished] = useState(false);
  const [practiceDirection, setPracticeDirection] = useState<'A_to_B' | 'B_to_A'>('A_to_B'); // 'A_to_B' means bahasaA to bahasaB, 'B_to_A' means bahasaB to bahasaA
  const [hintCount, setHintCount] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set()); // Menyimpan indeks karakter yang sudah terungkap

  useEffect(() => {
    // Reset revealedIndices when currentWord changes (i.e., new practice word)
    setRevealedIndices(new Set());
  }, [currentWordIndex]);

  const project = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  const allWordsInProject = useMemo(() => {
    if (!project) return [];
    return getVocabularyBySetIds(project.setIds); // Gunakan project.setIds
  }, [project, getVocabularyBySetIds]);

  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard', { replace: true });
      return;
    }
    // Hanya inisialisasi jika project dan allWordsInProject sudah dimuat
    if (!projectsLoading && !vocabLoading && project && allWordsInProject.length > 0) {
      setPracticeWords(shuffleArray([...allWordsInProject]));
      setCurrentWordIndex(0);
      setUserInput('');
      setFeedback(null);
      setShowAnswer(false);
      setGameFinished(false);
    }
  }, [projectId, allWordsInProject, navigate, projectsLoading, vocabLoading, project]);

  const currentWord = practiceWords[currentWordIndex];

  const handleShowHint = () => {
    if (!currentWord || hintCount >= 3) return; // Batasi penggunaan petunjuk hingga 3 kali

    const correctAnswer = (practiceDirection === 'A_to_B' ? currentWord.bahasaB : currentWord.bahasaA).replace(/,/g, '');
    const currentHintLevel = hintCount;

    // Helper function to reveal a character by its index in the original string
    const revealChar = (index: number) => {
      if (index >= 0 && index < correctAnswer.length && correctAnswer[index] !== ' ') {
        setRevealedIndices(prev => new Set(prev.add(index)));
      }
    };

    // Salin revealedIndices yang sudah ada untuk mempertahankan petunjuk sebelumnya
    const currentRevealed = new Set(revealedIndices);

    switch (currentHintLevel) {
      case 0: // Petunjuk pertama: Tampilkan huruf pertama dari setiap kata
        const words = correctAnswer.split(' ');
        let currentAbsoluteIndex = 0;
        words.forEach((word) => {
          if (word.length > 0) {
            currentRevealed.add(currentAbsoluteIndex);
          }
          currentAbsoluteIndex += word.length + 1; // +1 untuk spasi
        });
        break;
      case 1: // Petunjuk kedua: Tambahkan satu huruf acak baru
         let randomIndex1;
         do {
           randomIndex1 = Math.floor(Math.random() * correctAnswer.length);
         } while (currentRevealed.has(randomIndex1) || correctAnswer[randomIndex1] === ' ');
         currentRevealed.add(randomIndex1);
         break;
       case 2: // Petunjuk ketiga: Tambahkan dua huruf acak baru
         let revealedCount = 0;
         while (revealedCount < 2) {
           let randomIndex2;
           do {
             randomIndex2 = Math.floor(Math.random() * correctAnswer.length);
           } while (currentRevealed.has(randomIndex2) || correctAnswer[randomIndex2] === ' ');
           currentRevealed.add(randomIndex2);
           revealedCount++;
         }
         break;
       default: // Jika level petunjuk lebih dari 2, tampilkan semua huruf
         for (let i = 0; i < correctAnswer.length; i++) {
           currentRevealed.add(i);
         }
         break;
    }

    setRevealedIndices(currentRevealed); // Perbarui state revealedIndices

    // Generate the hint string based on the new revealedIndices
    let newHintString = '';
    for (let i = 0; i < correctAnswer.length; i++) {
      if (currentRevealed.has(i)) {
        newHintString += correctAnswer[i];
      } else if (correctAnswer[i] === ' ') {
        newHintString += ' ';}
      else {
        newHintString += '_';
      }
    }
    setHint(newHintString);
    setHintCount(prev => prev + 1); // Increment hintCount after processing
  };

  const handleCheckAnswer = () => {
    if (!currentWord) return;

    const normalizedUserInput = userInput.trim().toLowerCase();
    let correctAnswers: string[] = [];

    if (practiceDirection === 'A_to_B') {
      correctAnswers.push(currentWord.bahasaB.toLowerCase());
      if (currentWord.bahasaBAlternatives) {
        correctAnswers = correctAnswers.concat(currentWord.bahasaBAlternatives.map((alt: string) => alt.toLowerCase()));
      }
    } else {
      correctAnswers.push(currentWord.bahasaA.toLowerCase());
      // For B_to_A, we might consider alternatives for bahasaA if they were ever added, but for now, just bahasaA
    }

    const isCorrect = correctAnswers.some(answer => normalizedUserInput === answer);

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (!isCorrect) { // Hanya tampilkan jawaban jika salah
      setShowAnswer(true);
    }

    if (isCorrect) {
      markWordAsRemembered(currentWord.id);
    } else {
      // Jika hint digunakan, anggap sebagai jawaban salah sebagian
      if (hint) {
        markWordAsForgotten(currentWord.id); // Atau logika lain untuk "salah sebagian"
      } else {
        markWordAsForgotten(currentWord.id);
      }
    }
  };

  const handleNextWord = () => {
    setUserInput('');
    setFeedback(null);
    setShowAnswer(false);
    setHint(''); // Mengatur hint menjadi string kosong
    setHintCount(0);
    if (currentWordIndex < practiceWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setGameFinished(true);
    }
  };

  const handleShuffleWords = () => {
    setPracticeWords(shuffleArray([...allWordsInProject]));
    setCurrentWordIndex(0);
    setUserInput('');
    setFeedback(null);
    setShowAnswer(false);
    setGameFinished(false);
    setHint('');
    setHintCount(0);
  };

  if (projectsLoading || vocabLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <Card className="w-full max-w-2xl mx-auto my-8 text-center">
        <CardHeader>
          <CardTitle>Practice Complete!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">You have completed all words in this practice set.</p>
          <Button onClick={() => {
            setGameFinished(false);
            setCurrentWordIndex(0);
            setPracticeWords(shuffleArray([...allWordsInProject]));
            setUserInput('');
            setFeedback(null);
            setShowAnswer(false);
            setHint('');
            setHintCount(0);
          }}>Practice Again</Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="ml-2">Back to Dashboard</Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentWord) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">No words available for practice in this project.</h1>
        <Button onClick={() => navigate(`/project/${projectId}`)}>Add Words</Button>
        <Button onClick={() => navigate('/dashboard')} className="ml-2">Back to Dashboard</Button>
      </div>
    );
  }

  const displayWord = (practiceDirection === 'A_to_B' ? currentWord.bahasaA : currentWord.bahasaB).replace(/,/g, '');
  const correctDisplayAnswer = (practiceDirection === 'A_to_B' ? currentWord.bahasaB : currentWord.bahasaA).replace(/,/g, '');

  return (
    <div className="container mx-auto px-4 overflow-x-hidden">
      <Card className="w-full md:max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Writing Practice: {project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold mb-4 text-center">{displayWord}</p>
          {hint && <p className="text-xl text-gray-600 mb-4 text-center">Hint: {hint}</p>}
          <Input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCheckAnswer();
              }
            }}
            placeholder="Type your answer here"
            className="mb-4"
            disabled={feedback === 'correct'}
          />
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={handleCheckAnswer} disabled={feedback === 'correct'}>Check Answer</Button>
            <Button onClick={handleShowHint} variant="outline" disabled={hintCount >= 3}>Show Hint ({hintCount}/3)</Button>
            <Button onClick={handleNextWord}>Next Word</Button>
          </div>
          {feedback && (
            <p className={`text-lg font-semibold ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
              {feedback === 'correct' ? 'Correct!' : 'Incorrect. Try again.'}
            </p>
          )}
          {showAnswer && feedback === 'incorrect' && (
            <p className="text-sm text-gray-600 mt-2">
              Correct Answer: <span className="font-semibold">{correctDisplayAnswer}</span>
            </p>
          )}
        </CardContent>
      </Card>
      <div className="mt-4 flex flex-col md:flex-row justify-center gap-2">
        <Button onClick={handleShuffleWords} variant="secondary">Shuffle Words</Button>
        <Button onClick={() => setPracticeDirection(prev => prev === 'A_to_B' ? 'B_to_A' : 'A_to_B')} variant="secondary">
          Switch Direction ({practiceDirection === 'A_to_B' ? 'A to B' : 'B to A'})
        </Button>
      </div>
    </div>
  );
};



export default WritingPracticePage;
