import React, { useEffect, useState } from 'react';
import { ThemeContext, type Theme } from '../hooks/useTheme';

const STORAGE_KEY = 'theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Brand launches dark-first. Respect an explicit choice; never default to light/system.
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
