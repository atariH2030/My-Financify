/**
 * Tooltip - Componente de dica explicativa
 * 
 * DECISÃO: Acessibilidade através de explicações visuais
 * BENEFÍCIO: Usuários entendem termos técnicos sem sobrecarga visual
 * 
 * @version 3.0.0
 */

import React, { useState } from 'react';
import './Tooltip.css';

interface TooltipProps {
  text: string; // Texto a ser explicado
  explanation: string; // Explicação do termo
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  text, 
  explanation, 
  position = 'top',
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className="tooltip-wrapper"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)}
    >
      {children || (
        <span className="tooltip-text">
          {text}
          <i className="fas fa-question-circle tooltip-icon"></i>
        </span>
      )}
      
      {isVisible && (
        <span className={`tooltip-bubble ${position}`}>
          {explanation}
          <span className="tooltip-arrow"></span>
        </span>
      )}
    </span>
  );
};

export default Tooltip;
