/**
 * @file KeyboardShortcutsHelp.tsx
 * @description Modal de ajuda com lista de atalhos de teclado
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {formatShortcut, groupShortcutsByCategory, type KeyboardShortcut} from '../../hooks/useKeyboardShortcuts';
import './KeyboardShortcutsHelp.css';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  shortcuts: KeyboardShortcut[];
  onClose: () => void;
}

const categoryLabels: Record<string, string> = {
  navigation: 'Navegação',
  actions: 'Ações Rápidas',
  general: 'Geral',
};

const categoryIcons: Record<string, string> = {
  navigation: '🧭',
  actions: '⚡',
  general: '⌨️',
};

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  shortcuts,
  onClose,
}) => {
  const groupedShortcuts = groupShortcutsByCategory(shortcuts);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="keyboard-shortcuts-overlay" onClick={onClose}>
        <motion.div
          className="keyboard-shortcuts-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
        >
          {/* Header */}
          <div className="keyboard-shortcuts-header">
            <div className="keyboard-shortcuts-title">
              <span className="keyboard-shortcuts-icon">⌨️</span>
              <h2>Atalhos de Teclado</h2>
            </div>
            <button
              className="keyboard-shortcuts-close"
              onClick={onClose}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="keyboard-shortcuts-content">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
              if (categoryShortcuts.length === 0) return null;

              return (
                <div key={category} className="keyboard-shortcuts-category">
                  <h3 className="keyboard-shortcuts-category-title">
                    <span className="category-icon">
                      {categoryIcons[category]}
                    </span>
                    {categoryLabels[category]}
                  </h3>
                  <div className="keyboard-shortcuts-list">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div key={index} className="keyboard-shortcut-item">
                        <span className="shortcut-description">
                          {shortcut.description}
                        </span>
                        <kbd className="shortcut-keys">
                          {formatShortcut(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="keyboard-shortcuts-footer">
            <p>
              💡 Pressione <kbd>Ctrl + H</kbd> ou <kbd>Ctrl + /</kbd> para abrir esta ajuda
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default KeyboardShortcutsHelp;
