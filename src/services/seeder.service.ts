/**
 * Database Seeder - Dados de teste automáticos
 * Implementa TQM: Automação > Ação Manual
 * Garante dados consistentes para desenvolvimento e testes
 * 
 * @version 3.0.0 - Atualizado com nova estrutura hierárquica
 */

import Logger from './logger.service';
import Storage from './storage.service';
import type { Transaction, Budget as BudgetType } from '../types/financial.types';

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment';
  balance: number;
  currency: string;
}

export type Budget = Partial<BudgetType> & {
  id: string;
  category: string;
};

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
   * Popula transações financeiras realistas com nova estrutura hierárquica
   */
  private async seedTransactions(count: number): Promise<void> {
    try {
      const transactions: Transaction[] = [];
      const now = new Date();

      // Templates de transações realistas por sessão/categoria
      const transactionTemplates = [
        // RECEITAS
        { section: 'income', category: 'salary', subcategory: 'Salário Principal', amount: 5500, type: 'income' as const, desc: 'Salário Mensal', recurring: true, expenseType: undefined },
        { section: 'income', category: 'freelance', subcategory: 'Projetos', amount: 1200, type: 'income' as const, desc: 'Projeto de Desenvolvimento Web', expenseType: undefined },
        { section: 'income', category: 'investments', subcategory: 'Dividendos', amount: 150, type: 'income' as const, desc: 'Dividendos Ações', expenseType: undefined },
        
        // DESPESAS DA CASA - FIXAS
        { section: 'home-expenses', category: 'housing', subcategory: 'Aluguel', amount: 1800, type: 'expense' as const, desc: 'Aluguel Apartamento', recurring: true, expenseType: 'fixed' as const },
        { section: 'home-expenses', category: 'housing', subcategory: 'Condomínio', amount: 350, type: 'expense' as const, desc: 'Condomínio Mensal', recurring: true, expenseType: 'fixed' as const },
        { section: 'home-expenses', category: 'utilities', subcategory: 'Internet', amount: 120, type: 'expense' as const, desc: 'Internet Fibra 500MB', recurring: true, expenseType: 'fixed' as const },
        { section: 'home-expenses', category: 'utilities', subcategory: 'Streaming', amount: 45, type: 'expense' as const, desc: 'Netflix Premium', recurring: true, expenseType: 'fixed' as const },
        
        // DESPESAS DA CASA - VARIÁVEIS
        { section: 'home-expenses', category: 'utilities', subcategory: 'Luz', amount: 180, type: 'expense' as const, desc: 'Conta de Luz', recurring: true, expenseType: 'variable' as const },
        { section: 'home-expenses', category: 'utilities', subcategory: 'Água', amount: 85, type: 'expense' as const, desc: 'Conta de Água', recurring: true, expenseType: 'variable' as const },
        { section: 'home-expenses', category: 'utilities', subcategory: 'Gás', amount: 95, type: 'expense' as const, desc: 'Botijão de Gás', expenseType: 'variable' as const },
        { section: 'home-expenses', category: 'groceries', subcategory: 'Supermercado', amount: 650, type: 'expense' as const, desc: 'Compras do Mês', recurring: true, expenseType: 'variable' as const },
        { section: 'home-expenses', category: 'groceries', subcategory: 'Feira', amount: 120, type: 'expense' as const, desc: 'Feira Semanal', expenseType: 'variable' as const },
        
        // DESPESAS PESSOAIS - FIXAS
        { section: 'personal-expenses', category: 'health', subcategory: 'Plano de Saúde', amount: 420, type: 'expense' as const, desc: 'Unimed', recurring: true, expenseType: 'fixed' as const },
        { section: 'personal-expenses', category: 'health', subcategory: 'Academia', amount: 89, type: 'expense' as const, desc: 'Smart Fit', recurring: true, expenseType: 'fixed' as const },
        { section: 'personal-expenses', category: 'transportation', subcategory: 'Seguro Auto', amount: 185, type: 'expense' as const, desc: 'Seguro do Carro', recurring: true, expenseType: 'fixed' as const },
        
        // DESPESAS PESSOAIS - VARIÁVEIS
        { section: 'personal-expenses', category: 'food', subcategory: 'Restaurantes', amount: 85, type: 'expense' as const, desc: 'Almoço Restaurante', expenseType: 'variable' as const },
        { section: 'personal-expenses', category: 'food', subcategory: 'Delivery', amount: 65, type: 'expense' as const, desc: 'iFood - Jantar', expenseType: 'variable' as const },
        { section: 'personal-expenses', category: 'food', subcategory: 'Café', amount: 25, type: 'expense' as const, desc: 'Starbucks', expenseType: 'variable' as const },
        { section: 'personal-expenses', category: 'transportation', subcategory: 'Combustível', amount: 280, type: 'expense' as const, desc: 'Gasolina', recurring: true, expenseType: 'variable' as const },
        { section: 'personal-expenses', category: 'transportation', subcategory: 'Uber/Taxi', amount: 45, type: 'expense' as const, desc: 'Uber Centro', expenseType: 'variable' as const },
        { section: 'personal-expenses', category: 'personal-care', subcategory: 'Cabelo', amount: 80, type: 'expense' as const, desc: 'Corte de Cabelo', expenseType: 'variable' as const },
        
        // EDUCAÇÃO E CULTURA
        { section: 'education-culture', category: 'education', subcategory: 'Cursos Online', amount: 97, type: 'expense' as const, desc: 'Udemy - Curso React', recurring: true, expenseType: 'fixed' as const },
        { section: 'education-culture', category: 'education', subcategory: 'Livros', amount: 55, type: 'expense' as const, desc: 'Livro Técnico', expenseType: 'variable' as const },
        { section: 'education-culture', category: 'leisure', subcategory: 'Cinema', amount: 60, type: 'expense' as const, desc: 'Cinema + Pipoca', expenseType: 'variable' as const },
        { section: 'education-culture', category: 'leisure', subcategory: 'Assinaturas', amount: 35, type: 'expense' as const, desc: 'Spotify Premium', recurring: true, expenseType: 'fixed' as const },
        
        // INVESTIMENTOS E POUPANÇA
        { section: 'savings-investments', category: 'savings', subcategory: 'Poupança Automática', amount: 500, type: 'expense' as const, desc: 'Transferência para Poupança', recurring: true, expenseType: 'fixed' as const },
        { section: 'savings-investments', category: 'investments-category', subcategory: 'Renda Fixa', amount: 300, type: 'expense' as const, desc: 'Tesouro Direto', recurring: true, expenseType: 'fixed' as const },
        
        // DÍVIDAS
        { section: 'debts', category: 'credit-cards', subcategory: 'Fatura Integral', amount: 1250, type: 'expense' as const, desc: 'Fatura Cartão Nubank', recurring: true, expenseType: 'variable' as const },
      ];

      // Gera transações baseadas nos templates
      for (let i = 0; i < Math.min(count, transactionTemplates.length * 3); i++) {
        const template = transactionTemplates[i % transactionTemplates.length];
        
        // Varia o valor em +/- 20%
        const variance = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
        const amount = Number((template.amount * variance).toFixed(2));
        
        // Gera datas dos últimos 60 dias
        const daysAgo = Math.floor(Math.random() * 60);
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        
        transactions.push({
          id: `txn_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          type: template.type,
          section: template.section,
          category: template.category,
          subcategory: template.subcategory,
          amount,
          description: template.desc,
          expenseType: template.expenseType,
          date,
          recurring: template.recurring ? {
            enabled: true,
            frequency: 'monthly',
            nextDate: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000)
          } : undefined,
          metadata: {
            method: this.getRandomPaymentMethod(),
          },
          createdAt: new Date().toISOString(),
        });
      }

      // Ordena por data (mais recente primeiro)
      transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

      await Storage.save('transactions', transactions);
      Logger.info(`💳 ${transactions.length} transações criadas com nova estrutura`, undefined, 'SEEDER');

    } catch (error) {
      Logger.error('Falha ao criar transações', error as Error, 'SEEDER');
    }
  }

  /**
   * Retorna método de pagamento aleatório
   */
  private getRandomPaymentMethod(): 'cash' | 'debit' | 'credit' | 'transfer' | 'pix' | 'other' {
    const methods: Array<'cash' | 'debit' | 'credit' | 'transfer' | 'pix' | 'other'> = 
      ['cash', 'debit', 'credit', 'transfer', 'pix', 'other'];
    return methods[Math.floor(Math.random() * methods.length)];
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
          limitAmount: 1500,
          currentSpent: 987.50,
          period: 'monthly',
          alertThreshold: 80,
          status: 'active',
          startDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: 'budget-2',
          category: 'Transporte',
          limitAmount: 500,
          currentSpent: 345.00,
          period: 'monthly',
          alertThreshold: 80,
          status: 'active',
          startDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: 'budget-3',
          category: 'Lazer',
          limitAmount: 800,
          currentSpent: 620.00,
          period: 'monthly',
          alertThreshold: 80,
          status: 'active',
          startDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        {
          id: 'budget-4',
          category: 'Saúde',
          limitAmount: 1000,
          currentSpent: 450.00,
          period: 'monthly',
          alertThreshold: 80,
          status: 'active',
          startDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
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
      const transactions = await Storage.load<Transaction[]>('transactions') || [];
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
