/**
 * AIInsights Component - Widget de insights inteligentes no dashboard
 * 
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import './AIInsights.css';
import AIService from '../../services/ai.service';
import type { AIInsight } from '../../types/ai.types';

interface AIInsightsProps {
  onOpenChat?: () => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ onOpenChat }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      const configured = await AIService.isConfigured();
      setIsConfigured(configured);

      if (configured) {
        const data = await AIService.getInsights();
        // Mostrar apenas os 3 mais recentes e com alta prioridade
        const filtered = data
          .filter(i => i.priority === 'high' || i.priority === 'medium')
          .slice(0, 3);
        setInsights(filtered);
      }
    } catch (error) {
      console.error('Falha ao carregar insights', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: AIInsight['type']): string => {
    const icons = {
      warning: '⚠️',
      tip: '💡',
      achievement: '🏆',
      prediction: '🔮',
    };
    return icons[type];
  };

  const getPriorityClass = (priority: AIInsight['priority']): string => {
    return `ai-insight-priority-${priority}`;
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (!isConfigured) {
    return (
      <div className="ai-insights-widget">
        <div className="ai-insights-header">
          <h3>🤖 Insights de IA</h3>
        </div>
        <div className="ai-insights-setup">
          <div className="ai-insights-setup-icon">🔑</div>
          <p>Configure sua IA para receber insights inteligentes sobre suas finanças.</p>
          <a href="/settings" className="ai-insights-setup-link">
            Configurar Agora
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="ai-insights-widget">
        <div className="ai-insights-header">
          <h3>🤖 Insights de IA</h3>
        </div>
        <div className="ai-insights-loading">
          <div className="ai-insights-spinner"></div>
          <p>Analisando suas finanças...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights-widget">
      <div className="ai-insights-header">
        <h3>🤖 Insights de IA</h3>
        {onOpenChat && (
          <button 
            className="ai-insights-chat-button"
            onClick={onOpenChat}
            title="Abrir chat"
          >
            💬
          </button>
        )}
      </div>

      {insights.length === 0 ? (
        <div className="ai-insights-empty">
          <div className="ai-insights-empty-icon">✨</div>
          <p>Nenhum insight no momento.</p>
          <p className="ai-insights-empty-hint">
            Continue usando o app para receber análises inteligentes!
          </p>
        </div>
      ) : (
        <div className="ai-insights-list">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`ai-insight-card ${getPriorityClass(insight.priority)}`}
            >
              <div className="ai-insight-icon">
                {getInsightIcon(insight.type)}
              </div>
              <div className="ai-insight-content">
                <div className="ai-insight-header-row">
                  <h4 className="ai-insight-title">{insight.title}</h4>
                  <span className="ai-insight-time">
                    {formatTimestamp(insight.timestamp)}
                  </span>
                </div>
                <p className="ai-insight-description">{insight.description}</p>
                {insight.actionable && insight.actionUrl && (
                  <a
                    href={insight.actionUrl}
                    className="ai-insight-action"
                  >
                    {insight.actionLabel || 'Ver Detalhes'} →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ai-insights-footer">
        <button 
          className="ai-insights-refresh"
          onClick={loadInsights}
          title="Atualizar insights"
        >
          🔄 Atualizar
        </button>
        {onOpenChat && (
          <button 
            className="ai-insights-ask"
            onClick={onOpenChat}
          >
            Perguntar à IA →
          </button>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
