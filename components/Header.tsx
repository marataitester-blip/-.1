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

  const activeLinkClass = 'text-yellow-400 border-b-2 border-yellow-400';
  const inactiveLinkClass = 'text-gray-300 hover:text-yellow-400 transition duration-300';

  return (
    <header className="bg-[#1a102c]/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-purple-900/20">
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
            <div className="bg-purple-900/50 rounded-full border border-purple-700 md:ml-6">
                <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 text-xs md:px-3 md:py-1 md:text-sm rounded-full transition-colors duration-300 ${language === 'en' ? 'bg-yellow-400 text-purple-900' : 'text-gray-300'}`}
                >
                    EN
                </button>
                <button
                    onClick={() => setLanguage('ru')}
                    className={`px-2 py-0.5 text-xs md:px-3 md:py-1 md:text-sm rounded-full transition-colors duration-300 ${language === 'ru' ? 'bg-yellow-400 text-purple-900' : 'text-gray-300'}`}
                >
                    RU
                </button>
            </div>
            {/* Site Map button, styled like language switcher and now second (mobile only) */}
            <div className="md:hidden ml-4">
              <div className="bg-purple-900/50 rounded-full border border-purple-700 hover:border-yellow-400/80 transition-colors duration-300">
                  <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="px-3 py-1 text-sm font-semibold text-gray-300 rounded-full hover:text-yellow-300 transition-colors duration-300 whitespace-nowrap"
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
                            className={({ isActive }) => `px-3 py-2 rounded-md text-base ${isActive ? 'bg-purple-800 text-yellow-400' : 'text-gray-300 hover:bg-purple-700/50'}`}
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