/**
 * Resilient Storage Service
 * Sistema de armazenamento com fallback automático
 * 
 * Hierarquia:
 * 1. Supabase (primário)
 * 2. IndexedDB (cache offline)
 * 3. localStorage (fallback final)
 */

import { supabase, isSupabaseConfigured } from '../config/supabase.config';
import Logger from './logger.service';

interface StorageOptions {
  useCache?: boolean;
  timeout?: number;
  retries?: number;
}

class ResilientStorageService {
  private cacheEnabled = true;
  private offlineMode = false;
  private readonly DEFAULT_TIMEOUT = 5000; // 5 segundos
  private readonly DEFAULT_RETRIES = 3;

  /**
   * Verificar se está online
   */
  private async checkConnection(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      Logger.warn('Supabase não configurado, usando modo offline', undefined, 'STORAGE');
      this.offlineMode = true;
      return false;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const { error } = await supabase.auth.getSession();
      clearTimeout(timeout);

      if (error) {
        Logger.warn('Erro ao verificar conexão, usando modo offline', error, 'STORAGE');
        this.offlineMode = true;
        return false;
      }

      this.offlineMode = false;
      return true;
    } catch (error) {
      Logger.warn('Timeout na verificação de conexão, usando modo offline', error as Error, 'STORAGE');
      this.offlineMode = true;
      return false;
    }
  }

  /**
   * Executar operação com retry e timeout
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    options: StorageOptions = {}
  ): Promise<T> {
    const { timeout = this.DEFAULT_TIMEOUT, retries = this.DEFAULT_RETRIES } = options;
    
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Timeout wrapper
        const result = await Promise.race([
          operation(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Operation timeout')), timeout)
          ),
        ]);

        return result;
      } catch (error) {
        lastError = error as Error;
        Logger.warn(
          `Tentativa ${attempt}/${retries} falhou`,
          error as Error,
          'STORAGE'
        );

        if (attempt < retries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * Salvar no cache local (localStorage)
   */
  private saveToLocalCache<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(data));
      localStorage.setItem(`cache_${key}_timestamp`, Date.now().toString());
      Logger.info('Dados salvos no cache local', { key }, 'STORAGE');
    } catch (error) {
      Logger.error('Erro ao salvar no cache local', error as Error, 'STORAGE');
    }
  }

  /**
   * Obter do cache local
   */
  private getFromLocalCache<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (cached) {
        Logger.info('Dados obtidos do cache local', { key }, 'STORAGE');
        return JSON.parse(cached) as T;
      }
      return null;
    } catch (error) {
      Logger.error('Erro ao ler cache local', error as Error, 'STORAGE');
      return null;
    }
  }

  /**
   * Fetch com fallback automático
   */
  async fetch<T>(
    table: string,
    options: StorageOptions & { filter?: Record<string, any> } = {}
  ): Promise<T[]> {
    const cacheKey = `${table}_${JSON.stringify(options.filter || {})}`;

    // 1. Tentar Supabase
    if (!this.offlineMode) {
      try {
        const isOnline = await this.checkConnection();
        
        if (isOnline) {
          const result = await this.withRetry(async () => {
            let query = supabase.from(table).select('*');

            // Aplicar filtros
            if (options.filter) {
              Object.entries(options.filter).forEach(([key, value]) => {
                query = query.eq(key, value);
              });
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as T[];
          }, options);

          // Salvar no cache
          if (options.useCache !== false) {
            this.saveToLocalCache(cacheKey, result);
          }

          Logger.info('Dados obtidos do Supabase', { table, count: result.length }, 'STORAGE');
          return result;
        }
      } catch (error) {
        Logger.error('Erro ao buscar do Supabase, usando cache', error as Error, 'STORAGE');
      }
    }

    // 2. Fallback: Cache local
    const cached = this.getFromLocalCache<T[]>(cacheKey);
    if (cached) {
      Logger.warn('Usando cache local (modo offline)', { table }, 'STORAGE');
      return cached;
    }

    // 3. Fallback final: Array vazio
    Logger.warn('Nenhum dado disponível', { table }, 'STORAGE');
    return [];
  }

  /**
   * Insert com fallback
   */
  async insert<T>(
    table: string,
    data: Partial<T>,
    options: StorageOptions = {}
  ): Promise<T | null> {
    // 1. Tentar Supabase
    if (!this.offlineMode) {
      try {
        const isOnline = await this.checkConnection();
        
        if (isOnline) {
          const result = await this.withRetry(async () => {
            const { data: inserted, error } = await supabase
              .from(table)
              .insert(data)
              .select()
              .single();

            if (error) throw error;
            return inserted as T;
          }, options);

          Logger.info('Dados inseridos no Supabase', { table }, 'STORAGE');
          return result;
        }
      } catch (error) {
        Logger.error('Erro ao inserir no Supabase', error as Error, 'STORAGE');
      }
    }

    // 2. Fallback: Salvar na fila de sincronização
    const pendingKey = `pending_${table}_${Date.now()}`;
    this.saveToLocalCache(pendingKey, { action: 'insert', data, table });
    
    Logger.warn('Dados salvos para sincronização posterior', { table }, 'STORAGE');
    
    // Retornar com ID temporário
    return { ...data, id: `temp_${Date.now()}` } as T;
  }

  /**
   * Update com fallback
   */
  async update<T>(
    table: string,
    id: string,
    updates: Partial<T>,
    options: StorageOptions = {}
  ): Promise<T | null> {
    // 1. Tentar Supabase
    if (!this.offlineMode) {
      try {
        const isOnline = await this.checkConnection();
        
        if (isOnline) {
          const result = await this.withRetry(async () => {
            const { data: updated, error } = await supabase
              .from(table)
              .update(updates)
              .eq('id', id)
              .select()
              .single();

            if (error) throw error;
            return updated as T;
          }, options);

          Logger.info('Dados atualizados no Supabase', { table, id }, 'STORAGE');
          return result;
        }
      } catch (error) {
        Logger.error('Erro ao atualizar no Supabase', error as Error, 'STORAGE');
      }
    }

    // 2. Fallback: Salvar na fila
    const pendingKey = `pending_${table}_${Date.now()}`;
    this.saveToLocalCache(pendingKey, { action: 'update', id, updates, table });
    
    Logger.warn('Atualização salva para sincronização posterior', { table, id }, 'STORAGE');
    return updates as T;
  }

  /**
   * Delete com fallback
   */
  async delete(
    table: string,
    id: string,
    options: StorageOptions = {}
  ): Promise<boolean> {
    // 1. Tentar Supabase
    if (!this.offlineMode) {
      try {
        const isOnline = await this.checkConnection();
        
        if (isOnline) {
          await this.withRetry(async () => {
            const { error } = await supabase
              .from(table)
              .delete()
              .eq('id', id);

            if (error) throw error;
          }, options);

          Logger.info('Dados deletados do Supabase', { table, id }, 'STORAGE');
          return true;
        }
      } catch (error) {
        Logger.error('Erro ao deletar do Supabase', error as Error, 'STORAGE');
      }
    }

    // 2. Fallback: Salvar na fila
    const pendingKey = `pending_${table}_${Date.now()}`;
    this.saveToLocalCache(pendingKey, { action: 'delete', id, table });
    
    Logger.warn('Deleção salva para sincronização posterior', { table, id }, 'STORAGE');
    return true;
  }

  /**
   * Sincronizar operações pendentes
   */
  async syncPending(): Promise<void> {
    const isOnline = await this.checkConnection();
    if (!isOnline) {
      Logger.warn('Offline, sincronização adiada', undefined, 'STORAGE');
      return;
    }

    Logger.info('Iniciando sincronização...', undefined, 'STORAGE');

    const keys = Object.keys(localStorage).filter(key => key.startsWith('pending_'));
    
    for (const key of keys) {
      try {
        const operation = this.getFromLocalCache<any>(key);
        if (!operation) continue;

        const { action, table, data, id, updates } = operation;

        switch (action) {
          case 'insert':
            await this.insert(table, data, { retries: 1 });
            break;
          case 'update':
            await this.update(table, id, updates, { retries: 1 });
            break;
          case 'delete':
            await this.delete(table, id, { retries: 1 });
            break;
        }

        // Remover da fila após sucesso
        localStorage.removeItem(key);
        Logger.info('Operação sincronizada', { action, table }, 'STORAGE');
      } catch (error) {
        Logger.error('Erro ao sincronizar operação', error as Error, 'STORAGE');
      }
    }

    Logger.info('✅ Sincronização concluída!', undefined, 'STORAGE');
  }

  /**
   * Obter status do sistema
   */
  getStatus() {
    return {
      offlineMode: this.offlineMode,
      cacheEnabled: this.cacheEnabled,
      supabaseConfigured: isSupabaseConfigured(),
      pendingOperations: Object.keys(localStorage).filter(k => k.startsWith('pending_')).length,
    };
  }
}

export default new ResilientStorageService();
