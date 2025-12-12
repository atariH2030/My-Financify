/**
 * AI Chat Button Component
 * v3.14.0 - Botão flutuante para Chat IA
 */

import React, { useEffect, useRef, useState } from 'react';
import './AIChatButton.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Respostas baseadas em palavras-chave
    if (lowerMessage.includes('gastei') || lowerMessage.includes('despesa')) {
      return 'Com base nos seus dados, você gastou R$ 4.820,30 este mês. As principais categorias foram: Alimentação (R$ 1.200), Transporte (R$ 800) e Saúde (R$ 600).';
    }
    if (lowerMessage.includes('orçamento') || lowerMessage.includes('budget')) {
      return 'Seu orçamento está bem controlado! Você utilizou 68% do orçamento mensal. Ainda há margem de R$ 2.180 disponível para este mês.';
    }
    if (lowerMessage.includes('economizar') || lowerMessage.includes('poupar')) {
      return 'Aqui estão 3 sugestões para economizar:\n1. Reduza gastos com delivery (economia estimada: R$ 300/mês)\n2. Renegocie sua assinatura de streaming (economia: R$ 50/mês)\n3. Use transporte público 2x por semana (economia: R$ 150/mês)';
    }
    if (lowerMessage.includes('análise') || lowerMessage.includes('meses')) {
      return 'Nos últimos 3 meses, suas despesas tiveram uma redução de 12%. Suas receitas aumentaram 8%. Você está no caminho certo para atingir sua meta de economia!';
    }
    if (lowerMessage.includes('meta') || lowerMessage.includes('objetivo')) {
      return 'Você tem 3 metas ativas:\n• Fundo de Emergência: 45% concluído (R$ 4.500 de R$ 10.000)\n• Viagem: 20% (R$ 800 de R$ 4.000)\n• Carro Novo: 10% (R$ 3.000 de R$ 30.000)';
    }
    
    return 'Entendo sua pergunta! Estou aqui para ajudar com análises financeiras, sugestões de economia, acompanhamento de orçamento e metas. Pode me perguntar sobre seus gastos, receitas ou objetivos financeiros.';
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleSendMessage = (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simular digitação da IA (delay realista)
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        text: generateAIResponse(text),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 segundos
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
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
            {messages.length === 0 ? (
              <>
                <p className="ai-welcome">Olá! Sou seu assistente financeiro. Como posso ajudar?</p>
                <div className="ai-suggestions">
                  <button 
                    className="ai-suggestion"
                    onClick={() => handleSuggestionClick('Quanto gastei este mês?')}
                  >
                    Quanto gastei este mês?
                  </button>
                  <button 
                    className="ai-suggestion"
                    onClick={() => handleSuggestionClick('Como está meu orçamento?')}
                  >
                    Como está meu orçamento?
                  </button>
                  <button 
                    className="ai-suggestion"
                    onClick={() => handleSuggestionClick('Sugestões para economizar?')}
                  >
                    Sugestões para economizar?
                  </button>
                  <button 
                    className="ai-suggestion"
                    onClick={() => handleSuggestionClick('Análise dos últimos 3 meses')}
                  >
                    Análise dos últimos 3 meses
                  </button>
                </div>
              </>
            ) : (
              <div className="ai-messages">
                {messages.map(msg => (
                  <div key={msg.id} className={`ai-message ai-message--${msg.sender}`}>
                    <div className="ai-message-avatar">
                      {msg.sender === 'ai' ? '🤖' : '👤'}
                    </div>
                    <div className="ai-message-content">
                      <p>{msg.text}</p>
                      <span className="ai-message-time">
                        {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="ai-message ai-message--ai">
                    <div className="ai-message-avatar">🤖</div>
                    <div className="ai-message-content">
                      <div className="ai-typing">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="ai-chat-input">
            <input
              type="text"
              placeholder="Pergunte qualquer coisa sobre suas finanças..."
              className="ai-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
            />
            <button 
              className="ai-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatButton;
