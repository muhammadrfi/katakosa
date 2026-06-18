import React, { useState, useMemo, useEffect } from 'react';
import { useVocabularyStore } from '../vocabulary/useVocabularyStore';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, RotateCcw, RotateCw, Check, X } from 'lucide-react';
import ReviewCard from '../practice-projects/ReviewCard';
import { WordPair } from '../vocabulary/vocabulary.types';
import { soundEffects } from '../../utils/soundEffects';

const ReviewPracticePage = () => {
    const { 
        vocabularySets, 
        editWord, 
        markWordAsRemembered, 
        markWordAsForgotten 
    } = useVocabularyStore();
    const navigate = useNavigate();

    const wordsForReview = useMemo(() => {
        const allWords = vocabularySets.flatMap(set => set.words);
        const now = Date.now();
        return allWords.filter(word => word.nextReviewDate && word.nextReviewDate <= now);
    }, [vocabularySets]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (wordsForReview.length > 0 && currentIndex >= wordsForReview.length) {
            setIsFinished(true);
        }
    }, [wordsForReview, currentIndex]);

    // Reset flip state when moving between words
    useEffect(() => {
        setIsFlipped(false);
    }, [currentIndex]);

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
        setIsFlipped(false);
    };

    const handleRemembered = (word: WordPair) => {
        markWordAsRemembered(word.id);
        if (soundEffects.playCorrect) soundEffects.playCorrect();
        handleNext();
    };

    const handleForgotten = (word: WordPair) => {
        markWordAsForgotten(word.id);
        if (soundEffects.playIncorrect) soundEffects.playIncorrect();
        handleNext();
    };

    const handleMarkAsKnown = (word: WordPair) => {
        editWord(word.id, {
            repetition: word.repetition + 1,
            interval: 9999,
            nextReviewDate: Date.now() + (9999 * 24 * 60 * 60 * 1000)
        });
        if (soundEffects.playCorrect) soundEffects.playCorrect();
        handleNext();
    };

    if (wordsForReview.length === 0) {
        return (
            <div className="container mx-auto py-12 px-6 text-center">
                <Card className="max-w-md mx-auto rounded-2xl shadow-sm border">
                    <CardHeader>
                        <CardTitle className="font-extrabold text-xl">Tidak Ada Kata untuk Diulas</CardTitle>
                        <CardDescription className="text-zinc-500">Daftar ulasan Anda kosong. Semua kata sudah ditinjau atau belum ada kata yang jatuh tempo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="rounded-xl font-bold">
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
                <Card className="max-w-md mx-auto rounded-2xl shadow-sm border animate-in fade-in duration-300">
                    <CardHeader>
                        <CardTitle className="font-extrabold text-xl">Ulasan Selesai!</CardTitle>
                        <CardDescription className="text-zinc-500">Anda telah berhasil mengulas semua kata yang jatuh tempo.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => navigate('/kosakata')} className="rounded-xl font-bold"><Home className="mr-2 h-4 w-4"/> Kembali</Button>
                        <Button variant="outline" onClick={handleRestart} className="rounded-xl font-bold"><RotateCcw className="mr-2 h-4 w-4"/> Ulangi</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const currentWord = wordsForReview[currentIndex];

    if (!currentWord) {
        return (
            <div className="container mx-auto py-12 px-6 text-center">
                <Card className="max-w-md mx-auto rounded-2xl shadow-sm border">
                    <CardHeader>
                        <CardTitle className="font-extrabold text-xl">Tidak Ada Kata untuk Diulas</CardTitle>
                        <CardDescription className="text-zinc-500">Daftar ulasan Anda kosong.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="rounded-xl font-bold">
                            <Link to="/kosakata">Kembali ke Daftar Kata</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-6 animate-in fade-in duration-300">
            <div className="mb-6">
                <Button variant="ghost" asChild className="rounded-xl font-bold text-muted-foreground hover:text-foreground">
                    <Link to="/kosakata">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Kata
                    </Link>
                </Button>
            </div>
            <h2 className="text-2xl font-black text-center mb-1">Latihan Ulasan SRS</h2>
            <p className="text-muted-foreground text-xs text-center mb-6 font-bold uppercase tracking-wider">
                Kata {currentIndex + 1} dari {wordsForReview.length}
            </p>

            <ReviewCard 
                key={currentWord.id} 
                word={currentWord} 
                isFlipped={isFlipped}
                onFlip={setIsFlipped}
            />
            
            <div className="max-w-sm mx-auto mt-6">
                {!isFlipped ? (
                    <Button 
                        onClick={() => {
                            setIsFlipped(true);
                            if (soundEffects.playFlip) soundEffects.playFlip();
                        }}
                        className="w-full h-11 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <RotateCw className="h-4 w-4" />
                        <span>Lihat Arti</span>
                    </Button>
                ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-2 gap-3">
                            <Button 
                                variant="outline"
                                type="button"
                                onClick={() => handleForgotten(currentWord)} 
                                className="h-11 font-bold text-sm border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <X className="h-4.5 w-4.5" />
                                <span>Lupa (Salah)</span>
                            </Button>
                            <Button 
                                type="button"
                                onClick={() => handleRemembered(currentWord)} 
                                className="h-11 font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                            >
                                <Check className="h-4.5 w-4.5" />
                                <span>Ingat (Benar)</span>
                            </Button>
                        </div>
                        
                        <Button 
                            variant="outline" 
                            type="button"
                            onClick={() => handleMarkAsKnown(currentWord)} 
                            className="w-full h-11 text-xs font-semibold border-zinc-200 dark:border-zinc-800 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"
                        >
                            <Check className="mr-2 h-4 w-4 text-emerald-500" />
                            Tandai Sudah Tahu (Dikuasai)
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewPracticePage;
