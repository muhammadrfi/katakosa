import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sparkles, RotateCcw, ArrowLeft, GraduationCap, Monitor, Headphones, BookOpen, Clock, ClipboardList, ShieldAlert, Trash2, Calendar, Award, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CbtDurationMode, CbtSection, TryoutHistoryItem, TryoutSession, TryoutType } from '../types';
import PictureQuizPage from '../../picture-quiz/PictureQuizPage';

interface TryoutSetupProps {
  allQuestionsCount: number;
  chapterSelectionMode: 'all' | 'range';
  setChapterSelectionMode: (val: 'all' | 'range') => void;
  selectedChapters: number[];
  setSelectedChapters: (val: number[]) => void;
  selectedSection: 'all' | 'reading' | 'listening';
  setSelectedSection: (val: 'all' | 'reading' | 'listening') => void;
  selectedTypes: string[];
  setSelectedTypes: (val: string[]) => void;
  questionCount: number;
  setQuestionCount: (val: number) => void;
  isExamMode: boolean;
  setIsExamMode: (val: boolean) => void;
  instantFeedback: boolean;
  setInstantFeedback: (val: boolean) => void;
  isBlankOptions: boolean;
  setIsBlankOptions: (val: boolean) => void;
  filteredQuestionsCount: number;
  onStart: () => void;
  onResetOverrides: () => void;
  tryoutType: 'practice' | 'cbt';
  setTryoutType: (val: 'practice' | 'cbt') => void;
  cbtSection: 'mix' | 'reading' | 'listening';
  setCbtSection: (val: 'mix' | 'reading' | 'listening') => void;
  cbtQuestionCount: number;
  setCbtQuestionCount: (val: number) => void;
  cbtDurationMode: 'official' | '30' | '40' | '50' | '60';
  setCbtDurationMode: (val: 'official' | '30' | '40' | '50' | '60') => void;
  savedSession: TryoutSession | null;
  restoreSession: () => void;
  clearActiveSession: () => void;
  historyList: TryoutHistoryItem[];
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

const TryoutSetup: React.FC<TryoutSetupProps> = ({
  allQuestionsCount,
  chapterSelectionMode, setChapterSelectionMode,
  selectedChapters, setSelectedChapters,
  selectedSection, setSelectedSection,
  selectedTypes, setSelectedTypes,
  questionCount, setQuestionCount,
  isExamMode, setIsExamMode,
  instantFeedback, setInstantFeedback,
  filteredQuestionsCount,
  onStart, onResetOverrides,
  isBlankOptions, setIsBlankOptions,
  tryoutType, setTryoutType,
  cbtSection, setCbtSection,
  cbtQuestionCount, setCbtQuestionCount,
  cbtDurationMode, setCbtDurationMode,
  savedSession, restoreSession, clearActiveSession,
  historyList, deleteHistoryItem, clearHistory
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (filteredQuestionsCount > 0) {
      if (questionCount > filteredQuestionsCount) {
        setQuestionCount(filteredQuestionsCount);
      } else if (questionCount < Math.min(5, filteredQuestionsCount)) {
        setQuestionCount(Math.min(5, filteredQuestionsCount));
      }
    } else {
      setQuestionCount(0);
    }
  }, [filteredQuestionsCount, setQuestionCount, questionCount]);

  return (
    <div className="container mx-auto py-4 px-0 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Setup Tryout EPS-TOPIK</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Atur cakupan materi bab, jenis ujian, dan parameter simulasi resmi.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="self-start md:self-center font-bold text-muted-foreground hover:text-primary gap-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Button>
      </div>

      {savedSession && (
        <Card className="rounded-3xl border border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-sm mb-8 overflow-hidden animate-in slide-in-from-top duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/15 rounded-xl shrink-0 mt-0.5 sm:mt-0">
                  <Monitor className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground flex items-center gap-2">
                    Sesi Ujian Tersimpan Terdeteksi
                    <span className="bg-primary/20 text-primary text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                      Belum Selesai
                    </span>
                  </h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    Anda memiliki kuis aktif ({savedSession.tryoutType === 'cbt' ? 'Simulasi CBT' : 'Latihan Fleksibel'}) dengan {savedSession.quizQuestions.length} soal di nomor {savedSession.currentIndex + 1} yang belum selesai.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Button
                  variant="outline"
                  onClick={clearActiveSession}
                  className="flex-1 sm:flex-none h-10 text-xs font-bold border-zinc-200 dark:border-zinc-800 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 rounded-xl animate-none transition-all"
                >
                  Mulai Baru
                </Button>
                <Button
                  onClick={restoreSession}
                  className="flex-grow sm:flex-none h-10 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl shadow-md gap-2 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Lanjutkan Sesi
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Segmented Control / Tabs Selector */}
      <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl mb-8 max-w-xl mx-auto sm:mx-0 border border-zinc-200/50 dark:border-zinc-800/50 shadow-inner">
        <button
          type="button"
          onClick={() => setTryoutType('practice')}
          className={`flex-1 py-3 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
            tryoutType === 'practice'
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm scale-[1.02]"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Latihan Fleksibel</span>
        </button>
        <button
          type="button"
          onClick={() => setTryoutType('cbt')}
          className={`flex-1 py-3 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
            tryoutType === 'cbt'
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm scale-[1.02]"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <Monitor className="w-4 h-4 shrink-0" />
          <span>Simulasi Ujian CBT</span>
        </button>
        <button
          type="button"
          onClick={() => setTryoutType('picture-quiz')}
          className={`flex-1 py-3 px-4 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 ${
            tryoutType === 'picture-quiz'
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm scale-[1.02]"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <ImageIcon className="w-4 h-4 shrink-0" />
          <span>Kuis Kosakata Gambar</span>
        </button>
      </div>

      {tryoutType === 'picture-quiz' ? (
        <div className="animate-in fade-in duration-300">
          <PictureQuizPage embeddedMode={true} />
        </div>
      ) : tryoutType === 'cbt' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Left Column: CBT Parameters (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-3xl border shadow-sm">
              <CardHeader>
                <CardTitle className="font-extrabold text-xl flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  <span>1. Parameter Ujian CBT</span>
                </CardTitle>
                <CardDescription className="text-zinc-500 text-xs">
                  Pilih konfigurasi seksi soal, total pertanyaan, dan durasi pengerjaan.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* CBT Section Selection */}
                <div className="space-y-3">
                  <Label htmlFor="cbt-section" className="text-sm font-semibold text-foreground">Seksi Pertanyaan</Label>
                  <Select value={cbtSection} onValueChange={(val) => setCbtSection(val as CbtSection)}>
                    <SelectTrigger id="cbt-section" className="w-full h-11 rounded-xl">
                      <SelectValue placeholder="Pilih Seksi Ujian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mix">Campuran (Mix Membaca + Mendengar)</SelectItem>
                      <SelectItem value="reading">Membaca (Reading Only)</SelectItem>
                      <SelectItem value="listening">Mendengar (Listening Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* CBT Question Count */}
                <div className="space-y-3">
                  <Label htmlFor="cbt-count" className="text-sm font-semibold text-foreground">Jumlah Soal Ujian</Label>
                  <Select value={String(cbtQuestionCount)} onValueChange={(val) => setCbtQuestionCount(Number(val))}>
                    <SelectTrigger id="cbt-count" className="w-full h-11 rounded-xl">
                      <SelectValue placeholder="Pilih Jumlah Soal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="40">40 Soal (Ujian Resmi)</SelectItem>
                      <SelectItem value="20">20 Soal</SelectItem>
                      <SelectItem value="25">25 Soal</SelectItem>
                    </SelectContent>
                  </Select>
                  {cbtSection === "mix" && (
                    <p className="text-[10px] text-zinc-400 font-bold">
                      * Otomatis memuat tepat {Math.floor(cbtQuestionCount / 2)} soal Membaca dan {cbtQuestionCount - Math.floor(cbtQuestionCount / 2)} soal Mendengar.
                    </p>
                  )}
                </div>

                {/* CBT Time/Duration Selection */}
                <div className="space-y-3">
                  <Label htmlFor="cbt-duration" className="text-sm font-semibold text-foreground">Durasi Waktu Ujian</Label>
                  <Select value={cbtDurationMode} onValueChange={(val) => setCbtDurationMode(val as CbtDurationMode)}>
                    <SelectTrigger id="cbt-duration" className="w-full h-11 rounded-xl">
                      <SelectValue placeholder="Pilih Durasi Waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="official">Ujian Resmi (75 detik / soal - {Math.floor(cbtQuestionCount * 75 / 60)} Menit)</SelectItem>
                      <SelectItem value="30">30 Menit</SelectItem>
                      <SelectItem value="40">40 Menit</SelectItem>
                      <SelectItem value="50">50 Menit</SelectItem>
                      <SelectItem value="60">60 Menit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: CBT Rules Summary & Action */}
          <div className="space-y-6">
            <Card className="rounded-3xl border shadow-sm flex flex-col justify-between h-full bg-card">
              <div>
                <CardHeader>
                  <CardTitle className="font-extrabold text-xl flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-primary" />
                    <span>2. Ketentuan CBT</span>
                  </CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">
                    Peraturan simulasi ujian CBT resmi yang akan diterapkan.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-3.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                      <span>Timer Berjalan Mundur</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Monitor className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                      <span>Kamus & Tata Bahasa Dinonaktifkan</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Headphones className="w-4.5 h-4.5 text-purple-500 shrink-0" />
                      <span>Audio Soal Diputar Otomatis 2x</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                      <span>Soal Diacak dari Seluruh Bab 1-60</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                    <div className="space-y-0.5 pr-2">
                      <Label className="font-bold text-xs text-foreground">Koreksi Instan</Label>
                      <p className="text-[10px] text-muted-foreground">Tampilkan kunci & bunyi jawaban saat menjawab</p>
                    </div>
                    <Switch checked={instantFeedback} onCheckedChange={setInstantFeedback} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                    <div className="space-y-0.5 pr-2">
                      <Label className="font-bold text-xs text-foreground">Blank Opsi Jawaban</Label>
                      <p className="text-[10px] text-muted-foreground">Sembunyikan teks pilihan jawaban untuk soal non-gambar</p>
                    </div>
                    <Switch checked={isBlankOptions} onCheckedChange={setIsBlankOptions} />
                  </div>
                </CardContent>
              </div>

              <CardFooter className="border-t p-4 flex mt-auto">
                <Button 
                  onClick={onStart} 
                  className="flex-grow h-11 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 h-4" />
                  <span>Mulai Ujian CBT Resmi</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        /* Responsive Grid Layout */
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
                  Tentukan batasan materi bab, bagian kuis, serta tipe pertanyaan yang diujikan.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Chapter selection */}
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
                  
                  {chapterSelectionMode === "range" && (
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
                                ? `Bab ${[...selectedChapters].sort((a,b)=>a-b).join(', ')}` 
                                : selectedChapters.length > 5 
                                  ? `Bab ${[...selectedChapters].sort((a,b)=>a-b).slice(0, 5).join(', ')}...`
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
                            
                            {/* Pintasan Cepat */}
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

                            {/* Grid 60 Bab */}
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
                
                {/* Section Selection */}
                <div className="space-y-3">
                  <Label htmlFor="section-select" className="text-sm font-semibold text-foreground">Bagian Ujian</Label>
                  <Select value={selectedSection} onValueChange={(val) => setSelectedSection(val as 'all' | 'reading' | 'listening')}>
                    <SelectTrigger id="section-select" className="w-full h-11 rounded-xl">
                      <SelectValue placeholder="Pilih Bagian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Bagian (Membaca & Mendengar)</SelectItem>
                      <SelectItem value="reading">Membaca (Reading Only)</SelectItem>
                      <SelectItem value="listening">Mendengar (Listening Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Types */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Tipe Pertanyaan</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-border bg-muted/10">
                    {[
                      { id: "image", label: "Gambar" },
                      { id: "blank", label: "Rumpang" },
                      { id: "passage", label: "Cerita" },
                      { id: "grammar", label: "Bahasa" }
                    ].map((item) => {
                      const isChecked = selectedTypes.includes(item.id);
                      return (
                        <div key={item.id} className="flex items-center space-x-2.5">
                          <Checkbox 
                            id={`type-${item.id}`} 
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTypes([...selectedTypes, item.id]);
                              } else {
                                if (selectedTypes.length > 1) {
                                  setSelectedTypes(selectedTypes.filter(t => t !== item.id));
                                }
                              }
                            }}
                          />
                          <Label
                            htmlFor={`type-${item.id}`}
                            className="text-xs font-semibold cursor-pointer select-none text-muted-foreground peer-data-[state=checked]:text-foreground"
                          >
                            {item.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Exam Rules & Actions */}
          <div className="space-y-6">
            <Card className="rounded-3xl border shadow-sm flex flex-col justify-between h-full bg-card">
              <div>
                <CardHeader>
                  <CardTitle className="font-extrabold text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
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
                      <span>Jumlah Soal Ujian</span>
                      {filteredQuestionsCount > 0 ? (
                        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                          {filteredQuestionsCount} Soal Tersedia
                        </span>
                      ) : (
                        <span className="bg-destructive/10 text-destructive px-2.5 py-0.5 rounded-full text-xs font-bold">
                          0 Soal
                        </span>
                      )}
                    </Label>
                    
                    {filteredQuestionsCount > 0 ? (
                      <div className="space-y-4">
                        {/* Stepper Indikator */}
                        <div className="flex items-center justify-between border border-border rounded-xl p-1 bg-background h-11 max-w-[220px] mx-auto gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuestionCount(Math.max(5, questionCount - 1))}
                            disabled={questionCount <= 5}
                            className="h-9 w-9 rounded-lg hover:bg-muted font-bold text-lg select-none"
                          >
                            -
                          </Button>
                          <div className="flex items-center justify-center font-extrabold text-sm font-mono text-foreground">
                            <input
                              type="number"
                              min={Math.min(5, filteredQuestionsCount)}
                              max={filteredQuestionsCount}
                              value={questionCount || ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                if (val > filteredQuestionsCount) {
                                  setQuestionCount(filteredQuestionsCount);
                                } else {
                                  setQuestionCount(val);
                                }
                              }}
                              onBlur={() => {
                                const minVal = Math.min(5, filteredQuestionsCount);
                                if (questionCount < minVal) {
                                  setQuestionCount(minVal);
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
                            onClick={() => setQuestionCount(Math.min(filteredQuestionsCount, questionCount + 1))}
                            disabled={questionCount >= filteredQuestionsCount}
                            className="h-9 w-9 rounded-lg hover:bg-muted font-bold text-lg select-none"
                          >
                            +
                          </Button>
                        </div>

                        {/* Pills Pilihan Cepat */}
                        <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                          {[5, 10, 20, 40].map((num) => {
                            if (num > filteredQuestionsCount) return null;
                            const isCurrent = questionCount === num;
                            return (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setQuestionCount(num)}
                                className={`py-1 px-3 text-[10px] font-bold rounded-full border transition-all ${
                                  isCurrent
                                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                {num} Soal
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => setQuestionCount(filteredQuestionsCount)}
                            className={`py-1 px-3 text-[10px] font-bold rounded-full border transition-all ${
                              questionCount === filteredQuestionsCount
                                ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                : "bg-background border-border text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            Maks ({filteredQuestionsCount})
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-xs text-destructive font-bold py-2 bg-destructive/5 rounded-xl border border-destructive/10">
                        Tidak ada soal tersedia.
                      </p>
                    )}
                  </div>

                  {/* Mode Toggles */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                      <div className="space-y-0.5 pr-2">
                        <Label className="font-bold text-xs text-foreground">Mode Ujian</Label>
                        <p className="text-[10px] text-muted-foreground">Timer aktif & bantuan kamus mati</p>
                      </div>
                      <Switch checked={isExamMode} onCheckedChange={setIsExamMode} />
                    </div>

                    {!isExamMode && (
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card animate-in fade-in duration-200">
                        <div className="space-y-0.5 pr-2">
                          <Label className="font-bold text-xs text-foreground">Koreksi Instan</Label>
                          <p className="text-[10px] text-muted-foreground">Tampilkan kunci saat menjawab</p>
                        </div>
                        <Switch checked={instantFeedback} onCheckedChange={setInstantFeedback} />
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                      <div className="space-y-0.5 pr-2">
                        <Label className="font-bold text-xs text-foreground">Blank Opsi Jawaban</Label>
                        <p className="text-[10px] text-muted-foreground">Sembunyikan teks pilihan jawaban untuk soal non-gambar</p>
                      </div>
                      <Switch checked={isBlankOptions} onCheckedChange={setIsBlankOptions} />
                    </div>
                  </div>
                </CardContent>
              </div>
              
              <CardFooter className="border-t p-4 flex gap-3 mt-auto">
                <Button 
                  variant="outline" 
                  onClick={onResetOverrides} 
                  title="Reset Pengaturan"
                  className="h-11 border-destructive/20 dark:border-destructive/50 text-destructive hover:bg-destructive/10 font-bold px-3 rounded-xl shrink-0"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={onStart} 
                  disabled={filteredQuestionsCount === 0}
                  className="flex-grow h-11 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Mulai Simulasi</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {historyList.length > 0 && (
        <Card className="rounded-3xl border shadow-sm mt-8 overflow-hidden animate-in fade-in duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3 gap-4">
            <div>
              <CardTitle className="font-extrabold text-xl flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <span>Riwayat Hasil Tryout</span>
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs mt-0.5">
                Catatan performa ujian dan latihan mandiri Anda sebelumnya.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={clearHistory}
              className="h-9 text-xs font-bold border-destructive/20 dark:border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive/30 rounded-xl gap-1.5 px-3 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hapus Semua</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b bg-muted/40 dark:bg-muted/10 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3.5 px-6">Tanggal & Waktu</th>
                    <th className="py-3.5 px-6">Mode Ujian</th>
                    <th className="py-3.5 px-6">Seksi</th>
                    <th className="py-3.5 px-6 text-center">Skor Akhir</th>
                    <th className="py-3.5 px-6 text-center">Jawaban Benar</th>
                    <th className="py-3.5 px-6 text-center w-12">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {historyList.map((item) => {
                    // Determine badge styling based on accuracy
                    let scoreColor = "text-rose-600 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30";
                    if (item.score >= 80) {
                      scoreColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30";
                    } else if (item.score >= 60) {
                      scoreColor = "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30";
                    }

                    return (
                      <tr key={item.id} className="hover:bg-muted/30 dark:hover:bg-muted/5 transition-colors">
                        <td className="py-3.5 px-6 text-foreground font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            {item.date}
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] ${
                            item.tryoutType === 'cbt'
                              ? "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 font-bold"
                              : "text-purple-600 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30"
                          }`}>
                            {item.tryoutType === 'cbt' ? 'Simulasi CBT' : 'Latihan Fleksibel'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-muted-foreground capitalize">
                          {item.section === 'mix' ? 'Campuran' : item.section === 'reading' ? 'Membaca' : 'Mendengar'}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg border text-sm font-black font-mono ${scoreColor}`}>
                            {item.score}%
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-center text-muted-foreground font-mono font-bold">
                          {item.correctCount} <span className="text-zinc-300 dark:text-zinc-700">/</span> {item.totalQuestions}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => deleteHistoryItem(item.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TryoutSetup;
