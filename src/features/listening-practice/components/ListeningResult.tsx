import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, RotateCcw, Home, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { WordPair } from '../vocabulary/vocabulary.types';

interface ListeningResultProps {
  score: number;
  totalQuestions: number;
  incorrectlyAnsweredWords: WordPair[];
  onRestart: () => void;
  projectId?: string | null;
}

const ListeningResult = ({ score, totalQuestions, incorrectlyAnsweredWords, onRestart, projectId }: ListeningResultProps) => {
  return (
    <div className="animate-fade-in">
        <Card className="max-w-xl mx-auto text-center">
            <CardHeader>
                <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <CardTitle>Latihan Selesai!</CardTitle>
                <CardDescription>Skor Akhir Anda</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold mb-4">{score} / {totalQuestions}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={onRestart}><RotateCcw /> Coba Lagi</Button>
                    {projectId && <Button variant="secondary" asChild><Link to={`/latihan/${projectId}`}><Home/> Kembali ke Proyek</Link></Button>}
                </div>
            </CardContent>
        </Card>

        {incorrectlyAnsweredWords.length > 0 && (
            <Card className="mt-8 text-left max-w-xl mx-auto">
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
                            <TableHead>Kata (Didengar)</TableHead>
                            <TableHead>Jawaban Benar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incorrectlyAnsweredWords.map((word) => (
                            <TableRow key={word.id}>
                                <TableCell>{word.bahasaA}</TableCell>
                                <TableCell className="font-semibold">{word.bahasaB}</TableCell>
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

export default ListeningResult;
