/**
 * AIFloatingButton - Botão flutuante fixo para acesso rápido à IA
 * 
 * @version 1.0.0
 */

import React, { useState } from 'react';
import './AIFloatingButton.css';

interface AIFloatingButtonProps {
  onClick: () => void;
  hasNewInsights?: boolean;
}

const AIFloatingButton: React.FC<AIFloatingButtonProps> = ({ 
  onClick, 
  hasNewInsights = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={`ai-floating-button ${hasNewInsights ? 'has-insights' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Assistente IA"
      aria-label="Abrir assistente de IA"
    >
      <span className="ai-floating-icon">🤖</span>
      {hasNewInsights && <span className="ai-floating-badge">!</span>}
      {isHovered && (
        <span className="ai-floating-tooltip">Assistente IA</span>
      )}
    </button>
  );
};

export default AIFloatingButton;
