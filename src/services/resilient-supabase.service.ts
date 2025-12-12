/**
 * Resilient Supabase Service
 * Wrapper com fallback automático para Dexie quando Supabase falha
 */

import { Logger } from './logger.service';
import { supabase } from '../config/supabase';
import { healthCheck } from './health-check.service';
import { db } from './dexie.service';
import type { User, Transaction, Account, Budget, Goal } from '../types';

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'supabase' | 'dexie' | 'cache';
}

class ResilientSupabaseService {
  private useCache: boolean = true;
  private syncQueue: Array<() => Promise<void>> = [];
  private isSyncing: boolean = false;

  /**
   * Tenta operação no Supabase com fallback para Dexie
   */
  private async withFallback<T>(
    supabaseOperation: () => Promise<T>,
    dexieOperation: () => Promise<T>,
    operationName: string
  ): Promise<ServiceResponse<T>> {
    try {
      // Tentar Supabase primeiro
      const result = await supabaseOperation();
      
      Logger.info(`${operationName} succeeded via Supabase`);
      
      return {
        success: true,
        data: result,
        source: 'supabase',
      };
    } catch (supabaseError) {
      Logger.warn(`${operationName} failed via Supabase, using fallback`, supabaseError);

      try {
        // Fallback para Dexie
        const result = await dexieOperation();
        
        // Adicionar à fila de sincronização
        this.addToSyncQueue(supabaseOperation);
        
        return {
          success: true,
          data: result,
          source: 'dexie',
        };
      } catch (dexieError) {
        Logger.error(`${operationName} failed in both Supabase and Dexie`, dexieError);
        
        return {
          success: false,
          error: dexieError instanceof Error ? dexieError.message : 'Unknown error',
          source: 'cache',
        };
      }
    }
  }

  /**
   * Adiciona operação à fila de sincronização
   */
  private addToSyncQueue(operation: () => Promise<any>): void {
    this.syncQueue.push(operation);
    
    // Tentar sincronizar se não estiver já sincronizando
    if (!this.isSyncing && healthCheck.isServiceHealthy('supabase')) {
      this.processSyncQueue();
    }
  }

  /**
   * Processa fila de sincronização
   */
  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    Logger.info(`Processing sync queue (${this.syncQueue.length} operations)`);

    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue.shift();
      
      if (!operation) continue;

      try {
        await operation();
        Logger.info('Sync operation succeeded');
      } catch (error) {
        Logger.error('Sync operation failed', error);
        
        // Se falhar, recolocar na fila
        this.syncQueue.unshift(operation);
        break;
      }
    }

    this.isSyncing = false;
  }

  /**
   * Buscar transações com fallback
   */
  async getTransactions(userId: string): Promise<ServiceResponse<Transaction[]>> {
    return this.withFallback(
      async () => {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) throw error;
        return data as Transaction[];
      },
      async () => {
        return await db.transactions.where('userId').equals(userId).toArray();
      },
      'getTransactions'
    );
  }

  /**
   * Criar transação com fallback
   */
  async createTransaction(transaction: Partial<Transaction>): Promise<ServiceResponse<Transaction>> {
    return this.withFallback(
      async () => {
        const { data, error } = await supabase
          .from('transactions')
          .insert(transaction)
          .select()
          .single();

        if (error) throw error;
        
        // Sincronizar com Dexie
        if (data) {
          await db.transactions.put(data);
        }
        
        return data as Transaction;
      },
      async () => {
        const id = await db.transactions.add(transaction as Transaction);
        return { ...transaction, id } as Transaction;
      },
      'createTransaction'
    );
  }

  /**
   * Buscar contas com fallback
   */
  async getAccounts(userId: string): Promise<ServiceResponse<Account[]>> {
    return this.withFallback(
      async () => {
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        return data as Account[];
      },
      async () => {
        return await db.accounts.where('userId').equals(userId).toArray();
      },
      'getAccounts'
    );
  }

  /**
   * Buscar orçamentos com fallback
   */
  async getBudgets(userId: string): Promise<ServiceResponse<Budget[]>> {
    return this.withFallback(
      async () => {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;
        return data as Budget[];
      },
      async () => {
        return await db.budgets.where('userId').equals(userId).toArray();
      },
      'getBudgets'
    );
  }

  /**
   * Força sincronização manual
   */
  async forceSyncNow(): Promise<void> {
    if (!healthCheck.isServiceHealthy('supabase')) {
      throw new Error('Supabase is not healthy, cannot sync');
    }

    await this.processSyncQueue();
  }

  /**
   * Obtém tamanho da fila de sincronização
   */
  getSyncQueueSize(): number {
    return this.syncQueue.length;
  }

  /**
   * Verifica se está sincronizando
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

export const resilientSupabase = new ResilientSupabaseService();
