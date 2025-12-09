/**
 * Two-Factor Authentication (2FA) Service
 * Sistema TOTP (Time-based One-Time Password) compatível com Google Authenticator
 * 
 * @version 1.0.0
 * @security HIGH - Gerencia segurança crítica de contas
 */

import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import Storage from './storage.service';
import Logger from './logger.service';

interface TwoFAConfig {
  enabled: boolean;
  secret: string;
  backupCodes: string[];
  createdAt: string;
  lastUsed?: string;
}

interface TwoFASetupData {
  secret: string;
  qrCodeDataUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
}

class TwoFAService {
  private readonly STORAGE_KEY = 'twofa_config';
  private readonly BACKUP_CODES_COUNT = 8;
  private readonly ISSUER = 'My-Financify';

  /**
   * Verificar se 2FA está habilitado para o usuário
   */
  async isEnabled(): Promise<boolean> {
    try {
      const config = await this.getConfig();
      return config?.enabled || false;
    } catch (error) {
      Logger.error('Erro ao verificar status 2FA', error as Error, '2FA');
      return false;
    }
  }

  /**
   * Gerar novo setup de 2FA (QR Code + Backup Codes)
   */
  async generateSetup(userEmail: string): Promise<TwoFASetupData> {
    try {
      Logger.info('🔐 Gerando setup 2FA', { email: userEmail }, '2FA');

      // 1. Gerar secret aleatório (Base32)
      const secret = this.generateSecret();

      // 2. Criar URI TOTP compatível com Google Authenticator
      const totp = new OTPAuth.TOTP({
        issuer: this.ISSUER,
        label: userEmail,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      const otpauthUrl = totp.toString();

      // 3. Gerar QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // 4. Gerar backup codes
      const backupCodes = this.generateBackupCodes();

      Logger.info('✅ Setup 2FA gerado com sucesso', undefined, '2FA');

      return {
        secret,
        qrCodeDataUrl,
        manualEntryKey: this.formatSecretForDisplay(secret),
        backupCodes,
      };
    } catch (error) {
      Logger.error('Falha ao gerar setup 2FA', error as Error, '2FA');
      throw error;
    }
  }

  /**
   * Ativar 2FA após usuário escanear QR Code e validar código
   */
  async enable(secret: string, verificationCode: string, backupCodes: string[]): Promise<boolean> {
    try {
      Logger.info('🔐 Ativando 2FA', undefined, '2FA');

      // 1. Validar código de verificação
      const isValid = this.verifyToken(secret, verificationCode);
      if (!isValid) {
        Logger.warn('⚠️ Código de verificação inválido ao ativar 2FA', undefined, '2FA');
        return false;
      }

      // 2. Salvar configuração
      const config: TwoFAConfig = {
        enabled: true,
        secret,
        backupCodes,
        createdAt: new Date().toISOString(),
      };

      await Storage.save(this.STORAGE_KEY, config);

      Logger.info('✅ 2FA ativado com sucesso', undefined, '2FA');
      return true;
    } catch (error) {
      Logger.error('Falha ao ativar 2FA', error as Error, '2FA');
      throw error;
    }
  }

  /**
   * Desativar 2FA (requer código válido)
   */
  async disable(verificationCode: string): Promise<boolean> {
    try {
      Logger.info('🔓 Desativando 2FA', undefined, '2FA');

      const config = await this.getConfig();
      if (!config) {
        return false;
      }

      // Validar código antes de desativar
      const isValid = this.verifyToken(config.secret, verificationCode);
      if (!isValid) {
        Logger.warn('⚠️ Código inválido ao tentar desativar 2FA', undefined, '2FA');
        return false;
      }

      // Remover configuração
      await Storage.remove(this.STORAGE_KEY);

      Logger.info('✅ 2FA desativado com sucesso', undefined, '2FA');
      return true;
    } catch (error) {
      Logger.error('Falha ao desativar 2FA', error as Error, '2FA');
      throw error;
    }
  }

  /**
   * Verificar código TOTP (usado no login)
   */
  async verify(code: string): Promise<boolean> {
    try {
      const config = await this.getConfig();
      if (!config || !config.enabled) {
        return true; // Se 2FA não está ativo, permite login
      }

      // Verificar se é código TOTP ou backup code
      if (code.length === 6) {
        const isValid = this.verifyToken(config.secret, code);
        
        if (isValid) {
          // Atualizar último uso
          config.lastUsed = new Date().toISOString();
          await Storage.save(this.STORAGE_KEY, config);
        }

        return isValid;
      } else if (code.length === 10) {
        // Verificar backup code
        return await this.verifyBackupCode(code);
      }

      return false;
    } catch (error) {
      Logger.error('Erro ao verificar código 2FA', error as Error, '2FA');
      return false;
    }
  }

  /**
   * Obter códigos de backup restantes (para exibir ao usuário)
   */
  async getBackupCodes(): Promise<string[]> {
    try {
      const config = await this.getConfig();
      return config?.backupCodes || [];
    } catch (error) {
      Logger.error('Erro ao obter backup codes', error as Error, '2FA');
      return [];
    }
  }

  /**
   * Regenerar códigos de backup (invalida antigos)
   */
  async regenerateBackupCodes(verificationCode: string): Promise<string[] | null> {
    try {
      const config = await this.getConfig();
      if (!config || !config.enabled) {
        return null;
      }

      // Validar código antes de regenerar
      const isValid = this.verifyToken(config.secret, verificationCode);
      if (!isValid) {
        Logger.warn('⚠️ Código inválido ao tentar regenerar backup codes', undefined, '2FA');
        return null;
      }

      // Gerar novos códigos
      const newBackupCodes = this.generateBackupCodes();
      config.backupCodes = newBackupCodes;

      await Storage.save(this.STORAGE_KEY, config);

      Logger.info('✅ Backup codes regenerados', undefined, '2FA');
      return newBackupCodes;
    } catch (error) {
      Logger.error('Erro ao regenerar backup codes', error as Error, '2FA');
      return null;
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Obter configuração 2FA do storage
   */
  private async getConfig(): Promise<TwoFAConfig | null> {
    try {
      return await Storage.load<TwoFAConfig>(this.STORAGE_KEY);
    } catch (error) {
      Logger.error('Erro ao carregar config 2FA', error as Error, '2FA');
      return null;
    }
  }

  /**
   * Gerar secret aleatório (Base32)
   */
  private generateSecret(): string {
    const secret = new OTPAuth.Secret({ size: 20 });
    return secret.base32;
  }

  /**
   * Validar token TOTP
   */
  private verifyToken(secret: string, token: string): boolean {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: this.ISSUER,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret),
      });

      // Validar token (com janela de ±1 período = 60s de tolerância)
      const delta = totp.validate({ token, window: 1 });
      return delta !== null;
    } catch (error) {
      Logger.error('Erro ao validar token TOTP', error as Error, '2FA');
      return false;
    }
  }

  /**
   * Gerar códigos de backup (10 dígitos cada)
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      // Gerar 10 dígitos aleatórios
      const code = Math.random().toString().slice(2, 12);
      codes.push(code);
    }
    return codes;
  }

  /**
   * Verificar backup code (one-time use)
   */
  private async verifyBackupCode(code: string): Promise<boolean> {
    try {
      const config = await this.getConfig();
      if (!config || !config.enabled) {
        return false;
      }

      const index = config.backupCodes.indexOf(code);
      if (index === -1) {
        return false;
      }

      // Remover código usado (one-time)
      config.backupCodes.splice(index, 1);
      await Storage.save(this.STORAGE_KEY, config);

      Logger.info('✅ Backup code usado', { codesRestantes: config.backupCodes.length }, '2FA');

      // Alertar se poucos códigos restantes
      if (config.backupCodes.length <= 2) {
        Logger.warn('⚠️ Poucos backup codes restantes!', { count: config.backupCodes.length }, '2FA');
      }

      return true;
    } catch (error) {
      Logger.error('Erro ao verificar backup code', error as Error, '2FA');
      return false;
    }
  }

  /**
   * Formatar secret para entrada manual (grupos de 4)
   */
  private formatSecretForDisplay(secret: string): string {
    return secret.match(/.{1,4}/g)?.join(' ') || secret;
  }
}

// Singleton
export default new TwoFAService();
