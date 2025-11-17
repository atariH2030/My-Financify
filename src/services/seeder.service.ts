/**
 * Database Seeder - Dados de teste automáticos
 * Implementa TQM: Automação > Ação Manual
 * Garante dados consistentes para desenvolvimento e testes
 */

import Logger from './logger.service';
import Storage from './storage.service';

export interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  recurring?: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment';
  balance: number;
  currency: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'yearly';
}

export interface SeederConfig {
  forceReset?: boolean;
  includeTransactions?: boolean;
  includeAccounts?: boolean;
  includeBudgets?: boolean;
  transactionCount?: number;
}

class DatabaseSeeder {
  private readonly SEEDER_KEY = 'seeder-status';

  /**
   * Executa o seed completo do banco de dados
   */
  async seed(config: SeederConfig = {}): Promise<void> {
    try {
      Logger.info('🌱 Iniciando Database Seeder...', config, 'SEEDER');

      const {
        forceReset = false,
        includeTransactions = true,
        includeAccounts = true,
        includeBudgets = true,
        transactionCount = 30
      } = config;

      // Verifica se já foi executado
      if (!forceReset && await this.hasBeenSeeded()) {
        Logger.info('✅ Dados já foram populados anteriormente', undefined, 'SEEDER');
        return;
      }

      // Limpa dados antigos se forceReset
      if (forceReset) {
        Logger.warn('🔄 Force reset ativado - limpando dados antigos...', undefined, 'SEEDER');
        await this.clearAllData();
      }

      // Executa seeders
      if (includeAccounts) {
        await this.seedAccounts();
      }

      if (includeTransactions) {
        await this.seedTransactions(transactionCount);
      }

      if (includeBudgets) {
        await this.seedBudgets();
      }

      // Marca como executado
      await Storage.save(this.SEEDER_KEY, {
        executed: true,
        timestamp: new Date().toISOString(),
        config
      });

      Logger.info('✅ Database Seeder concluído com sucesso!', undefined, 'SEEDER');

    } catch (error) {
      Logger.error('❌ Falha no Database Seeder', error as Error, 'SEEDER');
      throw error;
    }
  }

  /**
   * Verifica se o seeder já foi executado
   */
  private async hasBeenSeeded(): Promise<boolean> {
    try {
      const status = await Storage.load<{ executed: boolean }>(this.SEEDER_KEY);
      return status?.executed === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Limpa todos os dados do storage
   */
  private async clearAllData(): Promise<void> {
    try {
      await Storage.clearAll();
      Logger.info('🗑️ Dados limpos com sucesso', undefined, 'SEEDER');
    } catch (error) {
      Logger.error('Falha ao limpar dados', error as Error, 'SEEDER');
    }
  }

  /**
   * Popula contas bancárias de exemplo
   */
  private async seedAccounts(): Promise<void> {
    try {
      const accounts: Account[] = [
        {
          id: 'acc-1',
          name: 'Conta Corrente Banco do Brasil',
          type: 'checking',
          balance: 5432.50,
          currency: 'BRL'
        },
        {
          id: 'acc-2',
          name: 'Poupança Caixa',
          type: 'savings',
          balance: 12500.00,
          currency: 'BRL'
        },
        {
          id: 'acc-3',
          name: 'Carteira de Investimentos',
          type: 'investment',
          balance: 35000.00,
          currency: 'BRL'
        }
      ];

      await Storage.save('accounts', accounts);
      Logger.info(`💰 ${accounts.length} contas criadas`, undefined, 'SEEDER');

    } catch (error) {
      Logger.error('Falha ao criar contas', error as Error, 'SEEDER');
    }
  }

  /**
   * Popula transações financeiras de exemplo
   */
  private async seedTransactions(count: number): Promise<void> {
    try {
      const categories = {
        income: ['Salário', 'Freelance', 'Investimentos', 'Bônus'],
        expense: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação']
      };

      const transactions: FinancialTransaction[] = [];

      for (let i = 0; i < count; i++) {
        const isIncome = Math.random() > 0.6; // 40% receitas, 60% despesas
        const type = isIncome ? 'income' : 'expense';
        const categoryList = categories[type];
        const category = categoryList[Math.floor(Math.random() * categoryList.length)];

        // Gera valores realistas
        const amount = isIncome 
          ? Math.floor(Math.random() * 5000) + 3000 // R$ 3000-8000
          : Math.floor(Math.random() * 500) + 50;   // R$ 50-550

        // Gera datas dos últimos 60 dias
        const daysAgo = Math.floor(Math.random() * 60);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        transactions.push({
          id: `txn-${i + 1}`,
          type,
          category,
          amount,
          date: date.toISOString(),
          description: `${category} - ${type === 'income' ? 'Recebimento' : 'Pagamento'}`,
          recurring: Math.random() > 0.7 // 30% recorrente
        });
      }

      // Ordena por data (mais recente primeiro)
      transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      await Storage.save('transactions', transactions);
      Logger.info(`💳 ${transactions.length} transações criadas`, undefined, 'SEEDER');

    } catch (error) {
      Logger.error('Falha ao criar transações', error as Error, 'SEEDER');
    }
  }

  /**
   * Popula orçamentos de exemplo
   */
  private async seedBudgets(): Promise<void> {
    try {
      const budgets: Budget[] = [
        {
          id: 'budget-1',
          category: 'Alimentação',
          limit: 1500,
          spent: 987.50,
          period: 'monthly'
        },
        {
          id: 'budget-2',
          category: 'Transporte',
          limit: 500,
          spent: 345.00,
          period: 'monthly'
        },
        {
          id: 'budget-3',
          category: 'Lazer',
          limit: 800,
          spent: 620.00,
          period: 'monthly'
        },
        {
          id: 'budget-4',
          category: 'Saúde',
          limit: 1000,
          spent: 450.00,
          period: 'monthly'
        }
      ];

      await Storage.save('budgets', budgets);
      Logger.info(`📊 ${budgets.length} orçamentos criados`, undefined, 'SEEDER');

    } catch (error) {
      Logger.error('Falha ao criar orçamentos', error as Error, 'SEEDER');
    }
  }

  /**
   * Reseta o status do seeder (útil para testes)
   */
  async resetSeederStatus(): Promise<void> {
    try {
      await Storage.remove(this.SEEDER_KEY);
      Logger.info('🔄 Status do seeder resetado', undefined, 'SEEDER');
    } catch (error) {
      Logger.error('Falha ao resetar status', error as Error, 'SEEDER');
    }
  }

  /**
   * Retorna estatísticas dos dados seedados
   */
  async getStats(): Promise<{ accounts: number; transactions: number; budgets: number }> {
    try {
      const accounts = await Storage.load<Account[]>('accounts') || [];
      const transactions = await Storage.load<FinancialTransaction[]>('transactions') || [];
      const budgets = await Storage.load<Budget[]>('budgets') || [];

      return {
        accounts: accounts.length,
        transactions: transactions.length,
        budgets: budgets.length
      };
    } catch (error) {
      Logger.error('Falha ao obter estatísticas', error as Error, 'SEEDER');
      return { accounts: 0, transactions: 0, budgets: 0 };
    }
  }
}

// Singleton
export const Seeder = new DatabaseSeeder();

export default Seeder;
