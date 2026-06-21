import { useState, useEffect } from 'react';

/**
 * useTheme — reads/writes the app colour scheme.
 *
 * Persists the selection in localStorage so it survives reloads.
 * Writes `data-theme` to <html> so CSS variables switch automatically.
 */
export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return { theme, setTheme, toggleTheme };
}
