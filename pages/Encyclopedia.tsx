import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslations } from '../hooks/useTranslations';
import tarotDeck from '../constants/deck';
import { TarotCard } from '../types';
import SpeakerIcon from '../components/SpeakerIcon';
import ImageRenderer from '../components/ImageRenderer';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import LoadingSpinner from '../components/LoadingSpinner';

const Encyclopedia: React.FC = () => {
  const { t, language } = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [audioStatus, setAudioStatus] = useState<{ id: number | null, status: 'idle' | 'generating' | 'playing' }>({ id: null, status: 'idle' });

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferCache = useRef<Map<number, AudioBuffer>>(new Map());

  useEffect(() => {
    // Lazy-initialize AudioContext
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      audioSourceRef.current?.stop();
    };
  }, []);

  const filteredDeck = useMemo(() => {
    if (!searchTerm) {
      return tarotDeck;
    }
    return tarotDeck.filter(card =>
      card.name[language].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, language]);

  const handleSpeak = async (e: React.MouseEvent, card: TarotCard) => {
    e.preventDefault();
    e.stopPropagation();

    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    if (audioStatus.id === card.id && audioStatus.status === 'playing') {
      audioSourceRef.current?.stop();
      setAudioStatus({ id: null, status: 'idle' });
      return;
    }
    
    if (audioStatus.status === 'generating') return;

    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
    }
    
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    
    try {
        let bufferToPlay: AudioBuffer;
        const cachedBuffer = audioBufferCache.current.get(card.id);

        if (cachedBuffer) {
            bufferToPlay = cachedBuffer;
        } else {
            setAudioStatus({ id: card.id, status: 'generating' });
            const audioText = card.longDescription[language];
            const base64Audio = await generateSpeech(audioText);
            const rawAudio = decode(base64Audio);
            const decodedBuffer = await decodeAudioData(rawAudio, audioCtx);
            audioBufferCache.current.set(card.id, decodedBuffer);
            bufferToPlay = decodedBuffer;
        }
        
        const source = audioCtx.createBufferSource();
        source.buffer = bufferToPlay;
        source.connect(audioCtx.destination);
        source.onended = () => {
            setAudioStatus(prev => prev.id === card.id ? { id: null, status: 'idle' } : prev);
            audioSourceRef.current = null;
        };
        source.start(0);
        audioSourceRef.current = source;
        setAudioStatus({ id: card.id, status: 'playing' });

    } catch (error) {
        console.error("Failed to play audio for card " + card.id, error);
        setAudioStatus({ id: null, status: 'idle' });
    }
  };


  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-bold font-serif text-yellow-300">{t('encyclopediaTitle')}</h1>
      <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{t('encyclopediaSubtitle')}</p>

      <div className="my-10 max-w-lg mx-auto">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-purple-900/50 border border-purple-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {filteredDeck.map(card => (
          <Link to={`/card/${card.id}`} key={card.id} className="group perspective-1000">
            <div className="relative transform transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2 aspect-[3/5]">
                <ImageRenderer 
                    src={card.imageUrl} 
                    alt={card.name[language]}
                    className="w-full h-full rounded-lg shadow-lg shadow-black/40"
                />
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg p-2">
                    <p className="text-white text-center font-bold font-serif text-lg">{card.name[language]}</p>
                    <button
                      onClick={(e) => handleSpeak(e, card)}
                      aria-label={t('playAudio')}
                      disabled={audioStatus.status === 'generating' && audioStatus.id !== card.id}
                      className="mt-2 p-2 rounded-full bg-purple-900/50 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {audioStatus.id === card.id && audioStatus.status === 'generating' 
                          ? <LoadingSpinner size="small" /> 
                          : <SpeakerIcon isSpeaking={audioStatus.id === card.id && audioStatus.status === 'playing'} />
                      }
                    </button>
                </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Encyclopedia;