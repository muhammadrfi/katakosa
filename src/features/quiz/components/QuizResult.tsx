
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, RotateCcw, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QuizQuestion } from "../quiz";

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  incorrectAnswers: QuizQuestion[];
}

const QuizResult = ({ score, totalQuestions, onRestart, incorrectAnswers }: QuizResultProps) => {
  const navigate = useNavigate();
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="container mx-auto py-12 px-6 max-w-2xl w-full text-center animate-fade-in">
      <Card>
        <CardHeader>
          <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <CardTitle>Tes Selesai!</CardTitle>
          <CardDescription>Berikut adalah hasil Anda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-4xl font-bold">{percentage}%</div>
          <p className="text-lg">
            Anda menjawab <span className="font-bold text-green-600">{score}</span> dari <span className="font-bold">{totalQuestions}</span> pertanyaan dengan benar.
          </p>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row justify-center gap-4">
          <Button onClick={onRestart} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
          <Button onClick={() => navigate('/kosakata')}>
            Kembali ke Daftar Set
          </Button>
        </CardFooter>
      </Card>

      {incorrectAnswers.length > 0 && (
        <Card className="mt-8 text-left">
          <CardHeader>
            <div className="flex items-center gap-3">
                <Lightbulb className="w-6 h-6 text-blue-500" />
                <CardTitle className="text-xl">Kata untuk Dipelajari</CardTitle>
            </div>
            <CardDescription>Berikut adalah kata-kata yang Anda jawab salah.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kata</TableHead>
                  <TableHead>Jawaban Benar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incorrectAnswers.map((item) => (
                  <TableRow key={item.wordId}>
                    <TableCell>{item.questionWord}</TableCell>
                    <TableCell className="font-semibold">{item.correctAnswer}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizResult;
