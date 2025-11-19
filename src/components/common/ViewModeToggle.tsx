/**
 * @file ViewModeToggle.tsx
 * @description Toggle entre Modo Lite e Completo
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 */

import React from 'react';
import { motion } from 'framer-motion';
import './ViewModeToggle.css';

export type ViewMode = 'complete' | 'lite';

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ mode, onChange, className = '' }) => {
  return (
    <div className={`view-mode-toggle ${className}`}>
      <div className="toggle-label">
        <span className="label-icon">⚙️</span>
        <span className="label-text">Modo de Visualização</span>
      </div>
      
      <div className="toggle-buttons" role="group" aria-label="Modo de visualização">
        <button
          type="button"
          className={`toggle-btn ${mode === 'complete' ? 'active' : ''}`}
          onClick={() => onChange('complete')}
          aria-pressed={mode === 'complete'}
          aria-label="Modo Completo"
        >
          <span className="btn-icon">📊</span>
          <span className="btn-text">
            <span className="btn-title">Completo</span>
            <span className="btn-subtitle">Todos os recursos</span>
          </span>
          {mode === 'complete' && (
            <motion.div
              className="active-indicator"
              layoutId="activeMode"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>

        <button
          type="button"
          className={`toggle-btn ${mode === 'lite' ? 'active' : ''}`}
          onClick={() => onChange('lite')}
          aria-pressed={mode === 'lite'}
          aria-label="Modo Simplificado"
        >
          <span className="btn-icon">✨</span>
          <span className="btn-text">
            <span className="btn-title">Simplificado</span>
            <span className="btn-subtitle">Essencial e direto</span>
          </span>
          {mode === 'lite' && (
            <motion.div
              className="active-indicator"
              layoutId="activeMode"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      </div>

      <div className="toggle-description">
        {mode === 'complete' ? (
          <p>
            <strong>Modo Completo:</strong> Acesso a todos os widgets, gráficos avançados, 
            relatórios detalhados e personalização total. Ideal para power users.
          </p>
        ) : (
          <p>
            <strong>Modo Simplificado:</strong> Interface linear e direta com foco nas 
            funcionalidades essenciais. Perfeito para uso rápido e objetivo.
          </p>
        )}
      </div>
    </div>
  );
};

export default ViewModeToggle;
