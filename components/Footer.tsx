import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslations } from '../hooks/useTranslations';

const Footer: React.FC = () => {
  const { t } = useTranslations();

  return (
    <footer className="bg-black/30 mt-12">
      <div className="container mx-auto px-4 py-8 text-center text-[var(--muted)]">
        <div className="flex justify-center space-x-6 mb-6 text-sm">
          <NavLink to="/" className="hover:text-[var(--accent)] transition-colors">{t('navHome')}</NavLink>
          <NavLink to="/readings" className="hover:text-[var(--accent)] transition-colors">{t('navReadings')}</NavLink>
          <NavLink to="/encyclopedia" className="hover:text-[var(--accent)] transition-colors">{t('navEncyclopedia')}</NavLink>
          <NavLink to="/quiz" className="hover:text-[var(--accent)] transition-colors">{t('navQuiz')}</NavLink>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} Astral Hero Tarot. {t('footerRights')}</p>
        <p className="mt-2 text-xs">{t('footerMotto')}</p>
      </div>
    </footer>
  );
};

export default Footer;