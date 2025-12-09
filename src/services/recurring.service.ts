/**
 * Recurring Transactions Service
 * Serviço para gerenciar transações recorrentes com Supabase e fallback localStorage
 */

import { supabase } from '../config/supabase.config';
import Logger from './logger.service';
import type { TransactionType, PaymentMethod } from '../types/financial.types';

const logService = Logger;

const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};

export interface RecurringTransaction {
  id: string;
  user_id?: string;
  name: string;
  type: TransactionType;
  amount: number;
  
  // Categorização
  section: string;
  category: string;
  subcategory?: string;
  
  // Recorrência
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'yearly';
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  
  // Configurações
  accountId?: string;
  paymentMethod?: PaymentMethod;
  autoGenerate: boolean;
  notifyBefore?: number;
  
  // Status e controle
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  isActive: boolean;
  lastGenerated?: string;
  generatedCount: number;
  
  createdAt: string;
  updatedAt?: string;
}

interface RecurringTransactionInput {
  name: string;
  amount: number;
  type: TransactionType;
  section: string;
  category: string;
  subcategory?: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'yearly';
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
  accountId?: string;
  paymentMethod?: PaymentMethod;
  autoGenerate?: boolean;
  notifyBefore?: number;
  status?: 'active' | 'paused' | 'completed' | 'cancelled';
  isActive?: boolean;
}

class RecurringTransactionsService {
  private readonly STORAGE_KEY = 'financify_recurring';
  private readonly SYNC_QUEUE_KEY = 'financify_recurring_sync_queue';
  private isOnline: boolean = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logService.info('🟢 Conexão online - iniciando sincronização de recorrentes');
      this.syncPendingRecurring();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logService.warn('🔴 Conexão offline - usando localStorage para recorrentes');
    });
  }

  async createRecurring(data: RecurringTransactionInput): Promise<RecurringTransaction> {
    const userId = await this.getUserId();
    
    const recurring: any = {
      user_id: userId,
      name: data.name,
      amount: data.amount,
      type: data.type,
      section: data.section,
      category: data.category,
      subcategory: data.subcategory,
      frequency: data.frequency,
      dayOfMonth: data.dayOfMonth,
      dayOfWeek: data.dayOfWeek,
      startDate: data.startDate,
      endDate: data.endDate,
      accountId: data.accountId,
      paymentMethod: data.paymentMethod,
      status: data.status || 'active',
      isActive: data.isActive !== false,
      autoGenerate: data.autoGenerate !== false,
      notifyBefore: data.notifyBefore,
      nextOccurrence: this.calculateNextDue(data),
      generatedCount: 0,
      createdAt: new Date().toISOString(),
    };

    if (this.isOnline) {
      try {
        const { data: created, error } = await supabase
          .from('recurring_transactions')
          .insert([recurring])
          .select()
          .single();

        if (error) throw error;

        logService.info('✅ Recorrente criada no Supabase', { id: created.id });
        await this.saveToLocalStorage(created);
        return created;
      } catch (error) {
        logService.error('❌ Erro ao criar no Supabase, salvando offline', toError(error));
      }
    }

    const offlineRecurring: RecurringTransaction = {
      ...recurring,
      id: `offline_recurring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    await this.saveToLocalStorage(offlineRecurring);
    await this.addToSyncQueue('create', offlineRecurring);

    logService.warn('⚠️ Recorrente salva offline', { id: offlineRecurring.id });
    return offlineRecurring;
  }

  async getRecurringTransactions(): Promise<RecurringTransaction[]> {
    const userId = await this.getUserId();

    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('recurring_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('nextDue', { ascending: true });

        if (error) throw error;

        logService.info('✅ Recorrentes carregadas do Supabase', { count: data.length });
        await this.updateLocalStorageCache(data);
        return data;
      } catch (error) {
        logService.error('❌ Erro ao buscar do Supabase, usando cache local', toError(error));
      }
    }

    const localRecurring = await this.getFromLocalStorage();
    logService.warn('⚠️ Usando recorrentes do cache local', { count: localRecurring.length });
    return localRecurring;
  }

  async updateRecurring(id: string, updates: Partial<RecurringTransactionInput>): Promise<RecurringTransaction> {
    const userId = await this.getUserId();

    if (id.startsWith('offline_')) {
      const localRecurring = await this.getFromLocalStorage();
      const index = localRecurring.findIndex(r => r.id === id);
      
      if (index === -1) throw new Error('Recorrente não encontrada');

      const updated = { ...localRecurring[index], ...updates, updatedAt: new Date().toISOString() };
      localRecurring[index] = updated;
      await this.setLocalStorage(localRecurring);
      await this.addToSyncQueue('update', updated);

      logService.warn('⚠️ Recorrente offline atualizada', { id });
      return updated;
    }

    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('recurring_transactions')
          .update({ ...updates, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;

        logService.info('✅ Recorrente atualizada no Supabase', { id });
        await this.updateLocalRecurring(data);
        return data;
      } catch (error) {
        logService.error('❌ Erro ao atualizar no Supabase', toError(error));
        throw error;
      }
    }

    throw new Error('Não foi possível atualizar - sem conexão');
  }

  async deleteRecurring(id: string): Promise<void> {
    const userId = await this.getUserId();

    if (id.startsWith('offline_')) {
      const localRecurring = await this.getFromLocalStorage();
      const filtered = localRecurring.filter(r => r.id !== id);
      await this.setLocalStorage(filtered);
      
      logService.warn('⚠️ Recorrente offline removida', { id });
      return;
    }

    if (this.isOnline) {
      try {
        const { error } = await supabase
          .from('recurring_transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;

        logService.info('✅ Recorrente deletada do Supabase', { id });
        await this.removeFromLocalStorage(id);
        return;
      } catch (error) {
        logService.error('❌ Erro ao deletar do Supabase', toError(error));
        throw error;
      }
    }

    throw new Error('Não foi possível deletar - sem conexão');
  }

  async getDueSoon(days: number = 7): Promise<RecurringTransaction[]> {
    const all = await this.getRecurringTransactions();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return all.filter(r => {
      if (!r.isActive) return false;
      const dueDate = new Date(r.nextOccurrence);
      return dueDate >= now && dueDate <= futureDate;
    });
  }

  private calculateNextDue(data: RecurringTransactionInput): string {
    const start = new Date(data.startDate);
    const now = new Date();
    
    if (start > now) return data.startDate;

    switch (data.frequency) {
      case 'daily':
        return new Date(now.setDate(now.getDate() + 1)).toISOString();
      
      case 'weekly': {
        const daysUntilTarget = ((data.dayOfWeek || 0) - now.getDay() + 7) % 7;
        return new Date(now.setDate(now.getDate() + daysUntilTarget)).toISOString();
      }
      case 'monthly': {
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(data.dayOfMonth || 1);
        return nextMonth.toISOString();
      }
      case 'yearly': {
        const nextYear = new Date(now);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        return nextYear.toISOString();
      }
      
      default:
        return data.startDate;
    }
  }

  /**
   * Sincronizar transações recorrentes pendentes (método público)
   */
  public async syncPending(): Promise<number> {
    const queue = await this.getSyncQueue();
    if (queue.length === 0) return 0;
    
    await this.syncPendingRecurring();
    return queue.length;
  }

  private async syncPendingRecurring(): Promise<void> {
    const queue = await this.getSyncQueue();
    
    if (queue.length === 0) {
      logService.info('✅ Nenhuma recorrente para sincronizar');
      return;
    }

    logService.info(`🔄 Sincronizando ${queue.length} recorrentes pendentes...`);

    for (const item of queue) {
      try {
        if (item.action === 'create' && item.recurring.id.startsWith('offline_')) {
          const { id, user_id: _user_id, ...recurringData } = item.recurring;
          const { data, error } = await supabase
            .from('recurring_transactions')
            .insert([{ ...recurringData, user_id: await this.getUserId() }])
            .select()
            .single();

          if (error) throw error;

          await this.replaceOfflineId(id, data.id);
          logService.info('✅ Recorrente sincronizada', { oldId: id, newId: data.id });
        } else if (item.action === 'update') {
          const { id, user_id: _user_id, ...updates } = item.recurring;
          await this.updateRecurring(id, updates);
        }

        await this.removeFromSyncQueue(item.recurring.id);
      } catch (error) {
        logService.error('❌ Erro ao sincronizar recorrente', toError(error));
      }
    }

    logService.info('✅ Sincronização de recorrentes concluída');
  }

  private async getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');
    return user.id;
  }

  private async getFromLocalStorage(): Promise<RecurringTransaction[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logService.error('❌ Erro ao ler localStorage', toError(error));
      return [];
    }
  }

  private async setLocalStorage(recurring: RecurringTransaction[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recurring));
    } catch (error) {
      logService.error('❌ Erro ao salvar no localStorage', toError(error));
    }
  }

  private async saveToLocalStorage(recurring: RecurringTransaction): Promise<void> {
    const all = await this.getFromLocalStorage();
    const index = all.findIndex(r => r.id === recurring.id);
    
    if (index >= 0) {
      all[index] = recurring;
    } else {
      all.unshift(recurring);
    }
    
    await this.setLocalStorage(all);
  }

  private async updateLocalRecurring(recurring: RecurringTransaction): Promise<void> {
    const all = await this.getFromLocalStorage();
    const index = all.findIndex(r => r.id === recurring.id);
    
    if (index >= 0) {
      all[index] = recurring;
      await this.setLocalStorage(all);
    }
  }

  private async removeFromLocalStorage(id: string): Promise<void> {
    const all = await this.getFromLocalStorage();
    const filtered = all.filter(r => r.id !== id);
    await this.setLocalStorage(filtered);
  }

  private async updateLocalStorageCache(recurring: RecurringTransaction[]): Promise<void> {
    await this.setLocalStorage(recurring);
  }

  private async replaceOfflineId(oldId: string, newId: string): Promise<void> {
    const all = await this.getFromLocalStorage();
    const index = all.findIndex(r => r.id === oldId);
    
    if (index >= 0) {
      all[index].id = newId;
      await this.setLocalStorage(all);
    }
  }

  private async getSyncQueue(): Promise<Array<{ action: string; recurring: RecurringTransaction }>> {
    try {
      const data = localStorage.getItem(this.SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logService.error('❌ Erro ao ler fila de sincronização', toError(error));
      return [];
    }
  }

  private async addToSyncQueue(action: string, recurring: RecurringTransaction): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push({ action, recurring });
    
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      logService.error('❌ Erro ao adicionar à fila de sincronização', toError(error));
    }
  }

  private async removeFromSyncQueue(recurringId: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filtered = queue.filter(item => item.recurring.id !== recurringId);
    
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      logService.error('❌ Erro ao remover da fila de sincronização', toError(error));
    }
  }
}

export const _recurringTransactionsService = new RecurringTransactionsService();
