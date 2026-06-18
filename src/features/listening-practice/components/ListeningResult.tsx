import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="container mx-auto px-4 py-8 max-w-xl animate-fade-in space-y-6">
        <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden text-center">
            <CardHeader className="pt-8 pb-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <Award className="w-8 h-8 text-emerald-500 animate-bounce" />
                </div>
                <CardTitle className="text-2xl font-black text-foreground">Latihan Selesai!</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">Hasil evaluasi mendengarkan Anda:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-8 flex flex-col items-center">
                <div className="bg-slate-50 dark:bg-slate-900 border border-border rounded-xl p-4 text-center w-full max-w-sm">
                  <span className="text-xs text-muted-foreground block mb-1">Skor Akhir</span>
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{score} / {totalQuestions}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                    <Button onClick={onRestart} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl py-5 shadow-sm">
                      <RotateCcw className="h-4 w-4 mr-2" /> Coba Lagi
                    </Button>
                    {projectId && (
                      <Button variant="outline" asChild className="flex-1 border-border hover:bg-muted text-muted-foreground font-bold rounded-xl py-5">
                        <Link to={`/latihan/${projectId}`}>
                          <Home className="h-4 w-4 mr-2" /> Proyek
                        </Link>
                      </Button>
                    )}
                </div>
            </CardContent>
        </Card>

        {incorrectlyAnsweredWords.length > 0 && (
            <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border/40 pb-4 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2 rounded-full border border-blue-500/20">
                          <Lightbulb className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-foreground">Evaluasi Salah</CardTitle>
                          <CardDescription className="text-muted-foreground text-xs mt-0.5">Daftar kata yang perlu Anda pelajari kembali:</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-72 overflow-y-auto">
                      <Table>
                          <TableHeader className="bg-slate-50/20 dark:bg-slate-900/10 sticky top-0">
                              <TableRow>
                                <TableHead className="font-semibold py-3 pl-6">Kata Asal (Didengar)</TableHead>
                                <TableHead className="font-semibold py-3 pr-6">Terjemahan Benar</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {incorrectlyAnsweredWords.map((word) => (
                                <TableRow key={word.id} className="hover:bg-muted/40">
                                    <TableCell className="py-3.5 pl-6 font-medium text-foreground">{word.bahasaA}</TableCell>
                                    <TableCell className="py-3.5 pr-6 font-semibold text-emerald-600 dark:text-emerald-400">{word.bahasaB}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
};

export default ListeningResult;
