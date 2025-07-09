
import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePracticeProjectStore } from '../../features/practice-projects/usePracticeProjectStore';
import { useVocabularyStore } from './useVocabularyStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookCopy, AlertTriangle, Plus, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VocabularySetList from './components/VocabularySetList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import AddVocabularyToProjectDialog from './components/AddVocabularyToProjectDialog';
import ExcelImporter from '../excel-importer/ExcelImporter';

const ITEMS_PER_PAGE = 5;

const ProjectVocabularyListPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, addSetsToProject, loading: projectsLoading } = usePracticeProjectStore();
  const { vocabularySets, removeWord, editWord, addWordToSet, removeVocabularySet, editVocabularySet, loading: vocabLoading } = useVocabularyStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<'name' | 'wordCount' | 'createdAt' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [srsFilter, setSrsFilter] = useState<'all' | 'new' | 'learning' | 'due' | 'mastered' | 'forgotten'>('all');

  const project = useMemo(() => {
    return projects.find(p => p.id === projectId);
  }, [projects, projectId]);

  const filteredProjectSets = useMemo(() => {
    if (!project) return [];
    let sets = vocabularySets.filter(set => project?.setIds?.includes(set.id));

    if (srsFilter !== 'all') {
      sets = sets.map(set => ({
        ...set,
        words: set.words.filter(word => {
          if (srsFilter === 'new') {
            return word.repetition === 0 && word.interval === 0;
          } else if (srsFilter === 'learning') {
            return word.repetition > 0 && word.repetition < 3 && word.interval < 7; // Example criteria
          } else if (srsFilter === 'due') {
            return word.interval > 0 && word.repetition >= 3; // Simplified: words that have been learned and are not new/learning
          } else if (srsFilter === 'mastered') {
            return word.repetition >= 5 && word.interval >= 30; // Example criteria for mastered
          } else if (srsFilter === 'forgotten') {
            return word.repetition === 0 && word.interval > 0; // Simplified: was learned but reset
          }
          return true;
        })
      })).filter(set => set.words.length > 0); // Remove sets that become empty after filtering
    }
    return sets;
  }, [vocabularySets, project, srsFilter]);

  const projectSets = useMemo(() => {
    let sortedSets = [...filteredProjectSets];

    if (sortColumn) {
      sortedSets = sortedSets.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortColumn === 'wordCount') {
          aValue = a.words.length;
          bValue = b.words.length;
        } else if (sortColumn === 'createdAt') {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
        } else {
          aValue = a[sortColumn];
          bValue = b[sortColumn];
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    return sortedSets;
  }, [filteredProjectSets, sortColumn, sortDirection]);

  const pageCount = useMemo(() => {
    return Math.ceil(projectSets.length / ITEMS_PER_PAGE);
  }, [projectSets.length]);

  const paginatedSets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return projectSets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [projectSets, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pageCount) return;
    setCurrentPage(page);
  };

  const handleSort = (column: 'name' | 'wordCount' | 'createdAt') => {
    setCurrentPage(1); // Reset to first page on sort
    setSortColumn(prevColumn => {
      if (prevColumn === column) {
        setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortDirection('asc');
      }
      return column;
    });
  };

  const getSortIcon = (column: 'name' | 'wordCount' | 'createdAt') => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  };
  const renderPagination = () => {
    if (pageCount <= 1) return null;

    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5; // Jumlah maksimal angka halaman yang akan ditampilkan

    if (pageCount <= maxPagesToShow) {
      for (let i = 1; i <= pageCount; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(pageCount, startPage + maxPagesToShow - 1);

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < pageCount) {
        if (endPage < pageCount - 1) {
          pageNumbers.push('...');
        }
        pageNumbers.push(pageCount);
      }
    }

    const uniquePageNumbers = [...new Set(pageNumbers)];

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
          </PaginationItem>
          {uniquePageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === '...' ? <PaginationEllipsis /> : <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page as number); }} isActive={currentPage === page}>{page}</PaginationLink>}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} className={currentPage === pageCount ? 'pointer-events-none opacity-50' : ''} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (projectsLoading || vocabLoading) {
    return <div className="container mx-auto py-12 px-6 text-center">Memuat data...</div>;
  }

  if (!projectId) {
    return (
      <div className="container mx-auto py-12 px-6 max-w-2xl text-center">
        <Card>
          <CardHeader>
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Kesalahan Proyek</CardTitle>
            <CardDescription>ID proyek tidak ditemukan. Silakan kembali ke daftar proyek.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/latihan')}>Kembali ke Daftar Proyek</Button>
          </CardContent>
        </Card>
      </div>
    );
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
    <div className="container mx-auto py-12 px-6 max-w-4xl">
      <Button variant="ghost" asChild className="mb-4 -ml-4">
        <Link to={`/latihan/${projectId}`}>
          <ArrowLeft className="mr-2" />
          Kembali ke Proyek
        </Link>
      </Button>
      
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <BookCopy className="w-8 h-8 text-primary"/>
              <CardTitle className="text-2xl">{project.name}: Daftar Kosakata</CardTitle>
            </div>
            <CardDescription className="mt-2 flex items-center justify-between">
              <span>Berikut adalah semua kosakata yang termasuk dalam proyek ini. Anda dapat mengelola kata dan set di sini.</span>
              <div className="flex items-center space-x-2">
                <Select onValueChange={(value: "all" | "new" | "learning" | "due" | "mastered" | "forgotten") => setSrsFilter(value)} defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter SRS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kata</SelectItem>
                    <SelectItem value="new">Kata Baru</SelectItem>
                    <SelectItem value="learning">Sedang Dipelajari</SelectItem>
                    <SelectItem value="due">Jatuh Tempo</SelectItem>
                    <SelectItem value="mastered">Dikuasai</SelectItem>
                    <SelectItem value="forgotten">Lupa</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="px-2 py-1 h-auto text-xs"
                >
                  Nama {getSortIcon('name')}
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('wordCount')}
                  className="px-2 py-1 h-auto text-xs"
                >
                  Jumlah Kata {getSortIcon('wordCount')}
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('createdAt')}
                  className="px-2 py-1 h-auto text-xs"
                >
                  Tanggal Dibuat {getSortIcon('createdAt')}
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {projectId && (
              <AddVocabularyToProjectDialog
                projectId={projectId}
                allSets={vocabularySets}
                projectSetIds={project.setIds}
                onAddSets={addSetsToProject}
              >
                <Button>
                  <Plus className="mr-2" />
                  Tambah Kosakata
                </Button>
              </AddVocabularyToProjectDialog>
            )}
            <ExcelImporter />
          </div>
        </CardHeader>
        <CardContent>
          {projectSets.length > 0 ? (
            <>
              <VocabularySetList
                sets={paginatedSets}
                selectedSetIds={[]} // Tidak ada fungsionalitas pemilihan set di sini
                onSetSelectionChange={() => {}} // Fungsi kosong karena tidak digunakan
                 onViewDetails={() => {}} // Fungsi kosong karena tidak digunakan

                onRemoveSet={removeVocabularySet}
                onRemoveWord={removeWord}
                onEditSet={editVocabularySet}
                onEditWord={editWord}
                onAddWord={addWordToSet}
          />
              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Tidak ada kosakata dalam proyek ini.</p>
                <div className="flex items-center space-x-2 justify-center">
                  <AddVocabularyToProjectDialog
                    projectId={projectId}
                    allSets={vocabularySets}
                    projectSetIds={project.setIds}
                    onAddSets={addSetsToProject}
                  >
                    <Button>
                      <Plus className="mr-2" />
                      Tambah Kosakata Pertama Anda
                    </Button>
                  </AddVocabularyToProjectDialog>
                  <ExcelImporter />
                </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      
    </div>
  );
};

export default ProjectVocabularyListPage;
