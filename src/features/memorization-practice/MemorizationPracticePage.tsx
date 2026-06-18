import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePracticeProjectStore } from '../../features/practice-projects/usePracticeProjectStore';
import { useVocabularyStore } from '../../features/vocabulary/useVocabularyStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { WordPair } from '../../features/vocabulary/vocabulary.types';
import MemorizationCard from './MemorizationCard';
import { soundEffects } from '../../utils/soundEffects';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';

const MemorizationPracticePage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = usePracticeProjectStore();
  const {
    loading: vocabLoading,
    getVocabularyBySetIds,
    markWordAsRemembered,
    markWordAsForgotten,
  } = useVocabularyStore();

  const [wordsToMemorize, setWordsToMemorize] = useState<WordPair[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9; // 3x3 grid

  const project = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  const allWordsInProject = useMemo(() => {
    if (!project) return [];
    return getVocabularyBySetIds(project.setIds);
  }, [project, getVocabularyBySetIds]);

  useEffect(() => {
    if (!projectsLoading && !vocabLoading && project) {
      const now = new Date().getTime();
      const initialWords = allWordsInProject.filter(word => {
        // Filter words that are due or have repetition < 5
        return word.repetition < 5 && (!word.nextReviewDate || word.nextReviewDate <= now);
      });
      setWordsToMemorize(initialWords);
      setCurrentPage(1);
    }
  }, [projectsLoading, vocabLoading, project, allWordsInProject]);

  const paginatedWords = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return wordsToMemorize.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [wordsToMemorize, currentPage]);

  const pageCount = useMemo(() => {
    return Math.ceil(wordsToMemorize.length / ITEMS_PER_PAGE);
  }, [wordsToMemorize.length]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pageCount) return;
    setCurrentPage(page);
  };

  const handleWordAction = (wordId: string, action: 'remember' | 'forgot') => {
    if (action === 'remember') {
      soundEffects.playCorrect();
      markWordAsRemembered(wordId);
    } else {
      soundEffects.playIncorrect();
      markWordAsForgotten(wordId);
    }
    
    // Optimistically remove it from current words to memorize list
    setWordsToMemorize(prevWords => {
      const updatedWords = prevWords.filter(word => word.id !== wordId);
      return updatedWords;
    });

    // Adjust page if the current page becomes empty
    const remainingAfterRemove = wordsToMemorize.length - 1;
    const newPageCount = Math.ceil(remainingAfterRemove / ITEMS_PER_PAGE);
    if (currentPage > newPageCount && newPageCount > 0) {
      setCurrentPage(newPageCount);
    }
  };

  if (projectsLoading || vocabLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background text-foreground">
        <Loader2 />
      </div>
    );
  }

  // Small helper for loader
  function Loader2() {
    return <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />;
  }

  if (!project) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-md text-center">
        <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader>
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-xl font-bold text-foreground">Proyek Tidak Ditemukan</CardTitle>
            <CardDescription className="text-muted-foreground">
              Proyek yang Anda cari tidak ada atau telah dihapus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/latihan')} className="rounded-xl w-full">Kembali ke Daftar Proyek</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/latihan/${projectId}`)}
          className="hover:bg-muted rounded-xl text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <span className="text-xs text-muted-foreground block">Ruang Menghafal</span>
          <span className="text-sm font-bold text-foreground">{project.name}</span>
        </div>
      </div>

      <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="text-center border-b border-border/40 pb-6 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
            <BrainCircuit className="h-6 w-6 text-emerald-500" />
          </div>
          <CardTitle className="text-xl text-foreground font-bold">Ruang Menghafal</CardTitle>
          <CardDescription className="text-muted-foreground max-w-md mx-auto">
            Hafalkan kosakata proyek ini dengan metode kartu flip interaktif. Klik kartu untuk melihat terjemahan kata.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {wordsToMemorize.length === 0 ? (
            <div className="text-center py-12 space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 animate-scale-pulse">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Semua kata telah dihafal!</h3>
              <p className="text-sm text-muted-foreground">
                Hebat! Tidak ada lagi kosakata di proyek ini yang perlu dihafal hari ini.
              </p>
              <Button onClick={() => navigate(`/latihan/${projectId}`)} className="rounded-xl w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-5">
                Selesai
              </Button>
            </div>
          ) : (
            <>
              {/* Words remaining badge */}
              <div className="flex justify-between items-center mb-4 text-xs font-semibold text-muted-foreground">
                <span>Kosakata perlu dihafal:</span>
                <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  {wordsToMemorize.length} kata tersisa
                </span>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedWords.map((word) => (
                  <MemorizationCard
                    key={word.id}
                    word={word}
                    onRemember={() => handleWordAction(word.id, 'remember')}
                    onForgot={() => handleWordAction(word.id, 'forgot')}
                  />
                ))}
              </div>

              {/* Pagination bar */}
              {pageCount > 1 && (
                <Pagination className="mt-8 border-t border-border/40 pt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-muted rounded-xl'}
                      />
                    </PaginationItem>
                    {(() => {
                      const pageNumbers = [];
                      if (pageCount <= 5) {
                        for (let i = 1; i <= pageCount; i++) pageNumbers.push(i);
                      } else {
                        pageNumbers.push(1);
                        if (currentPage > 3) pageNumbers.push('...');
                        if (currentPage > 2) pageNumbers.push(currentPage - 1);
                        if (currentPage > 1 && currentPage < pageCount) pageNumbers.push(currentPage);
                        if (currentPage < pageCount - 1) pageNumbers.push(currentPage + 1);
                        if (currentPage < pageCount - 2) pageNumbers.push('...');
                        pageNumbers.push(pageCount);
                      }
                      const uniquePageNumbers = [...new Set(pageNumbers)];
                      return uniquePageNumbers.map((page, index) => (
                        <PaginationItem key={index}>
                          {page === '...' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page as number);
                              }}
                              isActive={currentPage === page}
                              className="rounded-xl"
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ));
                    })()}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === pageCount ? 'pointer-events-none opacity-50' : 'hover:bg-muted rounded-xl'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemorizationPracticePage;