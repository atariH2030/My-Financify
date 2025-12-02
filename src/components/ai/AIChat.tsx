/**
 * AIChat Component - Interface de chat conversacional com IA
 * 
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AIChat.css';
import AIService from '../../services/ai.service';
import type { AIMessage, AIContext } from '../../types/ai.types';

interface AIChatProps {
  context: AIContext;
  onClose?: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ context, onClose }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Verificar se IA está configurada
  useEffect(() => {
    const checkConfig = async () => {
      const configured = await AIService.isConfigured();
      setIsConfigured(configured);
    };
    checkConfig();
  }, []);

  // Carregar histórico
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await AIService['getConversationHistory']();
        setMessages(history);
      } catch (error) {
        console.error('Falha ao carregar histórico', error);
      }
    };
    loadHistory();
  }, []);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus no input ao montar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !isConfigured) return;

    const userMessage: AIMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await AIService.chat(input.trim(), context);

      const assistantMessage: AIMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: AIMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `❌ Erro ao processar sua mensagem: ${(error as Error).message}. Verifique se sua API Key está configurada corretamente em Configurações > IA.`,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, isConfigured, context]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Deseja limpar todo o histórico de conversa?')) {
      await AIService.clearConversation();
      setMessages([]);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedQuestions = [
    'Como estão meus gastos este mês?',
    'Onde posso economizar?',
    'Estou dentro do orçamento?',
    'Qual categoria gasto mais?',
  ];

  if (!isConfigured) {
    return (
      <div className="ai-chat-container">
        <div className="ai-chat-header">
          <div className="ai-chat-title">
            <span className="ai-chat-icon">🤖</span>
            <h3>Assistente IA</h3>
          </div>
          {onClose && (
            <button className="ai-chat-close" onClick={onClose} title="Fechar">
              ✕
            </button>
          )}
        </div>

        <div className="ai-chat-setup">
          <div className="ai-chat-setup-icon">🔑</div>
          <h4>Configure sua IA</h4>
          <p>Para usar o assistente inteligente, você precisa configurar uma API Key do Google Gemini.</p>
          <ol>
            <li>Acesse <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
            <li>Crie uma API Key gratuita</li>
            <li>Vá em Configurações &gt; IA e cole sua chave</li>
          </ol>
          <a href="/settings" className="ai-chat-setup-button">
            Ir para Configurações
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <span className="ai-chat-icon">🤖</span>
          <h3>Assistente IA</h3>
        </div>
        <div className="ai-chat-actions">
          <button 
            className="ai-chat-clear" 
            onClick={handleClearHistory}
            title="Limpar histórico"
            disabled={messages.length === 0}
          >
            🗑️
          </button>
          {onClose && (
            <button className="ai-chat-close" onClick={onClose} title="Fechar">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="ai-chat-messages">
        {messages.length === 0 ? (
          <div className="ai-chat-empty">
            <div className="ai-chat-empty-icon">💬</div>
            <h4>Como posso ajudar?</h4>
            <p>Pergunte sobre suas finanças, gastos, orçamentos ou metas.</p>
            <div className="ai-chat-suggestions">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="ai-chat-suggestion"
                  onClick={() => setInput(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`ai-chat-message ${message.role}`}
            >
              <div className="ai-chat-message-avatar">
                {message.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="ai-chat-message-content">
                <div 
                  className="ai-chat-message-text"
                  dangerouslySetInnerHTML={{ 
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br>')
                  }}
                />
                <div className="ai-chat-message-time">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="ai-chat-message assistant">
            <div className="ai-chat-message-avatar">🤖</div>
            <div className="ai-chat-message-content">
              <div className="ai-chat-loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-input-container">
        <input
          ref={inputRef}
          type="text"
          className="ai-chat-input"
          placeholder="Digite sua pergunta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button
          className="ai-chat-send"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          title="Enviar"
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
};

export default AIChat;
