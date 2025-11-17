import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslations } from '../hooks/useTranslations';

const Header: React.FC = () => {
  const { t, language, setLanguage } = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { path: '/readings', label: t('navReadings') },
    { path: '/about', label: t('navAbout') },
    { path: '/encyclopedia', label: t('navEncyclopedia') },
    { path: '/quiz', label: t('navQuiz') },
    { path: '/community', label: t('navCommunity') },
    { path: '/shop', label: t('navShop') },
    { path: '/feedback', label: t('navFeedback') },
  ];

  const activeLinkClass = 'text-[var(--accent)] border-b-2 border-[var(--accent)]';
  const inactiveLinkClass = 'text-[var(--muted)] hover:text-[var(--accent)] transition duration-300';

  return (
    <header className="bg-[var(--bg)]/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-black/50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <NavLink to="/" className="text-2xl md:text-3xl font-bold font-serif text-white tracking-wider">
            Astral Hero Tarot
          </NavLink>

          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} pb-1`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center">
            {/* Swapped order: Language switcher is first, with margin for desktop view */}
            <div className="bg-black/30 rounded-full border border-[var(--accent)]/50 md:ml-6">
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 text-xs md:px-3 md:py-1 md:text-sm rounded-full transition-colors duration-300 ${language === 'en' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--muted)]'}`}
                >
                    EN
                </button>
                <button
                    onClick={() => setLanguage('ru')}
                    className={`px-2 py-0.5 text-xs md:px-3 md:py-1 md:text-sm rounded-full transition-colors duration-300 ${language === 'ru' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--muted)]'}`}
                >
                    RU
                </button>
            </div>
            {/* Site Map button, styled like language switcher and now second (mobile only) */}
            <div className="md:hidden ml-4">
              <div className="bg-black/30 rounded-full border border-[var(--accent)]/50 hover:border-[var(--accent)]/80 transition-colors duration-300">
                  <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="px-3 py-1 text-sm font-semibold text-[var(--muted)] rounded-full hover:text-[var(--accent)] transition-colors duration-300 whitespace-nowrap"
                  >
                      {t('navSiteMap')}
                  </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="md:hidden pb-4">
                <nav className="flex flex-col space-y-2">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) => `px-3 py-2 rounded-md text-base ${isActive ? 'bg-[var(--card-bg)] text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--card-bg)]/50'}`}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;