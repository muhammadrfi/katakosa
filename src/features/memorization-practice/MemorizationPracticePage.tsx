import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePracticeProjectStore } from '../../features/practice-projects/usePracticeProjectStore';
import { useVocabularyStore } from '../../features/vocabulary/useVocabularyStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, AlertTriangle } from 'lucide-react';
import { WordPair } from '../../features/vocabulary/vocabulary.types';
import MemorizationCard from './MemorizationCard';
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
      const initialWords = allWordsInProject.filter(word => word.repetition < 5); // Example filter
      setWordsToMemorize(initialWords);
      setCurrentPage(1); // Reset to first page on initial load
    }
  }, [projectsLoading, vocabLoading, project, allWordsInProject]);

  const paginatedWords = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return wordsToMemorize.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [wordsToMemorize, currentPage, ITEMS_PER_PAGE]);

  const pageCount = useMemo(() => {
    return Math.ceil(wordsToMemorize.length / ITEMS_PER_PAGE);
  }, [wordsToMemorize.length, ITEMS_PER_PAGE]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pageCount) return;
    setCurrentPage(page);
  };

  const handleWordAction = (wordId: string, action: 'remember' | 'forgot') => {
    if (action === 'remember') {
      markWordAsRemembered(wordId);
    } else {
      markWordAsForgotten(wordId);
    }
    // Remove the word from the current display
    setWordsToMemorize(prevWords => prevWords.filter(word => word.id !== wordId));
  };

  if (projectsLoading || vocabLoading) {
    return <div className="container mx-auto py-12 px-6 text-center">Memuat data...</div>;
  }

  if (!project) {
    return (
      <div className="container mx-auto py-12 px-6 max-w-2xl text-center">
         <Card>
            <CardHeader>
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <CardTitle>Proyek Tidak Ditemukan</CardTitle>
                <CardDescription>Proyek yang Anda cari tidak ada atau telah dihapus.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => navigate('/latihan')}>Kembali ke Daftar Proyek</Button>
            </CardContent>
         </Card>
       </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-6">
      <Button variant="ghost" onClick={() => navigate(`/practice/${projectId}`)} className="mb-4">
        <ArrowLeft className="mr-2" />
        Kembali ke Mode Latihan
      </Button>
      <Card>
        <CardHeader className="items-center text-center">
          <BrainCircuit className="w-12 h-12 text-primary mx-auto mb-4" />
          <CardTitle>Ruang Menghafal: {project.name}</CardTitle>
          <CardDescription>
            Hafalkan kosakata proyek ini dengan metode flipcard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wordsToMemorize.length === 0 ? (
            <div className="text-center">
              <p className="text-lg font-semibold mb-4">Semua kata telah dihafal!</p>
              <Button onClick={() => navigate(`/practice/${projectId}`)}>Selesai</Button>
            </div>
          ) : (
            <>
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
              {pageCount > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
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
                          {page === '...' ? <PaginationEllipsis /> : <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page as number); }} isActive={currentPage === page}>{page}</PaginationLink>}
                        </PaginationItem>
                      ));
                    })()}
                    <PaginationItem>
                      <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} className={currentPage === pageCount ? 'pointer-events-none opacity-50' : ''} />
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