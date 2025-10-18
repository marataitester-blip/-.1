import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import tarotDeck from '../constants/deck';
import { useTranslations } from '../hooks/useTranslations';
import SpeakerIcon from '../components/SpeakerIcon';
import ImageRenderer from '../components/ImageRenderer';

const CardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useTranslations();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const card = tarotDeck.find(c => c.id === Number(id));

  useEffect(() => {
    // Cleanup speechSynthesis on component unmount or card change
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [id]);

  if (!card) {
    return <div>Card not found.</div>;
  }
  
  const handleSpeak = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(card.longDescription[language]);
    utterance.lang = language === 'ru' ? 'ru-RU' : 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
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
                            className="p-3 rounded-full bg-purple-900/50 hover:bg-purple-800 inline-flex items-center justify-center"
                        >
                            <SpeakerIcon isSpeaking={isSpeaking} />
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