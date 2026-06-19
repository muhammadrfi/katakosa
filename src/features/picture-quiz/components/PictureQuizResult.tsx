import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, RotateCcw, Home, XCircle } from 'lucide-react';
import { PictureQuizQuestion } from '../types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PictureQuizResultProps {
  score: number;
  totalQuestions: number;
  incorrectItems: PictureQuizQuestion[];
  onRestart: () => void;
}

const PictureQuizResult = ({ score, totalQuestions, incorrectItems, onRestart }: PictureQuizResultProps) => {
  const navigate = useNavigate();
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const getFeedback = () => {
    if (percentage >= 90) return { text: 'Luar biasa! 🎉', color: 'text-emerald-500' };
    if (percentage >= 75) return { text: 'Bagus sekali! 👍', color: 'text-blue-500' };
    if (percentage >= 50) return { text: 'Cukup baik, terus berlatih! 💪', color: 'text-amber-500' };
    return { text: 'Perlu lebih banyak latihan 📚', color: 'text-rose-500' };
  };

  const feedback = getFeedback();

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] px-4 py-8 space-y-6">
      {/* Score Card */}
      <Card className="w-full max-w-sm border-border/60 shadow-sm rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="text-6xl font-black text-primary mb-1">{percentage}%</div>
          <div className="text-lg font-semibold text-foreground">
            {score} / {totalQuestions} benar
          </div>
          <p className={cn('mt-2 text-sm font-medium', feedback.color)}>{feedback.text}</p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <Button onClick={onRestart} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
          <RotateCcw className="mr-2 h-4 w-4" /> Ulangi Kuis
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)} className="w-full h-12 rounded-xl" size="lg">
          <Home className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>

      {/* Wrong Answers Review */}
      {incorrectItems.length > 0 && (
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="h-5 w-5 text-rose-500" />
            <h2 className="font-semibold text-foreground">Jawaban Salah ({incorrectItems.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {incorrectItems.map(q => (
              <Card key={q.id} className="border-rose-200 dark:border-rose-900/50 rounded-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={q.item.image}
                        alt={q.item.korean}
                        className="w-full h-full object-contain p-1"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{q.item.korean}</p>
                      <p className="text-xs text-muted-foreground truncate">{q.item.indonesian}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px]">Bab {q.item.chapter}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PictureQuizResult;
