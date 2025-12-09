/**
 * CPF Validation Service
 * Gerencia validação, verificação e auditoria de CPF no backend
 * 
 * @version 1.0.0
 * @author DEV - Rickson
 */

import { supabase } from '../config/supabase.config';
import { validateCPF, cleanCPF, anonymizeCPF } from '../utils/cpf';
import { Logger } from './logger.service';

// ============================================================================
// INTERFACES
// ============================================================================

export interface CPFVerificationRequest {
  userId: string;
  cpf: string;
  fullName: string;
  birthDate?: Date;
  phone?: string;
}

export interface CPFVerificationResult {
  success: boolean;
  status: 'verified' | 'rejected' | 'pending' | 'manual_review';
  message: string;
  cpfAnonymized?: string;
  error?: string;
}

export interface CPFCheckResult {
  available: boolean;
  message: string;
}

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================

class CPFValidationService {
  private readonly logger = Logger;

  // ==========================================================================
  // VALIDAÇÃO DE CPF
  // ==========================================================================

  /**
   * Valida formato do CPF (algoritmo de dígitos verificadores)
   */
  async validateFormat(cpf: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const result = validateCPF(cpf);
      
      if (!result.valid) {
        this.logger.warn('CPF_VALIDATION', `CPF format invalid (${anonymizeCPF(cpf)}): ${result.error}`);
      }
      
      return {
        valid: result.valid,
        error: result.error
      };
    } catch (error) {
      this.logger.error('CPF_VALIDATION', error as Error);
      return {
        valid: false,
        error: 'Erro ao validar formato do CPF'
      };
    }
  }

  /**
   * Verifica se CPF já está cadastrado no sistema
   */
  async checkDuplicate(cpf: string, excludeUserId?: string): Promise<CPFCheckResult> {
    try {
      const cleanedCPF = cleanCPF(cpf);
      
      let query = supabase
        .from('user_profiles')
        .select('id, cpf_verification_status')
        .eq('cpf', cleanedCPF);
      
      // Excluir próprio usuário (para updates)
      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }
      
      const { data, error } = await query.single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found (OK)
        throw error;
      }
      
      if (data) {
        this.logger.warn('CPF_VALIDATION', `CPF already registered (${anonymizeCPF(cpf)}) with status: ${data.cpf_verification_status}`);
        
        return {
          available: false,
          message: 'CPF já cadastrado no sistema'
        };
      }
      
      return {
        available: true,
        message: 'CPF disponível'
      };
    } catch (error) {
      this.logger.error('CPF_VALIDATION', error as Error);
      throw new Error('Erro ao verificar duplicidade de CPF');
    }
  }

  // ==========================================================================
  // VERIFICAÇÃO DE CPF (Registro/Update)
  // ==========================================================================

  /**
   * Verifica e registra CPF do usuário
   */
  async verifyCPF(request: CPFVerificationRequest): Promise<CPFVerificationResult> {
    try {
      const { userId, cpf, fullName, birthDate, phone } = request;
      const cleanedCPF = cleanCPF(cpf);
      
      this.logger.info('CPF_VALIDATION', `Starting CPF verification for user ${userId} (${anonymizeCPF(cpf)})`);

      // 1. Validar formato
      const formatValidation = await this.validateFormat(cleanedCPF);
      if (!formatValidation.valid) {
        await this.logVerificationAttempt(userId, cleanedCPF, 'rejected', formatValidation.error);
        
        return {
          success: false,
          status: 'rejected',
          message: formatValidation.error || 'CPF inválido',
          error: formatValidation.error
        };
      }

      // 2. Verificar duplicidade
      const duplicateCheck = await this.checkDuplicate(cleanedCPF, userId);
      if (!duplicateCheck.available) {
        await this.logVerificationAttempt(userId, cleanedCPF, 'rejected', 'CPF já cadastrado');
        
        return {
          success: false,
          status: 'rejected',
          message: 'CPF já cadastrado no sistema',
          error: 'duplicate_cpf'
        };
      }

      // 3. Salvar/Atualizar perfil do usuário
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          cpf: cleanedCPF,
          full_name: fullName,
          birth_date: birthDate,
          phone: phone,
          cpf_verification_status: 'verified', // Auto-verificado (pode adicionar verificação externa depois)
          cpf_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (upsertError) {
        throw upsertError;
      }

      // 4. Log de sucesso
      await this.logVerificationAttempt(userId, cleanedCPF, 'verified', 'Verificação bem-sucedida');

      this.logger.info('CPF_VALIDATION', `CPF verified successfully for user ${userId} (${anonymizeCPF(cleanedCPF)})`);

      return {
        success: true,
        status: 'verified',
        message: 'CPF verificado com sucesso',
        cpfAnonymized: anonymizeCPF(cleanedCPF)
      };
    } catch (error) {
      this.logger.error('CPF_VALIDATION', error as Error);
      
      return {
        success: false,
        status: 'rejected',
        message: 'Erro ao verificar CPF',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Atualiza CPF de usuário existente (requer re-verificação)
   */
  async updateCPF(userId: string, newCPF: string): Promise<CPFVerificationResult> {
    try {
      const cleanedCPF = cleanCPF(newCPF);
      
      this.logger.info('CPF_VALIDATION', `Updating CPF for user ${userId} (${anonymizeCPF(cleanedCPF)})`);

      // Buscar perfil atual
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, birth_date, phone')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('Perfil do usuário não encontrado');
      }

      // Re-verificar CPF
      return await this.verifyCPF({
        userId,
        cpf: cleanedCPF,
        fullName: profile.full_name,
        birthDate: profile.birth_date ? new Date(profile.birth_date) : undefined,
        phone: profile.phone || undefined
      });
    } catch (error) {
      this.logger.error('CPF_VALIDATION', error as Error);
      throw error;
    }
  }

  // ==========================================================================
  // AUDITORIA
  // ==========================================================================

  /**
   * Registra tentativa de verificação de CPF (auditoria)
   */
  private async logVerificationAttempt(
    userId: string,
    cpf: string,
    status: 'verified' | 'rejected' | 'pending' | 'manual_review',
    reason?: string
  ): Promise<void> {
    try {
      await supabase
        .from('cpf_verification_logs')
        .insert({
          user_id: userId,
          cpf: cpf,
          status: status,
          reason: reason || null,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      // Log de auditoria não deve bloquear operação principal
      this.logger.error('CPF_VALIDATION', error as Error);
    }
  }

  /**
   * Busca histórico de verificações de CPF de um usuário
   */
  async getVerificationHistory(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('cpf_verification_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      // Anonimizar CPFs no retorno
      return (data || []).map(log => ({
        ...log,
        cpf: anonymizeCPF(log.cpf)
      }));
    } catch (error) {
      this.logger.error('CPF_VALIDATION', error as Error);
      return [];
    }
  }

  // ==========================================================================
  // VALIDAÇÃO DE PERMISSÕES
  // ==========================================================================

  /**
   * Verifica se usuário tem CPF verificado (requisito para certas ações)
   */
  async isVerified(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('cpf_verification_status')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      return data.cpf_verification_status === 'verified';
    } catch (error) {
      this.logger.error('CPF_VALIDATION', error as Error);
      return false;
    }
  }

  /**
   * Requer CPF verificado (middleware)
   */
  async requireVerifiedCPF(userId: string): Promise<void> {
    const verified = await this.isVerified(userId);
    
    if (!verified) {
      throw new Error('CPF não verificado. Complete seu cadastro para continuar.');
    }
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export default new CPFValidationService();
