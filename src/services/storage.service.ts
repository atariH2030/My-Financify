/**
 * Storage Service - Gerenciamento robusto de dados locais
 * Inclui validação, backup automático e recovery de falhas
 */

import Logger from './logger.service';

export interface StorageConfig {
  encrypt?: boolean;
  backup?: boolean;
  version?: string;
}

export interface StorageData<T = any> {
  data: T;
  timestamp: string;
  version: string;
  checksum?: string;
}

class StorageService {
  private readonly storageKey = 'financy-life';
  private readonly backupKey = 'financy-life-backup';
  private readonly version = '2.0.0';

  /**
   * Salva dados no localStorage com validação e backup
   */
  async save<T>(key: string, data: T, config: StorageConfig = {}): Promise<boolean> {
    try {
      const storageData: StorageData<T> = {
        data,
        timestamp: new Date().toISOString(),
        version: config.version || this.version,
        checksum: this.generateChecksum(data)
      };

      const serialized = JSON.stringify(storageData);
      
      // Backup automático se configurado
      if (config.backup !== false) {
        await this.createBackup(key);
      }

      localStorage.setItem(`${this.storageKey}-${key}`, serialized);
      
      Logger.info(`Dados salvos com sucesso`, { key, size: serialized.length }, 'STORAGE');
      return true;

    } catch (error) {
      Logger.error(`Falha ao salvar dados`, error as Error, 'STORAGE');
      return false;
    }
  }

  /**
   * Carrega dados do localStorage com validação
   */
  async load<T>(key: string): Promise<T | null> {
    try {
      const stored = localStorage.getItem(`${this.storageKey}-${key}`);
      
      if (!stored) {
        Logger.info(`Nenhum dado encontrado para a chave: ${key}`, undefined, 'STORAGE');
        return null;
      }

      const storageData: StorageData<T> = JSON.parse(stored);
      
      // Validação de integridade
      if (!this.validateData(storageData)) {
        Logger.warn(`Dados corrompidos detectados, tentando recovery`, { key }, 'STORAGE');
        return await this.attemptRecovery<T>(key);
      }

      Logger.info(`Dados carregados com sucesso`, { key, version: storageData.version }, 'STORAGE');
      return storageData.data;

    } catch (error) {
      Logger.error(`Falha ao carregar dados`, error as Error, 'STORAGE');
      return await this.attemptRecovery<T>(key);
    }
  }

  /**
   * Remove dados específicos
   */
  async remove(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(`${this.storageKey}-${key}`);
      Logger.info(`Dados removidos`, { key }, 'STORAGE');
      return true;
    } catch (error) {
      Logger.error(`Falha ao remover dados`, error as Error, 'STORAGE');
      return false;
    }
  }

  /**
   * Lista todas as chaves disponíveis
   */
  getAllKeys(): string[] {
    try {
      const keys: string[] = [];
      const prefix = `${this.storageKey}-`;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
          keys.push(key.replace(prefix, ''));
        }
      }
      
      return keys;
    } catch (error) {
      Logger.error(`Falha ao listar chaves`, error as Error, 'STORAGE');
      return [];
    }
  }

  /**
   * Limpa todos os dados da aplicação
   */
  async clearAll(): Promise<boolean> {
    try {
      const keys = this.getAllKeys();
      keys.forEach(key => {
        localStorage.removeItem(`${this.storageKey}-${key}`);
      });
      
      Logger.info(`Todos os dados foram limpos`, { count: keys.length }, 'STORAGE');
      return true;
    } catch (error) {
      Logger.error(`Falha ao limpar dados`, error as Error, 'STORAGE');
      return false;
    }
  }

  /**
   * Cria backup dos dados atuais
   */
  private async createBackup(key: string): Promise<void> {
    try {
      const current = localStorage.getItem(`${this.storageKey}-${key}`);
      if (current) {
        localStorage.setItem(`${this.backupKey}-${key}`, current);
        Logger.debug(`Backup criado`, { key }, 'STORAGE');
      }
    } catch (error) {
      Logger.warn(`Falha ao criar backup`, error, 'STORAGE');
    }
  }

  /**
   * Tenta recuperar dados do backup
   */
  private async attemptRecovery<T>(key: string): Promise<T | null> {
    try {
      Logger.info(`Tentando recovery dos dados...`, { key }, 'STORAGE');
      
      const backup = localStorage.getItem(`${this.backupKey}-${key}`);
      if (backup) {
        const backupData: StorageData<T> = JSON.parse(backup);
        
        if (this.validateData(backupData)) {
          // Restaura backup como dados principais
          localStorage.setItem(`${this.storageKey}-${key}`, backup);
          
          Logger.info(`Recovery bem-sucedido!`, { key }, 'STORAGE');
          return backupData.data;
        }
      }
      
      Logger.error(`Recovery falhou - dados irrecuperáveis`, undefined, 'STORAGE');
      return null;

    } catch (error) {
      Logger.error(`Falha no processo de recovery`, error as Error, 'STORAGE');
      return null;
    }
  }

  /**
   * Valida integridade dos dados
   */
  private validateData<T>(storageData: StorageData<T>): boolean {
    if (!storageData || !storageData.data || !storageData.timestamp) {
      return false;
    }

    // Validação de checksum se disponível
    if (storageData.checksum) {
      const currentChecksum = this.generateChecksum(storageData.data);
      return currentChecksum === storageData.checksum;
    }

    return true;
  }

  /**
   * Gera checksum simples para validação
   */
  private generateChecksum<T>(data: T): string {
    const str = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString(36);
  }

  /**
   * Informações de uso do storage
   */
  getStorageInfo(): { used: number; available: number; keys: string[] } {
    try {
      const keys = this.getAllKeys();
      let used = 0;
      
      keys.forEach(key => {
        const data = localStorage.getItem(`${this.storageKey}-${key}`);
        if (data) used += data.length;
      });

      return {
        used,
        available: 5 * 1024 * 1024 - used, // 5MB típico do localStorage
        keys
      };
    } catch (error) {
      Logger.error(`Falha ao obter info do storage`, error as Error, 'STORAGE');
      return { used: 0, available: 0, keys: [] };
    }
  }
}

// Singleton para uso global
export const Storage = new StorageService();

export default Storage;