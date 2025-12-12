/**
 * @file ThemeToggle.tsx
 * @description Toggle Dark/Light Mode com animação suave
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 * 
 * Features:
 * - WCAG AAA compliant (44px touch target)
 * - Animação suave Moon/Sun
 * - Tooltip acessível
 * - Keyboard shortcut (Ctrl+Shift+D)
 * - LocalStorage persistence
 * - System preference detection
 */

import { useState, useEffect, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';
import './ThemeToggle.css';

export type Theme = 'light' | 'dark' | 'auto';
// Não re-exportar aqui para manter Fast Refresh

interface ThemeToggleProps {
  /**
   * Posição do toggle
   * @default 'sidebar'
   */
  position?: 'sidebar' | 'header' | 'settings' | 'floating';
  
  /**
   * Mostrar label ao lado do ícone
   * @default false
   */
  showLabel?: boolean;
  
  /**
   * Callback quando tema mudar
   */
  onThemeChange?: (theme: Theme) => void;
  
  /**
   * Classe CSS customizada
   */
  className?: string;
}

/**
 * Componente de Toggle de Tema
 * Permite alternar entre Dark/Light Mode
 */
export function ThemeToggle({
  position = 'sidebar',
  showLabel = false,
  onThemeChange,
  className = '',
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Prioridade: localStorage > preferência do sistema > light
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  const [isAnimating, setIsAnimating] = useState(false);

  // Função de toggle com useCallback para evitar re-renders
  const toggleTheme = useCallback(() => {
    setIsAnimating(true);
    
    // Toggle: light → dark → light
    setTheme(current => current === 'light' ? 'dark' : 'light');

    // Remove animação após 300ms
    setTimeout(() => setIsAnimating(false), 300);
  }, [setTheme]); // Dependência: setTheme do useState

  // Aplicar tema ao DOM
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Remove classes antigas
    root.removeAttribute('data-theme');
    body.classList.remove('light', 'dark');

    // Aplica novo tema
    if (theme === 'auto') {
      // Usa preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
      body.classList.add(systemTheme);
    } else {
      root.setAttribute('data-theme', theme);
      body.classList.add(theme);
    }

    // Persiste no localStorage
    localStorage.setItem('theme', theme);

    // Callback
    onThemeChange?.(theme);
  }, [theme, onThemeChange]);

  // Listener para mudanças na preferência do sistema
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
      document.body.className = systemTheme;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Keyboard shortcut: Ctrl+Shift+D
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTheme]); // Incluir toggleTheme nas dependências

  const currentTheme = theme === 'auto' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  const isDark = currentTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle theme-toggle--${position} ${className} ${isAnimating ? 'theme-toggle--animating' : ''}`}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={`${isDark ? 'Modo claro' : 'Modo escuro'} (Ctrl+Shift+D)`}
      data-testid="theme-toggle"
    >
      <div className="theme-toggle__icon-wrapper">
        {isDark ? (
          <Moon 
            className="theme-toggle__icon theme-toggle__icon--moon" 
            size={20}
            aria-hidden="true"
          />
        ) : (
          <Sun 
            className="theme-toggle__icon theme-toggle__icon--sun" 
            size={20}
            aria-hidden="true"
          />
        )}
      </div>

      {showLabel && (
        <span className="theme-toggle__label">
          {isDark ? 'Modo Escuro' : 'Modo Claro'}
        </span>
      )}

      {/* Tooltip acessível */}
      <span className="theme-toggle__tooltip" role="tooltip">
        {isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
        <kbd className="theme-toggle__shortcut">Ctrl+Shift+D</kbd>
      </span>
    </button>
  );
}

export default ThemeToggle;
