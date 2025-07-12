import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t } = useTranslation();

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#171617]/50 dark:bg-[#EAE7D3]/50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu */}
      <div
        className="fixed inset-y-0 right-0 w-64 bg-[#F4EDDE] dark:bg-[#171617] shadow-lg z-50 
                   transform transition-transform duration-300 ease-in-out"
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.menu')}
      >
        <div className="flex flex-col h-full">
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-4 self-end"
            aria-label={t('nav.close')}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation links */}
          <nav className="flex flex-col px-4 py-2 space-y-4">
            <NavLink
              to="/biography"
              className={({ isActive }) =>
                `p-2 hover:opacity-75 transition-opacity ${isActive ? 'font-medium' : ''}`
              }
              onClick={onClose}
            >
              {t('nav.biography')}
            </NavLink>
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `p-2 hover:opacity-75 transition-opacity ${isActive ? 'font-medium' : ''}`
              }
              onClick={onClose}
            >
              {t('nav.events')}
            </NavLink>
            <NavLink
              to="/gallery"
              className={({ isActive }) =>
                `p-2 hover:opacity-75 transition-opacity ${isActive ? 'font-medium' : ''}`
              }
              onClick={onClose}
            >
              {t('nav.gallery')}
            </NavLink>
            <NavLink
              to="/info"
              className={({ isActive }) =>
                `p-2 hover:opacity-75 transition-opacity ${isActive ? 'font-medium' : ''}`
              }
              onClick={onClose}
            >
              {t('nav.info')}
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `p-2 hover:opacity-75 transition-opacity ${isActive ? 'font-medium' : ''}`
              }
              onClick={onClose}
            >
              {t('nav.contact')}
            </NavLink>
            <NavLink
              to="/youtube"
              className={({ isActive }) =>
                `p-2 hover:opacity-75 transition-opacity ${isActive ? 'font-medium' : ''}`
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