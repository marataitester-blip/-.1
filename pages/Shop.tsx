import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import tarotDeck from '../constants/deck';
import ImageRenderer from '../components/ImageRenderer';

const Shop: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif">{t('shopTitle')}</h1>
            <p className="mt-4 text-lg text-[var(--muted)]">{t('shopIntro')}</p>
            
            <div className="mt-12 p-8 bg-[var(--card-bg)] rounded-lg border border-[var(--accent)]/20 flex flex-col md:flex-row items-center gap-8">
                <ImageRenderer src={tarotDeck[21].imageUrl} alt="Deck Preview" className="w-48 rounded-lg shadow-lg aspect-[3/5] flex-shrink-0" />
                <div className="text-left">
                    <h2 className="text-3xl font-serif">{t('deckTitle')}</h2>
                    <p className="mt-2 text-[var(--muted)]">{t('deckDescription')}</p>
                    <a 
                        href="https://www.amazon.com/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-block bg-[var(--accent)] text-[var(--bg)] font-bold py-3 px-8 rounded-full text-lg hover:bg-[#d8b88c] transition-transform transform hover:scale-105 duration-300"
                    >
                        {t('buyButton')}
                    </a>
                </div>
            </div>

             <div className="mt-16">
                <h3 className="text-2xl font-serif">{t('contactTitle')}</h3>
                <p className="mt-2 text-[var(--muted)]">{t('contactEmail')} <a href="mailto:contact@herosjourneytarot.com" className="text-[var(--accent)] hover:underline">contact@herosjourneytarot.com</a></p>
                <p className="mt-1 text-[var(--muted)]">{t('contactTelegram')} <a href="https://t.me/+y7Inf371g7w0NzMy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">Astral Hero Community</a></p>
             </div>
        </div>
    );
};

export default Shop;