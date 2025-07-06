
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  text: string;
  className?: string;
  iconClassName?: string;
}

const AudioPlayer = ({ text, className, iconClassName }: AudioPlayerProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Effect to cancel speech on component unmount
  useEffect(() => {
    return () => {
      // Make sure it exists and is speaking before trying to cancel
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const play = () => {
    // Check for feature support first
    if (!('speechSynthesis' in window)) {
      toast.error("Maaf, browser Anda tidak mendukung fitur suara ini.");
      return;
    }
    
    const synth = window.speechSynthesis;

    // If it's currently speaking, a click should stop it.
    if (synth.speaking) {
        synth.cancel();
        // The onend event of the previous utterance might not fire immediately after cancel,
        // so we manually set speaking state to false.
        setIsSpeaking(false); 
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = synth.getVoices();
    const indonesianVoice = voices.find(voice => voice.lang === 'id-ID') || voices.find(voice => voice.lang.startsWith('id'));

    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    } else {
      // It's okay if not found, browser will use a default voice.
      // We can log this for debugging but not show a warning to the user.
      console.warn("Suara Bahasa Indonesia tidak ditemukan, menggunakan suara default.");
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance.onerror", event);
      toast.error("Gagal memutar audio.");
      setIsSpeaking(false);
    };

    synth.speak(utterance);
  };

  // We can still conditionally render the button if we want to be clean
  if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={play}
      aria-label={`Dengarkan ${text}`}
      className={className}
    >
      {isSpeaking ? (
        <LoaderCircle className={cn("h-5 w-5 animate-spin", iconClassName)} />
      ) : (
        <Play className={cn("h-5 w-5", iconClassName)} />
      )}
    </Button>
  );
};

export default AudioPlayer;
