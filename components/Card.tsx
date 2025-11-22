
import React from 'react';
import { TarotCard } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import ImageRenderer from './ImageRenderer';

interface CardProps {
  card: TarotCard | null;
  isFlipped?: boolean;
  size?: 'small' | 'medium' | 'large';
  priority?: boolean;
}

const Card: React.FC<CardProps> = ({ card, isFlipped = true, size = 'medium', priority = false }) => {
  const { language } = useTranslations();

  const sizeClasses = {
    small: 'w-24 h-40 md:w-28 md:h-48',
    medium: 'w-48 h-80 md:w-60 md:h-[400px]',
    large: 'w-64 h-[426px] md:w-72 md:h-[480px]',
  };

  const cardBackUrl = "https://cdn.jsdelivr.net/gh/marataitester-blip/tarot/card_back.png";

  return (
    <div className={`perspective-1000 ${sizeClasses[size]}`}>
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden">
          <ImageRenderer 
            src={cardBackUrl}
            alt="Tarot Card Back" 
            className="w-full h-full rounded-xl shadow-lg shadow-black/50"
            priority={priority} // Prioritize back if the card itself is high priority
          />
        </div>
        
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          {card ? (
            <>
              <ImageRenderer 
                src={card.imageUrl} 
                alt={card.name[language]} 
                className="w-full h-full rounded-xl shadow-lg shadow-purple-900/50"
                priority={priority}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-center rounded-b-xl">
                <p className="text-white font-bold text-sm sm:text-base font-serif tracking-wider">
                  {card.name[language]}
                </p>
              </div>
            </>
          ) : (
             <div className="w-full h-full bg-gray-800 rounded-xl shadow-lg"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;