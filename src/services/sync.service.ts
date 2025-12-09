/**
 * Sync Service - Sincronização Automática
 * 
 * Detecta mudanças online/offline e sincroniza automaticamente
 * todos os services quando a conexão é restaurada.
 * 
 * @version 1.0.0
 */

import { transactionsService } from './transactions.service';
import { accountsService } from './accounts.service';
import { budgetsService } from './budgets.service';
import { goalsService } from './goals.service';
import { recurringTransactionsService } from './recurring.service';
import Logger from './logger.service';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncResult {
  service: string;
  success: boolean;
  syncedCount: number;
  error?: string;
}

class SyncService {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private listeners: Set<(status: SyncStatus, results?: SyncResult[]) => void> = new Set();
  private autoSyncEnabled: boolean = true;

  constructor() {
    this.setupEventListeners();
    Logger.info('🔄 SyncService inicializado', { online: this.isOnline }, 'SYNC');
  }

  /**
   * Configurar listeners de conexão
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Verificar a cada 30 segundos se há itens para sincronizar
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress && this.autoSyncEnabled) {
        this.checkAndSync();
      }
    }, 30000);
  }

  /**
   * Handler quando ficar online
   */
  private async handleOnline(): Promise<void> {
    this.isOnline = true;
    Logger.info('🌐 Conexão restaurada', {}, 'SYNC');
    this.notifyListeners('idle');
    
    if (this.autoSyncEnabled) {
      // Aguardar 2 segundos para estabilizar conexão
      setTimeout(() => {
        this.syncAll();
      }, 2000);
    }
  }

  /**
   * Handler quando ficar offline
   */
  private handleOffline(): void {
    this.isOnline = false;
    Logger.warn('📡 Conexão perdida - Modo offline ativado', {}, 'SYNC');
    this.notifyListeners('idle');
  }

  /**
   * Verificar se há itens pendentes e sincronizar
   */
  private async checkAndSync(): Promise<void> {
    const hasPending = this.hasPendingSync();
    if (hasPending) {
      Logger.info('🔄 Itens pendentes detectados - Iniciando sync automático', {}, 'SYNC');
      await this.syncAll();
    }
  }

  /**
   * Verificar se há itens pendentes de sincronização
   */
  private hasPendingSync(): boolean {
    try {
      const queues = [
        'financify_transactions_sync_queue',
        'financify_accounts_sync_queue',
        'financify_budgets_sync_queue',
        'financify_goals_sync_queue',
        'financify_recurring_sync_queue'
      ];

      for (const queueKey of queues) {
        const queue = localStorage.getItem(queueKey);
        if (queue) {
          const items = JSON.parse(queue);
          if (items.length > 0) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      Logger.error('❌ Erro ao verificar sync pendente', error as Error, 'SYNC');
      return false;
    }
  }

  /**
   * Sincronizar todos os services
   */
  public async syncAll(): Promise<SyncResult[]> {
    if (this.syncInProgress) {
      Logger.warn('⏳ Sync já em progresso', {}, 'SYNC');
      return [];
    }

    if (!this.isOnline) {
      Logger.warn('📡 Offline - Sync cancelado', {}, 'SYNC');
      return [];
    }

    this.syncInProgress = true;
    this.notifyListeners('syncing');

    const results: SyncResult[] = [];

    try {
      Logger.info('🔄 Iniciando sincronização completa', {}, 'SYNC');

      // Sincronizar cada service
      const services = [
        { name: 'Transactions', service: transactionsService },
        { name: 'Accounts', service: accountsService },
        { name: 'Budgets', service: budgetsService },
        { name: 'Goals', service: goalsService },
        { name: 'Recurring', service: recurringTransactionsService }
      ];

      for (const { name, service } of services) {
        try {
          const syncedCount = await service.syncPending();
          results.push({
            service: name,
            success: true,
            syncedCount
          });
          Logger.info(`✅ ${name} sincronizado`, { syncedCount }, 'SYNC');
        } catch (error) {
          results.push({
            service: name,
            success: false,
            syncedCount: 0,
            error: (error as Error).message
          });
          Logger.error(`❌ Erro ao sincronizar ${name}`, error as Error, 'SYNC');
        }
      }

      const totalSynced = results.reduce((sum, r) => sum + r.syncedCount, 0);
      const hasErrors = results.some(r => !r.success);

      Logger.info('🎉 Sincronização completa', {
        totalSynced,
        hasErrors,
        results
      }, 'SYNC');

      this.notifyListeners(hasErrors ? 'error' : 'success', results);

      return results;
    } catch (error) {
      Logger.error('❌ Erro na sincronização completa', error as Error, 'SYNC');
      this.notifyListeners('error');
      return results;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Adicionar listener de status de sync
   */
  public addListener(callback: (status: SyncStatus, results?: SyncResult[]) => void): void {
    this.listeners.add(callback);
  }

  /**
   * Remover listener
   */
  public removeListener(callback: (status: SyncStatus, results?: SyncResult[]) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * Notificar todos os listeners
   */
  private notifyListeners(status: SyncStatus, results?: SyncResult[]): void {
    this.listeners.forEach(callback => callback(status, results));
  }

  /**
   * Verificar se está online
   */
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Ativar/desativar sync automático
   */
  public setAutoSync(enabled: boolean): void {
    this.autoSyncEnabled = enabled;
    Logger.info(`🔄 Auto-sync ${enabled ? 'ativado' : 'desativado'}`, {}, 'SYNC');
  }

  /**
   * Verificar se sync está em progresso
   */
  public isSyncing(): boolean {
    return this.syncInProgress;
  }

  /**
   * Forçar sincronização manual
   */
  public async forceSync(): Promise<SyncResult[]> {
    Logger.info('🔄 Sync manual forçado', {}, 'SYNC');
    return this.syncAll();
  }
}

// Export singleton
export const syncService = new SyncService();
