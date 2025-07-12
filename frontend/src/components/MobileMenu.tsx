import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-[#F4EDDE] dark:bg-[#171617] shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4">
          <div className="flex justify-end">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#171617]/5 dark:hover:bg-[#EAE7D3]/5 rounded-lg transition-colors"
            >
              <span className="sr-only">Close menu</span>
              <svg 
                className="w-6 h-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>

          <nav className="mt-8 space-y-4">
            <NavLink 
              to="/biography" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-lg hover:bg-[#171617]/5 dark:hover:bg-[#EAE7D3]/5 transition-colors ${
                  isActive ? 'font-medium bg-[#171617]/5 dark:bg-[#EAE7D3]/5' : ''
                }`
              }
              onClick={onClose}
            >
              {t('nav.biography')}
            </NavLink>
            <NavLink 
              to="/events" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-lg hover:bg-[#171617]/5 dark:hover:bg-[#EAE7D3]/5 transition-colors ${
                  isActive ? 'font-medium bg-[#171617]/5 dark:bg-[#EAE7D3]/5' : ''
                }`
              }
              onClick={onClose}
            >
              {t('nav.events')}
            </NavLink>
            <NavLink 
              to="/gallery" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-lg hover:bg-[#171617]/5 dark:hover:bg-[#EAE7D3]/5 transition-colors ${
                  isActive ? 'font-medium bg-[#171617]/5 dark:bg-[#EAE7D3]/5' : ''
                }`
              }
              onClick={onClose}
            >
              {t('nav.gallery')}
            </NavLink>
            <NavLink 
              to="/info" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-lg hover:bg-[#171617]/5 dark:hover:bg-[#EAE7D3]/5 transition-colors ${
                  isActive ? 'font-medium bg-[#171617]/5 dark:bg-[#EAE7D3]/5' : ''
                }`
              }
              onClick={onClose}
            >
              {t('nav.info')}
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-lg hover:bg-[#171617]/5 dark:hover:bg-[#EAE7D3]/5 transition-colors ${
                  isActive ? 'font-medium bg-[#171617]/5 dark:bg-[#EAE7D3]/5' : ''
                }`
              }
              onClick={onClose}
            >
              {t('nav.contact')}
            </NavLink>
            <NavLink 
              to="/youtube" 
              className={({ isActive }) => 
                `block py-2 px-4 rounded-lg hover:bg-[#171617]/5 dark:hover:bg-[#EAE7D3]/5 transition-colors ${
                  isActive ? 'font-medium bg-[#171617]/5 dark:bg-[#EAE7D3]/5' : ''
                }`
              }
              onClick={onClose}
            >
              {t('nav.youtube')}
            </NavLink>
          </nav>
        </div>
      </div>
    </>
  );
} 