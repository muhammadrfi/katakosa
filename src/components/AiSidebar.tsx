import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, useAiStore } from '@/hooks/useAiStore';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Sparkles, Bot, User, Trash2, Send, X, AlertTriangle, History, Plus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const TypewriterMarkdown = ({ content, speed = 25 }: { content: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const words = content.split(' ');
    let currentWordIdx = 0;
    setDisplayedText('');
    
    const interval = setInterval(() => {
      if (currentWordIdx < words.length) {
        setDisplayedText((prev) => {
          return prev + (currentWordIdx === 0 ? '' : ' ') + words[currentWordIdx];
        });
        currentWordIdx++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [content, speed]);

  return (
    <ReactMarkdown
      components={{
        p: ({ node, ...props }) => <p className="mb-3.5 leading-relaxed last:mb-0 whitespace-pre-line" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3.5 space-y-1.5" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3.5 space-y-1.5" {...props} />,
        li: ({ node, ...props }) => <li className="text-sm leading-relaxed whitespace-pre-line" {...props} />,
        h1: ({ node, ...props }) => <h1 className="text-base font-extrabold mt-4 mb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-sm font-extrabold mt-4 mb-2" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-xs font-extrabold mt-3 mb-1.5" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-extrabold text-foreground dark:text-white" {...props} />,
        hr: ({ node, ...props }) => <hr className="my-4 border-zinc-200 dark:border-zinc-800" {...props} />
      }}
    >
      {displayedText}
    </ReactMarkdown>
  );
};

const MessageBubble = ({ m, isLatest }: { m: Message; isLatest: boolean }) => {
  const isUser = m.role === 'user';
  return (
    <div className={cn("flex w-full gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105", isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
        {isUser ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4"/>}
      </div>
      <div className={cn("p-3 sm:p-4 rounded-2xl text-sm max-w-[85%] shadow-sm leading-relaxed transition-all", isUser ? "bg-primary text-primary-foreground" : "bg-card border text-foreground")}>
        <div className="max-w-none break-words">
          {!isUser && isLatest ? (
            <TypewriterMarkdown content={m.content} />
          ) : (
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p className="mb-3.5 leading-relaxed last:mb-0 whitespace-pre-line" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3.5 space-y-1.5" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3.5 space-y-1.5" {...props} />,
                li: ({ node, ...props }) => <li className="text-sm leading-relaxed whitespace-pre-line" {...props} />,
                h1: ({ node, ...props }) => <h1 className="text-base font-extrabold mt-4 mb-2" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-sm font-extrabold mt-4 mb-2" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xs font-extrabold mt-3 mb-1.5" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-extrabold text-foreground dark:text-white" {...props} />,
                hr: ({ node, ...props }) => <hr className="my-4 border-zinc-200 dark:border-zinc-800" {...props} />
              }}
            >
              {m.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};

export const AiSidebar: React.FC = () => {
  const { 
    apiKey, 
    isSidebarOpen, 
    setSidebarOpen, 
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    clearAllSessions,
    isSidebarLoading,
    askSidebarActive
  } = useAiStore();

  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get active session
  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Auto create general session if open and no session exists
  useEffect(() => {
    if (isSidebarOpen && apiKey && sessions.length === 0) {
      createSession("Katakosa AI Chat", "general");
    }
  }, [isSidebarOpen, apiKey, sessions.length, createSession]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages, isSidebarOpen, isSidebarLoading]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey || isSidebarLoading || !activeSessionId) return;
    const userMsg = input.trim();
    setInput('');
    await askSidebarActive(userMsg);
  };

  const handleCreateNewChat = () => {
    const id = createSession("Asisten Chat Baru", "general");
    setActiveSessionId(id);
    setShowHistory(false);
  };

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Slide-out Sidebar Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-background border-l shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-card shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <Sparkles className="w-5 h-5 text-primary shrink-0 animate-pulse" />
            <div className="overflow-hidden">
              <h3 className="font-extrabold text-sm text-foreground truncate">
                {activeSession ? activeSession.title : "Katakosa AI"}
              </h3>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {activeSession ? `${activeSession.type} chat` : "Assistant"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {activeSession && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-xl text-zinc-400"
                onClick={() => {
                  if (confirm("Hapus percakapan aktif ini?")) {
                    deleteSession(activeSession.id);
                  }
                }}
                title="Hapus Chat Ini"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </Button>
            )}
            {apiKey && (
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("h-8 w-8 hover:bg-muted rounded-xl", showHistory && "bg-muted text-primary")} 
                onClick={() => setShowHistory(!showHistory)}
                title="Riwayat Chat"
              >
                <History className="w-4.5 h-4.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-xl" onClick={() => setSidebarOpen(false)}>
              <X className="w-4.5 h-4.5" />
            </Button>
          </div>
        </div>

        {/* Outer body wrapper to contain history sliding pane */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-muted/10">
          
          {/* History Overlaid Drawer */}
          {showHistory && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex flex-col p-4 animate-in fade-in slide-in-from-top duration-200">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Daftar Percakapan</span>
                <div className="flex items-center gap-1.5">
                  {sessions.length > 0 && (
                    <Button 
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Hapus semua riwayat percakapan?")) {
                          clearAllSessions();
                        }
                      }} 
                      className="rounded-xl h-8 text-xs font-bold text-muted-foreground hover:bg-destructive/10 hover:text-destructive px-2.5"
                    >
                      Hapus Semua
                    </Button>
                  )}
                  <Button 
                    onClick={handleCreateNewChat} 
                    size="sm" 
                    className="rounded-xl h-8 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Chat Baru
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 pr-1">
                {sessions.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-xs font-medium">
                    Belum ada riwayat percakapan.
                  </div>
                ) : (
                  <div className="space-y-1.5 pb-4">
                    {sessions.map((sess) => (
                      <div 
                        key={sess.id}
                        onClick={() => {
                          setActiveSessionId(sess.id);
                          setShowHistory(false);
                        }}
                        className={cn(
                          "group w-full p-3 rounded-xl border flex items-center justify-between gap-3 text-left transition-all duration-200 cursor-pointer text-xs font-bold",
                          sess.id === activeSessionId 
                            ? "bg-primary/5 border-primary/50 text-primary shadow-sm" 
                            : "bg-card hover:bg-muted hover:border-zinc-300 dark:hover:border-zinc-800 text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          <MessageSquare className={cn("w-4 h-4 shrink-0", sess.id === activeSessionId ? "text-primary" : "text-zinc-400")} />
                          <span className="truncate">{sess.title}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Hapus percakapan ini?")) {
                              deleteSession(sess.id);
                            }
                          }}
                          className="h-7 w-7 rounded-lg text-zinc-400 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 shrink-0"
                          title="Hapus Chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Main Chat Body */}
          {!apiKey ? (
            <div className="p-6 h-full flex flex-col justify-center items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base">API Key Belum Diatur</h4>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                  Atur Gemini API Key Anda terlebih dahulu pada panel chat melayang di pojok kanan bawah halaman utama.
                </p>
              </div>
              <Button size="sm" onClick={() => setSidebarOpen(false)}>
                Tutup Panel
              </Button>
            </div>
          ) : !activeSession ? (
            <div className="p-6 h-full flex flex-col justify-center items-center text-center gap-2">
              <Bot className="w-12 h-12 text-primary/40 animate-bounce" />
              <h4 className="font-bold text-sm text-foreground">Katakosa AI Siap Membantu</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-normal">
                Klik tombol **"Tanya AI"** pada soal tryout, daftar kata kosakata, atau materi budaya untuk mendapatkan penjelasan instan dan detail di sini.
              </p>
              <Button size="sm" onClick={handleCreateNewChat} className="mt-4 rounded-xl font-bold">
                Mulai Chat Baru
              </Button>
            </div>
          ) : activeSession.messages.length === 0 ? (
            <div className="p-6 h-full flex flex-col justify-center items-center text-center gap-2">
              <Bot className="w-10 h-10 text-primary/40" />
              <h4 className="font-bold text-xs text-foreground uppercase tracking-widest">Ruang Percakapan Baru</h4>
              <p className="text-xs text-muted-foreground max-w-xs leading-normal">
                Ketik pertanyaan di bawah untuk berdiskusi dengan Katakosa AI tentang tata bahasa Korea, contoh percakapan, atau persiapan EPS-TOPIK.
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6 pb-4">
                {activeSession.messages.map((m, i) => (
                  <MessageBubble key={i} m={m} isLatest={i === activeSession.messages.length - 1} />
                ))}
                {isSidebarLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse p-2 bg-muted/30 rounded-lg border w-fit">
                    <Bot className="w-4 h-4 animate-bounce text-primary" />
                    <span>Katakosa AI sedang merumuskan penjelasan...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer Chat Input */}
        {apiKey && activeSessionId && (
          <div className="p-4 border-t bg-card flex gap-2 items-center shrink-0">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder="Tanyakan / diskusikan lebih lanjut..." 
              className="rounded-xl h-10"
              disabled={isSidebarLoading}
            />
            <Button size="icon" className="h-10 w-10 shrink-0" onClick={handleSend} disabled={isSidebarLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
