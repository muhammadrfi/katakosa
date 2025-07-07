import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VocabularySet, WordPair } from '../vocabulary.types';
import { useWordTableLogic } from '../useWordTableLogic';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

interface VocabularyDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  vocabularySet: VocabularySet | null;
}

const VocabularyDetailPopup = ({ isOpen, onClose, vocabularySet }: VocabularyDetailPopupProps) => {
  if (!vocabularySet) {
    return null;
  }

  const { words } = vocabularySet;

  const {
    currentPage,
    itemsPerPage,
    searchQuery,
    currentWords,
    totalPages,
    sortColumn,
    sortDirection,
    alphabetFilter,
    swapLanguage,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchQuery,
    setCurrentPage,
    handleSort,
    setAlphabetFilter,
    toggleSwapLanguage,
  } = useWordTableLogic({ words });

  const getSortIcon = (column: keyof WordPair) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  const renderPaginationItems = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink isActive={i === currentPage} onClick={() => handlePageChange(i)}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink isActive={1 === currentPage} onClick={() => handlePageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > maxPagesToShow - 2) {
        pages.push(<PaginationEllipsis key="ellipsis-start" />);
      }

      let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2) + 1);
      let endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPagesToShow / 2) - 1);

      if (currentPage <= Math.floor(maxPagesToShow / 2) + 1) {
        endPage = maxPagesToShow - 1;
      } else if (currentPage >= totalPages - Math.floor(maxPagesToShow / 2)) {
        startPage = totalPages - maxPagesToShow + 2;
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink isActive={i === currentPage} onClick={() => handlePageChange(i)}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - Math.floor(maxPagesToShow / 2)) {
        pages.push(<PaginationEllipsis key="ellipsis-end" />);
      }

      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink isActive={totalPages === currentPage} onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] xl:max-w-[1100px] h-[90vh] flex flex-col my-8">
        <DialogHeader>
          <DialogTitle>Detail Set Kosakata: {vocabularySet.name}</DialogTitle>
          <DialogDescription>
            Total {vocabularySet.words.length} kata.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-hidden flex flex-col">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              type="text"
              placeholder="Cari kosakata..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-grow"
            />
            <Select onValueChange={(value) => setAlphabetFilter(value === 'all' ? null : value)} value={alphabetFilter || 'all'}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter Abjad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
                  <SelectItem key={letter} value={letter}>{letter}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={toggleSwapLanguage} variant="outline">
              Tukar Bahasa ({swapLanguage ? 'B-A' : 'A-B'})
            </Button>
          </div>

          <div className="flex-grow overflow-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-1/2 cursor-pointer"
                    onClick={() => handleSort('bahasaA')}
                  >
                    Bahasa A {getSortIcon('bahasaA')}
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead
                    className="w-1/2 cursor-pointer"
                    onClick={() => handleSort('bahasaB')}
                  >
                    Bahasa B {getSortIcon('bahasaB')}
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentWords.length > 0 ? (
                  currentWords.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell className="w-1/2 break-words">{swapLanguage ? word.bahasaB : word.bahasaA}</TableCell>
                      <TableCell className="w-1/2 break-words">{swapLanguage ? word.bahasaA : word.bahasaB}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4">
                      Tidak ada kata yang ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Select onValueChange={handleItemsPerPageChange} value={String(itemsPerPage)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VocabularyDetailPopup;