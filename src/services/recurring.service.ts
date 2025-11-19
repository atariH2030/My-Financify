/**
 * Recurring Transaction Service
 * Gerencia transações recorrentes (assinaturas, contas fixas, salários)
 * 
 * @version 3.8.0
 */

import StorageService from './storage.service';
import Logger from './logger.service';
import type { RecurringTransaction, RecurringFrequency, RecurringStatus } from '../types/financial.types';

const STORAGE_KEY = 'recurring_transactions';

class RecurringService {
  /**
   * Obtém todas as transações recorrentes
   */
  getAll(): RecurringTransaction[] {
    try {
      return StorageService.get<RecurringTransaction[]>(STORAGE_KEY) || [];
    } catch (error) {
      Logger.error('Erro ao buscar transações recorrentes', error as Error, 'RECURRING_SERVICE');
      return [];
    }
  }

  /**
   * Obtém transações recorrentes ativas
   */
  getActive(): RecurringTransaction[] {
    return this.getAll().filter(r => r.isActive && r.status === 'active');
  }

  /**
   * Obtém transações recorrentes por tipo
   */
  getByType(type: 'income' | 'expense'): RecurringTransaction[] {
    return this.getAll().filter(r => r.type === type);
  }

  /**
   * Busca por ID
   */
  getById(id: string): RecurringTransaction | undefined {
    return this.getAll().find(r => r.id === id);
  }

  /**
   * Cria nova transação recorrente
   */
  create(data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'generatedCount' | 'nextOccurrence'>): RecurringTransaction {
    try {
      const recurring: RecurringTransaction = {
        ...data,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        generatedCount: 0,
        nextOccurrence: this.calculateNextOccurrence(data.startDate, data.frequency, data.dayOfMonth, data.dayOfWeek),
      };

      const all = this.getAll();
      all.push(recurring);
      StorageService.set(STORAGE_KEY, all);

      Logger.info('Transação recorrente criada', { name: recurring.name, id: recurring.id }, 'RECURRING_SERVICE');
      return recurring;
    } catch (error) {
      Logger.error('Erro ao criar transação recorrente', error as Error, 'RECURRING_SERVICE');
      throw error;
    }
  }

  /**
   * Atualiza transação recorrente
   */
  update(id: string, data: Partial<RecurringTransaction>): RecurringTransaction {
    try {
      const all = this.getAll();
      const index = all.findIndex(r => r.id === id);

      if (index === -1) {
        throw new Error('Transação recorrente não encontrada');
      }

      const updated: RecurringTransaction = {
        ...all[index],
        ...data,
        id, // Garante que ID não seja alterado
        updatedAt: new Date().toISOString(),
      };

      // Recalcula próxima ocorrência se frequência ou data mudou
      if (data.frequency || data.startDate || data.dayOfMonth !== undefined || data.dayOfWeek !== undefined) {
        updated.nextOccurrence = this.calculateNextOccurrence(
          updated.startDate,
          updated.frequency,
          updated.dayOfMonth,
          updated.dayOfWeek
        );
      }

      all[index] = updated;
      StorageService.set(STORAGE_KEY, all);

      Logger.info('Transação recorrente atualizada', { name: updated.name, id }, 'RECURRING_SERVICE');
      return updated;
    } catch (error) {
      Logger.error('Erro ao atualizar transação recorrente', error as Error, 'RECURRING_SERVICE');
      throw error;
    }
  }

  /**
   * Remove transação recorrente
   */
  remove(id: string): boolean {
    try {
      const all = this.getAll();
      const filtered = all.filter(r => r.id !== id);

      if (filtered.length === all.length) {
        Logger.warn('Transação recorrente não encontrada para remoção', { id }, 'RECURRING_SERVICE');
        return false;
      }

      StorageService.set(STORAGE_KEY, filtered);
      Logger.info('Transação recorrente removida', { id }, 'RECURRING_SERVICE');
      return true;
    } catch (error) {
      Logger.error('Erro ao remover transação recorrente', error as Error, 'RECURRING_SERVICE');
      return false;
    }
  }

  /**
   * Pausa/Retoma transação recorrente
   */
  toggleStatus(id: string): RecurringTransaction {
    const recurring = this.getById(id);
    if (!recurring) {
      throw new Error('Transação recorrente não encontrada');
    }

    const newStatus: RecurringStatus = recurring.status === 'active' ? 'paused' : 'active';
    return this.update(id, { status: newStatus, isActive: newStatus === 'active' });
  }

  /**
   * Calcula próxima ocorrência
   */
  calculateNextOccurrence(
    startDate: string,
    frequency: RecurringFrequency,
    dayOfMonth?: number,
    dayOfWeek?: number
  ): string {
    const start = new Date(startDate);
    const now = new Date();
    let next = new Date(start);

    // Se data de início é futura, retorna ela
    if (start > now) {
      return start.toISOString();
    }

    // Calcula próxima ocorrência baseado na frequência
    switch (frequency) {
      case 'daily':
        next.setDate(now.getDate() + 1);
        break;

      case 'weekly':
        next = this.getNextWeekday(now, dayOfWeek || 0);
        break;

      case 'biweekly':
        next = this.getNextWeekday(now, dayOfWeek || 0);
        next.setDate(next.getDate() + 7);
        break;

      case 'monthly':
        next = this.getNextMonthDay(now, dayOfMonth || 1);
        break;

      case 'bimonthly':
        next = this.getNextMonthDay(now, dayOfMonth || 1);
        next.setMonth(next.getMonth() + 1);
        break;

      case 'quarterly':
        next = this.getNextMonthDay(now, dayOfMonth || 1);
        next.setMonth(next.getMonth() + 2);
        break;

      case 'semiannual':
        next = this.getNextMonthDay(now, dayOfMonth || 1);
        next.setMonth(next.getMonth() + 5);
        break;

      case 'yearly':
        next.setFullYear(now.getFullYear() + 1);
        if (dayOfMonth) {
          next.setDate(dayOfMonth);
        }
        break;
    }

    return next.toISOString();
  }

  /**
   * Obtém próximo dia da semana específico
   */
  private getNextWeekday(from: Date, targetDay: number): Date {
    const result = new Date(from);
    const currentDay = result.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    
    if (daysUntilTarget === 0) {
      result.setDate(result.getDate() + 7);
    } else {
      result.setDate(result.getDate() + daysUntilTarget);
    }
    
    return result;
  }

  /**
   * Obtém próximo dia do mês específico
   */
  private getNextMonthDay(from: Date, targetDay: number): Date {
    const result = new Date(from);
    result.setDate(targetDay);

    // Se o dia já passou este mês, vai para o próximo
    if (result <= from) {
      result.setMonth(result.getMonth() + 1);
    }

    // Ajusta para último dia do mês se targetDay > dias do mês
    const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    if (targetDay > lastDay) {
      result.setDate(lastDay);
    }

    return result;
  }

  /**
   * Obtém resumo de transações recorrentes
   */
  getSummary(): {
    total: number;
    active: number;
    paused: number;
    totalMonthlyIncome: number;
    totalMonthlyExpense: number;
    upcomingCount: number;
    upcomingAmount: number;
  } {
    const all = this.getAll();
    const active = all.filter(r => r.status === 'active');
    const paused = all.filter(r => r.status === 'paused');

    // Calcula totais mensais (convertendo outras frequências)
    let totalMonthlyIncome = 0;
    let totalMonthlyExpense = 0;

    active.forEach(r => {
      const monthlyAmount = this.convertToMonthly(r.amount, r.frequency);
      if (r.type === 'income') {
        totalMonthlyIncome += monthlyAmount;
      } else {
        totalMonthlyExpense += monthlyAmount;
      }
    });

    // Próximas 30 dias
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcoming = active.filter(r => {
      const next = new Date(r.nextOccurrence);
      return next >= now && next <= thirtyDaysFromNow;
    });

    return {
      total: all.length,
      active: active.length,
      paused: paused.length,
      totalMonthlyIncome,
      totalMonthlyExpense,
      upcomingCount: upcoming.length,
      upcomingAmount: upcoming.reduce((sum, r) => sum + r.amount, 0),
    };
  }

  /**
   * Converte valor para equivalente mensal
   */
  private convertToMonthly(amount: number, frequency: RecurringFrequency): number {
    const multipliers: Record<RecurringFrequency, number> = {
      daily: 30,
      weekly: 4.33,
      biweekly: 2.17,
      monthly: 1,
      bimonthly: 0.5,
      quarterly: 0.33,
      semiannual: 0.167,
      yearly: 0.083,
    };

    return amount * (multipliers[frequency] || 1);
  }

  /**
   * Obtém transações que devem ser geradas hoje
   */
  getDueToday(): RecurringTransaction[] {
    const active = this.getActive();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return active.filter(r => {
      if (!r.autoGenerate) return false;

      const next = new Date(r.nextOccurrence);
      next.setHours(0, 0, 0, 0);

      return next.getTime() === today.getTime();
    });
  }

  /**
   * Obtém transações próximas (próximos N dias)
   */
  getUpcoming(days: number = 7): RecurringTransaction[] {
    const active = this.getActive();
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return active.filter(r => {
      const next = new Date(r.nextOccurrence);
      return next >= now && next <= future;
    }).sort((a, b) => new Date(a.nextOccurrence).getTime() - new Date(b.nextOccurrence).getTime());
  }

  /**
   * Marca transação como gerada e calcula próxima ocorrência
   */
  markAsGenerated(id: string, transactionId: string): RecurringTransaction {
    const recurring = this.getById(id);
    if (!recurring) {
      throw new Error('Transação recorrente não encontrada');
    }

    const nextOccurrence = this.calculateNextOccurrence(
      recurring.nextOccurrence,
      recurring.frequency,
      recurring.dayOfMonth,
      recurring.dayOfWeek
    );

    return this.update(id, {
      lastGenerated: new Date().toISOString(),
      generatedCount: recurring.generatedCount + 1,
      nextOccurrence,
    });
  }

  /**
   * Gera ID único
   */
  private generateId(): string {
    return `recurring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new RecurringService();
