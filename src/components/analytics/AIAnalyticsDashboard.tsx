import React, { useEffect, useState } from 'react';
import { AnalyticsService, AIUsageStats } from '../../services/analytics.service';
import { motion } from 'framer-motion';
import './AIAnalyticsDashboard.css';

/**
 * Dashboard Analytics - Sprint 5.1
 * 
 * Visualiza estatísticas de uso da IA:
 * - Total de sessões de chat
 * - Mensagens enviadas
 * - Duração média das sessões
 * - Features mais utilizadas
 * - Insights por prioridade
 * 
 * QUALIDADE (ISO 25010):
 * - Usabilidade: Cards visuais com ícones e cores
 * - Performance: Carregamento otimizado dos dados
 * - Manutenibilidade: Lógica isolada no analytics.service
 */

const AIAnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<AIUsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const analyticsService = AnalyticsService.getInstance();
        const usageStats = await analyticsService.getUsageStats();
        setStats(usageStats);
      } catch (error) {
        console.error('[AIAnalyticsDashboard] Erro ao carregar stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="ai-analytics-loading">
        <div className="spinner"></div>
        <p>Carregando estatísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="ai-analytics-empty">
        <h3>📊 Nenhuma estatística disponível</h3>
        <p>Comece a usar o assistente de IA para gerar dados analíticos.</p>
      </div>
    );
  }

  // Calcular tempo médio formatado
  const avgMinutes = Math.floor(stats.averageSessionDuration / 60);
  const avgSeconds = Math.floor(stats.averageSessionDuration % 60);

  // Top 3 features mais usadas
  const topFeatures = stats.mostUsedFeatures.slice(0, 3);

  // Calcular total de insights
  const totalInsights = stats.insightsByPriority.high + stats.insightsByPriority.medium + stats.insightsByPriority.low;

  return (
    <div className="ai-analytics-dashboard">
      <header className="analytics-header">
        <h2>📊 Estatísticas de Uso da IA</h2>
        <p className="subtitle">Análise de performance e engajamento</p>
      </header>

      {/* Cards de Métricas Principais */}
      <section className="analytics-grid">
        <motion.div
          className="analytics-card card-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-icon">💬</div>
          <div className="card-content">
            <h3>{stats.totalChatSessions}</h3>
            <p>Sessões de Chat</p>
          </div>
        </motion.div>

        <motion.div
          className="analytics-card card-success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-icon">📨</div>
          <div className="card-content">
            <h3>{stats.totalMessages}</h3>
            <p>Mensagens Enviadas</p>
          </div>
        </motion.div>

        <motion.div
          className="analytics-card card-info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-icon">⏱️</div>
          <div className="card-content">
            <h3>{avgMinutes}m {avgSeconds}s</h3>
            <p>Duração Média</p>
          </div>
        </motion.div>

        <motion.div
          className="analytics-card card-warning"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-icon">💡</div>
          <div className="card-content">
            <h3>{totalInsights}</h3>
            <p>Insights Gerados</p>
          </div>
        </motion.div>
      </section>

      {/* Features Mais Utilizadas */}
      {topFeatures.length > 0 && (
        <motion.section
          className="analytics-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3>🔥 Features Mais Populares</h3>
          <div className="features-list">
            {topFeatures.map((feature, index) => (
              <div key={feature.name} className="feature-item">
                <span className="feature-rank">#{index + 1}</span>
                <span className="feature-name">{feature.name}</span>
                <span className="feature-count">{feature.count} usos</span>
                <div
                  className="feature-bar"
                  style={{
                    width: `${(feature.count / topFeatures[0].count) * 100}%`,
                  }}
                ></div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Insights por Prioridade */}
      <motion.section
        className="analytics-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3>🎯 Distribuição de Insights</h3>
        <div className="insights-grid">
          <div className="insight-card priority-high">
            <div className="insight-header">
              <span className="priority-icon">🔴</span>
              <span className="priority-label">Alta Prioridade</span>
            </div>
            <div className="insight-value">{stats.insightsByPriority.high}</div>
          </div>

          <div className="insight-card priority-medium">
            <div className="insight-header">
              <span className="priority-icon">🟡</span>
              <span className="priority-label">Média Prioridade</span>
            </div>
            <div className="insight-value">{stats.insightsByPriority.medium}</div>
          </div>

          <div className="insight-card priority-low">
            <div className="insight-header">
              <span className="priority-icon">🟢</span>
              <span className="priority-label">Baixa Prioridade</span>
            </div>
            <div className="insight-value">{stats.insightsByPriority.low}</div>
          </div>
        </div>
      </motion.section>

      {/* Nota: Seção de Sessões Recentes removida temporariamente */}
      {/* A interface AIUsageStats não possui campo recentSessions */}
    </div>
  );
};

export default AIAnalyticsDashboard;
