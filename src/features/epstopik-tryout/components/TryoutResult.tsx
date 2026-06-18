import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, RotateCcw, HelpCircle, Eye, BookOpen, Headphones } from 'lucide-react';
import { TryoutResults } from '../types';
import { cn } from '@/lib/utils';

interface TryoutResultProps {
  results: TryoutResults;
  onRestart: () => void;
  onMenu: () => void;
  onReview: (index: number) => void;
  tryoutType: 'practice' | 'cbt';
}

const TryoutResult: React.FC<TryoutResultProps> = ({ results, onRestart, onMenu, onReview, tryoutType }) => {
  const [showReview, setShowReview] = useState(false);

  const readingItems = results.items.filter(item => item.q.section === 'reading');
  const listeningItems = results.items.filter(item => item.q.section === 'listening');
  
  const readingCorrect = readingItems.filter(item => item.isCorrect).length;
  const listeningCorrect = listeningItems.filter(item => item.isCorrect).length;

  return (
    <Card className="max-w-3xl mx-auto border border-border shadow-md rounded-2xl overflow-hidden bg-card text-card-foreground">
      <CardHeader className="text-center pb-6 border-b">
        <Award className="h-16 w-16 mx-auto text-primary mb-3" />
        <CardTitle className="text-3xl font-extrabold">Hasil Latihan Anda</CardTitle>
        <CardDescription>
          Evaluasi kinerja Tryout Anda
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-6 border rounded-2xl bg-card shadow-sm">
            <div className="text-4xl font-black text-primary">
              {results.score % 1 === 0 ? results.score.toFixed(0) : results.score.toFixed(1)}%
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Skor Akurasi</div>
          </div>
          <div className="p-6 border rounded-2xl bg-card shadow-sm">
            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
              {results.correctCount}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Benar</div>
          </div>
          <div className="p-6 border rounded-2xl bg-card shadow-sm">
            <div className="text-4xl font-black text-rose-600 dark:text-rose-400">
              {results.items.length - results.correctCount}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Salah</div>
          </div>
        </div>

        {/* Section Score Breakdown */}
        {readingItems.length > 0 && listeningItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
            <div className="p-4 border rounded-2xl bg-zinc-50/30 dark:bg-zinc-900/10 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">Seksi Membaca</h4>
                  <p className="text-[10px] text-zinc-400 font-bold">READING SECTION</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                  {((readingCorrect / readingItems.length) * 100).toFixed(1).replace(".0", "")}%
                </span>
                <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{readingCorrect} / {readingItems.length} Benar</p>
              </div>
            </div>

            <div className="p-4 border rounded-2xl bg-zinc-50/30 dark:bg-zinc-900/10 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">Seksi Mendengar</h4>
                  <p className="text-[10px] text-zinc-400 font-bold">LISTENING SECTION</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                  {((listeningCorrect / listeningItems.length) * 100).toFixed(1).replace(".0", "")}%
                </span>
                <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{listeningCorrect} / {listeningItems.length} Benar</p>
              </div>
            </div>
          </div>
        )}

        {/* CBT Navigation Summary Grid */}
        <div className="space-y-4 border rounded-2xl p-6 bg-zinc-50/50 dark:bg-zinc-900/10">
          <div className="text-center space-y-1">
            <h4 className="font-extrabold text-sm text-zinc-700 dark:text-zinc-300">Peta Hasil Ujian (CBT Map)</h4>
            <p className="text-xs text-zinc-400">Klik pada kotak nomor soal untuk langsung meninjau pertanyaan tersebut secara detail.</p>
          </div>
          
          {(() => {
            const renderResultBox = (item: any, idx: number) => (
              <button
                key={idx}
                onClick={() => onReview(idx)}
                className={cn(
                  "w-11 h-11 rounded-xl flex flex-col items-center justify-center font-black transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm text-xs border-2",
                  item.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20"
                )}
              >
                <span className="text-sm">{idx + 1}</span>
                <span className="text-[7px] font-bold uppercase tracking-tighter -mt-0.5">
                  {item.isCorrect ? "OK" : "NO"}
                </span>
              </button>
            );

            return tryoutType === 'cbt' ? (
              <div className="space-y-6">
                {/* Check if there are reading items */}
                {results.items.some(item => item.q.section === 'reading') && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 border-b pb-1.5 justify-start">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Seksi Membaca (Reading)</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start py-1">
                      {results.items.map((item, idx) => {
                        if (item.q.section !== 'reading') return null;
                        return renderResultBox(item, idx);
                      })}
                    </div>
                  </div>
                )}

                {/* Check if there are listening items */}
                {results.items.some(item => item.q.section === 'listening') && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 border-b pb-1.5 justify-start">
                      <Headphones className="h-4 w-4 text-purple-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Seksi Mendengar (Listening)</span>
                    </div>
                    <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start py-1">
                      {results.items.map((item, idx) => {
                        if (item.q.section !== 'listening') return null;
                        return renderResultBox(item, idx);
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5 justify-center py-2">
                {results.items.map((item, idx) => renderResultBox(item, idx))}
              </div>
            );
          })()}
          
          <div className="flex justify-center pt-2">
            <Button
              onClick={() => onReview(0)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-widest px-6 h-10 rounded-xl flex items-center gap-2 shadow"
            >
              <Eye className="h-4 w-4" /> Mulai Tinjau Interaktif (CBT Mode)
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="font-bold text-lg flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
              <HelpCircle className="h-5 w-5 text-zinc-400" />
              Tinjau Soal Ringkas
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowReview(!showReview)}
              className="text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              {showReview ? "Sembunyikan" : "Tampilkan Ringkasan"}
            </Button>
          </div>

          {showReview && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {results.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "p-4 border rounded-2xl text-sm flex flex-col gap-3 transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-800",
                    item.isCorrect 
                      ? 'border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-950/10' 
                      : 'border-rose-100 bg-rose-50/30 dark:border-rose-900/30 dark:bg-rose-950/10'
                  )}
                  onClick={() => onReview(idx)}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      Bab {item.q.chapter} · #{item.q.question_number}
                    </span>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      item.isCorrect ? 'text-emerald-600' : 'text-rose-600'
                    )}>
                      {item.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  {item.q.question_text && (
                    <p className="line-clamp-2 text-zinc-500 dark:text-zinc-400 text-xs italic leading-relaxed">
                      "{item.q.question_text}"
                    </p>
                  )}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-400">Jawaban Anda:</span>
                      <span className={cn(
                        "font-bold",
                        item.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                      )}>
                        {item.userAns !== undefined ? `Opsi ${item.userAns}` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-400">Kunci Jawaban:</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        {item.correctAns !== null ? `Opsi ${item.correctAns}` : 'Unset'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-6 flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={onMenu} className="w-full sm:w-auto h-11 rounded-xl font-bold">
          Menu Utama
        </Button>
        <Button onClick={onRestart} className="w-full sm:w-auto h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold flex items-center gap-2 shadow-md">
          <RotateCcw className="h-4 w-4" /> Ulangi Tryout
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TryoutResult;
