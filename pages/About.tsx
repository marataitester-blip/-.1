import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center py-16">
            <h1 className="text-4xl md:text-5xl font-bold font-serif">{t('aboutTitle')}</h1>
            <p className="mt-4 text-lg text-[var(--muted)]">Your private space for guidance and clarity.</p>
            
            <div className="mt-12 w-full max-w-md">
                <Link 
                    to="/chat"
                    className="block w-full bg-[var(--accent)] text-[var(--bg)] font-bold py-4 px-8 rounded-full text-xl hover:bg-[#d8b88c] transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-[var(--accent)]/10"
                >
                    {t('aboutCTA')}
                </Link>
            </div>
        </div>
    );
};

export default About;