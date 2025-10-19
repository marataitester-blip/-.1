import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import tarotDeck from '../constants/deck';
import { useTranslations } from '../hooks/useTranslations';
import SpeakerIcon from '../components/SpeakerIcon';
import ImageRenderer from '../components/ImageRenderer';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import LoadingSpinner from '../components/LoadingSpinner';

const CardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useTranslations();
  const card = tarotDeck.find(c => c.id === Number(id));
  
  const [audioState, setAudioState] = useState<'idle' | 'generating' | 'playing'>('idle');
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferCache = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    // Lazy-initialize AudioContext
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Cleanup on unmount or when card (id) changes
    return () => {
      audioSourceRef.current?.stop();
      setAudioState('idle');
      audioBufferCache.current = null; // Clear cache for the new card
    };
  }, [id]);

  if (!card) {
    return <div>Card not found.</div>;
  }
  
  const handleSpeak = async () => {
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

  const relatedCards = tarotDeck.filter(c => c.id !== card.id).sort(() => 0.5 - Math.random()).slice(0, 3);

  return (
    <div className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="md:col-span-1 flex justify-center">
                 <ImageRenderer 
                    src={card.imageUrl} 
                    alt={card.name[language]} 
                    className="rounded-xl shadow-2xl shadow-purple-900/60 max-w-sm w-full aspect-[3/5]"
                />
            </div>
            <div className="md:col-span-2">
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-yellow-300">{card.name[language]}</h1>
                
                <div className="mt-6 text-lg text-gray-300 leading-relaxed">
                    <p>{card.longDescription[language]}</p>
                    <div className="mt-6">
                        <button 
                            onClick={handleSpeak}
                            aria-label={t('playAudio')}
                            disabled={audioState === 'generating'}
                            className="p-3 rounded-full bg-purple-900/50 hover:bg-purple-800 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-wait"
                        >
                            {audioState === 'generating' ? <LoadingSpinner size="small" /> : <SpeakerIcon isSpeaking={audioState === 'playing'} />}
                        </button>
                    </div>
                </div>


                <div className="mt-12">
                    <h3 className="text-2xl font-serif text-yellow-400">{t('relatedArcana')}</h3>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {relatedCards.map(relatedCard => (
                            <Link to={`/card/${relatedCard.id}`} key={relatedCard.id} className="group">
                                <ImageRenderer src={relatedCard.imageUrl} alt={relatedCard.name[language]} className="aspect-[3/5] rounded-lg transition-transform duration-300 group-hover:scale-105 shadow-md"/>
                                <p className="text-center mt-2 text-sm text-gray-300 group-hover:text-yellow-300">{relatedCard.name[language]}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CardDetail;