import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../ThemeToggle';
import MobileMenu from '../MobileMenu';

export default function Header() {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  const navLinks = [
    { to: '/biography', label: t('nav.biography') },
    { to: '/events', label: t('nav.events') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/info', label: t('nav.info') },
    { to: '/contact', label: t('nav.contact') },
    { to: '/youtube', label: t('nav.youtube') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-light-bg/80 dark:bg-dark-bg/80 border-b border-light-text/10 dark:border-dark-text/10">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="Standottori logo" className="h-8 w-1/20" />
          <span className="font-bold text-lg tracking-wide text-light-text dark:text-dark-text">Standottori</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `${isActive ? 'underline underline-offset-4 font-semibold' : ''} hover:opacity-80 transition-opacity`}
              >
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <button onClick={toggleLang} className="hover:opacity-80 transition-opacity uppercase">
              {i18n.language === 'fr' ? 'EN' : 'FR'}
            </button>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>

        {/* Mobile icons */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={toggleLang} className="hover:opacity-80 transition-opacity uppercase text-sm font-medium">
            {i18n.language === 'fr' ? 'EN' : 'FR'}
          </button>
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
            aria-label={t('nav.menu')}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Slide-over mobile menu */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
} 