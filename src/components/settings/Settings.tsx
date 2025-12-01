import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { useToast } from '../common/Toast';
import SettingsService, { type AppSettings, type CustomCategory } from '../../services/settings.service';
import './Settings.css';

type Tab = 'profile' | 'notifications' | 'preferences' | 'categories' | 'data';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
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

  useEffect(() => {
    loadSettings();
    loadStats();
  }, [loadSettings]);

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

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                  <h3>Backup dos Dados</h3>
                  <p>Exporte todos os seus dados para um arquivo JSON</p>
                  <Button onClick={handleExportData} variant="primary">
                    <i className="fas fa-download"></i> Exportar Backup
                  </Button>
                </div>

                <div className="action-group">
                  <h3>Restaurar Backup</h3>
                  <p>Importe um arquivo de backup anteriormente exportado</p>
                  <label className="file-input-label">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      style={{ display: 'none' }}
                    />
                    <Button variant="secondary">
                      <i className="fas fa-upload"></i> Importar Backup
                    </Button>
                  </label>
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
        </div>
      </div>
    </div>
  );
};

export default Settings;
