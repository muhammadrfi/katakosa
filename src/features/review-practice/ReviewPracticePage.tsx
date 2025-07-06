
import React, { useState, useMemo, useEffect } from 'react';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Home, RotateCcw, Check } from 'lucide-react';
import ReviewCard from '../practice-projects/ReviewCard';
import { WordPair } from '../vocabulary/vocabulary.types';

const ReviewPracticePage = () => {
    const { vocabularySets, editWord } = useVocabularyStore();
    const navigate = useNavigate();

    const wordsForReview = useMemo(() => {
        const allWords = vocabularySets.flatMap(set => set.words);
        const now = Date.now();
        return allWords.filter(word => word.nextReviewDate && word.nextReviewDate <= now);
    }, [vocabularySets]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (wordsForReview.length > 0 && currentIndex >= wordsForReview.length) {
            setIsFinished(true);
        }
    }, [wordsForReview, currentIndex]);

    const handleNext = () => {
        if (currentIndex < wordsForReview.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };
    
    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFinished(false);
    };

    const handleMarkAsKnown = (word: WordPair) => {
        // For simplicity, marking as known will set interval to a large number
        // In a real SRS, you might want to use a specific quality score (e.g., 5)
        // and let the SM-2 algorithm handle the next review date.
        const updatedWord = {
            ...word,
            repetition: word.repetition + 1,
            interval: 9999, // Mark as known for a very long time
            nextReviewDate: Date.now() + (9999 * 24 * 60 * 60 * 1000) // Set a far future date
        };
        editWord(updatedWord);
        handleNext();
    };

    if (wordsForReview.length === 0) {
        return (
            <div className="container mx-auto py-12 px-6 text-center">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Tidak Ada Kata untuk Diulas</CardTitle>
                        <CardDescription>Daftar ulasan Anda kosong. Semua kata sudah ditinjau atau belum ada kata yang jatuh tempo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link to="/kosakata">Kembali ke Daftar Kata</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isFinished) {
        return (
             <div className="container mx-auto py-12 px-6 text-center">
                <Card className="max-w-md mx-auto animate-fade-in">
                    <CardHeader>
                        <CardTitle>Ulasan Selesai!</CardTitle>
                        <CardDescription>Anda telah berhasil mengulas semua kata yang jatuh tempo.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={() => navigate('/kosakata')}><Home className="mr-2 h-4 w-4"/> Kembali</Button>
                        <Button variant="outline" onClick={handleRestart}><RotateCcw className="mr-2 h-4 w-4"/> Ulangi</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const currentWord = wordsForReview[currentIndex];

    // Fallback for safety, in case the list becomes empty unexpectedly
    if (!currentWord) {
        return (
            <div className="container mx-auto py-12 px-6 text-center">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Tidak Ada Kata untuk Diulas</CardTitle>
                        <CardDescription>Daftar ulasan Anda kosong.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link to="/kosakata">Kembali ke Daftar Kata</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-6 animate-fade-in">
             <div className="mb-6">
                <Button variant="ghost" asChild>
                    <Link to="/kosakata">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Kata
                    </Link>
                </Button>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Latihan Ulasan</h2>
            <p className="text-muted-foreground text-center mb-6">Kata {currentIndex + 1} dari {wordsForReview.length}</p>

            <ReviewCard key={currentWord.id} word={currentWord} />
            
            <div className="max-w-sm mx-auto mt-6 space-y-2">
                 <Button onClick={handleNext} className="w-full">
                    {currentIndex < wordsForReview.length - 1 ? 'Lanjut' : 'Selesai'}
                </Button>
                <Button variant="outline" onClick={() => handleMarkAsKnown(currentWord)} className="w-full">
                    <Check className="mr-2 h-4 w-4" />
                    Tandai Sudah Tahu
                </Button>
            </div>
        </div>
    );
}

export default ReviewPracticePage;
