import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAiStore } from '@/hooks/useAiStore';
import { cn } from '@/lib/utils';

export const AiAssistant: React.FC = () => {
  const { isSidebarOpen, setSidebarOpen } = useAiStore();

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] transition-all">
      <Button 
        size="icon" 
        className={cn(
          "rounded-full w-14 h-14 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95",
          isSidebarOpen ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 hover:bg-zinc-300" : "bg-primary text-primary-foreground"
        )} 
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        title={isSidebarOpen ? "Tutup Tanya AI" : "Tanya AI"}
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </Button>
    </div>
  );
};
