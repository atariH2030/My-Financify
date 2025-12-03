/**
 * @file push-notification.service.ts
 * @description Sistema de Push Notifications com Web Push API - Sprint 5.3
 * @version 3.12.0
 * @author DEV - Rickson (TQM)
 * 
 * PILARES:
 * - Web Push API para notificações do navegador
 * - Permissões gerenciadas adequadamente
 * - Integração com PWA Service Worker
 * - Notificações personalizáveis (ícone, badge, ações)
 * - Logs robustos para debug
 */

import Logger from './logger.service';

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: unknown;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export type NotificationPermission = 'default' | 'granted' | 'denied';

class PushNotificationService {
  private static instance: PushNotificationService;
  private readonly STORAGE_KEY = 'push_notification_settings';
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.initialize();
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Inicializa o serviço de notificações
   */
  private async initialize(): Promise<void> {
    try {
      // Verificar se o navegador suporta notificações
      if (!('Notification' in window)) {
        Logger.warn('Browser não suporta Web Notifications', undefined, 'PUSH');
        return;
      }

      // Verificar se há service worker registrado
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        this.registration = registration;
        Logger.info('Push Notifications inicializado', undefined, 'PUSH');
      }
    } catch (error) {
      Logger.error('Erro ao inicializar Push Notifications', error as Error, 'PUSH');
    }
  }

  /**
   * Verifica se navegador suporta notificações
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Obter permissão atual
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Solicitar permissão para notificações
   */
  async requestPermission(): Promise<NotificationPermission> {
    try {
      if (!this.isSupported()) {
        Logger.warn('Notificações não suportadas', undefined, 'PUSH');
        return 'denied';
      }

      const permission = await Notification.requestPermission();
      Logger.info('Permissão de notificação', { permission }, 'PUSH');
      
      // Salvar preferência
      this.saveSettings({ permission });

      return permission;
    } catch (error) {
      Logger.error('Erro ao solicitar permissão', error as Error, 'PUSH');
      return 'denied';
    }
  }

  /**
   * Enviar notificação local
   */
  async sendNotification(options: PushNotificationOptions): Promise<void> {
    try {
      // Verificar permissão
      const permission = this.getPermission();
      if (permission !== 'granted') {
        Logger.warn('Permissão de notificação negada', undefined, 'PUSH');
        return;
      }

      // Enviar via Service Worker (melhor para PWA)
      if (this.registration) {
        await this.registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/icons/icon-192x192.png',
          badge: options.badge || '/icons/badge-72x72.png',
          tag: options.tag || `notification-${Date.now()}`,
          data: options.data,
          requireInteraction: options.requireInteraction || false,
          // @ts-expect-error - actions é específica do Service Worker
          actions: options.actions,
          vibrate: [200, 100, 200],
        });

        Logger.info('Notificação enviada', { title: options.title }, 'PUSH');
      } else {
        // Fallback: Notification API direta (sem actions)
        new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/icons/icon-192x192.png',
        });
      }
    } catch (error) {
      Logger.error('Erro ao enviar notificação', error as Error, 'PUSH');
    }
  }

  /**
   * Notificações pré-configuradas para eventos comuns
   */
  async notifyBudgetAlert(categoryName: string, percentUsed: number): Promise<void> {
    await this.sendNotification({
      title: '⚠️ Alerta de Orçamento',
      body: `Você usou ${percentUsed}% do orçamento de ${categoryName}`,
      tag: 'budget-alert',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'Ver Orçamento' },
        { action: 'dismiss', title: 'Dispensar' },
      ],
      data: { type: 'budget', category: categoryName },
    });
  }

  async notifyGoalAchieved(goalName: string): Promise<void> {
    await this.sendNotification({
      title: '🎯 Meta Alcançada!',
      body: `Parabéns! Você atingiu sua meta: ${goalName}`,
      tag: 'goal-achieved',
      requireInteraction: true,
      actions: [
        { action: 'celebrate', title: '🎉 Celebrar' },
        { action: 'new-goal', title: 'Nova Meta' },
      ],
      data: { type: 'goal', name: goalName },
    });
  }

  async notifyRecurringTransactionDue(transactionName: string, amount: number): Promise<void> {
    await this.sendNotification({
      title: '📅 Transação Recorrente',
      body: `Lembrete: ${transactionName} - R$ ${amount.toFixed(2)} vence hoje`,
      tag: 'recurring-due',
      requireInteraction: false,
      actions: [
        { action: 'pay', title: 'Registrar Pagamento' },
        { action: 'snooze', title: 'Lembrar Depois' },
      ],
      data: { type: 'recurring', name: transactionName, amount },
    });
  }

  async notifyInsightAvailable(insightTitle: string, priority: 'high' | 'medium' | 'low'): Promise<void> {
    const emoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
    
    await this.sendNotification({
      title: `${emoji} Novo Insight de IA`,
      body: insightTitle,
      tag: 'ai-insight',
      requireInteraction: priority === 'high',
      actions: [
        { action: 'view', title: 'Ver Insight' },
        { action: 'dismiss', title: 'Dispensar' },
      ],
      data: { type: 'insight', priority },
    });
  }

  async notifySyncComplete(itemsSynced: number): Promise<void> {
    await this.sendNotification({
      title: '✅ Sincronização Concluída',
      body: `${itemsSynced} item(s) sincronizado(s) com sucesso`,
      tag: 'sync-complete',
      requireInteraction: false,
      data: { type: 'sync', count: itemsSynced },
    });
  }

  /**
   * Agendar notificação futura (usando setTimeout)
   */
  scheduleNotification(options: PushNotificationOptions, delayMs: number): number {
    const timeoutId = window.setTimeout(() => {
      this.sendNotification(options);
    }, delayMs);

    Logger.info('Notificação agendada', { delay: delayMs }, 'PUSH');
    return timeoutId;
  }

  /**
   * Cancelar notificação agendada
   */
  cancelScheduledNotification(timeoutId: number): void {
    window.clearTimeout(timeoutId);
    Logger.info('Notificação cancelada', { timeoutId }, 'PUSH');
  }

  /**
   * Obter notificações ativas
   */
  async getActiveNotifications(): Promise<Notification[]> {
    try {
      if (!this.registration) {
        return [];
      }
      return await this.registration.getNotifications();
    } catch (error) {
      Logger.error('Erro ao obter notificações ativas', error as Error, 'PUSH');
      return [];
    }
  }

  /**
   * Fechar todas as notificações
   */
  async closeAllNotifications(): Promise<void> {
    try {
      const notifications = await this.getActiveNotifications();
      notifications.forEach((notification) => notification.close());
      Logger.info('Todas as notificações fechadas', undefined, 'PUSH');
    } catch (error) {
      Logger.error('Erro ao fechar notificações', error as Error, 'PUSH');
    }
  }

  /**
   * Salvar configurações
   */
  private saveSettings(settings: { permission: NotificationPermission }): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      Logger.error('Erro ao salvar configurações', error as Error, 'PUSH');
    }
  }

  /**
   * Obter configurações salvas
   */
  getSettings(): { permission: NotificationPermission } | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      Logger.error('Erro ao carregar configurações', error as Error, 'PUSH');
      return null;
    }
  }

  /**
   * Testar notificação (para debug/demo)
   */
  async testNotification(): Promise<void> {
    await this.sendNotification({
      title: '🔔 Teste de Notificação',
      body: 'Se você está vendo isso, as notificações estão funcionando!',
      tag: 'test-notification',
      requireInteraction: false,
      actions: [
        { action: 'ok', title: '👍 OK' },
      ],
      data: { type: 'test' },
    });
  }
}

export { PushNotificationService };
export default PushNotificationService.getInstance();
