/**
 * @file validation.test.ts
 * @description Testes para sistema de validação com Zod
 * @version 2.4.0
 * @author DEV - Rickson (TQM)
 */

import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  cpfSchema,
  phoneSchema,
  currencySchema,
  dateSchema,
  accountSchema,
  transactionSchema,
  budgetSchema,
  goalSchema,
  userSchema,
  safeValidate,
} from '../utils/validation';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('deve validar email válido', () => {
      const result = safeValidate(emailSchema, 'teste@example.com');
      expect(result.success).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      const result = safeValidate(emailSchema, 'invalid-email');
      expect(result.success).toBe(false);
    });

    it('deve rejeitar email muito curto', () => {
      const result = safeValidate(emailSchema, 'a@b');
      expect(result.success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('deve validar senha forte', () => {
      const result = safeValidate(passwordSchema, 'Senha@123');
      expect(result.success).toBe(true);
    });

    it('deve rejeitar senha sem maiúscula', () => {
      const result = safeValidate(passwordSchema, 'senha@123');
      expect(result.success).toBe(false);
    });

    it('deve rejeitar senha sem minúscula', () => {
      const result = safeValidate(passwordSchema, 'SENHA@123');
      expect(result.success).toBe(false);
    });

    it('deve rejeitar senha sem número', () => {
      const result = safeValidate(passwordSchema, 'Senha@abc');
      expect(result.success).toBe(false);
    });

    it('deve rejeitar senha sem caractere especial', () => {
      const result = safeValidate(passwordSchema, 'Senha1234');
      expect(result.success).toBe(false);
    });

    it('deve rejeitar senha muito curta', () => {
      const result = safeValidate(passwordSchema, 'Se@1');
      expect(result.success).toBe(false);
    });
  });

  describe('cpfSchema', () => {
    it('deve validar CPF válido com formatação', () => {
      const result = safeValidate(cpfSchema, '123.456.789-09');
      expect(result.success).toBe(true);
    });

    it('deve validar CPF válido sem formatação', () => {
      const result = safeValidate(cpfSchema, '12345678909');
      expect(result.success).toBe(true);
    });

    it('deve rejeitar CPF com todos os dígitos iguais', () => {
      const result = safeValidate(cpfSchema, '111.111.111-11');
      expect(result.success).toBe(false);
    });

    it('deve rejeitar CPF com dígitos verificadores incorretos', () => {
      const result = safeValidate(cpfSchema, '123.456.789-00');
      expect(result.success).toBe(false);
    });
  });

  describe('phoneSchema', () => {
    it('deve validar telefone com formatação', () => {
      const result = safeValidate(phoneSchema, '(11) 98765-4321');
      expect(result.success).toBe(true);
    });

    it('deve validar telefone sem formatação', () => {
      const result = safeValidate(phoneSchema, '11987654321');
      expect(result.success).toBe(true);
    });

    it('deve rejeitar telefone inválido', () => {
      const result = safeValidate(phoneSchema, '123');
      expect(result.success).toBe(false);
    });
  });

  describe('currencySchema', () => {
    it('deve validar valor positivo', () => {
      const result = safeValidate(currencySchema, 100.5);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar valor negativo', () => {
      const result = safeValidate(currencySchema, -100);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar valor zero', () => {
      const result = safeValidate(currencySchema, 0);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar valor infinito', () => {
      const result = safeValidate(currencySchema, Infinity);
      expect(result.success).toBe(false);
    });
  });

  describe('dateSchema', () => {
    it('deve validar data válida', () => {
      const result = safeValidate(dateSchema, new Date('2024-01-15'));
      expect(result.success).toBe(true);
    });

    it('deve rejeitar data muito antiga', () => {
      const result = safeValidate(dateSchema, new Date('1800-01-01'));
      expect(result.success).toBe(false);
    });

    it('deve rejeitar data muito distante', () => {
      const result = safeValidate(dateSchema, new Date('2200-01-01'));
      expect(result.success).toBe(false);
    });
  });

  describe('accountSchema', () => {
    it('deve validar conta válida', () => {
      const account = {
        name: 'Conta Corrente',
        type: 'checking' as const,
        balance: 1000.5,
        bank: 'Banco do Brasil',
        accountNumber: '12345678',
        agency: '1234',
      };

      const result = safeValidate(accountSchema, account);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar conta com tipo inválido', () => {
      const account = {
        name: 'Conta Corrente',
        type: 'invalid',
        balance: 1000.5,
        bank: 'Banco do Brasil',
        accountNumber: '12345678',
        agency: '1234',
      };

      const result = safeValidate(accountSchema, account);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar conta com saldo negativo', () => {
      const account = {
        name: 'Conta Corrente',
        type: 'checking' as const,
        balance: -100,
        bank: 'Banco do Brasil',
        accountNumber: '12345678',
        agency: '1234',
      };

      const result = safeValidate(accountSchema, account);
      expect(result.success).toBe(false);
    });
  });

  describe('transactionSchema', () => {
    it('deve validar transação válida', () => {
      const transaction = {
        description: 'Compra no supermercado',
        amount: 150.75,
        type: 'expense' as const,
        category: 'Alimentação',
        date: new Date('2024-01-15'),
        accountId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = safeValidate(transactionSchema, transaction);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar transação com tipo inválido', () => {
      const transaction = {
        description: 'Compra no supermercado',
        amount: 150.75,
        type: 'invalid',
        category: 'Alimentação',
        date: new Date('2024-01-15'),
        accountId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = safeValidate(transactionSchema, transaction);
      expect(result.success).toBe(false);
    });
  });

  describe('budgetSchema', () => {
    it('deve validar orçamento válido', () => {
      const budget = {
        category: 'Alimentação',
        limit: 1000,
        period: 'monthly' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      const result = safeValidate(budgetSchema, budget);
      expect(result.success).toBe(true);
    });
  });

  describe('goalSchema', () => {
    it('deve validar meta válida', () => {
      const goal = {
        name: 'Viagem para Europa',
        targetAmount: 10000,
        currentAmount: 2000,
        deadline: new Date('2025-12-31'),
        priority: 'high' as const,
      };

      const result = safeValidate(goalSchema, goal);
      expect(result.success).toBe(true);
    });
  });

  describe('userSchema', () => {
    it('deve validar usuário válido', () => {
      const user = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'Senha@123',
        cpf: '123.456.789-09',
        phone: '(11) 98765-4321',
      };

      const result = safeValidate(userSchema, user);
      expect(result.success).toBe(true);
    });

    it('deve validar usuário sem campos opcionais', () => {
      const user = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'Senha@123',
      };

      const result = safeValidate(userSchema, user);
      expect(result.success).toBe(true);
    });
  });
});
