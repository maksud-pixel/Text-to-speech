import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [speaking, setSpeaking] = useState(false);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        const handleVoicesChanged = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };

        handleVoicesChanged(); 
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        };
    }, []);

    const speak = useCallback((text: string, voice: SpeechSynthesisVoice | null, rate: number, pitch: number) => {
        if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onstart = () => {
            setSpeaking(true);
            setPaused(false);
        };
        utterance.onpause = () => {
            setSpeaking(true);
            setPaused(true);
        };
        utterance.onresume = () => {
            setSpeaking(true);
            setPaused(false);
        };
        utterance.onend = () => {
            setSpeaking(false);
            setPaused(false);
        };
        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            setSpeaking(false);
            setPaused(false);
        };
        
        if (voice) {
            utterance.voice = voice;
        }
        utterance.pitch = pitch;
        utterance.rate = rate;

        window.speechSynthesis.speak(utterance);
    }, []);

    const pause = useCallback(() => {
        if (window.speechSynthesis && speaking && !paused) {
            window.speechSynthesis.pause();
        }
    }, [speaking, paused]);

    const resume = useCallback(() => {
        if (window.speechSynthesis && speaking && paused) {
            window.speechSynthesis.resume();
        }
    }, [speaking, paused]);

    const cancel = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            setPaused(false);
        }
    }, []);

    return {
        voices,
        speaking,
        paused,
        speak,
        pause,
        resume,
        cancel,
    };
};
