/**
 * Performance Utilities - Helpers para otimização
 * Implementa TQM: Performance + Manutenibilidade
 */

import React from 'react';
import { formatCurrency as formatCurrencyNew } from './currency';

/**
 * Debounce function - Atrasa execução até que chamadas parem
 * Útil para inputs, buscas, resize
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function debounced(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function - Limita frequência de execução
 * Útil para scroll, resize, mousemove
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  
  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastRun >= delay) {
      lastRun = now;
      func(...args);
    }
  };
}

/**
 * Lazy load de imagens - Otimiza carregamento
 */
export const lazyLoadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Format currency - Otimizado para performance
 */
export const formatCurrencyString = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Format date - Memoizado
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Format date relative - "há 2 dias", "ontem", etc.
 */
export const formatDateRelative = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`;
  return `Há ${Math.floor(diffDays / 365)} anos`;
};

/**
 * Generate unique ID - Performance otimizada
 */
export const generateId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep compare para React.memo - Evita re-renders desnecessários
 */
export const deepCompare = <T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean => {
  const keys1 = Object.keys(prevProps);
  const keys2 = Object.keys(nextProps);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (prevProps[key] !== nextProps[key]) return false;
  }
  
  return true;
};

/**
 * Batch updates - Agrupa múltiplas atualizações
 * Reduz re-renders
 */
export const batchUpdates = <T,>(
  updates: T[],
  callback: (batch: T[]) => void,
  delay: number = 100
): (() => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  const batch: T[] = [];
  
  const flush = () => {
    if (batch.length > 0) {
      callback([...batch]);
      batch.length = 0;
    }
  };
  
  updates.forEach(update => {
    batch.push(update);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(flush, delay);
  });
  
  return flush;
};

/**
 * Memoize function - Cache de resultados
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Check if element is in viewport - Para lazy loading
 */
export const isInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Request Animation Frame throttle - Para animações suaves
 */
export const rafThrottle = <T extends (...args: any[]) => any>(
  callback: T
): ((...args: Parameters<T>) => void) => {
  let requestId: number | null = null;
  
  return (...args: Parameters<T>) => {
    if (requestId !== null) return;
    
    requestId = requestAnimationFrame(() => {
      callback(...args);
      requestId = null;
    });
  };
};

/**
 * Local storage com try/catch automático
 */
export const safeStorage = {
  get: <T,>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: <T,>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};

// Aliases para retrocompatibilidade - Agora usando nova implementação ABNT
export const formatCurrency = formatCurrencyNew;
// Mantém função legada disponível se necessário
export const formatCurrencyLegacy = formatCurrencyString;

/**
 * Format percentage - Formata número como porcentagem
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${(value * 100).toFixed(decimals).replace('.', ',')}%`;
};

/**
 * Truncate string - Trunca string longa
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};

/**
 * Deep clone object - Cria cópia profunda
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmptyObject = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

