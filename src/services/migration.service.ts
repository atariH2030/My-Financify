/**
 * Migration Service - Migração automática de dados
 * Garante compatibilidade entre versões
 * 
 * @version 3.3.0
 */

import Logger from './logger.service';
import Storage from './storage.service';
import type { Transaction } from '../types/financial.types';

class MigrationService {
  private readonly MIGRATION_KEY = 'migrations-executed';

  /**
   * Executa todas as migrações pendentes
   */
  async runMigrations(): Promise<void> {
    try {
      const executed = await this.getExecutedMigrations();
      
      // Migração 1: Adicionar expenseType às transações
      if (!executed.includes('add-expense-type')) {
        await this.addExpenseTypeToTransactions();
        await this.markMigrationExecuted('add-expense-type');
      }

      Logger.info('✅ Migrações concluídas', undefined, 'MIGRATION');
    } catch (error) {
      Logger.error('Falha nas migrações', error as Error, 'MIGRATION');
    }
  }

  /**
   * Adiciona campo expenseType às transações existentes
   */
  private async addExpenseTypeToTransactions(): Promise<void> {
    try {
      const transactions = await Storage.load<Transaction[]>('transactions');
      
      if (!transactions || transactions.length === 0) {
        Logger.info('Nenhuma transação para migrar', undefined, 'MIGRATION');
        return;
      }

      // Categorias que são tipicamente fixas
      const fixedCategories = [
        'housing', 'utilities', 'health', 'transportation', 
        'education', 'subscriptions', 'insurance', 'loans'
      ];

      let migratedCount = 0;

      const updatedTransactions = transactions.map(t => {
        // Só adiciona expenseType se for expense e não tiver ainda
        if (t.type === 'expense' && !t.expenseType) {
          migratedCount++;
          
          // Determina se é fixo ou variável baseado na categoria
          const isFixed = fixedCategories.includes(t.category) || 
                         t.recurring?.enabled === true;
          
          return {
            ...t,
            expenseType: isFixed ? 'fixed' as const : 'variable' as const
          };
        }
        return t;
      });

      await Storage.save('transactions', updatedTransactions);
      
      Logger.info(
        `🔄 ${migratedCount} transações migradas com expenseType`,
        undefined,
        'MIGRATION'
      );
    } catch (error) {
      Logger.error('Falha ao migrar transações', error as Error, 'MIGRATION');
      throw error;
    }
  }

  /**
   * Obtém lista de migrações já executadas
   */
  private async getExecutedMigrations(): Promise<string[]> {
    try {
      const migrations = await Storage.load<string[]>(this.MIGRATION_KEY);
      return migrations || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Marca uma migração como executada
   */
  private async markMigrationExecuted(name: string): Promise<void> {
    try {
      const executed = await this.getExecutedMigrations();
      executed.push(name);
      await Storage.save(this.MIGRATION_KEY, executed);
    } catch (error) {
      Logger.error('Falha ao marcar migração', error as Error, 'MIGRATION');
    }
  }

  /**
   * Reseta todas as migrações (útil para testes)
   */
  async resetMigrations(): Promise<void> {
    try {
      await Storage.remove(this.MIGRATION_KEY);
      Logger.info('🗑️ Migrações resetadas', undefined, 'MIGRATION');
    } catch (error) {
      Logger.error('Falha ao resetar migrações', error as Error, 'MIGRATION');
    }
  }
}

// Singleton
export default new MigrationService();
