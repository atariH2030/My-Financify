import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { useToast } from '../common/Toast';
import SettingsService, { type AppSettings } from '../../services/settings.service';
import AIService from '../../services/ai.service';
import SettingsBackupService from '../../services/settings-backup.service';
import PushNotificationSettings from './PushNotificationSettings';
import type { AIProviderConfig } from '../../types/ai.types';
import './Settings.css';

type Tab = 'profile' | 'notifications' | 'preferences' | 'categories' | 'data' | 'ai';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [aiConfig, setAiConfig] = useState<AIProviderConfig | null>(null);
  const [aiConfigLoading, setAiConfigLoading] = useState(false);
  const { showToast } = useToast();

  const loadSettings = useCallback(async () => {
    try {
      const data = await SettingsService.getSettings();
      setSettings(data);
    } catch (error) {
      showToast('Erro ao carregar configurações', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadStats = async () => {
    const data = await SettingsService.getSystemStats();
    setStats(data);
  };

  const loadAIConfig = useCallback(async () => {
    try {
      const config = await AIService.getConfig();
      setAiConfig(config);
    } catch (error) {
      console.error('Erro ao carregar config IA:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadStats();
    loadAIConfig();
  }, [loadSettings, loadAIConfig]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      await SettingsService.updateProfile(settings.profile);
      showToast('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao salvar perfil', 'error');
    }
  };

  const handleNotificationsSave = async () => {
    if (!settings) return;

    try {
      await SettingsService.updateNotificationPreferences(settings.notifications);
      showToast('Preferências de notificação atualizadas!', 'success');
    } catch (error) {
      showToast('Erro ao salvar preferências', 'error');
    }
  };

  const handlePreferencesSave = async () => {
    if (!settings) return;

    try {
      await SettingsService.updateAppPreferences(settings.preferences);
      showToast('Preferências do aplicativo atualizadas!', 'success');
      
      // Atualiza tema se mudou
      if (settings.preferences.theme !== 'auto') {
        document.documentElement.setAttribute('data-theme', settings.preferences.theme);
        document.body.className = settings.preferences.theme;
        localStorage.setItem('theme', settings.preferences.theme);
      }
    } catch (error) {
      showToast('Erro ao salvar preferências', 'error');
    }
  };

  const handleAISave = async () => {
    if (!aiConfig) return;

    setAiConfigLoading(true);
    try {
      await AIService.configure(aiConfig);
      showToast('Configurações de IA atualizadas!', 'success');
      
      // Verificar se API Key está funcionando
      if (aiConfig.apiKey) {
        const isConfigured = await AIService.isConfigured();
        if (isConfigured) {
          showToast('API Key validada com sucesso! ✨', 'success');
        }
      }
    } catch (error) {
      showToast('Erro ao salvar configurações de IA', 'error');
    } finally {
      setAiConfigLoading(false);
    }
  };

  const handleTestAI = async () => {
    if (!aiConfig?.apiKey) {
      showToast('Configure uma API Key primeiro', 'error');
      return;
    }

    setAiConfigLoading(true);
    try {
      const testContext = {
        userId: 'test',
        timeRange: { start: new Date().toISOString(), end: new Date().toISOString() },
        transactions: { total: 10, income: 5000, expenses: 3000, byCategory: {} },
      };

      await AIService.chat('Olá! Como você está?', testContext);
      showToast('Teste realizado com sucesso! IA está funcionando! 🎉', 'success');
    } catch (error) {
      showToast(`Erro no teste: ${(error as Error).message}`, 'error');
    } finally {
      setAiConfigLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const jsonData = await SettingsService.exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-financify-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup exportado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao exportar dados', 'error');
    }
  };

  const _handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await SettingsService.importData(text);
      showToast('Dados importados! Recarregando...', 'success');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      showToast('Erro ao importar dados. Verifique o arquivo.', 'error');
    }
  };

  const handleResetSystem = async () => {
    if (!confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados do sistema. Esta ação não pode ser desfeita. Deseja continuar?')) {
      return;
    }

    if (!confirm('Tem ABSOLUTA CERTEZA? Digite "CONFIRMAR" abaixo para prosseguir:') || 
        prompt('Digite CONFIRMAR:') !== 'CONFIRMAR') {
      return;
    }

    try {
      await SettingsService.resetAll();
      showToast('Sistema resetado. Recarregando...', 'success');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      showToast('Erro ao resetar sistema', 'error');
    }
  };

  if (loading || !settings) {
    return <div className="settings-page"><div className="loading">Carregando...</div></div>;
  }

  return (
    <div className="settings-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <h1><i className="fas fa-cog"></i> Configurações</h1>
        <p>Personalize seu My Financify</p>
      </motion.div>

      <div className="settings-container">
        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i>
            <span>Perfil</span>
          </button>
          <button
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <i className="fas fa-bell"></i>
            <span>Notificações</span>
          </button>
          <button
            className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <i className="fas fa-palette"></i>
            <span>Aparência</span>
          </button>
          <button
            className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <i className="fas fa-tags"></i>
            <span>Categorias</span>
          </button>
          <button
            className={`tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <i className="fas fa-database"></i>
            <span>Dados</span>
          </button>
          <button
            className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            <i className="fas fa-robot"></i>
            <span>Assistente IA</span>
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="settings-card">
              <h2><i className="fas fa-user"></i> Perfil do Usuário</h2>
              <form onSubmit={handleProfileSave}>
                <Input
                  label="Nome"
                  value={settings.profile.name}
                  onChange={(e) => setSettings({
                    ...settings,
                    profile: { ...settings.profile, name: e.target.value }
                  })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={settings.profile.email || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    profile: { ...settings.profile, email: e.target.value }
                  })}
                  placeholder="seu@email.com"
                />
                <div className="form-group">
                  <label>Moeda</label>
                  <select
                    value={settings.profile.currency}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, currency: e.target.value }
                    })}
                    className="select-input"
                  >
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <Button type="submit" variant="primary">
                  <i className="fas fa-save"></i> Salvar Perfil
                </Button>
              </form>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card className="settings-card">
              <h2><i className="fas fa-bell"></i> Preferências de Notificação</h2>
              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Habilitar Notificações</h4>
                    <p>Receber notificações do sistema</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, enabled: e.target.checked }
                      })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Alertas de Orçamento</h4>
                    <p>Notificar quando atingir limite do orçamento</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications.budgetAlerts}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, budgetAlerts: e.target.checked }
                      })}
                      disabled={!settings.notifications.enabled}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Lembretes de Metas</h4>
                    <p>Notificar sobre progresso das metas</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications.goalReminders}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, goalReminders: e.target.checked }
                      })}
                      disabled={!settings.notifications.enabled}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Confirmações de Transação</h4>
                    <p>Notificar ao criar/editar/excluir transações</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications.transactionConfirmations}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, transactionConfirmations: e.target.checked }
                      })}
                      disabled={!settings.notifications.enabled}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              <Button onClick={handleNotificationsSave} variant="primary">
                <i className="fas fa-save"></i> Salvar Preferências
              </Button>
            </Card>
          )}

          {/* Push Notifications - Sprint 5.3 */}
          {activeTab === 'notifications' && (
            <PushNotificationSettings />
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <Card className="settings-card">
              <h2><i className="fas fa-palette"></i> Aparência e Preferências</h2>
              <div className="settings-group">
                <div className="form-group">
                  <label>Tema</label>
                  <select
                    value={settings.preferences.theme}
                    onChange={(e) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, theme: e.target.value as any }
                    })}
                    className="select-input"
                  >
                    <option value="light">☀️ Claro</option>
                    <option value="dark">🌙 Escuro</option>
                    <option value="auto">🔄 Automático</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Visualização Padrão</label>
                  <select
                    value={settings.preferences.defaultView}
                    onChange={(e) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, defaultView: e.target.value as any }
                    })}
                    className="select-input"
                  >
                    <option value="dashboard">📊 Dashboard</option>
                    <option value="transactions">💳 Transações</option>
                    <option value="reports">📈 Relatórios</option>
                    <option value="reports-advanced">📉 Análise Avançada</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Modo Compacto</h4>
                    <p>Reduz espaçamentos e tamanhos de elementos</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.preferences.compactMode}
                      onChange={(e) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, compactMode: e.target.checked }
                      })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Animações</h4>
                    <p>Exibir animações e transições</p>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.preferences.showAnimations}
                      onChange={(e) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, showAnimations: e.target.checked }
                      })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              <Button onClick={handlePreferencesSave} variant="primary">
                <i className="fas fa-save"></i> Salvar Preferências
              </Button>
            </Card>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <Card className="settings-card">
              <h2><i className="fas fa-tags"></i> Categorias Personalizadas</h2>
              <p className="info-text">
                Em breve você poderá criar suas próprias categorias personalizadas!
              </p>
              <div className="coming-soon">
                <i className="fas fa-hammer"></i>
                <h3>Em Desenvolvimento</h3>
                <p>Sistema de categorias personalizadas será adicionado em breve.</p>
              </div>
            </Card>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <Card className="settings-card">
              <h2><i className="fas fa-database"></i> Gerenciamento de Dados</h2>
              
              {/* Stats */}
              {stats && (
                <div className="data-stats">
                  <div className="stat-box">
                    <i className="fas fa-receipt"></i>
                    <span className="stat-value">{stats.totalTransactions}</span>
                    <span className="stat-label">Transações</span>
                  </div>
                  <div className="stat-box">
                    <i className="fas fa-wallet"></i>
                    <span className="stat-value">{stats.totalBudgets}</span>
                    <span className="stat-label">Orçamentos</span>
                  </div>
                  <div className="stat-box">
                    <i className="fas fa-bullseye"></i>
                    <span className="stat-value">{stats.totalGoals}</span>
                    <span className="stat-label">Metas</span>
                  </div>
                  <div className="stat-box">
                    <i className="fas fa-bell"></i>
                    <span className="stat-value">{stats.totalNotifications}</span>
                    <span className="stat-label">Notificações</span>
                  </div>
                  <div className="stat-box full">
                    <i className="fas fa-hard-drive"></i>
                    <span className="stat-value">{stats.storageUsed}</span>
                    <span className="stat-label">Espaço Usado</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="data-actions">
                <div className="action-group">
                  <h3>🔐 Backup Completo (Configurações)</h3>
                  <p>Exporte todas as suas configurações e preferências (sem dados financeiros)</p>
                  <Button onClick={async () => {
                    try {
                      await SettingsBackupService.downloadBackup(false);
                      showToast('Backup de configurações baixado!', 'success');
                    } catch (error) {
                      showToast('Erro ao exportar configurações', 'error');
                    }
                  }} variant="primary">
                    <i className="fas fa-download"></i> Exportar Configurações
                  </Button>
                </div>

                <div className="action-group">
                  <h3>💾 Backup Completo (Tudo)</h3>
                  <p>Exporte TODAS configurações E dados financeiros (contas, budgets, metas)</p>
                  <Button onClick={async () => {
                    try {
                      await SettingsBackupService.downloadBackup(true);
                      showToast('Backup completo baixado!', 'success');
                    } catch (error) {
                      showToast('Erro ao exportar dados', 'error');
                    }
                  }} variant="primary">
                    <i className="fas fa-download"></i> Exportar Tudo
                  </Button>
                </div>

                <div className="action-group">
                  <h3>📤 Restaurar Backup</h3>
                  <p>Importe um arquivo de backup (configurações ou completo)</p>
                  <label className="file-input-label">
                    <input
                      type="file"
                      accept=".json"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        try {
                          await SettingsBackupService.uploadBackup(file);
                          showToast('Backup restaurado com sucesso!', 'success');
                          setTimeout(() => window.location.reload(), 1500);
                        } catch (error) {
                          showToast('Erro ao restaurar backup: ' + (error as Error).message, 'error');
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <Button variant="secondary">
                      <i className="fas fa-upload"></i> Importar Backup
                    </Button>
                  </label>
                </div>

                <div className="action-group">
                  <h3>⚡ Backup Automático Local</h3>
                  <p>Restaurar última versão salva automaticamente no navegador</p>
                  <Button onClick={async () => {
                    try {
                      const success = await SettingsBackupService.restoreAutoBackup();
                      if (success) {
                        showToast('Backup automático restaurado!', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                      } else {
                        showToast('Nenhum backup automático encontrado', 'warning');
                      }
                    } catch (error) {
                      showToast('Erro ao restaurar backup automático', 'error');
                    }
                  }} variant="secondary">
                    <i className="fas fa-history"></i> Restaurar Auto-Backup
                  </Button>
                </div>

                <div className="action-group">
                  <h3>📊 Backup de Dados Brutos (JSON)</h3>
                  <p>Exportar dados financeiros para análise externa (formato antigo)</p>
                  <Button onClick={handleExportData} variant="secondary">
                    <i className="fas fa-file-code"></i> Exportar JSON
                  </Button>
                </div>

                <div className="action-group danger">
                  <h3>⚠️ Zona de Perigo</h3>
                  <p>Resetar completamente o sistema (apaga TODOS os dados)</p>
                  <Button onClick={handleResetSystem} variant="danger">
                    <i className="fas fa-trash"></i> Resetar Sistema
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && aiConfig && (
            <Card className="settings-card">
              <h2><i className="fas fa-robot"></i> Assistente IA</h2>
              <p className="section-description">
                Configure o assistente financeiro inteligente com Google Gemini Pro (gratuito)
              </p>

              <div className="settings-group">
                {/* API Key */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-key"></i> API Key do Google Gemini
                  </label>
                  <Input
                    type="password"
                    value={aiConfig.apiKey || ''}
                    onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                    placeholder="Cole sua API Key aqui..."
                  />
                  <small className="help-text">
                    📝 Obtenha gratuitamente em: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
                  </small>
                </div>

                {/* Modelo */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-microchip"></i> Modelo de IA
                  </label>
                  <select
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                    className="select-input"
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Rápido e Gratuito)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Mais Poderoso)</option>
                  </select>
                  <small className="help-text">
                    ⚡ Flash: Mais rápido, ideal para uso diário | 🚀 Pro: Análises mais complexas
                  </small>
                </div>

                {/* Temperatura */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-temperature-half"></i> Criatividade (Temperature): {aiConfig.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiConfig.temperature}
                    onChange={(e) => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                    className="slider-input"
                  />
                  <div className="slider-labels">
                    <span>Conservador (0.0)</span>
                    <span>Criativo (1.0)</span>
                  </div>
                  <small className="help-text">
                    💡 0.7 recomendado para finanças (equilíbrio entre precisão e criatividade)
                  </small>
                </div>

                {/* Max Tokens */}
                <div className="form-group">
                  <label>
                    <i className="fas fa-text-width"></i> Máximo de Tokens
                  </label>
                  <select
                    value={aiConfig.maxTokens}
                    onChange={(e) => setAiConfig({ ...aiConfig, maxTokens: parseInt(e.target.value) })}
                    className="select-input"
                  >
                    <option value="1024">1024 (Respostas Curtas)</option>
                    <option value="2048">2048 (Recomendado)</option>
                    <option value="4096">4096 (Respostas Longas)</option>
                  </select>
                  <small className="help-text">
                    📊 Maior = Respostas mais detalhadas (consome mais tokens gratuitos)
                  </small>
                </div>

                {/* Status */}
                <div className="ai-status">
                  <div className="status-indicator">
                    {aiConfig.apiKey ? (
                      <>
                        <i className="fas fa-check-circle" style={{ color: 'var(--success-color)' }}></i>
                        <span>API Key configurada</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-exclamation-circle" style={{ color: 'var(--warning-color)' }}></i>
                        <span>API Key não configurada</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="button-group">
                  <Button 
                    onClick={handleAISave} 
                    variant="primary"
                    disabled={aiConfigLoading || !aiConfig.apiKey}
                  >
                    <i className="fas fa-save"></i> Salvar Configurações
                  </Button>
                  <Button 
                    onClick={handleTestAI}
                    variant="secondary"
                    disabled={aiConfigLoading || !aiConfig.apiKey}
                  >
                    <i className="fas fa-flask"></i> Testar IA
                  </Button>
                </div>

                {/* Guia Rápido */}
                <div className="info-box">
                  <h4>🚀 Como Configurar (2 minutos)</h4>
                  <ol>
                    <li>Acesse <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
                    <li>Faça login com sua conta Google</li>
                    <li>Clique em &quot;Create API Key&quot; (gratuito, sem cartão)</li>
                    <li>Copie a chave gerada</li>
                    <li>Cole no campo acima e clique em &quot;Salvar&quot;</li>
                    <li>Clique em &quot;Testar IA&quot; para validar</li>
                  </ol>
                </div>

                {/* Limites Gratuitos */}
                <div className="info-box" style={{ borderColor: 'var(--success-color)' }}>
                  <h4>💚 Totalmente Gratuito!</h4>
                  <ul>
                    <li>✅ 60 requisições por minuto</li>
                    <li>✅ 1 milhão de tokens por dia</li>
                    <li>✅ Sem cartão de crédito</li>
                    <li>✅ Suficiente para centenas de usuários</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
