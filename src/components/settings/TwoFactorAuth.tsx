/**
 * TwoFactorAuth Component - Configuração de 2FA
 * Interface para ativar/desativar autenticação de dois fatores
 * 
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import './TwoFactorAuth.css';
import TwoFAService from '../../services/twofa.service';
import { useToast } from '../common/Toast';
import Button from '../common/Button';
import Card from '../common/Card';

interface TwoFASetupData {
  secret: string;
  qrCodeDataUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
}

const TwoFactorAuth: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<TwoFASetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  
  const toast = useToast();

  useEffect(() => {
    checkTwoFAStatus();
    loadBackupCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _checkTwoFAStatus = async () => {
    try {
      const enabled = await TwoFAService.isEnabled();
      setIsEnabled(enabled);
    } catch (error) {
      toast.error('Erro ao verificar status do 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const _loadBackupCodes = async () => {
    try {
      const codes = await TwoFAService.getBackupCodes();
      setBackupCodes(codes);
    } catch (error) {
      console.error('Erro ao carregar backup codes:', error);
    }
  };

  const handleStartSetup = async () => {
    try {
      setIsLoading(true);
      const userEmail = 'user@example.com'; // TODO: Obter do AuthContext
      const data = await TwoFAService.generateSetup(userEmail);
      setSetupData(data);
      setShowSetup(true);
      toast.success('QR Code gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar QR Code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableTwoFA = async () => {
    if (!setupData || verificationCode.length !== 6) {
      toast.error('Digite o código de 6 dígitos do seu aplicativo');
      return;
    }

    try {
      setIsLoading(true);
      const success = await TwoFAService.enable(
        setupData.secret,
        verificationCode,
        setupData.backupCodes
      );

      if (success) {
        setIsEnabled(true);
        setShowSetup(false);
        setBackupCodes(setupData.backupCodes);
        setShowBackupCodes(true);
        toast.success('🔐 2FA ativado com sucesso!');
      } else {
        toast.error('Código inválido. Tente novamente.');
      }
    } catch (error) {
      toast.error('Erro ao ativar 2FA');
    } finally {
      setIsLoading(false);
      setVerificationCode('');
    }
  };

  const handleDisableTwoFA = async () => {
    if (disableCode.length !== 6) {
      toast.error('Digite o código de 6 dígitos do seu aplicativo');
      return;
    }

    if (!confirm('⚠️ Tem certeza que deseja desativar o 2FA? Sua conta ficará menos segura.')) {
      return;
    }

    try {
      setIsLoading(true);
      const success = await TwoFAService.disable(disableCode);

      if (success) {
        setIsEnabled(false);
        setBackupCodes([]);
        toast.success('2FA desativado');
      } else {
        toast.error('Código inválido');
      }
    } catch (error) {
      toast.error('Erro ao desativar 2FA');
    } finally {
      setIsLoading(false);
      setDisableCode('');
    }
  };

  const handleRegenerateBackupCodes = async () => {
    const code = prompt('Digite o código do seu aplicativo para regenerar backup codes:');
    if (!code || code.length !== 6) {
      return;
    }

    try {
      setIsLoading(true);
      const newCodes = await TwoFAService.regenerateBackupCodes(code);

      if (newCodes) {
        setBackupCodes(newCodes);
        setShowBackupCodes(true);
        toast.success('✅ Novos códigos de backup gerados!');
      } else {
        toast.error('Código inválido');
      }
    } catch (error) {
      toast.error('Erro ao regenerar códigos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    const content = `My-Financify - Códigos de Backup 2FA
Data: ${new Date().toLocaleString('pt-BR')}

⚠️ IMPORTANTE: Guarde estes códigos em local seguro!
Cada código pode ser usado apenas UMA vez para fazer login caso perca acesso ao aplicativo autenticador.

CÓDIGOS:
${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

📌 Após usar todos os códigos, você precisará desativar e reativar o 2FA.
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-financify-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Códigos baixados com sucesso!');
  };

  const handleCopyBackupCodes = () => {
    const text = backupCodes.join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Códigos copiados para área de transferência!');
  };

  if (isLoading && !showSetup) {
    return (
      <Card>
        <div className="twofa-loading">
          <div className="spinner" />
          <p>Carregando configurações de segurança...</p>
        </div>
      </Card>
    );
  }

  // ==================== TELA DE SETUP ====================
  if (showSetup && setupData) {
    return (
      <Card className="twofa-setup">
        <h2>🔐 Configurar Autenticação de Dois Fatores</h2>
        
        <div className="setup-steps">
          <div className="setup-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Instale um aplicativo autenticador</h3>
              <p>Recomendamos:</p>
              <ul>
                <li>🟢 <strong>Google Authenticator</strong> (Android/iOS)</li>
                <li>🔵 <strong>Microsoft Authenticator</strong> (Android/iOS)</li>
                <li>🟣 <strong>Authy</strong> (Android/iOS/Desktop)</li>
              </ul>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Escaneie o QR Code</h3>
              <div className="qr-code-container">
                <img src={setupData.qrCodeDataUrl} alt="QR Code 2FA" className="qr-code" />
              </div>
              
              <details className="manual-entry">
                <summary>Não consegue escanear? Digite manualmente</summary>
                <div className="manual-key">
                  <code>{setupData.manualEntryKey}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(setupData.secret);
                      toast.success('Chave copiada!');
                    }}
                    className="copy-button"
                    title="Copiar chave"
                  >
                    📋
                  </button>
                </div>
              </details>
            </div>
          </div>

          <div className="setup-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Digite o código de verificação</h3>
              <p>Insira o código de 6 dígitos exibido no seu aplicativo:</p>
              <input
                type="text"
                className="verification-input"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="setup-actions">
          <Button
            onClick={() => {
              setShowSetup(false);
              setSetupData(null);
              setVerificationCode('');
            }}
            variant="secondary"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEnableTwoFA}
            variant="primary"
            disabled={isLoading || verificationCode.length !== 6}
          >
            {isLoading ? 'Ativando...' : 'Ativar 2FA'}
          </Button>
        </div>
      </Card>
    );
  }

  // ==================== TELA DE BACKUP CODES ====================
  if (showBackupCodes && backupCodes.length > 0) {
    return (
      <Card className="backup-codes-display">
        <h2>🔑 Códigos de Backup</h2>
        
        <div className="warning-box">
          <strong>⚠️ IMPORTANTE:</strong>
          <ul>
            <li>Guarde estes códigos em local seguro (cofre de senhas, papel guardado, etc.)</li>
            <li>Cada código pode ser usado <strong>apenas UMA vez</strong></li>
            <li>Use-os caso perca acesso ao aplicativo autenticador</li>
            <li>Não compartilhe com ninguém</li>
          </ul>
        </div>

        <div className="backup-codes-grid">
          {backupCodes.map((code, index) => (
            <div key={index} className="backup-code-item">
              <span className="code-number">{index + 1}.</span>
              <code className="backup-code">{code}</code>
            </div>
          ))}
        </div>

        <div className="backup-actions">
          <Button onClick={handleCopyBackupCodes} variant="secondary">
            📋 Copiar Todos
          </Button>
          <Button onClick={handleDownloadBackupCodes} variant="secondary">
            💾 Baixar .txt
          </Button>
          <Button onClick={() => setShowBackupCodes(false)} variant="primary">
            Entendi, continuar
          </Button>
        </div>
      </Card>
    );
  }

  // ==================== TELA PRINCIPAL ====================
  return (
    <Card className="twofa-main">
      <div className="twofa-header">
        <div>
          <h2>🔐 Autenticação de Dois Fatores (2FA)</h2>
          <p>Adicione uma camada extra de segurança à sua conta</p>
        </div>
        <div className={`status-badge ${isEnabled ? 'enabled' : 'disabled'}`}>
          {isEnabled ? '✅ Ativo' : '⚠️ Inativo'}
        </div>
      </div>

      <div className="twofa-content">
        {isEnabled ? (
          <>
            <div className="info-box success">
              <strong>✅ 2FA Ativado</strong>
              <p>Sua conta está protegida com autenticação de dois fatores.</p>
            </div>

            <div className="twofa-info-grid">
              <div className="info-item">
                <strong>Códigos de backup restantes:</strong>
                <span className={backupCodes.length <= 2 ? 'warning' : ''}>
                  {backupCodes.length} de 8
                </span>
              </div>

              {backupCodes.length <= 2 && (
                <div className="info-item warning">
                  <strong>⚠️ Atenção:</strong>
                  <span>Poucos códigos restantes! Regenere novos.</span>
                </div>
              )}
            </div>

            <div className="twofa-actions">
              <Button onClick={() => setShowBackupCodes(true)} variant="secondary">
                🔑 Ver Códigos de Backup
              </Button>
              <Button onClick={handleRegenerateBackupCodes} variant="secondary">
                🔄 Regenerar Códigos
              </Button>
            </div>

            <div className="disable-section">
              <h3>Desativar 2FA</h3>
              <p>Digite o código do seu aplicativo para desativar:</p>
              <div className="disable-form">
                <input
                  type="text"
                  className="verification-input"
                  placeholder="000000"
                  maxLength={6}
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                />
                <Button
                  onClick={handleDisableTwoFA}
                  variant="danger"
                  disabled={isLoading || disableCode.length !== 6}
                >
                  Desativar
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="info-box warning">
              <strong>⚠️ 2FA Desativado</strong>
              <p>Recomendamos ativar o 2FA para proteger sua conta financeira.</p>
            </div>

            <div className="benefits-list">
              <h3>Por que ativar o 2FA?</h3>
              <ul>
                <li>🛡️ <strong>Segurança Extra:</strong> Mesmo que alguém descubra sua senha, não conseguirá acessar sem o código</li>
                <li>📱 <strong>Fácil de Usar:</strong> Basta abrir o aplicativo e copiar o código</li>
                <li>🔒 <strong>Padrão da Indústria:</strong> Usado por bancos e serviços financeiros</li>
                <li>💾 <strong>Códigos de Backup:</strong> Acesso garantido mesmo sem o celular</li>
              </ul>
            </div>

            <Button onClick={handleStartSetup} variant="primary" size="lg">
              🔐 Ativar Autenticação de Dois Fatores
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default TwoFactorAuth;
