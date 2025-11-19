/**
 * Currency Formatter Tests
 * v3.11.0 - Validação de formatação ABNT e internacional
 */

import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseCurrency,
  formatPercentage,
  formatNumber,
  getCurrencySymbol,
  getCurrencyName,
  isValidCurrency,
  type CurrencyCode,
} from '../utils/currency';

describe('Currency Formatter', () => {
  describe('formatCurrency - BRL (ABNT)', () => {
    it('deve formatar valor positivo conforme ABNT', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
    });

    it('deve formatar valor negativo', () => {
      expect(formatCurrency(-1234.56)).toContain('-');
    });

    it('deve formatar zero', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00');
    });

    it('deve formatar valores grandes com separador de milhar', () => {
      expect(formatCurrency(1234567.89)).toBe('R$ 1.234.567,89');
    });

    it('deve formatar valores pequenos', () => {
      expect(formatCurrency(0.99)).toBe('R$ 0,99');
    });

    it('deve formatar sem símbolo quando solicitado', () => {
      const result = formatCurrency(1234.56, 'BRL', { showSymbol: false });
      expect(result).not.toContain('R$');
    });

    it('deve formatar em modo compacto', () => {
      expect(formatCurrency(1500, 'BRL', { compact: true })).toBe('R$ 1,5K');
      expect(formatCurrency(1500000, 'BRL', { compact: true })).toBe('R$ 1,5M');
      expect(formatCurrency(1500000000, 'BRL', { compact: true })).toBe('R$ 1,5B');
    });
  });

  describe('formatCurrency - USD', () => {
    it('deve formatar dólar americano corretamente', () => {
      const result = formatCurrency(1234.56, 'USD');
      expect(result).toContain('1,234.56');
    });

    it('deve usar vírgula para separador de milhar', () => {
      const result = formatCurrency(1234567.89, 'USD');
      expect(result).toContain(',');
    });

    it('deve usar ponto para decimal', () => {
      const result = formatCurrency(1234.56, 'USD');
      expect(result).toContain('.56');
    });
  });

  describe('formatCurrency - EUR', () => {
    it('deve formatar euro corretamente', () => {
      const result = formatCurrency(1234.56, 'EUR');
      expect(result).toContain('€');
    });

    it('deve usar formato europeu (ponto milhar, vírgula decimal)', () => {
      const result = formatCurrency(1234.56, 'EUR');
      expect(result).toContain('1.234,56');
    });
  });

  describe('formatCurrency - GBP', () => {
    it('deve formatar libra esterlina corretamente', () => {
      const result = formatCurrency(1234.56, 'GBP');
      expect(result).toContain('£');
    });
  });

  describe('formatCurrency - JPY', () => {
    it('deve formatar iene sem casas decimais', () => {
      const result = formatCurrency(1234, 'JPY');
      expect(result).toContain('1,234');
      expect(result).not.toContain('.00');
    });
  });

  describe('parseCurrency', () => {
    it('deve converter BRL formatado para número', () => {
      expect(parseCurrency('R$ 1.234,56', 'BRL')).toBe(1234.56);
    });

    it('deve converter USD formatado para número', () => {
      expect(parseCurrency('US$ 1,234.56', 'USD')).toBe(1234.56);
    });

    it('deve lidar com valores negativos', () => {
      expect(parseCurrency('-R$ 1.234,56', 'BRL')).toBe(-1234.56);
    });

    it('deve retornar 0 para strings vazias', () => {
      expect(parseCurrency('', 'BRL')).toBe(0);
    });

    it('deve remover caracteres não numéricos', () => {
      expect(parseCurrency('R$ 1.234,56 reais', 'BRL')).toBe(1234.56);
    });
  });

  describe('formatPercentage', () => {
    it('deve formatar percentual conforme ABNT', () => {
      expect(formatPercentage(0.1234)).toBe('12,34%');
    });

    it('deve formatar 50%', () => {
      expect(formatPercentage(0.5)).toBe('50,00%');
    });

    it('deve formatar com sinal positivo se solicitado', () => {
      expect(formatPercentage(0.1234, { showSign: true })).toBe('+12,34%');
    });

    it('deve respeitar número de decimais', () => {
      expect(formatPercentage(0.12345, { decimals: 3 })).toBe('12,345%');
    });

    it('deve formatar negativos', () => {
      expect(formatPercentage(-0.1234)).toBe('-12,34%');
    });
  });

  describe('formatNumber', () => {
    it('deve formatar número conforme ABNT', () => {
      expect(formatNumber(1234.56)).toBe('1.234,56');
    });

    it('deve respeitar casas decimais', () => {
      expect(formatNumber(1234.567, 3)).toBe('1.234,567');
    });

    it('deve formatar sem decimais', () => {
      expect(formatNumber(1234.56, 0)).toBe('1.235');
    });
  });

  describe('Helper functions', () => {
    it('deve retornar símbolo correto', () => {
      expect(getCurrencySymbol('BRL')).toBe('R$');
      expect(getCurrencySymbol('USD')).toBe('US$');
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('deve retornar nome correto', () => {
      expect(getCurrencyName('BRL')).toBe('Real Brasileiro');
      expect(getCurrencyName('USD')).toBe('Dólar Americano');
    });

    it('deve validar código de moeda', () => {
      expect(isValidCurrency('BRL')).toBe(true);
      expect(isValidCurrency('USD')).toBe(true);
      expect(isValidCurrency('INVALID')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('deve lidar com NaN', () => {
      expect(formatCurrency(NaN)).toBe('R$ 0,00');
    });

    it('deve lidar com Infinity', () => {
      const result = formatCurrency(Infinity);
      expect(result).toBeDefined();
    });

    it('deve lidar com valores muito grandes', () => {
      const result = formatCurrency(999999999999.99);
      expect(result).toBeDefined();
      expect(result).toContain('999.999.999.999,99');
    });

    it('deve lidar com valores muito pequenos', () => {
      expect(formatCurrency(0.01)).toBe('R$ 0,01');
    });
  });
});
