/**
 * @file date.ts
 * @description Utilitários para manipulação de datas com date-fns
 * @version 2.4.0
 * @author DEV - Rickson (TQM)
 */

import {
  format,
  parseISO,
  addDays,
  addWeeks as _addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks as _subWeeks,
  subMonths,
  subYears as _subYears,
  startOfDay as _startOfDay,
  endOfDay as _endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  isAfter,
  isBefore,
  isEqual,
  isToday,
  isYesterday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isPast,
  isFuture,
  isValid,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para o formato brasileiro (dd/MM/yyyy)
 */
export function formatDate(date: Date | string): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return 'Data inválida';
    return format(parsedDate, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
}

/**
 * Formata uma data com hora (dd/MM/yyyy HH:mm)
 */
export function formatDateTime(date: Date | string): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return 'Data inválida';
    return format(parsedDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
}

/**
 * Formata uma data de forma relativa (ex: "há 2 dias", "ontem")
 */
export function formatRelativeDate(date: Date | string): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return 'Data inválida';

    if (isToday(parsedDate)) return 'Hoje';
    if (isYesterday(parsedDate)) return 'Ontem';
    if (isTomorrow(parsedDate)) return 'Amanhã';

    const now = new Date();
    const daysDiff = differenceInDays(now, parsedDate);

    if (daysDiff > 0 && daysDiff <= 7) return `Há ${daysDiff} dia${daysDiff > 1 ? 's' : ''}`;
    if (daysDiff < 0 && daysDiff >= -7)
      return `Em ${Math.abs(daysDiff)} dia${Math.abs(daysDiff) > 1 ? 's' : ''}`;

    const weeksDiff = differenceInWeeks(now, parsedDate);
    if (weeksDiff > 0 && weeksDiff <= 4)
      return `Há ${weeksDiff} semana${weeksDiff > 1 ? 's' : ''}`;
    if (weeksDiff < 0 && weeksDiff >= -4)
      return `Em ${Math.abs(weeksDiff)} semana${Math.abs(weeksDiff) > 1 ? 's' : ''}`;

    const monthsDiff = differenceInMonths(now, parsedDate);
    if (monthsDiff > 0 && monthsDiff <= 12)
      return `Há ${monthsDiff} ${monthsDiff === 1 ? 'mês' : 'meses'}`;
    if (monthsDiff < 0 && monthsDiff >= -12)
      return `Em ${Math.abs(monthsDiff)} ${Math.abs(monthsDiff) === 1 ? 'mês' : 'meses'}`;

    const yearsDiff = differenceInYears(now, parsedDate);
    if (yearsDiff > 0) return `Há ${yearsDiff} ano${yearsDiff > 1 ? 's' : ''}`;
    if (yearsDiff < 0)
      return `Em ${Math.abs(yearsDiff)} ano${Math.abs(yearsDiff) > 1 ? 's' : ''}`;

    return formatDate(parsedDate);
  } catch {
    return 'Data inválida';
  }
}

/**
 * Formata uma data para o formato de mês/ano (ex: "Janeiro 2024")
 */
export function formatMonthYear(date: Date | string): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return 'Data inválida';
    return format(parsedDate, 'MMMM yyyy', { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
}

/**
 * Formata uma data para o formato curto de mês (ex: "Jan/24")
 */
export function formatShortMonthYear(date: Date | string): string {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return 'Data inválida';
    return format(parsedDate, 'MMM/yy', { locale: ptBR });
  } catch {
    return 'Data inválida';
  }
}

/**
 * Retorna o período atual (início e fim do mês)
 */
export function getCurrentPeriod(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
}

/**
 * Retorna o período do mês anterior
 */
export function getLastMonthPeriod(): { start: Date; end: Date } {
  const lastMonth = subMonths(new Date(), 1);
  return {
    start: startOfMonth(lastMonth),
    end: endOfMonth(lastMonth),
  };
}

/**
 * Retorna o período da semana atual
 */
export function getCurrentWeekPeriod(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfWeek(now, { locale: ptBR }),
    end: endOfWeek(now, { locale: ptBR }),
  };
}

/**
 * Retorna o período do ano atual
 */
export function getCurrentYearPeriod(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfYear(now),
    end: endOfYear(now),
  };
}

/**
 * Retorna um array com os últimos N dias
 */
export function getLastNDays(n: number): Date[] {
  const days: Date[] = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    days.push(subDays(today, i));
  }

  return days;
}

/**
 * Retorna um array com os últimos N meses
 */
export function getLastNMonths(n: number): Date[] {
  const months: Date[] = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    months.push(subMonths(today, i));
  }

  return months;
}

/**
 * Verifica se uma data está dentro de um período
 */
export function isDateInPeriod(
  date: Date | string,
  start: Date | string,
  end: Date | string
): boolean {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const parsedStart = typeof start === 'string' ? parseISO(start) : start;
    const parsedEnd = typeof end === 'string' ? parseISO(end) : end;

    if (!isValid(parsedDate) || !isValid(parsedStart) || !isValid(parsedEnd)) {
      return false;
    }

    return (
      (isAfter(parsedDate, parsedStart) || isEqual(parsedDate, parsedStart)) &&
      (isBefore(parsedDate, parsedEnd) || isEqual(parsedDate, parsedEnd))
    );
  } catch {
    return false;
  }
}

/**
 * Adiciona dias a uma data
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return addDays(parsedDate, days);
}

/**
 * Adiciona meses a uma data
 */
export function addMonthsToDate(date: Date | string, months: number): Date {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return addMonths(parsedDate, months);
}

/**
 * Adiciona anos a uma data
 */
export function addYearsToDate(date: Date | string, years: number): Date {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return addYears(parsedDate, years);
}

/**
 * Calcula o número de dias entre duas datas
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const parsedDate1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const parsedDate2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return Math.abs(differenceInDays(parsedDate1, parsedDate2));
}

/**
 * Calcula o número de meses entre duas datas
 */
export function monthsBetween(date1: Date | string, date2: Date | string): number {
  const parsedDate1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const parsedDate2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return Math.abs(differenceInMonths(parsedDate1, parsedDate2));
}

/**
 * Helpers para verificações rápidas de período
 */
export const dateHelpers = {
  isToday,
  isYesterday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isPast,
  isFuture,
  isValid,
  isAfter,
  isBefore,
  isEqual,
};
