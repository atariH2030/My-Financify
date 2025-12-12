/**
 * @file useTheme.ts
 * @description Hook customizado para gerenciar tema
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 */

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

/**
 * Hook customizado para gerenciar tema
 * Útil para componentes que precisam reagir a mudanças de tema
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const root = document.documentElement;
    const body = document.body;
    
    root.removeAttribute('data-theme');
    body.classList.remove('light', 'dark');
    
    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
      body.classList.add(systemTheme);
    } else {
      root.setAttribute('data-theme', newTheme);
      body.classList.add(newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        setThemeState(e.newValue as Theme);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { theme, setTheme, toggleTheme };
}
