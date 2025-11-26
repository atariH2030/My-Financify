/**
 * Notification Service - Sistema centralizado de notificações
 * Gerencia alertas, lembretes e notificações do sistema
 * 
 * @version 3.4.0
 */

import Logger from './logger.service';
import Storage from './storage.service';

export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'budget-alert' 
  | 'goal-reminder'
  | 'transaction';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    budgetId?: string;
    goalId?: string;
    transactionId?: string;
    amount?: number;
    percentage?: number;
  };
}

class NotificationService {
  private readonly STORAGE_KEY = 'notifications';
  private readonly MAX_NOTIFICATIONS = 50;
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  /**
   * Cria uma nova notificação
   */
  async create(
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      priority?: NotificationPriority;
      actionUrl?: string;
      actionLabel?: string;
      metadata?: Notification['metadata'];
    }
  ): Promise<Notification> {
    try {
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        priority: options?.priority || this.getPriorityByType(type),
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: options?.actionUrl,
        actionLabel: options?.actionLabel,
        metadata: options?.metadata,
      };

      const notifications = await this.getAll();
      notifications.unshift(notification);

      // Limita ao máximo de notificações
      const limited = notifications.slice(0, this.MAX_NOTIFICATIONS);
      
      await Storage.save(this.STORAGE_KEY, limited);
      this.notifyListeners(limited);

      Logger.info(
        `📬 Nova notificação: ${title}`,
        { type, priority: notification.priority },
        'NOTIFICATION'
      );

      return notification;
    } catch (error) {
      Logger.error('Falha ao criar notificação', error as Error, 'NOTIFICATION');
      throw error;
    }
  }

  /**
   * Obtém todas as notificações
   */
  async getAll(): Promise<Notification[]> {
    try {
      const notifications = await Storage.load<Notification[]>(this.STORAGE_KEY);
      return notifications || [];
    } catch (error) {
      Logger.error('Falha ao carregar notificações', error as Error, 'NOTIFICATION');
      return [];
    }
  }

  /**
   * Obtém notificações não lidas
   */
  async getUnread(): Promise<Notification[]> {
    const all = await this.getAll();
    return all.filter(n => !n.read);
  }

  /**
   * Obtém contagem de não lidas
   */
  async getUnreadCount(): Promise<number> {
    const unread = await this.getUnread();
    return unread.length;
  }

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: string): Promise<void> {
    try {
      const notifications = await this.getAll();
      const updated = notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );

      await Storage.save(this.STORAGE_KEY, updated);
      this.notifyListeners(updated);
    } catch (error) {
      Logger.error('Falha ao marcar como lida', error as Error, 'NOTIFICATION');
    }
  }

  /**
   * Marca todas como lidas
   */
  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getAll();
      const updated = notifications.map(n => ({ ...n, read: true }));

      await Storage.save(this.STORAGE_KEY, updated);
      this.notifyListeners(updated);

      Logger.info('✅ Todas notificações marcadas como lidas', undefined, 'NOTIFICATION');
    } catch (error) {
      Logger.error('Falha ao marcar todas como lidas', error as Error, 'NOTIFICATION');
    }
  }

  /**
   * Remove uma notificação
   */
  async remove(id: string): Promise<void> {
    try {
      const notifications = await this.getAll();
      const filtered = notifications.filter(n => n.id !== id);

      await Storage.save(this.STORAGE_KEY, filtered);
      this.notifyListeners(filtered);
    } catch (error) {
      Logger.error('Falha ao remover notificação', error as Error, 'NOTIFICATION');
    }
  }

  /**
   * Remove todas as notificações
   */
  async clearAll(): Promise<void> {
    try {
      await Storage.save(this.STORAGE_KEY, []);
      this.notifyListeners([]);

      Logger.info('🗑️ Todas notificações removidas', undefined, 'NOTIFICATION');
    } catch (error) {
      Logger.error('Falha ao limpar notificações', error as Error, 'NOTIFICATION');
    }
  }

  /**
   * Registra um listener para mudanças
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);

    // Retorna função para cancelar inscrição
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifica todos os listeners
   */
  private notifyListeners(notifications: Notification[]): void {
    this.listeners.forEach(listener => {
      try {
        listener(notifications);
      } catch (error) {
        Logger.error('Erro no listener de notificação', error as Error, 'NOTIFICATION');
      }
    });
  }

  /**
   * Determina prioridade baseada no tipo
   */
  private getPriorityByType(type: NotificationType): NotificationPriority {
    const priorityMap: Record<NotificationType, NotificationPriority> = {
      'info': 'low',
      'success': 'low',
      'warning': 'medium',
      'error': 'high',
      'budget-alert': 'high',
      'goal-reminder': 'medium',
      'transaction': 'low',
    };

    return priorityMap[type] || 'medium';
  }

  /**
   * Helpers para criar notificações específicas
   */

  // Alerta de orçamento
  async notifyBudgetAlert(
    budgetCategory: string,
    currentAmount: number,
    limitAmount: number,
    percentage: number
  ): Promise<void> {
    const title = percentage >= 100 
      ? '🚨 Orçamento Ultrapassado!' 
      : percentage >= 90
      ? '⚠️ Orçamento Crítico!'
      : '⚡ Alerta de Orçamento';

    const message = percentage >= 100
      ? `O orçamento de ${budgetCategory} foi ultrapassado! Você gastou R$ ${currentAmount.toFixed(2)} de R$ ${limitAmount.toFixed(2)} (${percentage.toFixed(0)}%).`
      : `Você atingiu ${percentage.toFixed(0)}% do orçamento de ${budgetCategory} (R$ ${currentAmount.toFixed(2)} de R$ ${limitAmount.toFixed(2)}).`;

    await this.create('budget-alert', title, message, {
      priority: percentage >= 100 ? 'urgent' : 'high',
      actionUrl: '/budgets',
      actionLabel: 'Ver Orçamentos',
      metadata: { amount: currentAmount, percentage },
    });
  }

  // Lembrete de meta
  async notifyGoalReminder(
    goalTitle: string,
    daysRemaining: number,
    currentAmount: number,
    targetAmount: number
  ): Promise<void> {
    const percentage = (currentAmount / targetAmount) * 100;

    const title = daysRemaining <= 7
      ? '⏰ Meta Próxima do Prazo!'
      : '🎯 Lembrete de Meta';

    const message = daysRemaining <= 7
      ? `A meta "${goalTitle}" vence em ${daysRemaining} dias! Você está em ${percentage.toFixed(0)}% do objetivo.`
      : `Lembrete: sua meta "${goalTitle}" está em ${percentage.toFixed(0)}% de conclusão.`;

    await this.create('goal-reminder', title, message, {
      priority: daysRemaining <= 7 ? 'high' : 'medium',
      actionUrl: '/goals',
      actionLabel: 'Ver Metas',
      metadata: { amount: currentAmount, percentage },
    });
  }

  // Confirmação de transação
  async notifyTransaction(
    type: 'created' | 'updated' | 'deleted',
    description: string,
    amount: number
  ): Promise<void> {
    const titles = {
      created: '✅ Transação Adicionada',
      updated: '✏️ Transação Atualizada',
      deleted: '🗑️ Transação Removida',
    };

    const messages = {
      created: `"${description}" foi adicionada (R$ ${amount.toFixed(2)}).`,
      updated: `"${description}" foi atualizada.`,
      deleted: `"${description}" foi removida.`,
    };

    await this.create('transaction', titles[type], messages[type], {
      priority: 'low',
      metadata: { amount },
    });
  }
}

// Singleton
export default new NotificationService();
