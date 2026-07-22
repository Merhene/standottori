import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';

interface ThemeToggleProps {
  transparent?: boolean;
}

export default function ThemeToggle({ transparent = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  
  const colorClass = transparent
    ? 'text-white drop-shadow-lg'
    : 'prime-header-link';

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center hover:opacity-70 transition-opacity ${colorClass}`}
      style={{ width: '1.25rem', height: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
      aria-label={t('theme.toggle')}
    >
      {theme === 'dark' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
