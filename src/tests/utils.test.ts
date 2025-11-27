/**
 * @file utils.test.ts
 * @description Testes para funções utilitárias
 * @version 2.4.0
 * @author DEV - Rickson (TQM)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  debounce,
  throttle,
  memoize,
  formatCurrencyString,
  truncateString,
  generateId,
  deepClone,
  isEmptyObject,
} from '../utils/performance';
import { formatCurrency, formatPercentage } from '../utils/currency';
import {
  formatDate,
  formatDateTime,
  formatRelativeDate,
  formatMonthYear,
  getCurrentPeriod,
  getLastNDays,
  getLastNMonths,
  isDateInPeriod,
  daysBetween,
  monthsBetween,
} from '../utils/date';

describe('Performance Utils', () => {
  describe('debounce', () => {
    it('deve executar função após delay', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('deve cancelar execuções anteriores', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });

  describe('throttle', () => {
    it('deve executar função no máximo uma vez por delay', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 500);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(500);
      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });
  });

  describe('memoize', () => {
    it('deve cachear resultado da função', () => {
      const expensiveFn = vi.fn((n: number) => n * 2);
      const memoizedFn = memoize(expensiveFn);

      const result1 = memoizedFn(5);
      const result2 = memoizedFn(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(expensiveFn).toHaveBeenCalledTimes(1);
    });

    it('deve calcular novamente para argumentos diferentes', () => {
      const expensiveFn = vi.fn((n: number) => n * 2);
      const memoizedFn = memoize(expensiveFn);

      memoizedFn(5);
      memoizedFn(10);

      expect(expensiveFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('formatCurrency', () => {
    it('deve formatar número como moeda brasileira', () => {
      expect(formatCurrency(1234.56)).toMatch(/R\$\s*1\.234,56/);
      expect(formatCurrency(0)).toMatch(/R\$\s*0,00/);
      expect(formatCurrency(1000000)).toMatch(/R\$\s*1\.000\.000,00/);
    });
  });

  describe('formatPercentage', () => {
    it('deve formatar número como porcentagem', () => {
      expect(formatPercentage(0.1234)).toBe('12,34%');
      expect(formatPercentage(1)).toBe('100,00%');
      expect(formatPercentage(0)).toBe('0,00%');
    });

    it('deve respeitar casas decimais especificadas', () => {
      expect(formatPercentage(0.1234, { decimals: 0 })).toBe('12%');
      expect(formatPercentage(0.1234, { decimals: 1 })).toBe('12,3%');
    });
  });

  describe('truncateString', () => {
    it('deve truncar string longa', () => {
      expect(truncateString('Hello World', 5)).toBe('Hello...');
      expect(truncateString('Short', 10)).toBe('Short');
    });
  });

  describe('generateId', () => {
    it('deve gerar IDs únicos', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('deepClone', () => {
    it('deve criar cópia profunda de objeto', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);

      cloned.b.c = 3;

      expect(original.b.c).toBe(2);
      expect(cloned.b.c).toBe(3);
    });
  });

  describe('isEmptyObject', () => {
    it('deve identificar objeto vazio', () => {
      expect(isEmptyObject({})).toBe(true);
      expect(isEmptyObject({ a: 1 })).toBe(false);
    });
  });
});

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('deve formatar data no formato brasileiro', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('deve retornar "Data inválida" para data inválida', () => {
      expect(formatDate('invalid')).toBe('Data inválida');
    });
  });

  describe('formatDateTime', () => {
    it('deve formatar data com hora', () => {
      const date = new Date('2024-01-15T14:30:00');
      expect(formatDateTime(date)).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
    });
  });

  describe('formatRelativeDate', () => {
    it('deve retornar "Hoje" para data atual', () => {
      const today = new Date();
      expect(formatRelativeDate(today)).toBe('Hoje');
    });
  });

  describe('formatMonthYear', () => {
    it('deve formatar mês e ano', () => {
      const date = new Date('2024-01-15');
      expect(formatMonthYear(date)).toMatch(/\w+ \d{4}/);
    });
  });

  describe('getCurrentPeriod', () => {
    it('deve retornar período do mês atual', () => {
      const period = getCurrentPeriod();
      expect(period.start).toBeInstanceOf(Date);
      expect(period.end).toBeInstanceOf(Date);
      expect(period.end.getTime()).toBeGreaterThan(period.start.getTime());
    });
  });

  describe('getLastNDays', () => {
    it('deve retornar array com N dias', () => {
      const days = getLastNDays(7);
      expect(days).toHaveLength(7);
      expect(days[0]).toBeInstanceOf(Date);
    });
  });

  describe('getLastNMonths', () => {
    it('deve retornar array com N meses', () => {
      const months = getLastNMonths(6);
      expect(months).toHaveLength(6);
      expect(months[0]).toBeInstanceOf(Date);
    });
  });

  describe('isDateInPeriod', () => {
    it('deve verificar se data está dentro do período', () => {
      const date = new Date('2024-06-15');
      const start = new Date('2024-06-01');
      const end = new Date('2024-06-30');

      expect(isDateInPeriod(date, start, end)).toBe(true);
    });

    it('deve retornar false se data está fora do período', () => {
      const date = new Date('2024-07-15');
      const start = new Date('2024-06-01');
      const end = new Date('2024-06-30');

      expect(isDateInPeriod(date, start, end)).toBe(false);
    });
  });

  describe('daysBetween', () => {
    it('deve calcular dias entre duas datas', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-10');

      expect(daysBetween(date1, date2)).toBe(9);
    });
  });

  describe('monthsBetween', () => {
    it('deve calcular meses entre duas datas', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-06-01');

      expect(monthsBetween(date1, date2)).toBe(5);
    });
  });
});
