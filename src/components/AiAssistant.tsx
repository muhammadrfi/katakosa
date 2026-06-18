import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { useAiStore } from '@/hooks/useAiStore';
import { getRelevantContext } from '@/utils/aiRetrieval';
import { askGemini } from '@/lib/gemini';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MessageSquare, Send, X, Settings, Sparkles, Bot, User, Trash2, RefreshCw, Maximize2, Minimize2, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVocabularyStore } from '@/features/vocabulary/useVocabularyStore'; 
import { useReviewListStore } from '@/features/review-practice/useReviewListStore';
import { useGamificationStore } from '@/features/dashboard/useGamificationStore';

const MessageBubble = ({ m }: { m: any }) => {
  const isUser = m.role === 'user';
  return (
    <div className={cn("flex w-full gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", isUser ? "bg-primary" : "bg-muted")}>
        {isUser ? <User className="w-4 h-4 text-primary-foreground"/> : <Bot className="w-4 h-4 text-muted-foreground"/>}
      </div>
      <div className={cn("p-4 rounded-2xl text-sm max-w-[85%] shadow-sm", isUser ? "bg-primary text-primary-foreground" : "bg-white border text-foreground")}>
        <div className="prose prose-sm max-w-none prose-headings:font-bold prose-p:my-2 prose-ul:my-2">
           <ReactMarkdown>{m.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export const AiAssistant: React.FC = () => {
  const { apiKey, setApiKey, selectedModel, setSelectedModel, history, addMessage, clearHistory } = useAiStore();
  
  const vocabulary = useVocabularyStore((state: any) => state.vocabularySets);
  const reviewList = useReviewListStore((state: any) => state.reviewList);
  
  const level = useGamificationStore((state: any) => state.level);
  const xp = useGamificationStore((state: any) => state.xp);
  const streak = useGamificationStore((state: any) => state.streak);
  const historyLogs = useGamificationStore((state: any) => state.historyLogs);

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [showSettings, setShowSettings] = useState(!apiKey);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid' | 'loading'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchModels = async () => {
    if (!apiKey) return;
    setLoadingModels(true);
    setStatus('loading');
    setErrorMsg('');
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.list();
      const modelsData = response.pageInternal || [];
      if (Array.isArray(modelsData)) {
        const geminiModels = modelsData.filter((m: any) => Array.isArray(m.supportedActions) && m.supportedActions.includes('generateContent') && m.name?.includes('gemini')).map((m: any) => m.name.replace('models/', ''));
        if (geminiModels.length === 0) { setStatus('invalid'); setErrorMsg("Tidak ada model Gemini."); return; }
        setModels(geminiModels); setStatus('valid');
        if (geminiModels.length > 0 && !geminiModels.includes(selectedModel)) setSelectedModel(geminiModels[0]);
      }
    } catch (e: any) { setStatus('invalid'); setErrorMsg(`Error: ${e.message}`); } finally { setLoadingModels(false); }
  };

  useEffect(() => { if (isOpen && apiKey && models.length === 0) fetchModels(); }, [isOpen, apiKey]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [history, isOpen, loading]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey || loading) return;
    const userMsg = input.trim();
    setInput(''); addMessage({ role: 'user', content: userMsg }); setLoading(true);
    try {
      const gamification = { level, xp, streak, historyLogs };
      const context = await getRelevantContext(userMsg, { vocabs: vocabulary, srs: reviewList, gamification });
      
      const prompt = `Anda adalah Asisten Belajar Bahasa Korea Katakosa yang mahir.
      
DATA KONTEKS:
- Seluruh Data Kosakata (untuk SRS): ${JSON.stringify(context.vocabs)}
- Progres User (Level/XP/Streak): ${JSON.stringify(gamification)}

INSTRUKSI:
1. JANGAN gunakan kalimat pembuka robotik. Langsung jawab pertanyaannya.
2. Jawab berdasarkan data progres user (Level/Streak/SRS) jika ditanya tentang progres.
3. Jika user memberikan beberapa kalimat, jelaskan setiap kalimat secara poin per poin.
4. Format tiap poin:
   - [Nomor]: [Status: Benar/Salah]
   - Kalimat: [Kalimat user]
   - Koreksi: [Kalimat yang benar (atau "Sudah benar")]
   - Penjelasan: [Alasan tata bahasa singkat].
5. Gunakan daftar poin yang bersih dengan spasi antar poin.
6. Jawaban harus padat, akurat, dan natural.

Pertanyaan User: ${userMsg}`;
      const aiRes = await askGemini(apiKey, selectedModel, prompt, history);
      addMessage({ role: 'model', content: aiRes });
    } catch (err: any) { addMessage({ role: 'model', content: `Error: ${err.message}` }); } finally { setLoading(false); }
  };

  return (
    <div className={cn("fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end", isExpanded && "inset-0 bottom-0 right-0")}>
      {isOpen ? (
        <div className={cn("bg-background border shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300", 
          isExpanded ? "w-full h-full rounded-none" : "w-[calc(100vw-2rem)] sm:w-[400px] h-[500px] sm:h-[600px] max-h-[calc(100vh-8rem)] rounded-2xl")}>
          <div className="p-4 border-b flex justify-between items-center bg-card">
            <h3 className="font-bold text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Katakosa AI</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSettings(!showSettings)}><Settings className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden bg-muted/20">
            {showSettings ? (
              <div className="p-6 space-y-4">
                <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Gemini API Key..." />
                {status !== 'idle' && (
                  <div className={cn("text-xs p-2 rounded", status === 'valid' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                    {status === 'loading' ? 'Memuat...' : status === 'valid' ? 'API Key Valid' : errorMsg}
                  </div>
                )}
                <Button size="sm" className="w-full" onClick={fetchModels}>Load Model</Button>
                {models.length > 0 && (
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value={selectedModel}>{selectedModel}</SelectItem></SelectContent>
                  </Select>
                )}
              </div>
            ) : (
              <ScrollArea className="h-full p-4"><div className="space-y-6 pb-4" ref={scrollRef}>
                  {history.map((m, i) => <MessageBubble key={i} m={m} />)}
                  {loading && <div className="text-sm text-muted-foreground animate-pulse p-2">Katakosa AI sedang berpikir...</div>}
              </div></ScrollArea>
            )}
          </div>
          <div className="p-4 border-t bg-card flex gap-2">
            <Button variant="outline" size="icon" onClick={clearHistory}><Trash2 className="w-4 h-4" /></Button>
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Tanya..." className="rounded-xl" />
            <Button size="icon" onClick={handleSend}><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      ) : (
        <Button size="icon" className="rounded-full w-14 h-14 shadow-xl" onClick={() => setIsOpen(true)}><MessageSquare /></Button>
      )}
    </div>
  );
};
