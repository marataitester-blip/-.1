
import { useState, useRef, useCallback, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';
import { useTranslations } from './useTranslations';

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const useAudioPlayer = () => {
    const { language } = useTranslations();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | number | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                audioContextRef.current = new AudioContext({ sampleRate: 24000 });
            }
        }
    }, []);

    const stop = useCallback(() => {
        if (sourceRef.current) {
            sourceRef.current.stop();
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }
        setIsPlaying(false);
        setActiveId(null);
    }, []);

    const play = useCallback(async (text: string, id: string | number) => {
        initAudioContext();
        
        if (isPlaying && activeId === id) {
            stop();
            return;
        }

        if (isLoading) return;
        
        stop();
        setActiveId(id);
        setIsLoading(true);
        setError(null);

        try {
            const base64Audio = await generateSpeech(text, language);
            const audioData = decode(base64Audio);
            
            if (!audioContextRef.current) {
                throw new Error("AudioContext not available.");
            }

            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                setIsPlaying(false);
                setActiveId(null);
                sourceRef.current = null;
            };
            
            source.start();
            sourceRef.current = source;
            setIsPlaying(true);

        } catch (e) {
            console.error("Failed to play audio:", e);
            setError("Could not play audio.");
            setActiveId(null);
        } finally {
            setIsLoading(false);
        }
    }, [language, isPlaying, isLoading, activeId, initAudioContext, stop]);

    useEffect(() => {
        return () => {
            stop();
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(console.error);
            }
        };
    }, [stop]);
    
    useEffect(() => {
        const initOnInteraction = () => {
            initAudioContext();
            document.removeEventListener('click', initOnInteraction, true);
            document.removeEventListener('keydown', initOnInteraction, true);
        };
        document.addEventListener('click', initOnInteraction, true);
        document.addEventListener('keydown', initOnInteraction, true);
        
        return () => {
            document.removeEventListener('click', initOnInteraction, true);
            document.removeEventListener('keydown', initOnInteraction, true);
        };
    }, [initAudioContext]);


    return { play, stop, isPlaying, isLoading, activeId };
};
