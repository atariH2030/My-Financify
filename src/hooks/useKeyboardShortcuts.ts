/**
 * @file useKeyboardShortcuts.ts
 * @description Hook para gerenciar atalhos de teclado globais
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
  category?: 'navigation' | 'actions' | 'general';
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

/**
 * Hook para registrar e gerenciar atalhos de teclado
 */
export const useKeyboardShortcuts = ({ 
  shortcuts, 
  enabled = true 
}: UseKeyboardShortcutsOptions) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignora atalhos quando está digitando em inputs/textareas
    const target = event.target as HTMLElement;
    const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
    const isContentEditable = target.isContentEditable;

    if (isInputField || isContentEditable) {
      // Permite ESC mesmo em campos de input
      if (event.key !== 'Escape') {
        return;
      }
    }

    // Procura o atalho correspondente
    const matchedShortcut = shortcuts.find(shortcut => {
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;

      return keyMatches && ctrlMatches && altMatches && shiftMatches;
    });

    if (matchedShortcut) {
      event.preventDefault();
      event.stopPropagation();
      matchedShortcut.action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
};

/**
 * Formata atalho para exibição
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  
  // Capitaliza primeira letra da key
  const key = shortcut.key.length === 1 
    ? shortcut.key.toUpperCase() 
    : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1);
  
  parts.push(key);
  
  return parts.join(' + ');
};

/**
 * Agrupa atalhos por categoria
 */
export const groupShortcutsByCategory = (shortcuts: KeyboardShortcut[]) => {
  const grouped: Record<string, KeyboardShortcut[]> = {
    navigation: [],
    actions: [],
    general: [],
  };

  shortcuts.forEach(shortcut => {
    const category = shortcut.category || 'general';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(shortcut);
  });

  return grouped;
};

export default useKeyboardShortcuts;
