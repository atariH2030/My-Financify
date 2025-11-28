/**
 * Accounts Service
 * Serviço para gerenciar contas/cartões com Supabase e fallback localStorage
 */

import { supabase } from '../config/supabase.config';
import Logger from './logger.service';
import type { CardBrand } from '../types/financial.types';

const logService = Logger;

const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};

export interface Account {
  id: string;
  user_id?: string;
  name: string;
  type: 'credit' | 'debit' | 'cash' | 'investment' | 'savings';
  brand?: CardBrand;
  lastDigits?: string;
  balance: number;
  creditLimit?: number;
  closingDay?: number;
  dueDay?: number;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface AccountInput {
  name: string;
  type: 'credit' | 'debit' | 'cash' | 'investment' | 'savings';
  brand?: CardBrand;
  lastDigits?: string;
  balance: number;
  creditLimit?: number;
  closingDay?: number;
  dueDay?: number;
  color: string;
  icon: string;
  isActive?: boolean;
}

class AccountsService {
  private readonly STORAGE_KEY = 'financify_accounts';
  private readonly SYNC_QUEUE_KEY = 'financify_accounts_sync_queue';
  private isOnline: boolean = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logService.info('🟢 Conexão online - iniciando sincronização de contas');
      this.syncPendingAccounts();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logService.warn('🔴 Conexão offline - usando localStorage para contas');
    });
  }

  async createAccount(data: AccountInput): Promise<Account> {
    const userId = await this.getUserId();
    
    const account: any = {
      user_id: userId,
      name: data.name,
      type: data.type,
      brand: data.brand,
      lastDigits: data.lastDigits,
      balance: data.balance,
      creditLimit: data.creditLimit,
      closingDay: data.closingDay,
      dueDay: data.dueDay,
      color: data.color,
      icon: data.icon,
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
    };

    if (this.isOnline) {
      try {
        const { data: created, error } = await supabase
          .from('accounts')
          .insert([account])
          .select()
          .single();

        if (error) throw error;

        logService.info('✅ Conta criada no Supabase', { id: created.id });
        await this.saveToLocalStorage(created);
        return created;
      } catch (error) {
        logService.error('❌ Erro ao criar no Supabase, salvando offline', toError(error));
      }
    }

    const offlineAccount: Account = {
      ...account,
      id: `offline_account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    await this.saveToLocalStorage(offlineAccount);
    await this.addToSyncQueue('create', offlineAccount);

    logService.warn('⚠️ Conta salva offline', { id: offlineAccount.id });
    return offlineAccount;
  }

  async getAccounts(): Promise<Account[]> {
    const userId = await this.getUserId();

    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        logService.info('✅ Contas carregadas do Supabase', { count: data.length });
        await this.updateLocalStorageCache(data);
        return data;
      } catch (error) {
        logService.error('❌ Erro ao buscar do Supabase, usando cache local', toError(error));
      }
    }

    const localAccounts = await this.getFromLocalStorage();
    logService.warn('⚠️ Usando contas do cache local', { count: localAccounts.length });
    return localAccounts;
  }

  async updateAccount(id: string, updates: Partial<AccountInput>): Promise<Account> {
    const userId = await this.getUserId();

    if (id.startsWith('offline_')) {
      const localAccounts = await this.getFromLocalStorage();
      const index = localAccounts.findIndex(a => a.id === id);
      
      if (index === -1) throw new Error('Conta não encontrada');

      const updated = { ...localAccounts[index], ...updates, updatedAt: new Date().toISOString() };
      localAccounts[index] = updated;
      await this.setLocalStorage(localAccounts);
      await this.addToSyncQueue('update', updated);

      logService.warn('⚠️ Conta offline atualizada', { id });
      return updated;
    }

    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('accounts')
          .update({ ...updates, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;

        logService.info('✅ Conta atualizada no Supabase', { id });
        await this.updateLocalAccount(data);
        return data;
      } catch (error) {
        logService.error('❌ Erro ao atualizar no Supabase', toError(error));
        throw error;
      }
    }

    throw new Error('Não foi possível atualizar - sem conexão');
  }

  async deleteAccount(id: string): Promise<void> {
    const userId = await this.getUserId();

    if (id.startsWith('offline_')) {
      const localAccounts = await this.getFromLocalStorage();
      const filtered = localAccounts.filter(a => a.id !== id);
      await this.setLocalStorage(filtered);
      
      logService.warn('⚠️ Conta offline removida', { id });
      return;
    }

    if (this.isOnline) {
      try {
        const { error } = await supabase
          .from('accounts')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;

        logService.info('✅ Conta deletada do Supabase', { id });
        await this.removeFromLocalStorage(id);
        return;
      } catch (error) {
        logService.error('❌ Erro ao deletar do Supabase', toError(error));
        throw error;
      }
    }

    throw new Error('Não foi possível deletar - sem conexão');
  }

  async getSummary(): Promise<{
    totalBalance: number;
    totalLimit: number;
    totalUsed: number;
    activeAccounts: number;
    totalAccounts: number;
    accounts: Array<{
      account: Account;
      balance: number;
      creditUsed: number;
      creditAvailable: number;
    }>;
  }> {
    const accounts = await this.getAccounts();

    const summary = accounts.reduce(
      (acc, account) => {
        if (account.isActive) {
          acc.totalBalance += account.balance;
          if (account.creditLimit) {
            acc.totalLimit += account.creditLimit;
            acc.totalUsed += Math.max(0, account.creditLimit - account.balance);
          }
          acc.activeAccounts++;
        }
        return acc;
      },
      { totalBalance: 0, totalLimit: 0, totalUsed: 0, activeAccounts: 0 }
    );

    // Adicionar array de contas com detalhes calculados
    const accountsWithDetails = accounts.map(account => ({
      account,
      balance: account.balance,
      creditUsed: account.creditLimit ? Math.max(0, account.creditLimit - account.balance) : 0,
      creditAvailable: account.creditLimit ? Math.max(0, account.balance) : 0,
    }));

    return {
      ...summary,
      totalAccounts: accounts.length,
      accounts: accountsWithDetails,
    };
  }

  /**
   * Sincronizar contas pendentes (método público)
   */
  public async syncPending(): Promise<number> {
    const queue = await this.getSyncQueue();
    if (queue.length === 0) return 0;
    
    await this.syncPendingAccounts();
    return queue.length;
  }

  private async syncPendingAccounts(): Promise<void> {
    const queue = await this.getSyncQueue();
    
    if (queue.length === 0) {
      logService.info('✅ Nenhuma conta para sincronizar');
      return;
    }

    logService.info(`🔄 Sincronizando ${queue.length} contas pendentes...`);

    for (const item of queue) {
      try {
        if (item.action === 'create' && item.account.id.startsWith('offline_')) {
          const { id, user_id, ...accountData } = item.account;
          const { data, error } = await supabase
            .from('accounts')
            .insert([{ ...accountData, user_id: await this.getUserId() }])
            .select()
            .single();

          if (error) throw error;

          await this.replaceOfflineId(id, data.id);
          logService.info('✅ Conta sincronizada', { oldId: id, newId: data.id });
        } else if (item.action === 'update') {
          const { id, user_id, ...updates } = item.account;
          await this.updateAccount(id, updates);
        }

        await this.removeFromSyncQueue(item.account.id);
      } catch (error) {
        logService.error('❌ Erro ao sincronizar conta', toError(error));
      }
    }

    logService.info('✅ Sincronização de contas concluída');
  }

  private async getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');
    return user.id;
  }

  private async getFromLocalStorage(): Promise<Account[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logService.error('❌ Erro ao ler localStorage', toError(error));
      return [];
    }
  }

  private async setLocalStorage(accounts: Account[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(accounts));
    } catch (error) {
      logService.error('❌ Erro ao salvar no localStorage', toError(error));
    }
  }

  private async saveToLocalStorage(account: Account): Promise<void> {
    const accounts = await this.getFromLocalStorage();
    const index = accounts.findIndex(a => a.id === account.id);
    
    if (index >= 0) {
      accounts[index] = account;
    } else {
      accounts.unshift(account);
    }
    
    await this.setLocalStorage(accounts);
  }

  private async updateLocalAccount(account: Account): Promise<void> {
    const accounts = await this.getFromLocalStorage();
    const index = accounts.findIndex(a => a.id === account.id);
    
    if (index >= 0) {
      accounts[index] = account;
      await this.setLocalStorage(accounts);
    }
  }

  private async removeFromLocalStorage(id: string): Promise<void> {
    const accounts = await this.getFromLocalStorage();
    const filtered = accounts.filter(a => a.id !== id);
    await this.setLocalStorage(filtered);
  }

  private async updateLocalStorageCache(accounts: Account[]): Promise<void> {
    await this.setLocalStorage(accounts);
  }

  private async replaceOfflineId(oldId: string, newId: string): Promise<void> {
    const accounts = await this.getFromLocalStorage();
    const index = accounts.findIndex(a => a.id === oldId);
    
    if (index >= 0) {
      accounts[index].id = newId;
      await this.setLocalStorage(accounts);
    }
  }

  private async getSyncQueue(): Promise<Array<{ action: string; account: Account }>> {
    try {
      const data = localStorage.getItem(this.SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logService.error('❌ Erro ao ler fila de sincronização', toError(error));
      return [];
    }
  }

  private async addToSyncQueue(action: string, account: Account): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push({ action, account });
    
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      logService.error('❌ Erro ao adicionar à fila de sincronização', toError(error));
    }
  }

  private async removeFromSyncQueue(accountId: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filtered = queue.filter(item => item.account.id !== accountId);
    
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      logService.error('❌ Erro ao remover da fila de sincronização', toError(error));
    }
  }
}

export const accountsService = new AccountsService();
