/**
 * Budgets Service
 * Serviço para gerenciar orçamentos com Supabase e fallback localStorage
 */

import { supabase } from '../config/supabase.config';
import Logger from './logger.service';

const logService = Logger;

const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};

export interface Budget {
  id: string;
  user_id?: string;
  category: string;
  description?: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  limitAmount: number;
  currentSpent: number;
  alertThreshold: number; // Percentage (ex: 80 = alerta aos 80%)
  status: 'active' | 'paused' | 'completed';
  startDate: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BudgetInput {
  category: string;
  description?: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  limitAmount: number;
  currentSpent?: number;
  alertThreshold?: number;
  status?: 'active' | 'paused' | 'completed';
  startDate: string;
}

class BudgetsService {
  private readonly STORAGE_KEY = 'financify_budgets';
  private readonly SYNC_QUEUE_KEY = 'financify_budgets_sync_queue';
  private isOnline: boolean = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logService.info('🟢 Conexão online - iniciando sincronização de orçamentos');
      this.syncPendingBudgets();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logService.warn('🔴 Conexão offline - usando localStorage para orçamentos');
    });
  }

  async createBudget(data: BudgetInput): Promise<Budget> {
    const userId = await this.getUserId();
    
    const budget: any = {
      user_id: userId,
      category: data.category,
      description: data.description,
      limitAmount: data.limitAmount,
      currentSpent: data.currentSpent || 0,
      period: data.period,
      startDate: data.startDate,
      alertThreshold: data.alertThreshold || 80,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
    };

    if (this.isOnline) {
      try {
        const { data: created, error } = await supabase
          .from('budgets')
          .insert([budget])
          .select()
          .single();

        if (error) throw error;

        logService.info('✅ Orçamento criado no Supabase', { id: created.id });
        await this.saveToLocalStorage(created);
        return created;
      } catch (error) {
        logService.error('❌ Erro ao criar no Supabase, salvando offline', toError(error));
      }
    }

    const offlineBudget: Budget = {
      ...budget,
      id: `offline_budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    await this.saveToLocalStorage(offlineBudget);
    await this.addToSyncQueue('create', offlineBudget);

    logService.warn('⚠️ Orçamento salvo offline', { id: offlineBudget.id });
    return offlineBudget;
  }

  async getBudgets(): Promise<Budget[]> {
    const userId = await this.getUserId();

    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId)
          .order('createdAt', { ascending: false });

        if (error) throw error;

        logService.info('✅ Orçamentos carregados do Supabase', { count: data.length });
        await this.updateLocalStorageCache(data);
        return data;
      } catch (error) {
        logService.error('❌ Erro ao buscar do Supabase, usando cache local', toError(error));
      }
    }

    const localBudgets = await this.getFromLocalStorage();
    logService.warn('⚠️ Usando orçamentos do cache local', { count: localBudgets.length });
    return localBudgets;
  }

  async updateBudget(id: string, updates: Partial<BudgetInput>): Promise<Budget> {
    const userId = await this.getUserId();

    if (id.startsWith('offline_')) {
      const localBudgets = await this.getFromLocalStorage();
      const index = localBudgets.findIndex(b => b.id === id);
      
      if (index === -1) throw new Error('Orçamento não encontrado');

      const updated = { ...localBudgets[index], ...updates, updatedAt: new Date().toISOString() };
      localBudgets[index] = updated;
      await this.setLocalStorage(localBudgets);
      await this.addToSyncQueue('update', updated);

      logService.warn('⚠️ Orçamento offline atualizado', { id });
      return updated;
    }

    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('budgets')
          .update({ ...updates, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;

        logService.info('✅ Orçamento atualizado no Supabase', { id });
        await this.updateLocalBudget(data);
        return data;
      } catch (error) {
        logService.error('❌ Erro ao atualizar no Supabase', toError(error));
        throw error;
      }
    }

    throw new Error('Não foi possível atualizar - sem conexão');
  }

  async deleteBudget(id: string): Promise<void> {
    const userId = await this.getUserId();

    if (id.startsWith('offline_')) {
      const localBudgets = await this.getFromLocalStorage();
      const filtered = localBudgets.filter(b => b.id !== id);
      await this.setLocalStorage(filtered);
      
      logService.warn('⚠️ Orçamento offline removido', { id });
      return;
    }

    if (this.isOnline) {
      try {
        const { error } = await supabase
          .from('budgets')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;

        logService.info('✅ Orçamento deletado do Supabase', { id });
        await this.removeFromLocalStorage(id);
        return;
      } catch (error) {
        logService.error('❌ Erro ao deletar do Supabase', toError(error));
        throw error;
      }
    }

    throw new Error('Não foi possível deletar - sem conexão');
  }

  async updateSpent(id: string, amount: number): Promise<void> {
    const budgets = await this.getBudgets();
    const budget = budgets.find(b => b.id === id);
    
    if (!budget) throw new Error('Orçamento não encontrado');

    const newSpent = budget.currentSpent + amount;
    await this.updateBudget(id, { currentSpent: newSpent } as any);

    // Verificar alertas
    const percentage = (newSpent / budget.limitAmount) * 100;
    if (budget.alertThreshold && percentage >= budget.alertThreshold) {
      logService.warn(`⚠️ Orçamento "${budget.category}" atingiu ${percentage.toFixed(1)}%`);
    }
  }

  /**
   * Sincronizar orçamentos pendentes (método público)
   */
  public async syncPending(): Promise<number> {
    const queue = await this.getSyncQueue();
    if (queue.length === 0) return 0;
    
    await this.syncPendingBudgets();
    return queue.length;
  }

  private async syncPendingBudgets(): Promise<void> {
    const queue = await this.getSyncQueue();
    
    if (queue.length === 0) {
      logService.info('✅ Nenhum orçamento para sincronizar');
      return;
    }

    logService.info(`🔄 Sincronizando ${queue.length} orçamentos pendentes...`);

    for (const item of queue) {
      try {
        if (item.action === 'create' && item.budget.id.startsWith('offline_')) {
          const { id, user_id: _user_id, ...budgetData } = item.budget;
          const { data, error } = await supabase
            .from('budgets')
            .insert([{ ...budgetData, user_id: await this.getUserId() }])
            .select()
            .single();

          if (error) throw error;

          await this.replaceOfflineId(id, data.id);
          logService.info('✅ Orçamento sincronizado', { oldId: id, newId: data.id });
        } else if (item.action === 'update') {
          const { id, user_id: _user_id, ...updates } = item.budget;
          await this.updateBudget(id, updates);
        }

        await this.removeFromSyncQueue(item.budget.id);
      } catch (error) {
        logService.error('❌ Erro ao sincronizar orçamento', toError(error));
      }
    }

    logService.info('✅ Sincronização de orçamentos concluída');
  }

  private async getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');
    return user.id;
  }

  private async getFromLocalStorage(): Promise<Budget[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logService.error('❌ Erro ao ler localStorage', toError(error));
      return [];
    }
  }

  private async setLocalStorage(budgets: Budget[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(budgets));
    } catch (error) {
      logService.error('❌ Erro ao salvar no localStorage', toError(error));
    }
  }

  private async saveToLocalStorage(budget: Budget): Promise<void> {
    const budgets = await this.getFromLocalStorage();
    const index = budgets.findIndex(b => b.id === budget.id);
    
    if (index >= 0) {
      budgets[index] = budget;
    } else {
      budgets.unshift(budget);
    }
    
    await this.setLocalStorage(budgets);
  }

  private async updateLocalBudget(budget: Budget): Promise<void> {
    const budgets = await this.getFromLocalStorage();
    const index = budgets.findIndex(b => b.id === budget.id);
    
    if (index >= 0) {
      budgets[index] = budget;
      await this.setLocalStorage(budgets);
    }
  }

  private async removeFromLocalStorage(id: string): Promise<void> {
    const budgets = await this.getFromLocalStorage();
    const filtered = budgets.filter(b => b.id !== id);
    await this.setLocalStorage(filtered);
  }

  private async updateLocalStorageCache(budgets: Budget[]): Promise<void> {
    await this.setLocalStorage(budgets);
  }

  private async replaceOfflineId(oldId: string, newId: string): Promise<void> {
    const budgets = await this.getFromLocalStorage();
    const index = budgets.findIndex(b => b.id === oldId);
    
    if (index >= 0) {
      budgets[index].id = newId;
      await this.setLocalStorage(budgets);
    }
  }

  private async getSyncQueue(): Promise<Array<{ action: string; budget: Budget }>> {
    try {
      const data = localStorage.getItem(this.SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logService.error('❌ Erro ao ler fila de sincronização', toError(error));
      return [];
    }
  }

  private async addToSyncQueue(action: string, budget: Budget): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push({ action, budget });
    
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      logService.error('❌ Erro ao adicionar à fila de sincronização', toError(error));
    }
  }

  private async removeFromSyncQueue(budgetId: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filtered = queue.filter(item => item.budget.id !== budgetId);
    
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      logService.error('❌ Erro ao remover da fila de sincronização', toError(error));
    }
  }
}

export const _budgetsService = new BudgetsService();
