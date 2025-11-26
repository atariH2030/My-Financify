/**
 * Account Service - Gerenciamento de Contas/Carteiras
 * Sistema simplificado SEM dados bancários sensíveis
 * Apenas referências visuais para controle pessoal
 * @version 3.7.0
 */

import Logger from './logger.service';
import Storage from './storage.service';
import type { Account, Transaction } from '../types/financial.types';

class AccountService {
  private readonly STORAGE_KEY = 'accounts';

  /**
   * Obtém todas as contas
   */
  async getAll(): Promise<Account[]> {
    try {
      const accounts = await Storage.load<Account[]>(this.STORAGE_KEY);
      return accounts || [];
    } catch (error) {
      Logger.error('Erro ao carregar contas', error as Error, 'ACCOUNTS');
      return [];
    }
  }

  /**
   * Obtém apenas contas ativas
   */
  async getActive(): Promise<Account[]> {
    const all = await this.getAll();
    return all.filter(a => a.isActive);
  }

  /**
   * Obtém conta por ID
   */
  async getById(id: string): Promise<Account | undefined> {
    const accounts = await this.getAll();
    return accounts.find(a => a.id === id);
  }

  /**
   * Cria nova conta
   */
  async create(data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    try {
      const accounts = await this.getAll();

      const newAccount: Account = {
        ...data,
        id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };

      accounts.push(newAccount);
      await Storage.save(this.STORAGE_KEY, accounts);

      Logger.info(`💳 Conta criada: ${newAccount.name}`, { id: newAccount.id }, 'ACCOUNTS');
      return newAccount;
    } catch (error) {
      Logger.error('Erro ao criar conta', error as Error, 'ACCOUNTS');
      throw error;
    }
  }

  /**
   * Atualiza conta existente
   */
  async update(id: string, data: Partial<Omit<Account, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const accounts = await this.getAll();
      const index = accounts.findIndex(a => a.id === id);

      if (index === -1) {
        throw new Error('Conta não encontrada');
      }

      accounts[index] = {
        ...accounts[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await Storage.save(this.STORAGE_KEY, accounts);
      Logger.info(`✏️ Conta atualizada: ${accounts[index].name}`, { id }, 'ACCOUNTS');
    } catch (error) {
      Logger.error('Erro ao atualizar conta', error as Error, 'ACCOUNTS');
      throw error;
    }
  }

  /**
   * Remove conta (soft delete - marca como inativa)
   */
  async remove(id: string): Promise<void> {
    try {
      await this.update(id, { isActive: false });
      Logger.info('🗑️ Conta desativada', { id }, 'ACCOUNTS');
    } catch (error) {
      Logger.error('Erro ao remover conta', error as Error, 'ACCOUNTS');
      throw error;
    }
  }

  /**
   * Remove permanentemente
   */
  async permanentDelete(id: string): Promise<void> {
    try {
      const accounts = await this.getAll();
      const filtered = accounts.filter(a => a.id !== id);
      await Storage.save(this.STORAGE_KEY, filtered);
      Logger.info('🗑️ Conta removida permanentemente', { id }, 'ACCOUNTS');
    } catch (error) {
      Logger.error('Erro ao remover conta', error as Error, 'ACCOUNTS');
      throw error;
    }
  }

  /**
   * Calcula saldo de uma conta baseado nas transações
   */
  async calculateBalance(accountId: string, transactions: Transaction[]): Promise<number> {
    const accountTransactions = transactions.filter(t => t.accountId === accountId);
    
    return accountTransactions.reduce((balance, t) => {
      return t.type === 'income' ? balance + t.amount : balance - t.amount;
    }, 0);
  }

  /**
   * Calcula fatura do cartão de crédito (transações não pagas do período)
   */
  async calculateCreditCardBill(
    accountId: string,
    transactions: Transaction[],
    referenceDate: Date = new Date()
  ): Promise<{
    total: number;
    transactions: Transaction[];
    closingDate: Date;
    dueDate: Date;
  }> {
    const account = await this.getById(accountId);
    
    if (!account || account.type !== 'credit') {
      return { total: 0, transactions: [], closingDate: referenceDate, dueDate: referenceDate };
    }

    const closingDay = account.closingDay || 5;
    const dueDay = account.dueDay || 10;

    // Calcula período da fatura (fechamento anterior até fechamento atual)
    const currentMonth = referenceDate.getMonth();
    const currentYear = referenceDate.getFullYear();
    
    let closingDate: Date;
    if (referenceDate.getDate() > closingDay) {
      // Já passou do fechamento deste mês
      closingDate = new Date(currentYear, currentMonth, closingDay);
    } else {
      // Ainda não fechou, pega fechamento do mês passado
      closingDate = new Date(currentYear, currentMonth - 1, closingDay);
    }

    const previousClosing = new Date(closingDate);
    previousClosing.setMonth(previousClosing.getMonth() - 1);

    // Vencimento é sempre após o fechamento
    const dueDate = new Date(closingDate);
    dueDate.setDate(dueDay);
    if (dueDay < closingDay) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    // Filtra transações do período
    const billTransactions = transactions.filter(t => {
      if (t.accountId !== accountId || t.type !== 'expense') return false;
      
      const transactionDate = new Date(t.date);
      return transactionDate > previousClosing && transactionDate <= closingDate;
    });

    const total = billTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      total,
      transactions: billTransactions,
      closingDate,
      dueDate,
    };
  }

  /**
   * Obtém resumo de todas as contas
   */
  async getSummary(transactions: Transaction[]): Promise<{
    totalAccounts: number;
    activeAccounts: number;
    totalBalance: number;
    totalCreditLimit: number;
    totalCreditUsed: number;
    accounts: Array<{
      account: Account;
      balance: number;
      creditUsed?: number;
      creditAvailable?: number;
    }>;
  }> {
    const accounts = await this.getAll();
    const activeAccounts = accounts.filter(a => a.isActive);

    let totalBalance = 0;
    let totalCreditLimit = 0;
    let totalCreditUsed = 0;

    const accountsWithBalance = await Promise.all(
      activeAccounts.map(async (account) => {
        const balance = await this.calculateBalance(account.id, transactions);
        
        let creditUsed = 0;
        let creditAvailable = 0;

        if (account.type === 'credit') {
          const bill = await this.calculateCreditCardBill(account.id, transactions);
          creditUsed = bill.total;
          creditAvailable = (account.creditLimit || 0) - creditUsed;
          totalCreditLimit += account.creditLimit || 0;
          totalCreditUsed += creditUsed;
        } else {
          totalBalance += balance;
        }

        return {
          account,
          balance,
          creditUsed: account.type === 'credit' ? creditUsed : undefined,
          creditAvailable: account.type === 'credit' ? creditAvailable : undefined,
        };
      })
    );

    return {
      totalAccounts: accounts.length,
      activeAccounts: activeAccounts.length,
      totalBalance,
      totalCreditLimit,
      totalCreditUsed,
      accounts: accountsWithBalance,
    };
  }

  /**
   * Valida se conta pode ser removida (tem transações associadas)
   */
  async canDelete(accountId: string, transactions: Transaction[]): Promise<{
    canDelete: boolean;
    reason?: string;
    transactionCount?: number;
  }> {
    const accountTransactions = transactions.filter(t => t.accountId === accountId);
    
    if (accountTransactions.length > 0) {
      return {
        canDelete: false,
        reason: 'Conta possui transações associadas',
        transactionCount: accountTransactions.length,
      };
    }

    return { canDelete: true };
  }
}

export default new AccountService();
