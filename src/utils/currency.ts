/**
 * Currency Formatter - Sistema de formatação de moedas
 * v3.11.0 - Conforme ABNT NBR 14725 e padrões internacionais
 * 
 * Padrões implementados:
 * - BRL: R$ 1.234,56 (ABNT - vírgula decimal, ponto milhar)
 * - USD: US$ 1,234.56 (padrão americano)
 * - EUR: € 1.234,56 (padrão europeu)
 * - GBP: £ 1,234.56 (padrão britânico)
 */

export type CurrencyCode = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'CAD' | 'AUD' | 'CNY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  name: string;
  decimalPlaces: number;
}

/**
 * Configurações de moedas suportadas
 */
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    locale: 'pt-BR',
    name: 'Real Brasileiro',
    decimalPlaces: 2,
  },
  USD: {
    code: 'USD',
    symbol: 'US$',
    locale: 'en-US',
    name: 'Dólar Americano',
    decimalPlaces: 2,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'de-DE',
    name: 'Euro',
    decimalPlaces: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    name: 'Libra Esterlina',
    decimalPlaces: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    locale: 'ja-JP',
    name: 'Iene Japonês',
    decimalPlaces: 0,
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    locale: 'de-CH',
    name: 'Franco Suíço',
    decimalPlaces: 2,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    locale: 'en-CA',
    name: 'Dólar Canadense',
    decimalPlaces: 2,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    locale: 'en-AU',
    name: 'Dólar Australiano',
    decimalPlaces: 2,
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    locale: 'zh-CN',
    name: 'Yuan Chinês',
    decimalPlaces: 2,
  },
};

/**
 * Formata valor como moeda conforme ABNT/padrões internacionais
 * 
 * @param value - Valor numérico
 * @param currency - Código da moeda (padrão: BRL)
 * @param options - Opções adicionais de formatação
 * 
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 * formatCurrency(1234.56, 'USD') // "US$ 1,234.56"
 * formatCurrency(1234.56, 'EUR') // "€ 1.234,56"
 */
export function formatCurrency(
  value: number,
  currency: CurrencyCode = 'BRL',
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    compact?: boolean;
  } = {}
): string {
  const { showSymbol = true, showCode = false, compact = false } = options;

  // Validação
  if (typeof value !== 'number' || isNaN(value)) {
    return showSymbol ? `${CURRENCIES[currency].symbol} 0,00` : '0,00';
  }

  const config = CURRENCIES[currency];

  // Formato compacto (1,2K, 1,5M, etc)
  if (compact && Math.abs(value) >= 1000) {
    return formatCompactCurrency(value, currency, showSymbol);
  }

  // Formatação usando Intl.NumberFormat
  try {
    const formatter = new Intl.NumberFormat(config.locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: showSymbol ? config.code : undefined,
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    });

    let formatted = formatter.format(value);

    // Para BRL, garantir formato ABNT com símbolo R$
    if (currency === 'BRL' && showSymbol) {
      formatted = formatted.replace(/^R\$\s*/, 'R$ ');
    }

    // Adicionar código da moeda se solicitado
    if (showCode && showSymbol) {
      formatted = `${formatted} (${config.code})`;
    }

    return formatted;
  } catch (error) {
    // Fallback manual
    return formatCurrencyManual(value, currency, showSymbol);
  }
}

/**
 * Formato compacto para valores grandes
 * Ex: 1.500 → 1,5K | 1.500.000 → 1,5M
 */
function formatCompactCurrency(
  value: number,
  currency: CurrencyCode,
  showSymbol: boolean
): string {
  const config = CURRENCIES[currency];
  const symbol = showSymbol ? `${config.symbol} ` : '';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  let compact: string;
  let suffix: string;

  if (absValue >= 1_000_000_000) {
    compact = (absValue / 1_000_000_000).toFixed(1);
    suffix = 'B';
  } else if (absValue >= 1_000_000) {
    compact = (absValue / 1_000_000).toFixed(1);
    suffix = 'M';
  } else if (absValue >= 1_000) {
    compact = (absValue / 1_000).toFixed(1);
    suffix = 'K';
  } else {
    return formatCurrency(value, currency, { showSymbol });
  }

  // Usar vírgula como separador decimal para BRL
  if (currency === 'BRL') {
    compact = compact.replace('.', ',');
  }

  return `${sign}${symbol}${compact}${suffix}`;
}

/**
 * Formatação manual (fallback)
 */
function formatCurrencyManual(
  value: number,
  currency: CurrencyCode,
  showSymbol: boolean
): string {
  const config = CURRENCIES[currency];
  const symbol = showSymbol ? `${config.symbol} ` : '';
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  // Separar inteiro e decimal
  const [integer, decimal = ''] = absValue.toFixed(config.decimalPlaces).split('.');

  // Adicionar separador de milhar
  let formattedInteger: string;
  if (currency === 'BRL' || currency === 'EUR') {
    // Formato europeu: ponto para milhar
    formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  } else {
    // Formato americano: vírgula para milhar
    formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // Adicionar decimal
  let formattedDecimal = '';
  if (config.decimalPlaces > 0) {
    const decimalSeparator = currency === 'BRL' || currency === 'EUR' ? ',' : '.';
    formattedDecimal = decimalSeparator + decimal.padEnd(config.decimalPlaces, '0');
  }

  return `${sign}${symbol}${formattedInteger}${formattedDecimal}`;
}

/**
 * Converte string formatada para número
 * 
 * @example
 * parseCurrency("R$ 1.234,56") // 1234.56
 * parseCurrency("US$ 1,234.56") // 1234.56
 */
export function parseCurrency(value: string, currency: CurrencyCode = 'BRL'): number {
  if (!value) return 0;

  // Remove símbolos e espaços
  let cleaned = value.replace(/[^\d,.-]/g, '');

  // Identifica separador decimal baseado na moeda
  if (currency === 'BRL' || currency === 'EUR') {
    // Formato europeu: vírgula é decimal, ponto é milhar
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // Formato americano: ponto é decimal, vírgula é milhar
    cleaned = cleaned.replace(/,/g, '');
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata percentual conforme ABNT
 * 
 * @example
 * formatPercentage(0.1234) // "12,34%"
 * formatPercentage(0.5) // "50,00%"
 */
export function formatPercentage(
  value: number,
  options: {
    decimals?: number;
    showSign?: boolean;
  } = {}
): string {
  const { decimals = 2, showSign = false } = options;

  if (typeof value !== 'number' || isNaN(value)) {
    return '0,00%';
  }

  const percentage = value * 100;
  const sign = showSign && percentage > 0 ? '+' : '';
  const formatted = percentage.toFixed(decimals).replace('.', ',');

  return `${sign}${formatted}%`;
}

/**
 * Formata número conforme ABNT (sem símbolo de moeda)
 * 
 * @example
 * formatNumber(1234.56) // "1.234,56"
 * formatNumber(1234.56, 0) // "1.235"
 */
export function formatNumber(value: number, decimals: number = 2): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Obtém símbolo da moeda
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCIES[currency]?.symbol || currency;
}

/**
 * Obtém nome da moeda
 */
export function getCurrencyName(currency: CurrencyCode): string {
  return CURRENCIES[currency]?.name || currency;
}

/**
 * Lista todas as moedas disponíveis
 */
export function getAvailableCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCIES);
}

/**
 * Valida código de moeda
 */
export function isValidCurrency(code: string): code is CurrencyCode {
  return code in CURRENCIES;
}
