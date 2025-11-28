/**
 * @file validation.ts
 * @description Sistema de validação avançada com Zod
 * @version 3.0.0 - Atualizado com nova estrutura hierárquica
 * @author DEV - Rickson (TQM)
 */

import { z } from 'zod';

/**
 * Schema para validação de email
 */
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email muito curto')
  .max(100, 'Email muito longo');

/**
 * Schema para validação de senha
 */
export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .max(100, 'Senha muito longa')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial');

/**
 * Schema para validação de CPF
 */
export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF inválido')
  .refine(validateCPF, 'CPF inválido');

/**
 * Schema para validação de telefone
 */
export const phoneSchema = z
  .string()
  .regex(
    /^\(\d{2}\)\s?\d{4,5}-?\d{4}$|^\d{10,11}$/,
    'Telefone inválido'
  );

/**
 * Schema para validação de valor monetário
 */
export const currencySchema = z
  .number()
  .positive('Valor deve ser positivo')
  .finite('Valor deve ser um número válido')
  .max(999999999.99, 'Valor muito alto');

/**
 * Schema para validação de data
 */
export const dateSchema = z
  .date()
  .min(new Date('1900-01-01'), 'Data muito antiga')
  .max(new Date('2100-12-31'), 'Data muito distante');

/**
 * Schema para validação de conta bancária
 */
export const accountSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo'),
  type: z.enum(['checking', 'savings', 'investment', 'credit'], {
    message: 'Tipo de conta inválido',
  }),
  balance: currencySchema,
  bank: z.string().min(2, 'Nome do banco deve ter no mínimo 2 caracteres'),
  accountNumber: z
    .string()
    .regex(/^\d{4,20}$/, 'Número de conta inválido'),
  agency: z.string().regex(/^\d{4}(-\d)?$/, 'Agência inválida'),
});

/**
 * Schema para validação de transação (v3.0 - com hierarquia)
 */
export const transactionSchema = z.object({
  description: z
    .string()
    .min(3, 'Descrição deve ter no mínimo 3 caracteres')
    .max(200, 'Descrição muito longa'),
  amount: currencySchema,
  type: z.enum(['income', 'expense'], {
    message: 'Tipo de transação inválido',
  }),
  
  // Hierarquia: Sessão → Categoria → Subcategoria
  section: z
    .string()
    .min(2, 'Sessão é obrigatória')
    .optional(),
  category: z
    .string()
    .min(2, 'Categoria deve ter no mínimo 2 caracteres')
    .max(50, 'Categoria muito longa'),
  subcategory: z
    .string()
    .max(50, 'Subcategoria muito longa')
    .optional(),
  
  // Tipo de despesa (apenas para expenses)
  expenseType: z.enum(['fixed', 'variable'], {
    message: 'Tipo de despesa inválido',
  }).optional(),
  
  date: z.union([z.string().min(1, 'Data é obrigatória'), z.date()]),
  accountId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  
  // Recorrência
  recurring: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly']),
    endDate: z.string().optional(),
  }).optional(),
  
  // Metadados
  metadata: z.object({
    method: z.enum(['cash', 'debit', 'credit', 'transfer', 'pix', 'other']).optional(),
    notes: z.string().max(500).optional(),
  }).optional(),
});

/**
 * Schema para validação de orçamento (v3.2 - Budget atualizado)
 */
export const budgetSchema = z.object({
  category: z
    .string()
    .min(2, 'Categoria deve ter no mínimo 2 caracteres')
    .max(50, 'Categoria muito longa'),
  description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional(),
  limitAmount: currencySchema.optional(),
  limit: currencySchema.optional(), // Alias para compatibilidade
  period: z.enum(['monthly', 'quarterly', 'yearly'], {
    message: 'Período inválido',
  }),
  startDate: z.union([z.string().min(1, 'Data de início é obrigatória'), z.date()]),
  endDate: z.union([z.string(), z.date()]).optional(),
  alertThreshold: z.number().min(50).max(100).default(80).optional(),
}).refine(data => data.limitAmount || data.limit, {
  message: 'Limite é obrigatório (limitAmount ou limit)',
});

/**
 * Schema para validação de transações recorrentes (v3.8)
 */
export const recurringTransactionSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome muito longo'),
  type: z.enum(['income', 'expense'], {
    message: 'Tipo inválido',
  }),
  amount: currencySchema,
  section: z.string().optional(),
  category: z
    .string()
    .min(2, 'Categoria é obrigatória'),
  subcategory: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'yearly'], {
    message: 'Frequência inválida',
  }),
  dayOfMonth: z.number().min(1).max(31).optional(),
  dayOfWeek: z.number().min(0).max(6).optional(),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().optional(),
  accountId: z.string().optional(),
  paymentMethod: z.enum(['cash', 'debit', 'credit', 'transfer', 'pix', 'other']).optional(),
  autoGenerate: z.boolean().default(true),
  notifyBefore: z.number().min(0).max(30).optional(),
  status: z.enum(['active', 'paused', 'completed', 'cancelled']).default('active'),
  isActive: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});

/**
 * Schema para validação de meta financeira (v3.0 - com lista de desejos)
 */
export const goalSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título muito longo')
    .optional(),
  name: z.string().min(3).max(100).optional(), // Alias para compatibilidade
  description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional(),
  type: z.enum(['savings', 'investment', 'emergency', 'wishlist', 'debt-payment'], {
    message: 'Tipo de meta inválido',
  }).optional(),
  targetAmount: currencySchema,
  currentAmount: currencySchema.optional(),
  deadline: z.union([dateSchema, z.date()]),
  section: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    message: 'Prioridade inválida',
  }),
  
  // Para lista de desejos
  isWishlist: z.boolean().optional(),
  imageUrl: z.string().url('URL inválida').optional(),
  link: z.string().url('URL inválida').optional(),
});

/**
 * Schema para validação de usuário
 */
export const userSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo'),
  email: emailSchema,
  password: passwordSchema,
  cpf: cpfSchema.optional(),
  phone: phoneSchema.optional(),
  birthDate: dateSchema.optional(),
  avatar: z.string().url('URL de avatar inválida').optional(),
});

/**
 * Função auxiliar para validar CPF
 */
function validateCPF(cpf: string): boolean {
  // Remove pontos e traços
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Helper para validação segura com try-catch
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues?.map((err) => err.message) || ['Erro de validação'];
      return { success: false, errors };
    }
    return { success: false, errors: ['Erro de validação desconhecido'] };
  }
}

/**
 * Helper para validação assíncrona
 */
export async function safeValidateAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const result = await schema.parseAsync(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues?.map((err) => err.message) || ['Erro de validação'];
      return { success: false, errors };
    }
    return { success: false, errors: ['Erro de validação desconhecido'] };
  }
}

/**
 * Helper para obter apenas os erros de um campo específico
 */
export function getFieldErrors(
  schema: z.ZodSchema,
  data: unknown,
  fieldPath: string
): string[] {
  try {
    schema.parse(data);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues
        ?.filter((err) => err.path.join('.') === fieldPath)
        .map((err) => err.message) || [];
    }
    return [];
  }
}

/**
 * Validation functions for convenience
 */
export const validateTransaction = (data: unknown) => transactionSchema.safeParse(data);
export const validateGoal = (data: unknown) => goalSchema.safeParse(data);
export const validateBudget = (data: unknown) => budgetSchema.safeParse(data);
export const validateRecurring = (data: unknown) => recurringTransactionSchema.safeParse(data);
export const validateAccount = (data: unknown) => accountSchema.safeParse(data);

/**
 * Export ValidationError type from Zod
 */
export type ValidationError = z.ZodIssue;

