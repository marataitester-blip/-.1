import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { analyzeTextAndPickCard, generateCardImage, QuizResult, generateSpeech } from '../services/geminiService';
import tarotDeck from '../constants/deck';
import { TarotCard } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import ImageRenderer from '../components/ImageRenderer';
import SpeakerIcon from '../components/SpeakerIcon';
import { decode, decodeAudioData } from '../utils/audioUtils';

const Quiz: React.FC = () => {
  const { t, language } = useTranslations();
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [matchedCard, setMatchedCard] = useState<TarotCard | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [audioState, setAudioState] = useState<'idle' | 'generating' | 'playing'>('idle');
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferCache = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
        audioSourceRef.current?.stop();
    };
  }, []);

  const handleSpeak = async () => {
    if (!result || !result.portrait) return;

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
            const base64Audio = await generateSpeech(result.portrait);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);
    setMatchedCard(null);
    setGeneratedImageUrl(null);
    
    // Stop any ongoing audio and clear cache
    audioSourceRef.current?.stop();
    setAudioState('idle');
    audioBufferCache.current = null;

    try {
      const analysisResult = await analyzeTextAndPickCard(userInput, language);
      setResult(analysisResult);

      const foundCard = tarotDeck.find(
        card => card.name.en.toLowerCase() === analysisResult.cardName.toLowerCase()
      );
      setMatchedCard(foundCard || null);

      if (foundCard) {
        const imageUrl = await generateCardImage(foundCard.name.en, analysisResult.portrait);
        setGeneratedImageUrl(imageUrl);
      }
      
    } catch (err) {
      setError(t('error'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold font-serif text-yellow-300">{t('quizTitle')}</h1>
      <p className="mt-4 text-lg text-gray-300">{t('quizSubtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-10">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={t('quizInputPlaceholder')}
          rows={8}
          className="w-full p-4 bg-purple-900/50 border-2 border-purple-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors duration-300"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="mt-6 inline-block bg-yellow-400 text-purple-900 font-bold py-3 px-12 rounded-full text-lg hover:bg-yellow-300 transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !userInput.trim()}
        >
          {isLoading ? t('generating') : t('quizSubmit')}
        </button>
      </form>

      {isLoading && (
        <div className="mt-12">
          <LoadingSpinner />
        </div>
      )}

      {error && <p className="mt-8 text-red-400">{error}</p>}

      {result && (
        <div className="mt-12 text-left animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            <div className="flex flex-col items-center">
              <h3 className="text-2xl font-serif text-yellow-400 mb-4">{t('quizYourArcana')}</h3>
              {matchedCard && <Card card={matchedCard} size="large" />}
            </div>

            <div className="flex flex-col items-center">
                <h3 className="text-2xl font-serif text-yellow-400 mb-4">{t('quizYourImage')}</h3>
                {generatedImageUrl ? (
                    <ImageRenderer src={generatedImageUrl} alt={`AI generated ${result.cardName}`} className="rounded-xl shadow-2xl shadow-purple-900/60 w-64 h-[426px] md:w-72 md:h-[480px]" />
                ) : (
                    <div className="w-64 h-[426px] md:w-72 md:h-[480px] bg-purple-900/50 rounded-xl flex items-center justify-center">
                        <LoadingSpinner />
                    </div>
                )}
            </div>
            
            <div className="md:col-span-2">
                <h3 className="text-2xl font-serif text-yellow-400 mt-8 mb-4 flex items-center gap-4">
                  {t('quizYourPortrait')}
                   <button 
                      onClick={handleSpeak}
                      aria-label={t('playAudio')}
                      disabled={audioState === 'generating'}
                      className="p-2 rounded-full bg-purple-900/50 hover:bg-purple-800 disabled:opacity-50 disabled:cursor-wait"
                  >
                      {audioState === 'generating' ? <LoadingSpinner size="small" /> : <SpeakerIcon isSpeaking={audioState === 'playing'} />}
                  </button>
                </h3>
                <div className="p-6 bg-purple-900/30 rounded-lg border border-purple-700">
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{result.portrait}</p>
                </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;