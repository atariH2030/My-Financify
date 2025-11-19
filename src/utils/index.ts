/**
 * Utils - Exportação centralizada
 * Utilities para performance, hooks customizados, animações, validação e datas
 * v3.11 - Sistema de formatação de moedas ABNT
 */

// Custom Hooks
export * from './hooks';

// Performance Utilities
export * from './performance';

// Currency Formatting (ABNT + International)
export * from './currency';

// Animations (Framer Motion)
export * from './animations';

// Validation (Zod)
export * from './validation';

// Date Utilities (date-fns) - Re-exportando com alias para evitar conflito
export {
  formatDate as formatDateBR,
  formatDateTime,
  formatRelativeDate,
  formatMonthYear,
  formatShortMonthYear,
  getCurrentPeriod,
  getLastMonthPeriod,
  getCurrentWeekPeriod,
  getCurrentYearPeriod,
  getLastNDays,
  getLastNMonths,
  isDateInPeriod,
  addDaysToDate,
  addMonthsToDate,
  addYearsToDate,
  daysBetween,
  monthsBetween,
  dateHelpers,
} from './date';

// PWA Manager
export * from './pwa';
