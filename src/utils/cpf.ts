/**
 * CPF Validator Utility
 * Validação completa de CPF brasileiro com verificação de dígitos e blacklist
 * 
 * @version 1.0.0
 * @author DEV - Rickson
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface CPFValidationResult {
  valid: boolean;
  formatted?: string;  // CPF formatado (123.456.789-10)
  clean?: string;      // CPF limpo (12345678910)
  error?: string;      // Mensagem de erro
}

// ============================================================================
// CONSTANTES
// ============================================================================

// CPFs conhecidos como inválidos (sequências, testes)
const BLACKLISTED_CPFS = [
  '00000000000',
  '11111111111',
  '22222222222',
  '33333333333',
  '44444444444',
  '55555555555',
  '66666666666',
  '77777777777',
  '88888888888',
  '99999999999',
  '12345678909', // CPF de teste comum
  '00000000191'  // CPF de teste
];

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Remove caracteres não numéricos do CPF
 */
export const cleanCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};

/**
 * Formata CPF no padrão XXX.XXX.XXX-XX
 */
export const formatCPF = (cpf: string): string => {
  const clean = cleanCPF(cpf);
  
  if (clean.length !== 11) {
    return cpf; // Retorna original se inválido
  }
  
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Valida formato básico do CPF (11 dígitos numéricos)
 */
const isValidFormat = (cpf: string): boolean => {
  const clean = cleanCPF(cpf);
  return /^\d{11}$/.test(clean);
};

/**
 * Verifica se CPF está na blacklist
 */
const isBlacklisted = (cpf: string): boolean => {
  const clean = cleanCPF(cpf);
  return BLACKLISTED_CPFS.includes(clean);
};

/**
 * Calcula dígito verificador do CPF
 */
const calculateDigit = (cpf: string, factor: number): number => {
  let sum = 0;
  
  for (let i = 0; i < factor - 1; i++) {
    sum += parseInt(cpf.charAt(i)) * (factor - i);
  }
  
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

/**
 * Valida dígitos verificadores do CPF
 */
const validateCheckDigits = (cpf: string): boolean => {
  const clean = cleanCPF(cpf);
  
  // Primeiro dígito verificador
  const firstDigit = calculateDigit(clean, 10);
  if (firstDigit !== parseInt(clean.charAt(9))) {
    return false;
  }
  
  // Segundo dígito verificador
  const secondDigit = calculateDigit(clean, 11);
  if (secondDigit !== parseInt(clean.charAt(10))) {
    return false;
  }
  
  return true;
};

// ============================================================================
// FUNÇÃO PRINCIPAL DE VALIDAÇÃO
// ============================================================================

/**
 * Valida CPF completo (formato, blacklist, dígitos verificadores)
 * 
 * @param cpf - CPF a ser validado (aceita com ou sem máscara)
 * @returns Objeto com resultado da validação
 * 
 * @example
 * const result = validateCPF('123.456.789-10');
 * if (result.valid) {
 *   console.log('CPF válido:', result.formatted);
 * } else {
 *   console.error('Erro:', result.error);
 * }
 */
export const validateCPF = (cpf: string): CPFValidationResult => {
  // Validação de entrada
  if (!cpf || typeof cpf !== 'string') {
    return {
      valid: false,
      error: 'CPF não fornecido ou inválido'
    };
  }
  
  const clean = cleanCPF(cpf);
  
  // Validar formato (11 dígitos)
  if (!isValidFormat(cpf)) {
    return {
      valid: false,
      error: 'CPF deve conter 11 dígitos numéricos'
    };
  }
  
  // Verificar blacklist
  if (isBlacklisted(clean)) {
    return {
      valid: false,
      error: 'CPF inválido (sequência não permitida)'
    };
  }
  
  // Validar dígitos verificadores
  if (!validateCheckDigits(clean)) {
    return {
      valid: false,
      error: 'CPF inválido (dígitos verificadores incorretos)'
    };
  }
  
  // CPF válido!
  return {
    valid: true,
    formatted: formatCPF(clean),
    clean: clean
  };
};

// ============================================================================
// FUNÇÕES DE MÁSCARA (para inputs)
// ============================================================================

/**
 * Aplica máscara de CPF conforme digitação
 * Usar em onChange de input
 * 
 * @example
 * <input 
 *   value={cpf}
 *   onChange={(e) => setCPF(maskCPFInput(e.target.value))}
 *   maxLength={14}
 * />
 */
export const maskCPFInput = (value: string): string => {
  const clean = cleanCPF(value);
  
  // Aplicar máscara progressivamente
  if (clean.length <= 3) {
    return clean;
  } else if (clean.length <= 6) {
    return clean.replace(/(\d{3})(\d+)/, '$1.$2');
  } else if (clean.length <= 9) {
    return clean.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  } else {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  }
};

/**
 * Remove máscara do CPF para envio ao backend
 */
export const unmaskCPF = (cpf: string): string => {
  return cleanCPF(cpf);
};

// ============================================================================
// FUNÇÕES DE ANONIMIZAÇÃO (LGPD)
// ============================================================================

/**
 * Anonimiza CPF para exibição (mantém primeiros 3 e últimos 2 dígitos)
 * 
 * @example
 * anonymizeCPF('12345678910') // => '123.***.**-10'
 */
export const anonymizeCPF = (cpf: string): string => {
  const clean = cleanCPF(cpf);
  
  if (clean.length !== 11) {
    return '***.***.***-**';
  }
  
  const first3 = clean.substring(0, 3);
  const last2 = clean.substring(9, 11);
  
  return `${first3}.***.**-${last2}`;
};

/**
 * Valida se usuário tem mais de 18 anos (opcional - se tiver data nascimento)
 * Útil para validar CPF de responsáveis
 */
export const isAdult = (birthDate: Date): boolean => {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }
  
  return age >= 18;
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  validateCPF,
  formatCPF,
  cleanCPF,
  maskCPFInput,
  unmaskCPF,
  anonymizeCPF,
  isAdult
};
