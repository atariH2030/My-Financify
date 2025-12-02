/**
 * Transactions Service
 * Serviço para gerenciar transações com Supabase e fallback localStorage
 */

import { supabase } from '../config/supabase.config';
import Logger from './logger.service';
import type { Transaction, TransactionType } from '../types/financial.types';

const logService = Logger;

// Helper para converter unknown error em Error
const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};

interface TransactionInput {
  description: string;
  amount: number;
  type: TransactionType;
  section: string;
  category: string;
  subcategory?: string;
  date: Date;
  accountId?: string;
  notes?: string;
  tags?: string[];
}

interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  section?: string;
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
}

class TransactionsService {
  private readonly STORAGE_KEY = 'financify_transactions';
  private readonly SYNC_QUEUE_KEY = 'financify_sync_queue';
  private isOnline: boolean = navigator.onLine;

  constructor() {
    // Monitorar status de conexão
    window.addEventListener('online', () => {
      this.isOnline = true;
      logService.info('🟢 Conexão online - iniciando sincronização');
      this.syncPendingTransactions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logService.warn('🔴 Conexão offline - usando localStorage');
    });
  }

  /**
   * Criar nova transação
   */
  async createTransaction(data: TransactionInput): Promise<Transaction> {
    const userId = await this.getUserId();
    
    const transaction: any = {
      user_id: userId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      section: data.section,
      category: data.category,
      subcategory: data.subcategory,
      date: data.date,
      accountId: data.accountId,
      tags: data.tags,
      metadata: {
        notes: data.notes || '',
      },
      createdAt: new Date().toISOString(),
    };

    // Tentar criar no Supabase primeiro
    if (this.isOnline) {
      try {
        const { data: created, error } = await supabase
          .from('transactions')
          .insert([transaction])
          .select()
          .single();

        if (error) throw error;

        logService.info('✅ Transação criada no Supabase', { id: created.id });
        
        // Salvar também no localStorage como cache
        await this.saveToLocalStorage(created);
        
        return created;
      } catch (error) {
        logService.error('❌ Erro ao criar no Supabase, salvando offline', toError(error));
      }
    }

    // Fallback: Salvar offline e adicionar à fila de sincronização
    const offlineTransaction: Transaction = {
      ...transaction,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    await this.saveToLocalStorage(offlineTransaction);
    await this.addToSyncQueue('create', offlineTransaction);

    logService.warn('⚠️ Transação salva offline', { id: offlineTransaction.id });
    
    return offlineTransaction;
  }

  /**
   * Buscar todas as transações
   */
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    const userId = await this.getUserId();

    // Tentar buscar do Supabase
    if (this.isOnline) {
      try {
        let query = supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        // Aplicar filtros
        if (filters?.type) {
          query = query.eq('type', filters.type);
        }
        if (filters?.category) {
          query = query.eq('category', filters.category);
        }
        if (filters?.section) {
          query = query.eq('section', filters.section);
        }
        if (filters?.startDate) {
          query = query.gte('date', filters.startDate.toISOString());
        }
        if (filters?.endDate) {
          query = query.lte('date', filters.endDate.toISOString());
        }
        if (filters?.accountId) {
          query = query.eq('accountId', filters.accountId);
        }

        const { data, error } = await query;

        if (error) throw error;

        logService.info('✅ Transações carregadas do Supabase', { count: data.length });
        
        // Atualizar cache local
        await this.updateLocalStorageCache(data);
        
        return data;
      } catch (error) {
        logService.error('❌ Erro ao buscar do Supabase, usando cache local', toError(error));
      }
    }

    // Fallback: Buscar do localStorage
    const localTransactions = await this.getFromLocalStorage();
    logService.warn('⚠️ Usando transações do cache local', { count: localTransactions.length });
    
    return this.applyFilters(localTransactions, filters);
  }

  /**
   * Buscar transação por ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    // Verificar se é ID offline
    if (id.startsWith('offline_')) {
      const localTransactions = await this.getFromLocalStorage();
      return localTransactions.find(t => t.id === id) || null;
    }

    // Buscar do Supabase
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        logService.error('❌ Erro ao buscar transação', toError(error));
      }
    }

    // Fallback: buscar do localStorage
    const localTransactions = await this.getFromLocalStorage();
    return localTransactions.find(t => t.id === id) || null;
  }

  /**
   * Atualizar transação
   */
  async updateTransaction(id: string, updates: Partial<TransactionInput>): Promise<Transaction> {
    const userId = await this.getUserId();

    // Se é transação offline, atualizar localmente
    if (id.startsWith('offline_')) {
      const localTransactions = await this.getFromLocalStorage();
      const index = localTransactions.findIndex(t => t.id === id);
      
      if (index === -1) {
        throw new Error('Transação não encontrada');
      }

      const updated = {
        ...localTransactions[index],
        ...updates,
      };

      localTransactions[index] = updated;
      await this.setLocalStorage(localTransactions);
      await this.addToSyncQueue('update', updated);

      logService.warn('⚠️ Transação offline atualizada', { id });
      return updated;
    }

    // Atualizar no Supabase
    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .update(updates)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;

        logService.info('✅ Transação atualizada no Supabase', { id });
        
        // Atualizar cache local
        await this.updateLocalTransaction(data);
        
        return data;
      } catch (error) {
        logService.error('❌ Erro ao atualizar no Supabase', toError(error));
        throw error;
      }
    }

    throw new Error('Não foi possível atualizar - sem conexão');
  }

  /**
   * Deletar transação
   */
  async deleteTransaction(id: string): Promise<void> {
    const userId = await this.getUserId();

    // Se é transação offline, remover localmente
    if (id.startsWith('offline_')) {
      const localTransactions = await this.getFromLocalStorage();
      const filtered = localTransactions.filter(t => t.id !== id);
      await this.setLocalStorage(filtered);
      
      logService.warn('⚠️ Transação offline removida', { id });
      return;
    }

    // Deletar do Supabase
    if (this.isOnline) {
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;

        logService.info('✅ Transação deletada do Supabase', { id });
        
        // Remover do cache local
        await this.removeFromLocalStorage(id);
        
        return;
      } catch (error) {
        logService.error('❌ Erro ao deletar do Supabase', toError(error));
        throw error;
      }
    }

    throw new Error('Não foi possível deletar - sem conexão');
  }

  /**
   * Calcular resumo financeiro
   */
  async getFinancialSummary(month?: number, year?: number): Promise<{
    income: number;
    expenses: number;
    balance: number;
    transactionCount: number;
  }> {
    const currentDate = new Date();
    const targetMonth = month !== undefined ? month : currentDate.getMonth();
    const targetYear = year || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const transactions = await this.getTransactions({ startDate, endDate });

    const summary = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else {
          acc.expenses += transaction.amount;
        }
        acc.transactionCount++;
        return acc;
      },
      { income: 0, expenses: 0, balance: 0, transactionCount: 0 }
    );

    summary.balance = summary.income - summary.expenses;

    return summary;
  }

  /**
   * Sincronizar transações pendentes
   */
  /**
   * Sincronizar transações pendentes (método público)
   */
  public async syncPending(): Promise<number> {
    const queue = await this.getSyncQueue();
    if (queue.length === 0) return 0;
    
    await this.syncPendingTransactions();
    return queue.length;
  }
  
  private async syncPendingTransactions(): Promise<void> {
    const queue = await this.getSyncQueue();
    
    if (queue.length === 0) {
      logService.info('✅ Nenhuma transação para sincronizar');
      return;
    }

    logService.info(`🔄 Sincronizando ${queue.length} transações pendentes...`);

    for (const item of queue) {
      try {
        if (item.action === 'create' && item.transaction.id.startsWith('offline_')) {
          // Criar no Supabase e substituir ID offline
          const { id, ...transactionData } = item.transaction;
          const { data, error } = await supabase
            .from('transactions')
            .insert([transactionData])
            .select()
            .single();

          if (error) throw error;

          // Substituir ID offline pelo ID real
          await this.replaceOfflineId(id, data.id);
          
          logService.info('✅ Transação sincronizada', { oldId: id, newId: data.id });
        } else if (item.action === 'update') {
          // Atualizar no Supabase
          const { id, ...updates } = item.transaction;
          await this.updateTransaction(id, updates);
        }

        // Remover da fila após sucesso
        await this.removeFromSyncQueue(item.transaction.id);
      } catch (error) {
        logService.error('❌ Erro ao sincronizar transação', toError(error));
      }
    }

    logService.info('✅ Sincronização concluída');
  }

  // ==================== Helpers ====================

  private async getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');
    return user.id;
  }

  private async getFromLocalStorage(): Promise<Transaction[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logService.error('❌ Erro ao ler localStorage', toError(error));
      return [];
    }
  }

  private async setLocalStorage(transactions: Transaction[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      logService.error('❌ Erro ao salvar no localStorage', toError(error));
    }
  }

  private async saveToLocalStorage(transaction: Transaction): Promise<void> {
    const transactions = await this.getFromLocalStorage();
    const index = transactions.findIndex(t => t.id === transaction.id);
    
    if (index >= 0) {
      transactions[index] = transaction;
    } else {
      transactions.unshift(transaction);
    }
    
    await this.setLocalStorage(transactions);
  }

  private async updateLocalTransaction(transaction: Transaction): Promise<void> {
    const transactions = await this.getFromLocalStorage();
    const index = transactions.findIndex(t => t.id === transaction.id);
    
    if (index >= 0) {
      transactions[index] = transaction;
      await this.setLocalStorage(transactions);
    }
  }

  private async removeFromLocalStorage(id: string): Promise<void> {
    const transactions = await this.getFromLocalStorage();
    const filtered = transactions.filter(t => t.id !== id);
    await this.setLocalStorage(filtered);
  }

  private async updateLocalStorageCache(transactions: Transaction[]): Promise<void> {
    await this.setLocalStorage(transactions);
  }

  private async replaceOfflineId(oldId: string, newId: string): Promise<void> {
    const transactions = await this.getFromLocalStorage();
    const index = transactions.findIndex(t => t.id === oldId);
    
    if (index >= 0) {
      transactions[index].id = newId;
      await this.setLocalStorage(transactions);
    }
  }

  private applyFilters(transactions: Transaction[], filters?: TransactionFilters): Transaction[] {
    if (!filters) return transactions;

    return transactions.filter(t => {
      if (filters.type && t.type !== filters.type) return false;
      if (filters.category && t.category !== filters.category) return false;
      if (filters.section && t.section !== filters.section) return false;
      if (filters.accountId && t.accountId !== filters.accountId) return false;
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;
      return true;
    });
  }

  // ==================== Sync Queue ====================

  private async getSyncQueue(): Promise<Array<{ action: string; transaction: Transaction }>> {
    try {
      const data = localStorage.getItem(this.SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logService.error('❌ Erro ao ler fila de sincronização', toError(error));
      return [];
    }
  }

  private async addToSyncQueue(action: string, transaction: Transaction): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push({ action, transaction });
    
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      logService.error('❌ Erro ao adicionar à fila de sincronização', toError(error));
    }
  }

  private async removeFromSyncQueue(transactionId: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filtered = queue.filter(item => item.transaction.id !== transactionId);
    
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      logService.error('❌ Erro ao remover da fila de sincronização', toError(error));
    }
  }
}

export const transactionsService = new TransactionsService();
