
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const playSound = useCallback((textToSpeak: string, lang: string = 'id-ID') => {
        if (!('speechSynthesis' in window)) {
            toast.error("Maaf, browser Anda tidak mendukung fitur suara ini.");
            return;
        }
        const synth = window.speechSynthesis;

        if (synth.speaking) {
            // If called while speaking, it will stop the current speech.
            synth.cancel();
            setIsSpeaking(false);
            return;
        }

        if (textToSpeak) {
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            
            const setVoiceAndSpeak = () => {
                const voices = synth.getVoices();
                const desiredVoice = voices.find(voice => voice.lang === lang) || voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
                
                if (desiredVoice) {
                    utterance.voice = desiredVoice;
                } else {
                    console.warn(`Suara untuk bahasa ${lang} tidak ditemukan, menggunakan suara default.`);
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
            
            if (synth.getVoices().length > 0) {
                setVoiceAndSpeak();
            } else {
                // The voices are not loaded immediately.
                synth.onvoiceschanged = setVoiceAndSpeak;
            }
        }
    }, []);

    return { isSpeaking, playSound };
};
