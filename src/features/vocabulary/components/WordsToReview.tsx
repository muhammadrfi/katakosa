
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Lightbulb, Trash2, BrainCircuit } from "lucide-react";
import { WordPair, ReviewWord } from '../vocabulary.types';
import { Link } from "react-router-dom";

interface WordsToReviewProps {
  reviewList: ReviewWord[];
  allWords: WordPair[];
  onClear: () => void;
}

const WordsToReview = ({ reviewList, allWords, onClear }: WordsToReviewProps) => {
  if (reviewList.length === 0) {
    return null;
  }

  const wordsMap = new Map(allWords.map(w => [w.id, w]));
  
  const reviewWordsData = reviewList
    .map(item => ({
      ...item,
      wordData: wordsMap.get(item.wordId),
    }))
    .filter(item => item.wordData);

  if (reviewWordsData.length === 0) {
      return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <CardTitle className="text-xl">Kosakata Perlu Diulas</CardTitle>
          </div>
          <CardDescription className="mt-2">
            Berikut adalah kata-kata yang sering Anda salah jawab.
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 self-start shrink-0">
          <Button variant="outline" size="sm" onClick={onClear} className="w-full sm:w-auto">
            <Trash2 className="mr-2 h-4 w-4" />
            Kosongkan
          </Button>
          <Button asChild size="sm" className="w-full sm:w-auto">
              <Link to="/latihan/ulasan">
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Mulai Ulasan
              </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kata</TableHead>
              <TableHead>Arti</TableHead>
              <TableHead className="text-right">Jumlah Salah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewWordsData.map((item) => (
              <TableRow key={item.wordId}>
                <TableCell>{item.wordData?.bahasaA}</TableCell>
                <TableCell>{item.wordData?.bahasaB}</TableCell>
                <TableCell className="text-right font-semibold">{item.incorrectCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WordsToReview;
