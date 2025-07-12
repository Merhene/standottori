import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../ThemeToggle';
import MobileMenu from '../MobileMenu';

export default function Header() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  
  return (
    <header className="bg-[#F4EDDE] dark:bg-[#171617] shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            Standottori
          </Link>
          

          <div className="hidden md:flex items-center space-x-6">
            <NavLink 
              to="/biography" 
              className={({ isActive }) => 
                `hover:opacity-75 transition-opacity ${isActive ? 'font-medium' : ''}`
              }
            >
              {t('nav.biography')}
            </NavLink>
            <NavLink 
              to="/events" 
              className={({ isActive }) => 
                `hover:opacity-75 transition-opacity ${isActive ? 'font-medium' : ''}`
              }
            >
              {t('nav.events')}
            </NavLink>
            <NavLink 
              to="/gallery" 
              className={({ isActive }) => 
                `hover:opacity-75 transition-opacity ${isActive ? 'font-medium' : ''}`
              }
            >
              {t('nav.gallery')}
            </NavLink>
            <NavLink 
              to="/info" 
              className={({ isActive }) => 
                `hover:opacity-75 transition-opacity ${isActive ? 'font-medium' : ''}`
              }
            >
              {t('nav.info')}
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                `hover:opacity-75 transition-opacity ${isActive ? 'font-medium' : ''}`
              }
            >
              {t('nav.contact')}
            </NavLink>
            <NavLink 
              to="/youtube" 
              className={({ isActive }) => 
                `hover:opacity-75 transition-opacity ${isActive ? 'font-medium' : ''}`
              }
            >
              {t('nav.youtube')}
            </NavLink>
            <ThemeToggle />
          </div>
          
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button 
              className="p-2 hover:bg-[#171617]/5 dark:hover:bg-[#EAE7D3]/5 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label={t('nav.menu')}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </header>
  );
} 