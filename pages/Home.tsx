import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslations } from '../hooks/useTranslations';
import tarotDeck from '../constants/deck';
import { TarotCard } from '../types';
import Card from '../components/Card';
import SpeakerIcon from '../components/SpeakerIcon';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import LoadingSpinner from '../components/LoadingSpinner';

const Home: React.FC = () => {
  const { t, language } = useTranslations();
  const [cardOfDay, setCardOfDay] = useState<TarotCard | null>(null);
  const [audioState, setAudioState] = useState<'idle' | 'generating' | 'playing'>('idle');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferCache = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const getCardOfDay = () => {
      const today = new Date();
      const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
      const random = Math.sin(seed) * 10000;
      const pseudoRandomValue = random - Math.floor(random);
      const randomIndex = Math.floor(pseudoRandomValue * tarotDeck.length);
      const dailyCard = tarotDeck[randomIndex];
      setCardOfDay(dailyCard);
    };
    getCardOfDay();
  }, []);

  useEffect(() => {
    // Lazy-initialize AudioContext
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Cleanup on unmount
    return () => {
      audioSourceRef.current?.stop();
    };
  }, []);
  
  const handleSpeak = async (e: React.MouseEvent, card: TarotCard) => {
    e.preventDefault();

    if (audioState === 'playing') {
      audioSourceRef.current?.stop();
      setAudioState('idle');
      return;
    }
    
    if (audioState === 'generating') return;
    
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') await audioCtx.resume();
    
    try {
      let bufferToPlay: AudioBuffer;

      if (audioBufferCache.current) {
        bufferToPlay = audioBufferCache.current;
      } else {
        setAudioState('generating');
        const audioText = card.longDescription[language];
        const base64Audio = await generateSpeech(audioText);
        const rawAudio = decode(base64Audio);
        const decodedBuffer = await decodeAudioData(rawAudio, audioCtx);
        audioBufferCache.current = decodedBuffer;
        bufferToPlay = decodedBuffer;
      }
      
      const source = audioCtx.createBufferSource();
      source.buffer = bufferToPlay;
      source.connect(audioCtx.destination);
      source.onended = () => {
          setAudioState('idle');
          audioSourceRef.current = null;
      };
      source.start(0);
      audioSourceRef.current = source;
      setAudioState('playing');

    } catch (error) {
      console.error("Failed to play audio:", error);
      setAudioState('idle');
    }
  };

  return (
    <div className="text-center py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-yellow-300 leading-tight">
            {t('homeTitle')}
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-xl">
            {t('homeSubtitle')}
          </p>
          <div className="mt-8 p-6 bg-purple-900/30 rounded-lg border border-purple-700 max-w-xl">
             <p className="text-gray-200 leading-relaxed">{t('homeDescription')}</p>
          </div>
          <Link
            to="/readings"
            className="mt-10 inline-block bg-yellow-400 text-purple-900 font-bold py-3 px-8 rounded-full text-lg hover:bg-yellow-300 transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-yellow-500/20"
          >
            {t('homeCTA')}
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center">
            {cardOfDay && (
                <Link to={`/card/${cardOfDay.id}`} className="flex flex-col items-center animate-fade-in group">
                    <div className="transition-transform duration-300 group-hover:scale-105">
                        <Card card={cardOfDay} size="large" />
                    </div>
                    <div className="mt-6 max-w-xs text-center p-4 bg-black/20 rounded-lg">
                        <h3 className="text-2xl font-serif text-yellow-400 transition-colors duration-300 group-hover:text-yellow-200">{cardOfDay.name[language]}</h3>
                        <p className="mt-2 text-gray-300">{cardOfDay.description[language]}</p>
                        <div className="mt-4">
                            <button 
                                onClick={(e) => handleSpeak(e, cardOfDay)}
                                aria-label={t('playAudio')}
                                disabled={audioState === 'generating'}
                                className="p-2 rounded-full bg-purple-900/50 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-wait"
                            >
                                {audioState === 'generating' ? <LoadingSpinner size="small" /> : <SpeakerIcon isSpeaking={audioState === 'playing'} />}
                            </button>
                        </div>
                    </div>
                </Link>
            )}
        </div>
      </div>
    </div>
  );
};

export default Home;