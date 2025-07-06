import React, { useState, useMemo } from 'react';
import { WordPair } from '../vocabulary.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface FilteredWordListProps {
  words: WordPair[];
  filterName: string;
}

const ITEMS_PER_PAGE = 10;

const FilteredWordList: React.FC<FilteredWordListProps> = ({ words, filterName }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => Math.ceil(words.length / ITEMS_PER_PAGE), [words.length]);

  const currentWords = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return words.slice(startIndex, endIndex);
  }, [words, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kata-kata: {filterName}</CardTitle>
      </CardHeader>
      <CardContent>
        {words.length === 0 ? (
          <p>Tidak ada kata dalam kategori ini.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
              </Table>
            </div>
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
                {currentWords.map(word => (
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
              <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
                Sebelumnya
              </Button>
              <span>
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
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