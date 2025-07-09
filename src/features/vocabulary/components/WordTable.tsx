
import React, { useState } from 'react';
import { WordPair } from '../vocabulary.types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Pencil, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWordTableLogic } from '../useWordTableLogic'; // Import custom hook
import { ArrowUpDown } from 'lucide-react';


interface WordTableProps {
  words: WordPair[];
  onRemoveWord: (wordId: string) => void;
  onEditWord: (wordId: string, newWord: { bahasaA: string; bahasaB: string }) => void;

}

const EditWordDialog = ({ word, onEditWord, children }: { word: WordPair, onEditWord: WordTableProps['onEditWord'], children: React.ReactNode }) => {
  const [editedWord, setEditedWord] = useState({ bahasaA: word.bahasaA, bahasaB: word.bahasaB });

  const handleSave = () => {
    if (editedWord.bahasaA.trim() && editedWord.bahasaB.trim()) {
      onEditWord(word.id, editedWord);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Kata</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bahasaA-edit">Bahasa A</Label>
            <Input id="bahasaA-edit" value={editedWord.bahasaA} onChange={(e) => setEditedWord({ ...editedWord, bahasaA: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bahasaB-edit">Bahasa B (Terjemahan)</Label>
            <Input id="bahasaB-edit" value={editedWord.bahasaB} onChange={(e) => setEditedWord({ ...editedWord, bahasaB: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Batal</Button>
          </DialogClose>
          <DialogClose asChild>
             <Button type="submit" onClick={handleSave}>Simpan</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const WordTable = ({ words, onRemoveWord, onEditWord }: WordTableProps) => {
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
    const maxPagesToShow = 5; // Jumlah maksimal angka halaman yang akan ditampilkan

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust startPage if endPage is less than maxPagesToShow
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink isActive={1 === currentPage} onClick={() => handlePageChange(1)}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(<PaginationEllipsis key="ellipsis-start" />);
      }
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

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
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
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Cari kosakata..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1); // Reset to first page on search
        }}
        className="mb-4"
      />

      <div className="flex items-center space-x-2 mb-4">
        <Select onValueChange={(value) => setAlphabetFilter(value === 'all' ? null : value)} value={alphabetFilter || 'all'}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Abjad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
              <SelectItem key={letter} value={letter.toLowerCase()}>{letter}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={toggleSwapLanguage} variant="outline">
          Tukar Bahasa ({swapLanguage ? 'B-A' : 'A-B'})
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">No.</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('bahasaA')}
                className="px-0 hover:bg-transparent"
              >
                Bahasa A
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {getSortIcon('bahasaA')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('bahasaB')}
                className="px-0 hover:bg-transparent"
              >
                Bahasa B (Terjemahan)
                <ArrowUpDown className="ml-2 h-4 w-4" />
                {getSortIcon('bahasaB')}
              </Button>
            </TableHead>
            <TableHead className="text-right w-[120px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentWords.map((word, index) => (
            <TableRow key={word.id}>
              <TableCell className="font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
              <TableCell>{word.bahasaA}</TableCell>
              <TableCell>{word.bahasaB}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-0">
                  <EditWordDialog word={word} onEditWord={onEditWord}>
                    <Button variant="ghost" size="icon" className="hover:text-primary h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </EditWordDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini akan menghapus kata <span className="font-semibold">"{word.bahasaA}"</span> secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onRemoveWord(word.id)} className="bg-destructive hover:bg-destructive/90">
                          Ya, Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {words.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="items-per-page">Kata per halaman:</Label>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
      )}
    </div>
  );
};

export default WordTable;
