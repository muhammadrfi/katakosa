import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  BookText,
  Search,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  X,
  ArrowLeft,
  BookImage,
  Languages,
  Info,
  Sparkles,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAiStore } from '@/hooks/useAiStore';
import ImportTextbookVocabDialog from './components/ImportTextbookVocabDialog';
import { toast } from 'sonner';

interface TextbookVocabItem {
  korean: string;
  english: string;
  indonesian: string;
  page: number;
  chapter: number;
  book: number;
}

interface GrammarExample {
  korean: string;
  indonesian: string;
}

interface TextbookGrammarItem {
  chapter: number;
  book: number;
  grammar: string;
  meaning: string;
  explanation: string;
  examples: GrammarExample[];
}

interface VisualChapter {
  chapter: number;
  title: string;
  vocab1_img: string;
  vocab2_img: string;
  culture_img: string;
  book: number;
}

interface GranularItem {
  korean: string;
  indonesian: string;
  image: string | null;
}

interface GranularSection {
  title: string;
  type: 'vocab' | 'culture';
  items?: GranularItem[];
  content?: string;
  images?: string[];
  main_image?: string | null; // Tambahkan ini
  culture_pairs?: { korean: string; indonesian: string }[]; // Tambahkan ini agar tidak error
}

interface DetailedChapter {
  chapter: number;
  sections: GranularSection[];
}

interface CultureChapterCardProps {
  chapter: number;
  title: string;
  onSelect: (chapter: string) => void;
  onTanyaCulture: (title: string, koreanText: string, indonesianText: string) => void;
}

const CultureChapterCard = ({ chapter, title, onSelect, onTanyaCulture }: CultureChapterCardProps) => {
  const [sections, setSections] = useState<GranularSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/data/textbook_culture_ch${chapter}.json`);
        if (res.ok) {
          const data = await res.json();
          setSections(data.sections || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [chapter]);

  const cultureSections = sections.filter(s => s.type === 'culture');

  return (
    <div className="space-y-4 border-b pb-8 last:border-b-0">
      <div 
        onClick={() => onSelect(chapter.toString())}
        className="flex items-center justify-between cursor-pointer group hover:text-primary transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-primary text-primary-foreground rounded-lg font-bold text-lg">
            Bab {chapter}
          </div>
          <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          Detail Bab →
        </Button>
      </div>

      {loading ? (
        <div className="h-24 bg-muted/20 animate-pulse rounded-xl" />
      ) : cultureSections.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 mt-2">
          {cultureSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
              <div className="text-center space-y-1.5 py-1">
                <h4 className="font-extrabold text-base text-indigo-900 dark:text-indigo-200 tracking-tight">
                  {section.title}
                </h4>
                <div className="w-16 h-0.5 bg-primary/60 mx-auto rounded-full" />
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-50/60 dark:border-slate-800/80 shadow-sm space-y-5">
                {section.culture_pairs && section.culture_pairs.length > 0 ? (
                  section.culture_pairs.map((pair, pIdx) => (
                    <div key={pIdx} className="space-y-2">
                      <div className="text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-pretendard">
                        {pair.korean}
                      </div>
                      <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {pair.indonesian}
                      </div>
                      {pIdx < section.culture_pairs.length - 1 && (
                        <div className="border-b border-slate-100 dark:border-slate-800/50 pt-3" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium font-pretendard">
                    {section.content}
                  </div>
                )}
                
                <div className="pt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onTanyaCulture(
                      section.title || "Budaya Bab Ini", 
                      section.culture_pairs?.map(p => p.korean).join('\n') || section.content || "",
                      section.culture_pairs?.map(p => p.indonesian).join('\n') || section.content || ""
                    )}
                    className="rounded-full h-8 px-4 text-xs font-bold flex items-center gap-1.5 border-indigo-200 dark:border-slate-800 hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 transition-all text-indigo-600 dark:text-indigo-400 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tanya AI tentang Budaya Ini</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic pl-4">
          Tidak ada materi budaya untuk bab ini.
        </div>
      )}
    </div>
  );
};

const ITEMS_PER_PAGE = 25;

const TextbookMaterialPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'vocab';

  const { setSidebarOpen, createSession, askSidebar } = useAiStore();

  const handleTanyaVocab = async (korean: string, indonesian: string) => {
    createSession(`Tanya AI: Kosakata "${korean}"`, 'vocab');
    setSidebarOpen(true);
    
    const userDisplayMsg = `Jelaskan kosakata "${korean}" (${indonesian}) bab ini.`;
    const hiddenPrompt = `Tolong jelaskan kosakata bahasa Korea berikut dengan fokus utama pada materi textbook EPS-TOPIK:
Kata: "${korean}"
Arti: "${indonesian}"

Berikan penjelasan terstruktur:
1. ARTI & CONTOH (Berikan pelafalan natural, makna dasar sesuai textbook, dan 2 contoh kalimat praktis konteks industri/pekerjaan manufaktur Korea beserta terjemahannya).
2. JEMBATAN KELEDAI (Mnemonic unik atau tips mudah mengingat kata ini).
3. POLA SOAL UJIAN (Jelaskan bagaimana kata "${korean}" ini biasanya diuji dalam soal EPS-TOPIK, misalnya dalam tipe soal mencocokkan gambar, melengkapi kalimat rumpang/빈칸, atau soal persamaan/lawan kata).

PENTING: Pastikan penjelasan berakar pada konteks ujian EPS-TOPIK dan gunakan spasi baris baru ganda agar nyaman dibaca.`;

    await askSidebar(userDisplayMsg, hiddenPrompt);
  };

  const handleTanyaVocabList = async (book: string, chapter: string, items: TextbookVocabItem[]) => {
    const title = chapter !== 'Semua Bab' ? `${book} ${chapter}` : 'Daftar Kosakata Pilihan';
    createSession(`Tanya AI: Kosakata ${title}`, 'vocab');
    setSidebarOpen(true);

    const limitedItems = items.slice(0, 15);
    const formattedList = limitedItems.map((item, idx) => {
      return `${idx + 1}. ${item.korean} (${item.indonesian}) - Bab ${item.chapter}`;
    }).join('\n');

    const userDisplayMsg = `Jelaskan ringkasan kosakata untuk "${title}".`;
    const hiddenPrompt = `Tolong jelaskan daftar kosakata textbook EPS-TOPIK berikut secara menarik, ringkas, dan fokus pada persiapan ujian:
Daftar Kosakata (${title}):
${formattedList}
${items.length > 15 ? `(Dan ${items.length - 15} kata lainnya di bab/halaman ini)` : ''}

Berikan penjelasan terstruktur:
1. ARTI & CONTOH KALIMAT (Pilih 2-3 kosakata paling krusial/sering keluar dari daftar di atas, lalu jelaskan maknanya secara mendalam serta berikan contoh kalimat praktis dwibahasa Korea-Indonesia).
2. KELOMPOK TEMA (Kelompokkan kata-kata di atas ke dalam kategori/tema utama agar lebih mudah dihafalkan secara sistematis).
3. POLA SOAL UJIAN (Jelaskan bagaimana kelompok kosakata pada bab/jilid ini biasanya keluar dalam soal EPS-TOPIK, dan berikan tips cara cepat mencocokkan kata kunci tanpa membaca seluruh soal).

PENTING: Jawab secara padat, batasi penjelasan maksimal 2-3 kalimat per bagian, fokus pada ujian, dan gunakan jarak spasi baris baru ganda agar nyaman dibaca.`;

    await askSidebar(userDisplayMsg, hiddenPrompt);
  };

  const handleTanyaVocabSection = async (title: string, items: GranularItem[]) => {
    createSession(`Tanya AI: ${title}`, 'vocab');
    setSidebarOpen(true);

    const formattedList = items.map((item, idx) => {
      return `${idx + 1}. ${item.korean} (${item.indonesian})`;
    }).join('\n');

    const userDisplayMsg = `Jelaskan materi kosakata untuk "${title}".`;
    const hiddenPrompt = `Tolong jelaskan kelompok kosakata textbook EPS-TOPIK berikut secara terfokus:
Materi: "${title}"
Daftar Kata:
${formattedList}

Berikan penjelasan terstruktur:
1. INTISARI TOPIK (Jelaskan mengapa kata-kata ini dikelompokkan bersama dan kegunaan utamanya dalam percakapan sehari-hari/industri di Korea).
2. CONTOH KALIMAT UJIAN (Berikan 2 contoh dialog pendek dwibahasa Korea-Indonesia menggunakan kata-kata di atas sesuai gaya soal ujian).
3. POLA SOAL UJIAN (Jelaskan bagaimana kelompok kosakata "${title}" ini biasanya keluar di ujian EPS-TOPIK, misalnya tipe soal memilih gambar pekerjaan/alat, melengkapi kalimat rumpang/빈칸, atau pemahaman bagan).

PENTING: Fokuskan penjelasan pada bahan ujian EPS-TOPIK, batasi perluasan yang tidak perlu, dan gunakan spasi baris baru ganda agar tidak rapat/dempet.`;

    await askSidebar(userDisplayMsg, hiddenPrompt);
  };

  const handleTanyaCulture = async (title: string, koreanText: string, indonesianText: string) => {
    const displayTitle = title || "Budaya Bab Ini";
    createSession(`Tanya AI: Budaya "${displayTitle.slice(0, 20)}..."`, 'culture');
    setSidebarOpen(true);
    
    const userDisplayMsg = `Jelaskan budaya tentang "${displayTitle}".`;
    const hiddenPrompt = `Tolong berikan penjelasan tambahan mengenai topik budaya Korea berikut dengan tetap berakar kuat pada data textbook EPS-TOPIK:
Topik: "${displayTitle}"
Penjelasan Asli Textbook:
- Bahasa Korea: "${koreanText}"
- Bahasa Indonesia: "${indonesianText}"

Berikan penjelasan terstruktur:
1. RINGKASAN BUDAYA (Jelaskan poin-poin penting dari penjelasan asli di atas secara padat dan mudah dipahami).
2. FUN FACTS & INFORMASI TAMBAHAN (Berikan 2 fakta menarik yang relevan untuk memperdalam pemahaman tanpa meluas terlalu jauh).
3. POLA SOAL UJIAN (Jelaskan bagaimana topik budaya "${displayTitle}" ini biasanya diuji dalam soal membaca/reading EPS-TOPIK, misalnya soal memilih pernyataan yang sesuai dengan isi teks/내용과 같은 것, atau menjawab pertanyaan tentang informasi penting).

PENTING: Fokuskan penjelasan untuk membantu menjawab soal ujian, hindari bahasan umum yang tidak relevan dengan EPS-TOPIK, dan gunakan jarak spasi baris baru ganda agar nyaman dibaca.`;

    await askSidebar(userDisplayMsg, hiddenPrompt);
  };

  const handleTanyaGrammar = async (grammar: string, meaning: string, explanation: string) => {
    createSession(`Tanya AI: Tata Bahasa "${grammar}"`, 'vocab');
    setSidebarOpen(true);

    const userDisplayMsg = `Jelaskan tata bahasa "${grammar}" (${meaning}).`;
    const hiddenPrompt = `Tolong jelaskan tata bahasa Korea textbook EPS-TOPIK berikut secara ramah dan terfokus:
Tata Bahasa: "${grammar}"
Arti: "${meaning}"
Penjelasan Singkat: "${explanation}"

Berikan penjelasan terstruktur:
1. ATURAN PENGGUNAAN (Makna dasar, fungsi utama, dan cara penggabungannya/konjugasi dengan kata kerja/kata sifat secara ringkas).
2. CONTOH KALIMAT UJIAN (Berikan 2 contoh kalimat dwibahasa Korea-Indonesia lainnya yang sering keluar dalam model soal ujian).
3. POLA SOAL UJIAN (Jelaskan bagaimana tata bahasa "${grammar}" ini biasanya diuji dalam soal EPS-TOPIK, misalnya tipe soal melengkapi kalimat rumpang/빈칸, memilih kalimat yang gramatikalnya benar, atau melengkapi dialog/대화).

PENTING: Fokuskan pembahasan pada kesiapan ujian EPS-TOPIK dan gunakan jarak spasi baris baru ganda agar nyaman dibaca.`;

    await askSidebar(userDisplayMsg, hiddenPrompt);
  };

  // Data states
  const [vocabData, setVocabData] = useState<TextbookVocabItem[]>([]);
  const [grammarData, setGrammarData] = useState<TextbookGrammarItem[]>([]);
  const [visualData, setVisualData] = useState<VisualChapter[]>([]);
  const [detailedChapter, setDetailedChapter] = useState<DetailedChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filter states - Vocab
  const [vocabSearch, setVocabSearch] = useState('');
  const [vocabBook, setVocabBook] = useState<string>('all');
  const [vocabChapter, setVocabChapter] = useState<string>('all');
  const [vocabPage, setVocabPage] = useState(1);

  // Filter states - Grammar
  const [grammarSearch, setGrammarSearch] = useState('');
  const [grammarBook, setGrammarBook] = useState<string>('all');
  const [grammarChapter, setGrammarChapter] = useState<string>('all');

  // Filter states - Visual
  const [visualBook, setVisualBook] = useState<string>('all');
  const [visualChapter, setVisualChapter] = useState<string>('all');

  // Filter states - Culture
  const [cultureBook, setCultureBook] = useState<string>('all');
  const [cultureChapter, setCultureChapter] = useState<string>('all');
  const [detailedCultureChapter, setDetailedCultureChapter] = useState<DetailedChapter | null>(null);
  const [loadingCultureDetail, setLoadingCultureDetail] = useState(false);

  // Interactive states
  const [selectedVocabKeys, setSelectedVocabKeys] = useState<string[]>([]);
  const [expandedGrammarKeys, setExpandedGrammarKeys] = useState<string[]>([]);

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [vocabRes, grammarRes, visualRes] = await Promise.all([
          fetch('/data/textbook_vocabulary.json'),
          fetch('/data/textbook_grammar.json'),
          fetch('/data/textbook_chapters_visual.json'),
        ]);

        if (vocabRes.ok && grammarRes.ok) {
          const vocab = await vocabRes.json();
          const grammar = await grammarRes.json();
          setVocabData(vocab);
          setGrammarData(grammar);
        }
        
        if (visualRes.ok) {
          const visual = await visualRes.json();
          setVisualData(visual);
        }
      } catch (err) {
        console.error(err);
        toast.error('Error memuat data materi buku.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle Tab changes (sync with search params)
  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val });
  };

  // Chapter options list based on selected book
  const chapterOptions = useMemo(() => {
    const list = [];
    if (vocabBook === '1') {
      for (let i = 1; i <= 30; i++) list.push(i);
    } else if (vocabBook === '2') {
      for (let i = 31; i <= 60; i++) list.push(i);
    } else {
      for (let i = 1; i <= 60; i++) list.push(i);
    }
    return list;
  }, [vocabBook]);

  const grammarChapterOptions = useMemo(() => {
    const list = [];
    if (grammarBook === '1') {
      for (let i = 1; i <= 30; i++) list.push(i);
    } else if (grammarBook === '2') {
      for (let i = 31; i <= 60; i++) list.push(i);
    } else {
      for (let i = 1; i <= 60; i++) list.push(i);
    }
    return list;
  }, [grammarBook]);

  // Vocab filtering
  const filteredVocab = useMemo(() => {
    return vocabData.filter(item => {
      // Search filter (Korean, Indonesian, or English)
      const matchesSearch =
        vocabSearch.trim() === '' ||
        item.korean.toLowerCase().includes(vocabSearch.toLowerCase()) ||
        item.indonesian.toLowerCase().includes(vocabSearch.toLowerCase()) ||
        item.english.toLowerCase().includes(vocabSearch.toLowerCase());

      // Book filter
      const matchesBook =
        vocabBook === 'all' || item.book.toString() === vocabBook;

      // Chapter filter
      const matchesChapter =
        vocabChapter === 'all' || item.chapter.toString() === vocabChapter;

      return matchesSearch && matchesBook && matchesChapter;
    });
  }, [vocabData, vocabSearch, vocabBook, vocabChapter]);

  // Vocab pagination
  const vocabPageCount = useMemo(() => {
    return Math.ceil(filteredVocab.length / ITEMS_PER_PAGE);
  }, [filteredVocab.length]);

  const paginatedVocab = useMemo(() => {
    const startIdx = (vocabPage - 1) * ITEMS_PER_PAGE;
    return filteredVocab.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredVocab, vocabPage]);

  // Reset page when filters change
  useEffect(() => {
    setVocabPage(1);
  }, [vocabSearch, vocabBook, vocabChapter]);

  // Fetch granular data when chapter is selected in Visual tab
  useEffect(() => {
    const loadDetail = async () => {
      if (visualChapter === 'all') {
        setDetailedChapter(null);
        return;
      }
      
      try {
        setLoadingDetail(true);
        const res = await fetch(`/data/textbook_visual_ch${visualChapter}.json`);
        if (res.ok) {
          const data = await res.json();
          setDetailedChapter(data);
        } else {
          setDetailedChapter(null);
        }
      } catch (err) {
        setDetailedChapter(null);
      } finally {
        setLoadingDetail(false);
      }
    };
    loadDetail();
  }, [visualChapter]);

  // Fetch granular data when chapter is selected in Culture tab
  useEffect(() => {
    const loadCultureDetail = async () => {
      if (cultureChapter === 'all') {
        setDetailedCultureChapter(null);
        return;
      }
      
      try {
        setLoadingCultureDetail(true);
        const res = await fetch(`/data/textbook_culture_ch${cultureChapter}.json`);
        if (res.ok) {
          const data = await res.json();
          setDetailedCultureChapter(data);
        } else {
          setDetailedCultureChapter(null);
        }
      } catch (err) {
        setDetailedCultureChapter(null);
      } finally {
        setLoadingCultureDetail(false);
      }
    };
    loadCultureDetail();
  }, [cultureChapter]);

  // Selection helpers
  const handleSelectWord = (itemKey: string) => {
    setSelectedVocabKeys(prev =>
      prev.includes(itemKey)
        ? prev.filter(k => k !== itemKey)
        : [...prev, itemKey]
    );
  };

  const handleSelectAllCurrentPage = (checked: boolean) => {
    const pageKeys = paginatedVocab.map(item => `${item.korean}_${item.book}_${item.chapter}`);
    if (checked) {
      setSelectedVocabKeys(prev => Array.from(new Set([...prev, ...pageKeys])));
    } else {
      setSelectedVocabKeys(prev => prev.filter(k => !pageKeys.includes(k)));
    }
  };

  const isAllCurrentPageSelected = useMemo(() => {
    if (paginatedVocab.length === 0) return false;
    const pageKeys = paginatedVocab.map(item => `${item.korean}_${item.book}_${item.chapter}`);
    return pageKeys.every(k => selectedVocabKeys.includes(k));
  }, [paginatedVocab, selectedVocabKeys]);

  const selectedWordsData = useMemo(() => {
    return vocabData
      .filter(item => {
        const key = `${item.korean}_${item.book}_${item.chapter}`;
        return selectedVocabKeys.includes(key);
      })
      .map(item => ({
        korean: item.korean,
        indonesian: item.indonesian,
        chapter: item.chapter,
        book: item.book,
      }));
  }, [vocabData, selectedVocabKeys]);

  // Grammar filtering
  const filteredGrammar = useMemo(() => {
    return grammarData.filter(item => {
      const matchesSearch =
        grammarSearch.trim() === '' ||
        item.grammar.toLowerCase().includes(grammarSearch.toLowerCase()) ||
        item.meaning.toLowerCase().includes(grammarSearch.toLowerCase()) ||
        item.explanation.toLowerCase().includes(grammarSearch.toLowerCase());

      const matchesBook =
        grammarBook === 'all' || item.book.toString() === grammarBook;

      const matchesChapter =
        grammarChapter === 'all' || item.chapter.toString() === grammarChapter;

      return matchesSearch && matchesBook && matchesChapter;
    });
  }, [grammarData, grammarSearch, grammarBook, grammarChapter]);

  // Visual filtering
  const filteredVisual = useMemo(() => {
    return visualData.filter(item => {
      const matchesBook = visualBook === 'all' || item.book.toString() === visualBook;
      const matchesChapter = visualChapter === 'all' || item.chapter.toString() === visualChapter;
      return matchesBook && matchesChapter;
    });
  }, [visualData, visualBook, visualChapter]);

  const visualChapterOptions = useMemo(() => {
    const list = [];
    if (visualBook === '1') {
      for (let i = 1; i <= 30; i++) list.push(i);
    } else if (visualBook === '2') {
      for (let i = 31; i <= 60; i++) list.push(i);
    } else {
      for (let i = 1; i <= 60; i++) list.push(i);
    }
    return list;
  }, [visualBook]);

  // Culture filtering
  const filteredCulture = useMemo(() => {
    return visualData.filter(item => {
      const matchesBook = cultureBook === 'all' || item.book.toString() === cultureBook;
      const matchesChapter = cultureChapter === 'all' || item.chapter.toString() === cultureChapter;
      return matchesBook && matchesChapter;
    });
  }, [visualData, cultureBook, cultureChapter]);

  const cultureChapterOptions = useMemo(() => {
    const list = [];
    if (cultureBook === '1') {
      for (let i = 1; i <= 30; i++) list.push(i);
    } else if (cultureBook === '2') {
      for (let i = 31; i <= 60; i++) list.push(i);
    } else {
      for (let i = 1; i <= 60; i++) list.push(i);
    }
    return list;
  }, [cultureBook]);

  // Expanded grammar helper
  const toggleGrammar = (key: string) => {
    setExpandedGrammarKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-6 text-center text-muted-foreground animate-pulse">
        <GraduationCap className="w-12 h-12 mx-auto mb-4 text-primary animate-bounce" />
        <p className="text-lg font-medium">Memuat data kurikulum standard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Materi Standard Textbook</h1>
            <p className="text-muted-foreground mt-1">
              Daftar kosakata resmi dan tata bahasa lengkap dari Standard Textbook EPS-TOPIK Jilid 1 & 2.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1 max-w-[850px] gap-1 bg-muted">
          <TabsTrigger value="vocab" className="py-2 md:py-1.5 flex items-center justify-center gap-2">
            <BookText className="w-4 h-4" />
            <span>Kosakata Indeks</span>
          </TabsTrigger>
          <TabsTrigger value="grammar" className="py-2 md:py-1.5 flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Tata Bahasa <span className="hidden md:inline">(문법)</span></span>
          </TabsTrigger>
          <TabsTrigger value="visual" className="py-2 md:py-1.5 flex items-center justify-center gap-2">
            <BookImage className="w-4 h-4" />
            <span>Visual Kosakata <span className="hidden md:inline">(어휘 그림)</span></span>
          </TabsTrigger>
          <TabsTrigger value="culture" className="py-2 md:py-1.5 flex items-center justify-center gap-2">
            <Languages className="w-4 h-4" />
            <span>Budaya & Info <span className="hidden md:inline">(문화와 정보)</span></span>
          </TabsTrigger>
        </TabsList>

        {/* ======================================================== */}
        {/* TAB 1: KOSAKATA INDEKS */}
        {/* ======================================================== */}
        <TabsContent value="vocab" className="space-y-6 animate-in fade-in duration-200">
          <Card>
            <CardHeader>
              <CardTitle>Kosakata Indeks Buku (어휘 색인)</CardTitle>
              <CardDescription>
                Cari kosakata standard, saring berdasarkan bab/jilid buku, dan impor kata-kata pilihan langsung ke proyek latihan Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                {/* Search */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="vocab-search">Pencarian Kata</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="vocab-search"
                      value={vocabSearch}
                      onChange={e => setVocabSearch(e.target.value)}
                      placeholder="Cari dalam Hangeul, Indonesia, atau Inggris..."
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Book Filter */}
                <div className="space-y-1.5">
                  <Label htmlFor="vocab-book">Jilid Buku</Label>
                  <Select value={vocabBook} onValueChange={(val) => {
                    setVocabBook(val);
                    setVocabChapter('all');
                  }}>
                    <SelectTrigger id="vocab-book">
                      <SelectValue placeholder="Semua Buku" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jilid</SelectItem>
                      <SelectItem value="1">Jilid 1 (Bab 1-30)</SelectItem>
                      <SelectItem value="2">Jilid 2 (Bab 31-60)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Chapter Filter */}
                <div className="space-y-1.5">
                  <Label htmlFor="vocab-chapter">Bab Buku</Label>
                  <Select value={vocabChapter} onValueChange={setVocabChapter}>
                    <SelectTrigger id="vocab-chapter">
                      <SelectValue placeholder="Semua Bab" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Bab</SelectItem>
                      {chapterOptions.map(ch => (
                        <SelectItem key={ch} value={ch.toString()}>
                          Bab {ch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* AI Vocabulary Analyst Button */}
              {filteredVocab.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTanyaVocabList(
                      vocabBook !== 'all' ? `Jilid ${vocabBook}` : 'Semua Jilid',
                      vocabChapter !== 'all' ? `Bab ${vocabChapter}` : 'Semua Bab',
                      paginatedVocab
                    )}
                    className="rounded-full h-8 px-4 text-xs font-bold flex items-center gap-1.5 border-primary/20 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all shadow-sm text-primary"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span>Tanya AI tentang Kosakata Ini ({vocabChapter !== 'all' ? `Bab ${vocabChapter}` : 'Terfilter'})</span>
                  </Button>
                </div>
              )}

              {/* Selection Floating Toolbar */}
              {selectedVocabKeys.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-primary/10 border-2 border-primary/20 rounded-lg animate-in slide-in-from-top-4 duration-200">
                  <div className="text-sm font-semibold text-primary">
                    Terpilih {selectedVocabKeys.length} kosakata
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedVocabKeys([])}
                      size="sm"
                      className="text-xs text-muted-foreground"
                    >
                      Batal Pilihan
                    </Button>
                    <ImportTextbookVocabDialog
                      selectedWords={selectedWordsData}
                      onSuccess={() => {
                        setSelectedVocabKeys([]);
                        toast.success('Kosakata berhasil diimpor!');
                      }}
                    >
                      <Button size="sm">Impor ke Set Latihan</Button>
                    </ImportTextbookVocabDialog>
                  </div>
                </div>
              )}

              {/* Vocabulary Table */}
              {paginatedVocab.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm border-collapse text-left">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="p-3 w-12 text-center">
                          <Checkbox
                            checked={isAllCurrentPageSelected}
                            onCheckedChange={handleSelectAllCurrentPage}
                          />
                        </th>
                        <th className="p-3 font-semibold">Bahasa Korea</th>
                        <th className="p-3 font-semibold">Terjemahan Indonesia</th>
                        <th className="p-3 font-semibold hidden md:table-cell">Bahasa Inggris</th>
                        <th className="p-3 font-semibold text-center w-24">Buku / Bab</th>
                        <th className="p-3 font-semibold text-center w-20 hidden sm:table-cell">Halaman</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedVocab.map(item => {
                        const itemKey = `${item.korean}_${item.book}_${item.chapter}`;
                        const isChecked = selectedVocabKeys.includes(itemKey);
                        return (
                          <tr
                            key={itemKey}
                            onClick={() => handleSelectWord(itemKey)}
                            className={`border-b hover:bg-muted/30 transition-colors cursor-pointer ${
                              isChecked ? 'bg-primary/5' : ''
                            }`}
                          >
                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => handleSelectWord(itemKey)}
                              />
                            </td>
                            <td className="p-3 font-bold text-base text-foreground font-pretendard">
                              {item.korean}
                            </td>
                            <td className="p-3 text-muted-foreground font-medium">
                              {item.indonesian}
                            </td>
                            <td className="p-3 text-xs text-muted-foreground/80 italic hidden md:table-cell">
                              {item.english}
                            </td>
                            <td className="p-3 text-center text-xs font-semibold text-slate-500">
                              Jilid {item.book} • Bab {item.chapter}
                            </td>
                            <td className="p-3 text-center text-xs text-muted-foreground hidden sm:table-cell">
                              hlm {item.page}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                  <Info className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                  <p className="font-medium">Tidak ada kosakata yang cocok dengan pencarian Anda.</p>
                  <p className="text-xs mt-1">Coba sesuaikan kata kunci atau saringannya.</p>
                </div>
              )}

              {/* Pagination Controls */}
              {vocabPageCount > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="text-xs text-muted-foreground">
                    Menampilkan {(vocabPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(vocabPage * ITEMS_PER_PAGE, filteredVocab.length)} dari {filteredVocab.length} kata
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVocabPage(prev => Math.max(1, prev - 1))}
                      disabled={vocabPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, vocabPageCount) }, (_, idx) => {
                        let pageNum = vocabPage - 2 + idx;
                        if (vocabPage <= 2) pageNum = idx + 1;
                        if (vocabPage >= vocabPageCount - 1) pageNum = vocabPageCount - 4 + idx;
                        if (pageNum < 1 || pageNum > vocabPageCount) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={vocabPage === pageNum ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setVocabPage(pageNum)}
                            className="w-8 h-8 text-xs"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVocabPage(prev => Math.min(vocabPageCount, prev + 1))}
                      disabled={vocabPage === vocabPageCount}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 2: TATA BAHASA */}
        {/* ======================================================== */}
        <TabsContent value="grammar" className="space-y-6 animate-in fade-in duration-200">
          <Card>
            <CardHeader>
              <CardTitle>Tata Bahasa Textbook (문법)</CardTitle>
              <CardDescription>
                Pelajari 120 tata bahasa resmi dari Jilid 1 & 2 lengkap dengan penjelasan pola konjugasi dan contoh kalimat dwibahasa Korea-Indonesia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                {/* Search */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="grammar-search">Pencarian Tata Bahasa</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="grammar-search"
                      value={grammarSearch}
                      onChange={e => setGrammarSearch(e.target.value)}
                      placeholder="Cari pola tata bahasa atau artinya..."
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Book Filter */}
                <div className="space-y-1.5">
                  <Label htmlFor="grammar-book">Jilid Buku</Label>
                  <Select value={grammarBook} onValueChange={(val) => {
                    setGrammarBook(val);
                    setGrammarChapter('all');
                  }}>
                    <SelectTrigger id="grammar-book">
                      <SelectValue placeholder="Semua Buku" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jilid</SelectItem>
                      <SelectItem value="1">Jilid 1 (Bab 1-30)</SelectItem>
                      <SelectItem value="2">Jilid 2 (Bab 31-60)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Chapter Filter */}
                <div className="space-y-1.5">
                  <Label htmlFor="grammar-chapter">Bab Buku</Label>
                  <Select value={grammarChapter} onValueChange={setGrammarChapter}>
                    <SelectTrigger id="grammar-chapter">
                      <SelectValue placeholder="Semua Bab" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Bab</SelectItem>
                      {grammarChapterOptions.map(ch => (
                        <SelectItem key={ch} value={ch.toString()}>
                          Bab {ch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Grammar Accordion List */}
              {filteredGrammar.length > 0 ? (
                <div className="space-y-4">
                  {filteredGrammar.map(item => {
                    const itemKey = `${item.grammar}_${item.book}_${item.chapter}`;
                    const isExpanded = expandedGrammarKeys.includes(itemKey);
                    return (
                      <div
                        key={itemKey}
                        className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                          isExpanded
                            ? 'ring-1 ring-primary border-primary bg-primary/[0.01]'
                            : 'hover:border-slate-300 dark:hover:border-slate-700 bg-card'
                        }`}
                      >
                        {/* Header */}
                        <div
                          onClick={() => toggleGrammar(itemKey)}
                          className="flex items-center justify-between p-4 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-4 flex-grow min-w-0">
                            {/* Chapter Tag */}
                            <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-bold text-xs shrink-0">
                              Bab {item.chapter}
                            </div>
                            {/* Grammar Form */}
                            <div className="font-extrabold text-lg text-primary truncate">
                              {item.grammar}
                            </div>
                            {/* Meaning */}
                            <div className="text-muted-foreground text-sm truncate hidden sm:block">
                              — {item.meaning}
                            </div>
                          </div>
                          <div className="ml-4 shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTanyaGrammar(item.grammar, item.meaning, item.explanation)}
                              className="h-8 w-8 p-0 rounded-full text-zinc-500 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10"
                              title="Tanya AI tentang Tata Bahasa Ini"
                            >
                              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                            </Button>
                            <div className="text-muted-foreground cursor-pointer" onClick={() => toggleGrammar(itemKey)}>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="p-5 border-t space-y-4 animate-in slide-in-from-top-4 duration-200">
                            {/* Meaning (Mobile/Small screen backup) */}
                            <div className="sm:hidden block">
                              <span className="text-xs font-semibold text-muted-foreground">ARTI:</span>
                              <p className="text-sm font-semibold mt-0.5">{item.meaning}</p>
                            </div>

                            {/* Explanation */}
                            <div className="space-y-1">
                              <h4 className="text-xs font-extrabold tracking-wider text-muted-foreground uppercase">
                                Penjelasan Penggunaan
                              </h4>
                              <p className="text-sm leading-relaxed text-foreground/90">
                                {item.explanation}
                              </p>
                            </div>

                            {/* Example Sentences */}
                            {item.examples && item.examples.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-extrabold tracking-wider text-muted-foreground uppercase">
                                  Contoh Kalimat
                                </h4>
                                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                                  {item.examples.map((ex, idx) => (
                                    <div
                                      key={idx}
                                      className="border-b last:border-b-0 pb-2.5 last:pb-0 space-y-1"
                                    >
                                      <div className="font-bold text-base text-primary/95 font-pretendard">
                                        {ex.korean}
                                      </div>
                                      <div className="text-sm text-muted-foreground font-medium">
                                        {ex.indonesian}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="pt-2 flex justify-end border-t border-zinc-100 dark:border-zinc-850/30">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleTanyaGrammar(item.grammar, item.meaning, item.explanation)}
                                className="rounded-full h-8 px-4 text-xs font-bold flex items-center gap-1.5 border-indigo-200 dark:border-slate-800 hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 transition-all text-indigo-600 dark:text-indigo-400 shadow-sm"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Tanya AI tentang Tata Bahasa Ini</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed animate-in fade-in duration-200">
                  <Info className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                  <p className="font-medium">Tidak ada tata bahasa yang cocok dengan pencarian Anda.</p>
                  <p className="text-xs mt-1">Coba sesuaikan kata kunci atau saringannya.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 3: VISUAL VOCABULARY */}
        {/* ======================================================== */}
        <TabsContent value="visual" className="space-y-6 animate-in fade-in duration-200">
          <Card>
            <CardHeader>
              <CardTitle>Visual Kosakata Per Bab (어휘 그림)</CardTitle>
              <CardDescription>
                Lihat halaman asli kosakata bergambar (Kosakata 1 & 2) serta visual kartu kosakata digital per bab.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                {/* Book Filter */}
                <div className="space-y-1.5">
                  <Label htmlFor="visual-book">Jilid Buku</Label>
                  <Select value={visualBook} onValueChange={(val) => {
                    setVisualBook(val);
                    setVisualChapter('all');
                  }}>
                    <SelectTrigger id="visual-book">
                      <SelectValue placeholder="Semua Buku" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jilid</SelectItem>
                      <SelectItem value="1">Jilid 1 (Bab 1-30)</SelectItem>
                      <SelectItem value="2">Jilid 2 (Bab 31-60)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Chapter Filter */}
                <div className="space-y-1.5">
                  <Label htmlFor="visual-chapter">Pilih Bab</Label>
                  <Select value={visualChapter} onValueChange={setVisualChapter}>
                    <SelectTrigger id="visual-chapter">
                      <SelectValue placeholder="Pilih Bab" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tampilkan Semua Bab</SelectItem>
                      {visualChapterOptions.map(ch => (
                        <SelectItem key={ch} value={ch.toString()}>
                          Bab {ch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Visual Content */}
              <div className="space-y-10">
                {loadingDetail ? (
                  <div className="text-center py-20 animate-pulse">
                    <BookImage className="w-12 h-12 mx-auto mb-4 text-primary/40 animate-bounce" />
                    <p className="text-muted-foreground">Membangun kartu digital...</p>
                  </div>
                ) : detailedChapter ? (
                  <div className="space-y-12">
                    {(() => {
                      const vocabSections = detailedChapter.sections.filter(s => s.type === 'vocab');
                      if (vocabSections.length === 0) {
                        return (
                          <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                            <BookImage className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                            <p className="font-medium">Tidak ada visual kosakata untuk bab ini.</p>
                          </div>
                        );
                      }
                      return vocabSections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-6">
                          <div className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-6 bg-primary rounded-full" />
                              <h3 className="text-xl font-bold text-foreground">
                                {section.title}
                              </h3>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleTanyaVocabSection(section.title, section.items || [])}
                              className="rounded-full h-8 px-3 text-xs font-bold flex items-center gap-1.5 border-primary/20 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all shadow-sm text-primary"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                              <span>Tanya AI tentang {section.title}</span>
                            </Button>
                          </div>
                          
                          <div className="space-y-6">
                            {section.main_image && (
                              <div className="flex justify-center mb-6">
                                <div className="rounded-2xl border-4 border-primary/10 overflow-hidden shadow-xl bg-white max-w-3xl w-full">
                                  <img 
                                    src={section.main_image} 
                                    alt={section.title}
                                    className="w-full h-auto object-contain"
                                  />
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {section.items ? section.items.map((item, iIdx) => {
                                const hasImage = item.image && item.image.trim() !== "";
                                if (hasImage) {
                                  return (
                                    <div 
                                      key={iIdx} 
                                      className="group bg-card border rounded-xl p-3 flex flex-col items-center text-center gap-3 hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                                    >
                                      <div className="w-full aspect-square bg-white rounded-lg border overflow-hidden flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                                        <img 
                                          src={item.image!} 
                                          alt={item.korean}
                                          className="w-full h-full object-contain"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <div className="font-extrabold text-lg text-primary font-pretendard">
                                          {item.korean}
                                        </div>
                                        <div className="text-sm font-medium text-muted-foreground leading-tight">
                                          {item.indonesian}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div 
                                      key={iIdx} 
                                      className="group bg-muted/10 dark:bg-muted/5 border border-border border-l-4 border-l-primary/60 rounded-xl p-4 flex flex-col justify-center items-center text-center min-h-[135px] hover:shadow-md hover:border-primary/30 transition-all duration-300"
                                    >
                                      <div className="space-y-2">
                                        <div className="font-extrabold text-xl text-primary font-pretendard">
                                          {item.korean}
                                        </div>
                                        <div className="text-sm font-semibold text-muted-foreground leading-tight">
                                          {item.indonesian}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              }) : null}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : filteredVisual.length > 0 ? (
                  filteredVisual.map(item => (
                    <div key={item.chapter} className="space-y-6 border-b pb-10 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-primary text-primary-foreground rounded-lg font-bold text-lg">
                          Bab {item.chapter}
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">
                          {item.title}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Vocabulary 1 */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary font-semibold">
                            <BookImage className="w-5 h-5" />
                            <span>Kosakata 1 (어휘 1)</span>
                          </div>
                          <div className="rounded-xl border overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                            <img 
                              src={item.vocab1_img} 
                              alt={`Bab ${item.chapter} Vocab 1`}
                              className="w-full h-auto object-contain"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          </div>
                        </div>

                        {/* Vocabulary 2 */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-primary font-semibold">
                            <BookImage className="w-5 h-5" />
                            <span>Kosakata 2 (어휘 2)</span>
                          </div>
                          <div className="rounded-xl border overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                            <img 
                              src={item.vocab2_img} 
                              alt={`Bab ${item.chapter} Vocab 2`}
                              className="w-full h-auto object-contain"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
                    <BookImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                    <p className="text-muted-foreground font-medium">Data visual belum tersedia atau tidak ditemukan.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======================================================== */}
        {/* TAB 4: CULTURE & INFORMATION */}
        {/* ======================================================== */}
        <TabsContent value="culture" className="space-y-6 animate-in fade-in duration-200">
          <Card>
            <CardHeader>
              <CardTitle>Budaya & Informasi Per Bab (문화와 정보)</CardTitle>
              <CardDescription>
                Pelajari penjelasan adat istiadat, tata cara kehidupan sehari-hari, dan kebudayaan masyarakat Korea.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                {/* Book Filter */}
                <div className="space-y-1.5">
                  <Label htmlFor="culture-book">Jilid Buku</Label>
                  <Select value={cultureBook} onValueChange={(val) => {
                    setCultureBook(val);
                    setCultureChapter('all');
                  }}>
                    <SelectTrigger id="culture-book">
                      <SelectValue placeholder="Semua Buku" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jilid</SelectItem>
                      <SelectItem value="1">Jilid 1 (Bab 1-30)</SelectItem>
                      <SelectItem value="2">Jilid 2 (Bab 31-60)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Chapter Filter */}
                <div className="space-y-1.5">
                  <Label htmlFor="culture-chapter">Pilih Bab</Label>
                  <Select value={cultureChapter} onValueChange={setCultureChapter}>
                    <SelectTrigger id="culture-chapter">
                      <SelectValue placeholder="Pilih Bab" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tampilkan Semua Bab</SelectItem>
                      {cultureChapterOptions.map(ch => (
                        <SelectItem key={ch} value={ch.toString()}>
                          Bab {ch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Culture Content */}
              <div className="space-y-10">
                {loadingCultureDetail ? (
                  <div className="text-center py-20 animate-pulse">
                    <Languages className="w-12 h-12 mx-auto mb-4 text-primary/40 animate-bounce" />
                    <p className="text-muted-foreground">Memuat materi budaya...</p>
                  </div>
                ) : detailedCultureChapter ? (
                  <div className="space-y-12">
                    {(() => {
                      const cultureSections = detailedCultureChapter.sections.filter(s => s.type === 'culture');
                      if (cultureSections.length === 0) {
                        return (
                          <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                            <Languages className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                            <p className="font-medium">Materi budaya dan informasi tidak tersedia untuk bab ini.</p>
                          </div>
                        );
                      }
                      return cultureSections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-6">
                          <div className="text-center space-y-2 pb-2">
                            <h3 className="text-2xl md:text-3xl font-extrabold text-indigo-950 dark:text-indigo-100 tracking-tight">
                              {section.title}
                            </h3>
                            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
                          </div>
                          
                          <div className="space-y-8">
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-indigo-50/60 dark:border-slate-800/80 shadow-sm space-y-6">
                              {section.culture_pairs && section.culture_pairs.length > 0 ? (
                                section.culture_pairs.map((pair, pIdx) => (
                                  <div key={pIdx} className="space-y-3">
                                    <div className="text-[17px] md:text-lg font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-pretendard tracking-wide">
                                      {pair.korean}
                                    </div>
                                    <div className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                                      {pair.indonesian}
                                    </div>
                                    {pIdx < section.culture_pairs.length - 1 && (
                                      <div className="border-b border-slate-100 dark:border-slate-800/50 pt-4" />
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed text-slate-700 dark:text-slate-300 font-medium font-pretendard">
                                  {section.content}
                                </div>
                              )}
                              
                              <div className="pt-2 flex justify-end">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleTanyaCulture(
                                    section.title || "Budaya Bab Ini", 
                                    section.culture_pairs?.map(p => p.korean).join('\n') || section.content || "",
                                    section.culture_pairs?.map(p => p.indonesian).join('\n') || section.content || ""
                                  )}
                                  className="rounded-full h-8 px-4 text-xs font-bold flex items-center gap-1.5 border-indigo-200 dark:border-slate-800 hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 transition-all text-indigo-600 dark:text-indigo-400 shadow-sm"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Tanya AI tentang Budaya Ini</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : filteredCulture.length > 0 ? (
                  <div className="space-y-8">
                    {filteredCulture.map(item => (
                      <CultureChapterCard
                        key={item.chapter}
                        chapter={item.chapter}
                        title={item.title}
                        onSelect={setCultureChapter}
                        onTanyaCulture={handleTanyaCulture}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed">
                    <Languages className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                    <p className="text-muted-foreground font-medium">Data budaya belum tersedia atau tidak ditemukan.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TextbookMaterialPage;
