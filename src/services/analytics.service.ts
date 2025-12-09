/**
 * @file analytics.service.ts
 * @description Sistema de analytics unificado - IA + Google Analytics 4
 * @version 3.15.0
 * @author DEV - Rickson (TQM)
 */

import Logger from './logger.service';

// Google Analytics Types
interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

interface PageView {
  page_title: string;
  page_location: string;
  page_path: string;
}

// Google Analytics gtag interface
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

export interface AIAnalyticsEvent {
  id: string;
  timestamp: Date;
  eventType: 'chat_open' | 'chat_close' | 'message_sent' | 'insight_viewed' | 'insight_dismissed' | 'feature_used';
  metadata?: {
    messageCount?: number;
    sessionDuration?: number;
    insightPriority?: 'high' | 'medium' | 'low';
    insightCategory?: string;
    featureName?: string;
  };
}

export interface AIUsageStats {
  totalChatSessions: number;
  totalMessages: number;
  totalInsightsViewed: number;
  totalInsightsDismissed: number;
  averageSessionDuration: number;
  mostUsedFeatures: Array<{ name: string; count: number }>;
  insightsByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  lastUpdated: Date;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private readonly STORAGE_KEY = 'ai_analytics_events';
  private readonly STATS_KEY = 'ai_usage_stats';
  private currentSession: {
    startTime: Date | null;
    messageCount: number;
  } = { startTime: null, messageCount: 0 };

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Track evento de IA
   */
  async trackEvent(
    eventType: AIAnalyticsEvent['eventType'],
    metadata?: AIAnalyticsEvent['metadata']
  ): Promise<void> {
    try {
      const event: AIAnalyticsEvent = {
        id: this.generateId(),
        timestamp: new Date(),
        eventType,
        metadata,
      };

      // Salvar evento
      const events = await this.getEvents();
      events.push(event);
      
      // Manter apenas últimos 1000 eventos
      const recentEvents = events.slice(-1000);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentEvents));

      // Atualizar estatísticas
      await this.updateStats(event);

      Logger.info(`Analytics: ${eventType}`, { metadata }, 'ANALYTICS');
    } catch (error) {
      Logger.error('Erro ao trackear evento', error as Error, 'ANALYTICS');
    }
  }

  /**
   * Iniciar sessão de chat
   */
  startChatSession(): void {
    this.currentSession.startTime = new Date();
    this.currentSession.messageCount = 0;
    this.trackEvent('chat_open');
  }

  /**
   * Finalizar sessão de chat
   */
  async endChatSession(): Promise<void> {
    if (this.currentSession.startTime) {
      const duration = Date.now() - this.currentSession.startTime.getTime();
      await this.trackEvent('chat_close', {
        sessionDuration: duration,
        messageCount: this.currentSession.messageCount,
      });
      this.currentSession = { startTime: null, messageCount: 0 };
    }
  }

  /**
   * Track mensagem enviada
   */
  trackMessage(): void {
    this.currentSession.messageCount++;
    this.trackEvent('message_sent', {
      messageCount: this.currentSession.messageCount,
    });
  }

  /**
   * Track insight visualizado
   */
  trackInsightViewed(priority: 'high' | 'medium' | 'low', category: string): void {
    this.trackEvent('insight_viewed', {
      insightPriority: priority,
      insightCategory: category,
    });
  }

  /**
   * Track insight dispensado
   */
  trackInsightDismissed(priority: 'high' | 'medium' | 'low', category: string): void {
    this.trackEvent('insight_dismissed', {
      insightPriority: priority,
      insightCategory: category,
    });
  }

  /**
   * Track uso de feature
   */
  trackFeatureUsed(featureName: string): void {
    this.trackEvent('feature_used', { featureName });
  }

  /**
   * Obter estatísticas de uso
   */
  async getUsageStats(): Promise<AIUsageStats> {
    try {
      const data = localStorage.getItem(this.STATS_KEY);
      const stats = data ? JSON.parse(data) : null;
      return stats || this.getDefaultStats();
    } catch (error) {
      Logger.error('Erro ao obter stats', error as Error, 'ANALYTICS');
      return this.getDefaultStats();
    }
  }

  /**
   * Obter eventos recentes
   */
  async getRecentEvents(limit: number = 50): Promise<AIAnalyticsEvent[]> {
    try {
      const events = await this.getEvents();
      return events.slice(-limit).reverse();
    } catch (error) {
      Logger.error('Erro ao obter eventos', error as Error, 'ANALYTICS');
      return [];
    }
  }

  /**
   * Limpar analytics (para testes ou reset)
   */
  async clearAnalytics(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STATS_KEY);
      Logger.info('Analytics limpos com sucesso', {}, 'ANALYTICS');
    } catch (error) {
      Logger.error('Erro ao limpar analytics', error as Error, 'ANALYTICS');
    }
  }

  /**
   * HELPERS PRIVADOS
   */

  private async getEvents(): Promise<AIAnalyticsEvent[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const events = data ? JSON.parse(data) : [];
    return events || [];
  }

  private async updateStats(event: AIAnalyticsEvent): Promise<void> {
    try {
      const stats = await this.getUsageStats();

      // Atualizar contadores
      switch (event.eventType) {
        case 'chat_open':
          stats.totalChatSessions++;
          break;
        case 'message_sent':
          stats.totalMessages++;
          break;
        case 'insight_viewed':
          stats.totalInsightsViewed++;
          if (event.metadata?.insightPriority) {
            stats.insightsByPriority[event.metadata.insightPriority]++;
          }
          break;
        case 'insight_dismissed':
          stats.totalInsightsDismissed++;
          break;
        case 'feature_used':
          if (event.metadata?.featureName) {
            const feature = stats.mostUsedFeatures.find(
              (f) => f.name === event.metadata!.featureName
            );
            if (feature) {
              feature.count++;
            } else {
              stats.mostUsedFeatures.push({
                name: event.metadata.featureName,
                count: 1,
              });
            }
            // Ordenar por uso
            stats.mostUsedFeatures.sort((a, b) => b.count - a.count);
            // Manter apenas top 10
            stats.mostUsedFeatures = stats.mostUsedFeatures.slice(0, 10);
          }
          break;
      }

      // Atualizar duração média de sessão
      if (event.eventType === 'chat_close' && event.metadata?.sessionDuration) {
        const totalSessions = stats.totalChatSessions;
        const currentAvg = stats.averageSessionDuration;
        stats.averageSessionDuration =
          (currentAvg * (totalSessions - 1) + event.metadata.sessionDuration) /
          totalSessions;
      }

      stats.lastUpdated = new Date();
      localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      Logger.error('Erro ao atualizar stats', error as Error, 'ANALYTICS');
    }
  }

  private getDefaultStats(): AIUsageStats {
    return {
      totalChatSessions: 0,
      totalMessages: 0,
      totalInsightsViewed: 0,
      totalInsightsDismissed: 0,
      averageSessionDuration: 0,
      mostUsedFeatures: [],
      insightsByPriority: {
        high: 0,
        medium: 0,
        low: 0,
      },
      lastUpdated: new Date(),
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========== GOOGLE ANALYTICS 4 INTEGRATION ==========

  private gaInitialized = false;
  private measurementId: string | null = null;

  /**
   * Inicializar Google Analytics 4
   */
  async initializeGA(): Promise<void> {
    try {
      this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

      if (!this.measurementId) {
        Logger.warn('Google Analytics Measurement ID not configured', 'ANALYTICS');
        return;
      }

      // Somente em produção
      if (!import.meta.env.PROD) {
        Logger.info('Google Analytics disabled in development', 'ANALYTICS');
        return;
      }

      // Carregar script
      await this.loadGtagScript();
      this.configGA();

      this.gaInitialized = true;
      Logger.info('✅ Google Analytics initialized', 'ANALYTICS');
    } catch (error) {
      Logger.error('Failed to initialize Google Analytics', error as Error, 'ANALYTICS');
    }
  }

  private async loadGtagScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gtag) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load gtag script'));

      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
    });
  }

  private configGA(): void {
    if (!window.gtag || !this.measurementId) return;

    window.gtag('config', this.measurementId, {
      send_page_view: false,
      cookie_flags: 'SameSite=None;Secure',
    });
  }

  /**
   * Track pageview no GA4
   */
  trackPageView(pageData?: Partial<PageView>): void {
    if (!this.gaInitialized || !window.gtag) return;

    const data = {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      ...pageData,
    };

    window.gtag('event', 'page_view', data);
  }

  /**
   * Track evento customizado no GA4
   */
  trackGAEvent(event: GAEvent): void {
    if (!this.gaInitialized || !window.gtag) return;

    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }

  /**
   * Track conversão
   */
  trackConversion(name: string, value?: number): void {
    this.trackGAEvent({
      action: 'conversion',
      category: 'Conversions',
      label: name,
      value,
    });
  }

  /**
   * Helpers de tracking comuns
   */
  trackSignup(method: string): void {
    this.trackGAEvent({ action: 'sign_up', category: 'Engagement', label: method });
  }

  trackLogin(method: string): void {
    this.trackGAEvent({ action: 'login', category: 'Engagement', label: method });
  }

  trackTransactionCreated(category: string, amount: number): void {
    this.trackGAEvent({
      action: 'transaction_created',
      category: 'Transactions',
      label: category,
      value: amount,
    });
  }

  trackGoalCreated(type: string): void {
    this.trackGAEvent({ action: 'goal_created', category: 'Goals', label: type });
  }

  trackExport(format: string): void {
    this.trackGAEvent({ action: 'export', category: 'Features', label: format });
  }

  trackUpgrade(plan: 'plus' | 'premium'): void {
    this.trackConversion('upgrade', plan === 'premium' ? 19.9 : 9.9);
  }

  setUserProperties(props: { user_id?: string; plan?: string }): void {
    if (!this.gaInitialized || !window.gtag) return;
    window.gtag('set', 'user_properties', props);
  }
}

export { AnalyticsService };
export default AnalyticsService.getInstance();
