import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import tarotDeck from '../constants/deck';
import { TarotCard } from '../types';
import Card from '../components/Card';
import SpeakerIcon from '../components/SpeakerIcon';
import { interpretSpread, SpreadInterpretation } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

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
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [spreadInterpretation, setSpreadInterpretation] = useState<SpreadInterpretation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup speechSynthesis on component unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);
  
  useEffect(() => {
    const generateInterpretation = async () => {
      if (areCardsFlipped && activeSpread && (activeSpread === 'three' || activeSpread === 'hero') && drawnCards.every(c => c !== null)) {
        setIsGenerating(true);
        setError(null);
        try {
          const validCards = drawnCards.filter((c): c is TarotCard => c !== null);
          if (validCards.length === drawnCards.length) {
            const spreadName = t(activeSpread === 'three' ? 'threeCards' : 'heroPath');
            const interpretation = await interpretSpread(validCards, spreadName, language);
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


  const handleSpeak = (text: string, index: number) => {
    if (speakingIndex === index) {
        window.speechSynthesis.cancel();
        setSpeakingIndex(null);
        return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ru' ? 'ru-RU' : 'en-US';
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleDrawCards = (spread: SpreadType) => {
    window.speechSynthesis.cancel();
    setSpeakingIndex(null);
    setActiveSpread(spread);
    setAreCardsFlipped(false);
    setSpreadInterpretation(null);
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
  
  const spreadLabels = activeSpread ? spreadConfigs[activeSpread].labelsKey.map(key => t(key as any)) : [];


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
                        onClick={() => handleSpeak(card.longDescription[language], index)}
                        aria-label={t('playAudio')}
                        className="p-2 rounded-full bg-purple-900/50 hover:bg-purple-800"
                    >
                        <SpeakerIcon isSpeaking={speakingIndex === index} />
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
              <div>
                <h3 className="text-2xl font-serif text-yellow-400 mb-2">{t('interpretationGeneral')}</h3>
                <p>{spreadInterpretation.general}</p>
              </div>
              <div>
                <h3 className="text-2xl font-serif text-yellow-400 mb-2">{t('interpretationRelationships')}</h3>
                <p>{spreadInterpretation.relationships}</p>
              </div>
              <div>
                <h3 className="text-2xl font-serif text-yellow-400 mb-2">{t('interpretationFinance')}</h3>
                <p>{spreadInterpretation.finance}</p>
              </div>
              <div>
                <h3 className="text-2xl font-serif text-yellow-400 mb-2">{t('interpretationHealth')}</h3>
                <p>{spreadInterpretation.health}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Readings;