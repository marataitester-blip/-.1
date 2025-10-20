import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center py-16">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-yellow-300">{t('aboutTitle')}</h1>
            <p className="mt-4 text-lg text-gray-300">Your private space for guidance and clarity.</p>
            
            <div className="mt-12 w-full max-w-md">
                <Link 
                    to="/chat"
                    className="block w-full bg-yellow-400 text-purple-900 font-bold py-4 px-8 rounded-full text-xl hover:bg-yellow-300 transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-yellow-500/20"
                >
                    {t('aboutCTA')}
                </Link>
            </div>
        </div>
    );
};

export default About;