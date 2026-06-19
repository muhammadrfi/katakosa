import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Type, Shuffle, Globe, BookOpen, Play, Calendar, Monitor } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { PictureQuizMode, PictureQuizLang } from '../types';
import { cn } from '@/lib/utils';

interface PictureQuizStartScreenProps {
  totalItems: number;
  onStart: (count: number, mode: PictureQuizMode, lang: PictureQuizLang, instantFeedback: boolean) => void;
  chapterSelectionMode: 'all' | 'range';
  setChapterSelectionMode: (val: 'all' | 'range') => void;
  selectedChapters: number[];
  setSelectedChapters: (val: number[]) => void;
}

const MODE_OPTIONS: { mode: PictureQuizMode; label: string; description: string; icon: React.ReactNode }[] = [
  {
    mode: 'image-to-text',
    label: 'Gambar → Kata',
    description: 'Lihat gambar, tebak artinya',
    icon: <ImageIcon className="h-5 w-5" />,
  },
  {
    mode: 'text-to-image',
    label: 'Kata → Gambar',
    description: 'Baca kata, pilih gambar yang tepat',
    icon: <Type className="h-5 w-5" />,
  },
  {
    mode: 'mixed',
    label: 'Campuran',
    description: 'Keduanya diacak bergantian',
    icon: <Shuffle className="h-5 w-5" />,
  },
];

const PictureQuizStartScreen = ({
  totalItems,
  onStart,
  chapterSelectionMode,
  setChapterSelectionMode,
  selectedChapters,
  setSelectedChapters,
}: PictureQuizStartScreenProps) => {
  const [count, setCount] = useState(20);
  const [mode, setMode] = useState<PictureQuizMode>('image-to-text');
  const [lang, setLang] = useState<PictureQuizLang>('indonesian');
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);

  // Sync count to not exceed totalItems dynamically
  useEffect(() => {
    if (totalItems > 0) {
      if (count > totalItems) {
        setCount(totalItems);
      } else if (count < Math.min(5, totalItems)) {
        setCount(Math.min(5, totalItems));
      }
    } else {
      setCount(0);
    }
  }, [totalItems]);

  return (
    <div className="container mx-auto px-4 md:px-0">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <ImageIcon className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Kuis Kosakata Gambar</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Uji hafalan kosakata EPS-TOPIK 1-60 dengan visual gambar resmi.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope Settings (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border shadow-sm">
            <CardHeader>
              <CardTitle className="font-extrabold text-xl flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span>1. Cakupan Soal</span>
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                Tentukan batasan materi bab, mode pertanyaan, serta bahasa jawaban kuis.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Chapter Selection */}
              <div className="space-y-3">
                <Label htmlFor="chapter-mode" className="text-sm font-semibold text-foreground">Materi Bab Ujian</Label>
                <Select value={chapterSelectionMode} onValueChange={(val) => setChapterSelectionMode(val as 'all' | 'range')}>
                  <SelectTrigger id="chapter-mode" className="w-full h-11 rounded-xl">
                    <SelectValue placeholder="Pilih Cakupan Bab" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Bab (1-60)</SelectItem>
                    <SelectItem value="range">Pilih Bab Spesifik</SelectItem>
                  </SelectContent>
                </Select>

                {chapterSelectionMode === 'range' && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between font-bold h-11 px-4 border border-input rounded-xl bg-background text-foreground hover:bg-muted/50"
                        >
                          <span>
                            {selectedChapters.length === 0
                              ? "Tidak ada bab terpilih"
                              : selectedChapters.length === 60
                                ? "Semua Bab Terpilih (1-60)"
                                : `${selectedChapters.length} Bab Terpilih`}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2 font-normal truncate max-w-[200px] hidden sm:inline">
                            {selectedChapters.length > 0 && selectedChapters.length <= 5
                              ? `Bab ${[...selectedChapters].sort((a, b) => a - b).join(', ')}`
                              : selectedChapters.length > 5
                                ? `Bab ${[...selectedChapters].sort((a, b) => a - b).slice(0, 5).join(', ')}...`
                                : ""}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[320px] p-4 rounded-2xl shadow-xl z-[120]" align="start">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Pilih Bab (1-60)</span>
                            <span className="text-xs font-bold text-primary">{selectedChapters.length} Terpilih</span>
                          </div>

                          {/* Quick shortcuts */}
                          <div className="grid grid-cols-2 gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-[10px] font-bold h-8 rounded-lg"
                              onClick={() => setSelectedChapters(Array.from({ length: 60 }, (_, i) => i + 1))}
                            >
                              Pilih Semua
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-[10px] font-bold h-8 rounded-lg"
                              onClick={() => setSelectedChapters([])}
                            >
                              Kosongkan
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[10px] font-bold h-8 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                              onClick={() => setSelectedChapters(Array.from({ length: 30 }, (_, i) => i + 1))}
                            >
                              Jilid 1 (1-30)
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[10px] font-bold h-8 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                              onClick={() => setSelectedChapters(Array.from({ length: 30 }, (_, i) => i + 31))}
                            >
                              Jilid 2 (31-60)
                            </Button>
                          </div>

                          <div className="h-[1px] bg-border" />

                          {/* Grid 60 Chapters */}
                          <div className="grid grid-cols-6 gap-1 max-h-[200px] overflow-y-auto custom-scrollbar p-0.5">
                            {Array.from({ length: 60 }, (_, i) => i + 1).map((ch) => {
                              const isChecked = selectedChapters.includes(ch);
                              return (
                                <button
                                  key={ch}
                                  type="button"
                                  onClick={() => {
                                    if (isChecked) {
                                      setSelectedChapters(selectedChapters.filter(c => c !== ch));
                                    } else {
                                      setSelectedChapters([...selectedChapters, ch]);
                                    }
                                  }}
                                  className={`h-8 w-full text-xs font-bold rounded-lg border transition-all ${
                                    isChecked
                                      ? "bg-primary border-primary text-primary-foreground shadow-sm font-black"
                                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                                  }`}
                                >
                                  {ch}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Mode Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Mode Soal</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {MODE_OPTIONS.map(opt => (
                    <button
                      key={opt.mode}
                      onClick={() => setMode(opt.mode)}
                      className={cn(
                        'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200',
                        mode === opt.mode
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-muted/40'
                      )}
                    >
                      <span className={cn('p-2 rounded-lg shrink-0', mode === opt.mode ? 'bg-primary/20' : 'bg-muted')}>
                        {opt.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">{opt.label}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{opt.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Toggle (only relevant for image→text mode) */}
              {mode !== 'text-to-image' && (
                <div className="space-y-3 pt-2">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" /> Bahasa Pilihan Jawaban
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {([['indonesian', 'Indonesia 🇮🇩'], ['korean', 'Korea 🇰🇷']] as [PictureQuizLang, string][]).map(([l, label]) => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className={cn(
                          'py-2.5 rounded-xl border text-xs font-bold transition-all duration-200',
                          lang === l
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-border bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Exam Rules & Actions */}
        <div className="space-y-6">
          <Card className="rounded-3xl border shadow-sm flex flex-col justify-between h-full bg-card">
            <div>
              <CardHeader>
                <CardTitle className="font-extrabold text-xl flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  <span>2. Aturan Kuis</span>
                </CardTitle>
                <CardDescription className="text-zinc-500 text-xs">
                  Atur jumlah soal kuis dan pilih mode simulasi.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Question Limit Stepper */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground flex justify-between items-center">
                    <span>Jumlah Soal Kuis</span>
                    {totalItems > 0 ? (
                      <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                        {totalItems} Kosakata Tersedia
                      </span>
                    ) : (
                      <span className="bg-destructive/10 text-destructive px-2.5 py-0.5 rounded-full text-xs font-bold">
                        0 Soal
                      </span>
                    )}
                  </Label>

                  {totalItems > 0 ? (
                    <div className="space-y-4">
                      {/* Stepper Input */}
                      <div className="flex items-center justify-between border border-border rounded-xl p-1 bg-background h-11 max-w-[220px] mx-auto gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setCount(Math.max(5, count - 1))}
                          disabled={count <= 5}
                          className="h-9 w-9 rounded-lg hover:bg-muted font-bold text-lg select-none"
                        >
                          -
                        </Button>
                        <div className="flex items-center justify-center font-extrabold text-sm font-mono text-foreground">
                          <input
                            type="number"
                            min={Math.min(5, totalItems)}
                            max={totalItems}
                            value={count || ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Number(e.target.value);
                              if (val > totalItems) {
                                setCount(totalItems);
                              } else {
                                setCount(val);
                              }
                            }}
                            onBlur={() => {
                              const minVal = Math.min(5, totalItems);
                              if (count < minVal) {
                                setCount(minVal);
                              }
                            }}
                            className="w-10 text-center bg-transparent border-none focus:outline-none focus:ring-0 p-0 font-extrabold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="select-none text-muted-foreground font-semibold text-xs ml-0.5">Soal</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setCount(Math.min(totalItems, count + 1))}
                          disabled={count >= totalItems}
                          className="h-9 w-9 rounded-lg hover:bg-muted font-bold text-lg select-none"
                        >
                          +
                        </Button>
                      </div>

                      {/* Quick select pills */}
                      <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                        {[5, 10, 20, 40].map((num) => {
                          if (num > totalItems) return null;
                          const isCurrent = count === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setCount(num)}
                              className={`py-1 px-3 text-[10px] font-bold rounded-full border transition-all ${
                                isCurrent
                                  ? "bg-primary border-primary text-primary-foreground shadow-sm font-extrabold"
                                  : "bg-background border-border text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              {num} Soal
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => setCount(totalItems)}
                          className={`py-1 px-3 text-[10px] font-bold rounded-full border transition-all ${
                            count === totalItems
                              ? "bg-primary border-primary text-primary-foreground shadow-sm font-extrabold"
                              : "bg-background border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          Maks ({totalItems})
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      Pilih setidaknya 1 Bab yang berisi kosakata bergambar.
                    </div>
                  )}
                </div>

                {/* Koreksi Instan Toggle Switch */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                  <div className="space-y-0.5 pr-2">
                    <Label className="font-bold text-xs text-foreground">Koreksi Instan</Label>
                    <p className="text-[10px] text-muted-foreground">Tampilkan kunci & bunyi jawaban saat menjawab</p>
                  </div>
                  <Switch checked={instantFeedback} onCheckedChange={setInstantFeedback} />
                </div>
              </CardContent>
            </div>

            <CardFooter className="border-t p-4 flex mt-auto">
              <Button
                onClick={() => onStart(count, mode, mode === 'text-to-image' ? 'indonesian' : lang, instantFeedback)}
                disabled={totalItems === 0 || count <= 0}
                className="flex-grow h-11 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4" />
                <span>Mulai Kuis Gambar</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Simple Label helper component to prevent import breaks
const Label = ({ htmlFor, className, children }: { htmlFor?: string; className?: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>
    {children}
  </label>
);

export default PictureQuizStartScreen;
