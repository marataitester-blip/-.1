import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import tarotDeck from '../constants/deck';
import ImageRenderer from '../components/ImageRenderer';

const Shop: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-yellow-300">{t('shopTitle')}</h1>
            <p className="mt-4 text-lg text-gray-300">{t('shopIntro')}</p>
            
            <div className="mt-12 p-8 bg-purple-900/30 rounded-lg border border-purple-700 flex flex-col md:flex-row items-center gap-8">
                <ImageRenderer src={tarotDeck[21].imageUrl} alt="Deck Preview" className="w-48 rounded-lg shadow-lg aspect-[3/5] flex-shrink-0" />
                <div className="text-left">
                    <h2 className="text-3xl font-serif text-yellow-400">{t('deckTitle')}</h2>
                    <p className="mt-2 text-gray-300">{t('deckDescription')}</p>
                    <a 
                        href="https://www.amazon.com/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-block bg-yellow-400 text-purple-900 font-bold py-3 px-8 rounded-full text-lg hover:bg-yellow-300 transition-transform transform hover:scale-105 duration-300"
                    >
                        {t('buyButton')}
                    </a>
                </div>
            </div>

             <div className="mt-16">
                <h3 className="text-2xl font-serif text-yellow-400">{t('contactTitle')}</h3>
                <p className="mt-2 text-gray-400">{t('contactEmail')} <a href="mailto:contact@herosjourneytarot.com" className="text-yellow-300 hover:underline">contact@herosjourneytarot.com</a></p>
                <p className="mt-1 text-gray-400">{t('contactTelegram')} <a href="#" onClick={(e) => e.preventDefault()} className="text-yellow-300 hover:underline">Astral Hero Community</a></p>
             </div>
        </div>
    );
};

export default Shop;