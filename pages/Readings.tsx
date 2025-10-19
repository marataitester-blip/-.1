import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import tarotDeck from '../constants/deck';
import { TarotCard } from '../types';
import Card from '../components/Card';
import SpeakerIcon from '../components/SpeakerIcon';
import { interpretSpread, SpreadInterpretation, generateSpeech } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { translations } from '../constants/translations';

type SpreadType = 'day' | 'three' | 'hero';

const spreadConfigs = {
  day: { count: 1, labelsKey: [] },
  three: { count: 3, labelsKey: ['past', 'present', 'future'] },
  hero: { count: 5, labelsKey: ['step1', 'step2', 'step3', 'step4', 'step5'] },
};

// Fisher-Yates shuffle algorithm
const shuffleDeck = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Readings: React.FC = () => {
  const { t, language } = useTranslations();
  const [activeSpread, setActiveSpread] = useState<SpreadType | null>(null);
  const [drawnCards, setDrawnCards] = useState<(TarotCard | null)[]>([]);
  const [areCardsFlipped, setAreCardsFlipped] = useState(false);
  const [spreadInterpretation, setSpreadInterpretation] = useState<SpreadInterpretation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [audioStatus, setAudioStatus] = useState<{ index: number | null, status: 'idle' | 'generating' | 'playing' }>({ index: null, status: 'idle' });
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferCache = useRef<Map<number, AudioBuffer>>(new Map());
  
  const [interpretationAudio, setInterpretationAudio] = useState<{ part: keyof SpreadInterpretation | null, status: 'idle' | 'generating' | 'playing' }>({ part: null, status: 'idle' });
  const interpretationAudioCache = useRef<Map<string, AudioBuffer>>(new Map());

  useEffect(() => {
    // Lazy-initialize AudioContext
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      audioSourceRef.current?.stop();
    };
  }, []);
  
  const spreadLabels = activeSpread ? spreadConfigs[activeSpread].labelsKey.map(key => t(key as any)) : [];
  
  useEffect(() => {
    const generateInterpretation = async () => {
      if (areCardsFlipped && activeSpread && (activeSpread === 'three' || activeSpread === 'hero') && drawnCards.every(c => c !== null)) {
        setIsGenerating(true);
        setError(null);
        try {
          const validCards = drawnCards.filter((c): c is TarotCard => c !== null);
          if (validCards.length === drawnCards.length) {
            
            // The prompt sent to the AI should be consistently in English to avoid errors.
            // We'll use the English translations for the spread name and card positions for the API call.
            // The `language` parameter will tell the AI which language to respond in.
            const spreadNameEn = translations.en[activeSpread === 'three' ? 'threeCards' : 'heroPath'];
            const labelsEn = spreadConfigs[activeSpread].labelsKey.map(key => translations.en[key as keyof typeof translations.en]);

            const cardsWithPositions = validCards.map((card, index) => ({
                card,
                position: labelsEn[index] || `Card ${index + 1}`, // Use English labels for the API
            }));
            
            const interpretation = await interpretSpread(cardsWithPositions, spreadNameEn, language);

            setSpreadInterpretation(interpretation);
          }
        } catch (err) {
            setError(t('error'));
        } finally {
          setIsGenerating(false);
        }
      }
    };

    generateInterpretation();
  }, [areCardsFlipped, activeSpread, language, drawnCards, t]);

  const handleSpeak = async (card: TarotCard, index: number) => {
    const audioCtx = audioContextRef.current;
    if (!audioCtx) return;

    if (audioStatus.index === index && audioStatus.status === 'playing') {
      audioSourceRef.current?.stop();
      setAudioStatus({ index: null, status: 'idle' });
      return;
    }
    
    if (audioStatus.status === 'generating' || interpretationAudio.status === 'generating') return;

    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
    }
    setInterpretationAudio({ part: null, status: 'idle' });
    
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    
    try {
        let bufferToPlay: AudioBuffer;
        const cachedBuffer = audioBufferCache.current.get(card.id);

        if (cachedBuffer) {
            bufferToPlay = cachedBuffer;
        } else {
            setAudioStatus({ index: index, status: 'generating' });
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
            setAudioStatus(prev => prev.index === index ? { index: null, status: 'idle' } : prev);
            audioSourceRef.current = null;
        };
        source.start(0);
        audioSourceRef.current = source;
        setAudioStatus({ index: index, status: 'playing' });

    } catch (error) {
        console.error("Failed to play audio for card at index " + index, error);
        setAudioStatus({ index: null, status: 'idle' });
    }
  };

  const handleSpeakInterpretation = async (part: keyof SpreadInterpretation) => {
    const audioCtx = audioContextRef.current;
    const textToSpeak = spreadInterpretation?.[part];
    if (!audioCtx || !textToSpeak) return;

    if (interpretationAudio.part === part && interpretationAudio.status === 'playing') {
        audioSourceRef.current?.stop();
        setInterpretationAudio({ part: null, status: 'idle' });
        return;
    }
    
    if (audioStatus.status === 'generating' || interpretationAudio.status === 'generating') return;

    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
    }
    setAudioStatus({ index: null, status: 'idle' });
    
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    
    try {
        let bufferToPlay: AudioBuffer;
        const cacheKey = `${part}_${language}`;
        const cachedBuffer = interpretationAudioCache.current.get(cacheKey);

        if (cachedBuffer) {
            bufferToPlay = cachedBuffer;
        } else {
            setInterpretationAudio({ part: part, status: 'generating' });
            const base64Audio = await generateSpeech(textToSpeak);
            const rawAudio = decode(base64Audio);
            const decodedBuffer = await decodeAudioData(rawAudio, audioCtx);
            interpretationAudioCache.current.set(cacheKey, decodedBuffer);
            bufferToPlay = decodedBuffer;
        }
        
        const source = audioCtx.createBufferSource();
        source.buffer = bufferToPlay;
        source.connect(audioCtx.destination);
        source.onended = () => {
            setInterpretationAudio(prev => prev.part === part ? { part: null, status: 'idle' } : prev);
            audioSourceRef.current = null;
        };
        source.start(0);
        audioSourceRef.current = source;
        setInterpretationAudio({ part: part, status: 'playing' });

    } catch (error) {
        console.error(`Failed to play audio for interpretation part "${part}"`, error);
        setInterpretationAudio({ part: null, status: 'idle' });
    }
  };


  const handleDrawCards = (spread: SpreadType) => {
    audioSourceRef.current?.stop();
    setAudioStatus({ index: null, status: 'idle' });
    setInterpretationAudio({ part: null, status: 'idle' });
    setActiveSpread(spread);
    setAreCardsFlipped(false);
    setSpreadInterpretation(null);
    interpretationAudioCache.current.clear();
    setIsGenerating(false);
    setError(null);
    
    const shuffled = shuffleDeck(tarotDeck);
    const newCards = shuffled.slice(0, spreadConfigs[spread].count);
    setDrawnCards(Array(spreadConfigs[spread].count).fill(null));
    
    setTimeout(() => {
        setDrawnCards(newCards);
        setTimeout(() => setAreCardsFlipped(true), 200);
    }, 500);
  };
  
  const renderInterpretationSection = (part: keyof SpreadInterpretation, title: string) => (
    <div>
        <h3 className="text-2xl font-serif text-yellow-400 mb-2 flex items-center gap-4">
            {title}
            <button
                onClick={() => handleSpeakInterpretation(part)}
                aria-label={`${t('playAudio')} for ${title}`}
                disabled={(interpretationAudio.status === 'generating' && interpretationAudio.part !== part)}
                className="p-2 rounded-full bg-purple-900/50 hover:bg-purple-800 disabled:opacity-50"
            >
                {interpretationAudio.part === part && interpretationAudio.status === 'generating'
                    ? <LoadingSpinner size="small" />
                    : <SpeakerIcon isSpeaking={interpretationAudio.part === part && interpretationAudio.status === 'playing'} />
                }
            </button>
        </h3>
        <p>{spreadInterpretation?.[part]}</p>
    </div>
  );


  return (
    <div className="text-center flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-bold font-serif text-yellow-300">{t('readingsTitle')}</h1>
      <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{t('readingsSubtitle')}</p>

      <div className="my-10 flex flex-wrap justify-center gap-4">
        <button onClick={() => handleDrawCards('day')} className={`px-6 py-3 font-bold rounded-full transition duration-300 ${activeSpread === 'day' ? 'bg-yellow-400 text-purple-900' : 'bg-purple-800 hover:bg-purple-700'}`}>{t('cardOfDay')}</button>
        <button onClick={() => handleDrawCards('three')} className={`px-6 py-3 font-bold rounded-full transition duration-300 ${activeSpread === 'three' ? 'bg-yellow-400 text-purple-900' : 'bg-purple-800 hover:bg-purple-700'}`}>{t('threeCards')}</button>
        <button onClick={() => handleDrawCards('hero')} className={`px-6 py-3 font-bold rounded-full transition duration-300 ${activeSpread === 'hero' ? 'bg-yellow-400 text-purple-900' : 'bg-purple-800 hover:bg-purple-700'}`}>{t('heroPath')}</button>
      </div>

      {drawnCards.length > 0 && (
        <div className="mt-12 flex flex-wrap justify-center items-start gap-8 md:gap-12">
          {drawnCards.map((card, index) => (
            <div key={index} className="flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
              <Card card={card} isFlipped={areCardsFlipped} size={drawnCards.length > 3 ? 'small' : 'medium'} />
              {spreadLabels[index] && <p className="text-yellow-400 font-serif text-lg">{spreadLabels[index]}</p>}
               {areCardsFlipped && card && (
                <div className="max-w-xs text-center p-4 bg-black/20 rounded-lg space-y-3">
                    <p className="text-gray-300 text-sm">{card.longDescription[language]}</p>
                     <button 
                        onClick={() => handleSpeak(card, index)}
                        aria-label={t('playAudio')}
                        disabled={audioStatus.status === 'generating' && audioStatus.index !== index}
                        className="p-2 rounded-full bg-purple-900/50 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-wait"
                    >
                        {audioStatus.index === index && audioStatus.status === 'generating' 
                            ? <LoadingSpinner size="small" /> 
                            : <SpeakerIcon isSpeaking={audioStatus.index === index && audioStatus.status === 'playing'} />
                        }
                    </button>
                </div>
               )}
            </div>
          ))}
        </div>
      )}

      {(isGenerating || spreadInterpretation || error) && (activeSpread === 'three' || activeSpread === 'hero') && (
        <div className="mt-16 w-full max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-yellow-300">{t('spreadInterpretation')}</h2>
          
          {isGenerating && (
            <div className="mt-8">
              <LoadingSpinner />
              <p className="mt-4 text-gray-400">{t('generatingInterpretation')}</p>
            </div>
          )}

          {error && <p className="mt-8 text-red-400">{error}</p>}

          {spreadInterpretation && (
            <div className="mt-8 text-left space-y-6 text-gray-300 leading-relaxed text-lg p-8 bg-purple-900/30 rounded-lg border border-purple-700">
                {spreadInterpretation.relationships && renderInterpretationSection('relationships', t('interpretationRelationships'))}
                {spreadInterpretation.finance && renderInterpretationSection('finance', t('interpretationFinance'))}
                {spreadInterpretation.health && renderInterpretationSection('health', t('interpretationHealth'))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Readings;