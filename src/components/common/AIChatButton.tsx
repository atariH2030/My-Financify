/**
 * AI Chat Button Component
 * v3.14.0 - Botão flutuante para Chat IA
 */

import React, { useState } from 'react';
import './AIChatButton.css';

const AIChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // TODO: Implementar modal de chat IA completo
  };

  return (
    <>
      <button
        className="ai-chat-button"
        onClick={toggleChat}
        aria-label="Chat IA"
        title="Assistente IA Financeiro"
      >
        <i className="fas fa-robot"></i>
        <span className="ai-pulse"></span>
      </button>

      {isOpen && (
        <div className="ai-chat-modal">
          <div className="ai-chat-header">
            <h3>🤖 Assistente IA Financeiro</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="ai-chat-content">
            <p className="ai-welcome">Olá! Sou seu assistente financeiro. Como posso ajudar?</p>
            <div className="ai-suggestions">
              <button className="ai-suggestion">Quanto gastei este mês?</button>
              <button className="ai-suggestion">Como está meu orçamento?</button>
              <button className="ai-suggestion">Sugestões para economizar?</button>
              <button className="ai-suggestion">Análise dos últimos 3 meses</button>
            </div>
          </div>
          <div className="ai-chat-input">
            <input
              type="text"
              placeholder="Pergunte qualquer coisa sobre suas finanças..."
              className="ai-input"
            />
            <button className="ai-send-btn">
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatButton;
