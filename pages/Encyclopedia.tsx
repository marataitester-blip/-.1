import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [audioStatus, setAudioStatus] = useState<'idle' | 'generating' | 'playing'>('idle');

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferCache = useRef<Map<number, AudioBuffer>>(new Map());

  useEffect(() => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      audioSourceRef.current?.stop();
    };
  }, []);

  // Stop audio when modal is closed
  useEffect(() => {
    if (!selectedCard) {
      audioSourceRef.current?.stop();
      setAudioStatus('idle');
    }
  }, [selectedCard]);

  const handleSpeak = async (card: TarotCard) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    if (audioStatus === 'playing') {
      audioSourceRef.current?.stop();
      setAudioStatus('idle');
      return;
    }
    
    if (audioStatus === 'generating') return;

    if (audioCtx.state === 'suspended') await audioCtx.resume();
    
    try {
        let bufferToPlay: AudioBuffer;
        const cachedBuffer = audioBufferCache.current.get(card.id);

        if (cachedBuffer) {
            bufferToPlay = cachedBuffer;
        } else {
            setAudioStatus('generating');
            const audioText = `${card.name[language]}. ${card.keyword[language]}. ${card.longDescription[language]}`;
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
            setAudioStatus('idle');
            audioSourceRef.current = null;
        };
        source.start(0);
        audioSourceRef.current = source;
        setAudioStatus('playing');

    } catch (error) {
        console.error("Failed to play audio for card " + card.id, error);
        setAudioStatus('idle');
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-bold font-serif">{t('encyclopediaTitle')}</h1>
      
      <a 
          href="https://t.me/+y7Inf371g7w0NzMy" 
          target="_blank"
          rel="noopener noreferrer"
          className="contact-btn inline-block max-w-xs my-6 mx-auto py-3 px-5 bg-transparent border-2 border-[var(--accent)] text-[var(--accent)] rounded-full font-serif text-lg font-semibold hover:bg-[var(--accent)] hover:text-[var(--bg)] hover:shadow-lg hover:shadow-[var(--accent)]/20 transition-all duration-200"
      >
          Связь с Мастером (колода, расклады)
      </a>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 md:gap-5">
        {tarotDeck.map(card => (
          <div key={card.id} className="cursor-pointer group" onClick={() => setSelectedCard(card)}>
            <ImageRenderer 
                src={card.imageUrl} 
                alt={card.name[language]}
                className="w-full h-full rounded-lg shadow-lg border border-[var(--accent)]/20 aspect-[600/1040] object-cover transition-all duration-300 group-hover:transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-[var(--accent)]/20"
            />
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedCard && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in-fast"
          onClick={() => setSelectedCard(null)}
        >
          <div 
            className="bg-[var(--card-bg)] w-11/12 max-w-lg max-h-[90vh] rounded-xl border border-[var(--accent)] shadow-2xl shadow-black p-6 flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedCard(null)}
              className="absolute top-2 right-3 text-[var(--muted)] hover:text-[var(--accent)] text-4xl font-bold"
              aria-label="Close modal"
            >
              &times;
            </button>
            <div className="overflow-y-auto pr-4 -mr-4 text-center">
              <ImageRenderer 
                src={selectedCard.imageUrl} 
                alt={selectedCard.name[language]}
                className="w-full max-w-xs mx-auto rounded-lg"
              />
              <h2 className="text-3xl font-serif mt-4">{selectedCard.name[language]}</h2>
              <h3 className="text-lg italic text-[var(--muted)] mb-4">{selectedCard.keyword[language]}</h3>
              <p className="text-left leading-relaxed">{selectedCard.longDescription[language]}</p>
              <button
                onClick={() => handleSpeak(selectedCard)}
                aria-label={t('playAudio')}
                disabled={audioStatus === 'generating'}
                className="mt-4 w-12 h-12 rounded-full border border-[var(--accent)] flex items-center justify-center mx-auto hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors disabled:opacity-50"
              >
                  {audioStatus === 'generating' 
                      ? <LoadingSpinner size="small" /> 
                      : <svg className={`w-6 h-6 transition-colors duration-300 ${audioStatus === 'playing' ? 'text-white' : 'text-[var(--accent)]'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.75 3.5a.75.75 0 00-1.5 0v13a.75.75 0 001.5 0v-13zM12.75 3.5a.75.75 0 00-1.5 0v13a.75.75 0 001.5 0v-13z"></path></svg>
                  }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Encyclopedia;