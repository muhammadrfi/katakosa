import { useState, useMemo, useCallback } from 'react';
import { WordPair } from '@/types/vocabulary'; // Menggunakan alias @/types/vocabulary

interface UseWordTableLogicProps {
  words: WordPair[];
}

interface UseWordTableLogicReturn {
  currentPage: number;
  itemsPerPage: number;
  searchQuery: string;
  filteredWords: WordPair[];
  currentWords: WordPair[];
  totalPages: number;
  sortColumn: keyof WordPair | null;
  sortDirection: 'asc' | 'desc';
  alphabetFilter: string | null;
  swapLanguage: boolean;
  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (value: string) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  handleSort: (column: keyof WordPair) => void;
  setAlphabetFilter: (filter: string | null) => void;
  toggleSwapLanguage: () => void;
}

export const useWordTableLogic = ({ words }: UseWordTableLogicProps): UseWordTableLogicReturn => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof WordPair | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [alphabetFilter, setAlphabetFilter] = useState<string | null>(null);
  const [swapLanguage, setSwapLanguage] = useState(false);

  const filteredWords = useMemo(() => {
    let currentWords = words;

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      currentWords = currentWords.filter(word =>
        word.bahasaA.toLowerCase().includes(lowerCaseQuery) ||
        word.bahasaB.toLowerCase().includes(lowerCaseQuery)
      );
    }

    if (alphabetFilter) {
      currentWords = currentWords.filter(word =>
        (swapLanguage ? word.bahasaB : word.bahasaA).toLowerCase().startsWith(alphabetFilter.toLowerCase())
      );
    }

    if (!searchQuery && !alphabetFilter) {
      currentWords = words;
    }

    // Remove duplicate sort logic
    // The previous code had duplicate sort logic, this removes the first one
    // and keeps the more comprehensive one below.

    // This part was duplicated and is now removed.
    // if (sortColumn) {
    //   return [...filtered].sort((a, b) => {
    //     const aValue = a[sortColumn];
    //     const bValue = b[sortColumn];

    //     if (typeof aValue === 'string' && typeof bValue === 'string') {
    //       return sortDirection === 'asc'
    //         ? aValue.localeCompare(bValue)
    //         : bValue.localeCompare(aValue);
    //     }
    //     return 0;
    //   });
    // }

    // The remaining sort logic will be applied to currentWords
    const sortedWords = [...currentWords];

    if (sortColumn) {
      sortedWords.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      });
    } else {
      // Default sort by bahasaA alphabetically if no sortColumn is set
      sortedWords.sort((a, b) => a.bahasaA.localeCompare(b.bahasaA));
    }

    return sortedWords;
  }, [words, searchQuery, alphabetFilter, swapLanguage, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWords = useMemo(() => filteredWords.slice(startIndex, endIndex), [filteredWords, startIndex, endIndex]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when items per page changes
  }, []);

  const handleSort = useCallback((column: keyof WordPair) => {
    setCurrentPage(1); // Reset to first page on sort
    setSortColumn(prevColumn => {
      if (prevColumn === column) {
        setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortDirection('asc');
      }
      return column;
    });
  }, []);

  const toggleSwapLanguage = useCallback(() => {
    setSwapLanguage(prev => !prev);
    setCurrentPage(1);
    setSortColumn(null); // Reset sort when language is swapped
    setAlphabetFilter(null); // Reset alphabet filter when language is swapped
  }, []);

  return {
    currentPage,
    itemsPerPage,
    searchQuery,
    filteredWords,
    currentWords,
    totalPages,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchQuery,
    setCurrentPage,
    sortColumn,
    sortDirection,
    handleSort,
    alphabetFilter,
    swapLanguage,
    setAlphabetFilter,
    toggleSwapLanguage,
  };
};