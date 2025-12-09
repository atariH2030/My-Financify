/**
 * Supabase Integration Service
 * ÚNICA FONTE DE VERDADE para comunicação com Supabase
 * Centraliza: autenticação, CRUD, cache, sincronização offline
 */

import { supabase } from '../config/supabase.config';
import { Logger } from './logger.service';
import StorageService from './storage.service';
import type { Transaction, Account, RecurringTransaction, Budget, FinancialGoal } from '../types/financial.types';

// ============================================
// CACHE & OFFLINE-FIRST STRATEGY
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // milliseconds
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, expiresIn = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.expiresIn;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new CacheManager();

// ============================================
// SUPABASE INTEGRATION SERVICE
// ============================================

export class SupabaseIntegrationService {
  private static instance: SupabaseIntegrationService;
  private userId: string | null = null;

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): SupabaseIntegrationService {
    if (!SupabaseIntegrationService.instance) {
      SupabaseIntegrationService.instance = new SupabaseIntegrationService();
    }
    return SupabaseIntegrationService.instance;
  }

  // ============================================
  // AUTH
  // ============================================

  private async initializeAuth() {
    try {
      const { data } = await supabase.auth.getSession();
      this.userId = data.session?.user?.id || null;

      // Listen to auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        this.userId = session?.user?.id || null;
        if (event === 'SIGNED_OUT') {
          cache.clear();
        }
      });
    } catch (error) {
      Logger.error('SUPABASE_INTEGRATION', error as Error);
    }
  }

  private getUserId(): string {
    if (!this.userId) {
      throw new Error('User not authenticated');
    }
    return this.userId;
  }

  // ============================================
  // TRANSACTIONS
  // ============================================

  async getTransactions(useCache = true): Promise<Transaction[]> {
    const cacheKey = 'transactions_all';
    
    // Try cache first
    if (useCache) {
      const cached = cache.get<Transaction[]>(cacheKey);
      if (cached) {
        Logger.debug('SUPABASE_INTEGRATION', 'Returning cached transactions');
        return cached;
      }
    }

    try {
      const userId = this.getUserId();
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      const transactions = data as Transaction[];
      cache.set(cacheKey, transactions);
      
      // Backup to localStorage
      await StorageService.save('transactions', transactions);
      
      Logger.info('SUPABASE_INTEGRATION', `Transactions loaded: ${transactions.length}`);
      return transactions;
    } catch (error) {
      Logger.error('SUPABASE_INTEGRATION', error as Error);
      
      // Fallback to localStorage
      const localTransactions = await StorageService.load<Transaction[]>('transactions');
      return localTransactions || [];
    }
  }

  async createTransaction(transaction: Omit<Transaction, 'id' | 'user_id'>): Promise<Transaction> {
    try {
      const userId = this.getUserId();
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: userId }])
        .select()
        .single();

      if (error) throw error;

      cache.invalidatePattern('transactions');
      Logger.info('SUPABASE_INTEGRATION', 'Transaction created');
      
      return data as Transaction;
    } catch (error) {
      Logger.error('SUPABASE_INTEGRATION', error as Error);
      throw error;
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      cache.invalidatePattern('transactions');
      Logger.info('SUPABASE_INTEGRATION', 'Transaction updated');
      
      return data as Transaction;
    } catch (error) {
      Logger.error('SUPABASE_INTEGRATION', error as Error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      cache.invalidatePattern('transactions');
      Logger.info('SUPABASE_INTEGRATION', 'Transaction deleted');
    } catch (error) {
      Logger.error('SUPABASE_INTEGRATION', error as Error);
      throw error;
    }
  }

  // ============================================
  // ACCOUNTS
  // ============================================

  async getAccounts(useCache = true): Promise<Account[]> {
    const cacheKey = 'accounts_all';
    
    if (useCache) {
      const cached = cache.get<Account[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const userId = this.getUserId();
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;

      const accounts = data as Account[];
      cache.set(cacheKey, accounts);
      await StorageService.save('accounts', accounts);
      
      return accounts;
    } catch (error) {
      Logger.error('SUPABASE_INTEGRATION', error as Error);
      const localAccounts = await StorageService.load<Account[]>('accounts');
      return localAccounts || [];
    }
  }

  // ============================================
  // RECURRING TRANSACTIONS
  // ============================================

  async getRecurringTransactions(useCache = true): Promise<RecurringTransaction[]> {
    const cacheKey = 'recurring_all';
    
    if (useCache) {
      const cached = cache.get<RecurringTransaction[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const userId = this.getUserId();
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('next_due', { ascending: true });

      if (error) throw error;

      const recurring = data as RecurringTransaction[];
      cache.set(cacheKey, recurring);
      await StorageService.save('recurring_transactions', recurring);
      
      return recurring;
    } catch (error) {
      Logger.error('SUPABASE_INTEGRATION', error as Error);
      const localRecurring = await StorageService.load<RecurringTransaction[]>('recurring_transactions');
      return localRecurring || [];
    }
  }

  // ============================================
  // GOALS
  // ============================================

  async getGoals(useCache = true): Promise<FinancialGoal[]> {
    const cacheKey = 'goals_all';
    
    if (useCache) {
      const cached = cache.get<FinancialGoal[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const userId = this.getUserId();
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('target_date');

      if (error) throw error;

      const goals = data as FinancialGoal[];
      cache.set(cacheKey, goals);
      await StorageService.save('goals', goals);
      
      return goals;
    } catch (error) {
      Logger.error('SUPABASE_INTEGRATION', error as Error);
      const localGoals = await StorageService.load<FinancialGoal[]>('goals');
      return localGoals || [];
    }
  }

  // ============================================
  // BUDGETS
  // ============================================

  async getBudgets(useCache = true): Promise<Budget[]> {
    const cacheKey = 'budgets_all';
    
    if (useCache) {
      const cached = cache.get<Budget[]>(cacheKey);
      if (cached) return cached;
    }

    try {
      const userId = this.getUserId();
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('category');

      if (error) throw error;

      const budgets = data as Budget[];
      cache.set(cacheKey, budgets);
      await StorageService.save('budgets', budgets);
      
      return budgets;
    } catch (error) {
      Logger.error('SUPABASE_INTEGRATION', error as Error);
      const localBudgets = await StorageService.load<Budget[]>('budgets');
      return localBudgets || [];
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  clearCache(): void {
    cache.clear();
    Logger.info('SUPABASE_INTEGRATION', 'Cache cleared');
  }

  invalidateCache(pattern: string): void {
    cache.invalidatePattern(pattern);
    Logger.info('SUPABASE_INTEGRATION', `Cache invalidated for: ${pattern}`);
  }
}

// Export singleton instance
export const _supabaseService = SupabaseIntegrationService.getInstance();
