/**
 * @file offline-queue.service.ts
 * @description Sistema robusto de queue para operações offline
 * @version 3.13.0
 * @author DEV - Rickson (TQM)
 */

import Logger from './logger.service';

export type OperationType = 'create' | 'update' | 'delete';
export type EntityType = 'transaction' | 'account' | 'budget' | 'goal' | 'recurring';

export interface QueueOperation {
  id: string;
  type: OperationType;
  entity: EntityType;
  data: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

class OfflineQueueService {
  private static instance: OfflineQueueService;
  private readonly QUEUE_KEY = 'offline_operations_queue';
  private readonly MAX_RETRIES = 3;
  private isProcessing = false;

  private constructor() {
    this.setupOnlineListener();
  }

  static getInstance(): OfflineQueueService {
    if (!OfflineQueueService.instance) {
      OfflineQueueService.instance = new OfflineQueueService();
    }
    return OfflineQueueService.instance;
  }

  /**
   * Adicionar operação à queue
   */
  async enqueue(
    type: OperationType,
    entity: EntityType,
    data: any
  ): Promise<string> {
    try {
      const operation: QueueOperation = {
        id: this.generateId(),
        type,
        entity,
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        maxRetries: this.MAX_RETRIES,
        status: 'pending',
      };

      const queue = await this.getQueue();
      queue.push(operation);
      await this.saveQueue(queue);

      Logger.info(`Operação enfileirada: ${type} ${entity}`, { id: operation.id }, 'OFFLINE_QUEUE');

      // Se online, processar imediatamente
      if (navigator.onLine) {
        this.processQueue();
      }

      return operation.id;
    } catch (error) {
      Logger.error('Erro ao enfileirar operação', error as Error, 'OFFLINE_QUEUE');
      throw error;
    }
  }

  /**
   * Processar queue de operações
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;

    try {
      const queue = await this.getQueue();
      const pendingOps = queue.filter((op) => op.status === 'pending');

      Logger.info(`Processando ${pendingOps.length} operações pendentes`, {}, 'OFFLINE_QUEUE');

      for (const operation of pendingOps) {
        await this.processOperation(operation);
      }

      // Limpar operações completadas antigas (mais de 7 dias)
      await this.cleanupOldOperations();
    } catch (error) {
      Logger.error('Erro ao processar queue', error as Error, 'OFFLINE_QUEUE');
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Obter operações pendentes
   */
  async getPendingOperations(): Promise<QueueOperation[]> {
    const queue = await this.getQueue();
    return queue.filter((op) => op.status === 'pending');
  }

  /**
   * Obter estatísticas da queue
   */
  async getQueueStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    failed: number;
    completed: number;
  }> {
    const queue = await this.getQueue();
    return {
      total: queue.length,
      pending: queue.filter((op) => op.status === 'pending').length,
      processing: queue.filter((op) => op.status === 'processing').length,
      failed: queue.filter((op) => op.status === 'failed').length,
      completed: queue.filter((op) => op.status === 'completed').length,
    };
  }

  /**
   * Retry operação falhada
   */
  async retryOperation(operationId: string): Promise<void> {
    const queue = await this.getQueue();
    const operation = queue.find((op) => op.id === operationId);

    if (!operation) {
      throw new Error('Operação não encontrada');
    }

    if (operation.status !== 'failed') {
      throw new Error('Apenas operações falhadas podem ser retentadas');
    }

    operation.status = 'pending';
    operation.retryCount = 0;
    operation.error = undefined;

    await this.saveQueue(queue);
    await this.processQueue();
  }

  /**
   * Limpar queue (para testes)
   */
  async clearQueue(): Promise<void> {
    localStorage.removeItem(this.QUEUE_KEY);
    Logger.info('Queue limpa', {}, 'OFFLINE_QUEUE');
  }

  /**
   * HELPERS PRIVADOS
   */

  private async processOperation(operation: QueueOperation): Promise<void> {
    try {
      operation.status = 'processing';
      await this.updateOperation(operation);

      // Simular sync com backend (substituir com chamada real)
      await this.syncWithBackend(operation);

      // Atualizar status para completed
      const updatedOperation = { ...operation, status: 'completed' as const };
      await this.updateOperation(updatedOperation);

      Logger.info(`Operação processada: ${operation.type} ${operation.entity}`, 
        { id: operation.id }, 'OFFLINE_QUEUE');
    } catch (error) {
      operation.retryCount++;
      operation.error = (error as Error).message;

      if (operation.retryCount >= operation.maxRetries) {
        operation.status = 'failed';
        Logger.error(`Operação falhou após ${operation.maxRetries} tentativas`, 
          error as Error, 'OFFLINE_QUEUE');
      } else {
        operation.status = 'pending';
        Logger.warn(`Operação falhou (tentativa ${operation.retryCount}/${operation.maxRetries})`, 
          { error: (error as Error).message }, 'OFFLINE_QUEUE');
      }

      await this.updateOperation(operation);
    }
  }

  private async syncWithBackend(_operation: QueueOperation): Promise<void> {
    // TODO: Implementar sync real com Supabase
    // Por enquanto, simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simular falha ocasional para testes
    if (Math.random() < 0.1) {
      throw new Error('Erro de rede simulado');
    }
  }

  private async getQueue(): Promise<QueueOperation[]> {
    try {
      const data = localStorage.getItem(this.QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      Logger.error('Erro ao obter queue', error as Error, 'OFFLINE_QUEUE');
      return [];
    }
  }

  private async saveQueue(queue: QueueOperation[]): Promise<void> {
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      Logger.error('Erro ao salvar queue', error as Error, 'OFFLINE_QUEUE');
      throw error;
    }
  }

  private async updateOperation(operation: QueueOperation): Promise<void> {
    try {
      const queue = await this.getQueue();
      const index = queue.findIndex((op) => op.id === operation.id);
      
      if (index !== -1) {
        queue[index] = operation;
        await this.saveQueue(queue);
      }
    } catch (error) {
      Logger.error('Erro ao atualizar operação', error as Error, 'OFFLINE_QUEUE');
      throw error;
    }
  }

  private async cleanupOldOperations(): Promise<void> {
    try {
      const queue = await this.getQueue();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const cleanedQueue = queue.filter((op) => {
        const opDate = new Date(op.timestamp);
        return op.status !== 'completed' || opDate > sevenDaysAgo;
      });

      if (cleanedQueue.length < queue.length) {
        await this.saveQueue(cleanedQueue);
        Logger.info(`Limpas ${queue.length - cleanedQueue.length} operações antigas`, 
          {}, 'OFFLINE_QUEUE');
      }
    } catch (error) {
      Logger.error('Erro ao limpar operações antigas', error as Error, 'OFFLINE_QUEUE');
    }
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      Logger.info('Conexão restaurada, processando queue', {}, 'OFFLINE_QUEUE');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      Logger.info('Conexão perdida, operações serão enfileiradas', {}, 'OFFLINE_QUEUE');
    });
  }

  private generateId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default OfflineQueueService.getInstance();
