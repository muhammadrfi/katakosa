import React from 'react';
import { WordPair } from '../vocabulary.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FilteredWordListProps {
  words: WordPair[];
  filterName: string;
}

const FilteredWordList: React.FC<FilteredWordListProps> = ({ words, filterName }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kata-kata: {filterName}</CardTitle>
      </CardHeader>
      <CardContent>
        {words.length === 0 ? (
          <p>Tidak ada kata dalam kategori ini.</p>
        ) : (
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
              {words.map(word => (
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
        )}
      </CardContent>
    </Card>
  );
};

export default FilteredWordList;