import React, { useState, useEffect } from 'react';
import { WordPair } from '../vocabulary.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface FilteredWordListProps {
  allWords: WordPair[];
  initialFilterType: 'all' | 'new' | 'learning' | 'due' | 'mastered' | 'forgotten';
  getFilteredWords: (words: WordPair[], filter: 'all' | 'new' | 'learning' | 'due' | 'mastered' | 'forgotten') => WordPair[];
}

const FilteredWordList: React.FC<FilteredWordListProps> = ({ allWords, initialFilterType, getFilteredWords }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilter, setCurrentFilter] = useState(initialFilterType);
  const itemsPerPage = 10; // Anda bisa menyesuaikan jumlah item per halaman

  const filteredWords = React.useMemo(() => {
    return getFilteredWords(allWords, currentFilter);
  }, [allWords, currentFilter, getFilteredWords]);

  useEffect(() => {
    setCurrentPage(1); // Reset halaman ke 1 setiap kali filter atau daftar kata berubah
  }, [filteredWords]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWords.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const filterOptions = [
    { value: 'all', label: 'Semua Kata' },
    { value: 'new', label: 'Baru' },
    { value: 'learning', label: 'Belajar' },
    { value: 'due', label: 'Jatuh Tempo' },
    { value: 'mastered', label: 'Dikuasai' },
    { value: 'forgotten', label: 'Terlupakan' },
  ];

  const getFilterName = (filterValue: string) => {
    const option = filterOptions.find(opt => opt.value === filterValue);
    return option ? option.label : 'Tidak Diketahui';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Kata: {getFilterName(currentFilter)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label htmlFor="filter" className="mr-2">Filter:</label>
          <select
            id="filter"
            value={currentFilter}
            onChange={(e) => setCurrentFilter(e.target.value as any)}
            className="p-2 border rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {filteredWords.length === 0 ? (
          <p>Tidak ada kata dalam kategori ini.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bahasa A</TableHead>
                  <TableHead>Bahasa B</TableHead>
                  <TableHead>Repetisi</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Faktor Kemudahan</TableHead>
                  <TableHead>Tanggal Review Berikutnya</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map(word => (
                  <TableRow key={word.id}>
                    <TableCell>{word.bahasaA}</TableCell>
                    <TableCell>{word.bahasaB}</TableCell>
                    <TableCell>{word.repetition}</TableCell>
                    <TableCell>{word.interval} hari</TableCell>
                    <TableCell>{word.easeFactor.toFixed(2)}</TableCell>
                    <TableCell>
                      {word.nextReviewDate ? new Date(word.nextReviewDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4">
              <Button onClick={handlePrevPage} disabled={currentPage === 1} variant="outline">
                Sebelumnya
              </Button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? "default" : "outline"}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button onClick={handleNextPage} disabled={currentPage === totalPages} variant="outline">
                Berikutnya
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FilteredWordList;