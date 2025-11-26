/**
 * Settings Service - Gerenciamento de configurações do sistema
 * @version 3.6.0
 */

import Logger from './logger.service';
import Storage from './storage.service';

export interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
  currency: string;
  language: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  budgetAlerts: boolean;
  goalReminders: boolean;
  transactionConfirmations: boolean;
  emailNotifications: boolean;
}

export interface AppPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultView: 'dashboard' | 'transactions' | 'reports' | 'reports-advanced';
  sidebarCollapsed: boolean;
  compactMode: boolean;
  showAnimations: boolean;
}

export interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  createdAt: string;
}

export interface AppSettings {
  profile: UserProfile;
  notifications: NotificationPreferences;
  preferences: AppPreferences;
  customCategories: CustomCategory[];
  version: string;
  lastUpdated: string;
}

class SettingsService {
  private readonly STORAGE_KEY = 'app_settings';
  private readonly VERSION = '3.6.0';

  private defaultSettings: AppSettings = {
    profile: {
      name: 'Usuário',
      currency: 'BRL',
      language: 'pt-BR',
    },
    notifications: {
      enabled: true,
      budgetAlerts: true,
      goalReminders: true,
      transactionConfirmations: false,
      emailNotifications: false,
    },
    preferences: {
      theme: 'light',
      defaultView: 'dashboard',
      sidebarCollapsed: false,
      compactMode: false,
      showAnimations: true,
    },
    customCategories: [],
    version: this.VERSION,
    lastUpdated: new Date().toISOString(),
  };

  /**
   * Carrega todas as configurações
   */
  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await Storage.load<AppSettings>(this.STORAGE_KEY);
      
      if (!settings) {
        await this.saveSettings(this.defaultSettings);
        return this.defaultSettings;
      }

      // Merge com defaults para garantir todas as propriedades
      return {
        ...this.defaultSettings,
        ...settings,
        profile: { ...this.defaultSettings.profile, ...settings.profile },
        notifications: { ...this.defaultSettings.notifications, ...settings.notifications },
        preferences: { ...this.defaultSettings.preferences, ...settings.preferences },
      };
    } catch (error) {
      Logger.error('Erro ao carregar configurações', error as Error, 'SETTINGS');
      return this.defaultSettings;
    }
  }

  /**
   * Salva todas as configurações
   */
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const updated = {
        ...settings,
        version: this.VERSION,
        lastUpdated: new Date().toISOString(),
      };

      await Storage.save(this.STORAGE_KEY, updated);
      Logger.info('✅ Configurações salvas', undefined, 'SETTINGS');
    } catch (error) {
      Logger.error('Erro ao salvar configurações', error as Error, 'SETTINGS');
      throw error;
    }
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(profile: Partial<UserProfile>): Promise<void> {
    const settings = await this.getSettings();
    settings.profile = { ...settings.profile, ...profile };
    await this.saveSettings(settings);
    Logger.info('👤 Perfil atualizado', { name: profile.name }, 'SETTINGS');
  }

  /**
   * Atualiza preferências de notificação
   */
  async updateNotificationPreferences(prefs: Partial<NotificationPreferences>): Promise<void> {
    const settings = await this.getSettings();
    settings.notifications = { ...settings.notifications, ...prefs };
    await this.saveSettings(settings);
    Logger.info('🔔 Preferências de notificação atualizadas', undefined, 'SETTINGS');
  }

  /**
   * Atualiza preferências do app
   */
  async updateAppPreferences(prefs: Partial<AppPreferences>): Promise<void> {
    const settings = await this.getSettings();
    settings.preferences = { ...settings.preferences, ...prefs };
    await this.saveSettings(settings);
    Logger.info('⚙️ Preferências do app atualizadas', undefined, 'SETTINGS');
  }

  /**
   * Gerenciamento de categorias customizadas
   */
  async addCustomCategory(category: Omit<CustomCategory, 'id' | 'createdAt'>): Promise<CustomCategory> {
    const settings = await this.getSettings();
    
    const newCategory: CustomCategory = {
      ...category,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    settings.customCategories.push(newCategory);
    await this.saveSettings(settings);

    Logger.info('📁 Categoria customizada adicionada', { name: category.name }, 'SETTINGS');
    return newCategory;
  }

  async updateCustomCategory(id: string, updates: Partial<Omit<CustomCategory, 'id' | 'createdAt'>>): Promise<void> {
    const settings = await this.getSettings();
    settings.customCategories = settings.customCategories.map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    await this.saveSettings(settings);
  }

  async deleteCustomCategory(id: string): Promise<void> {
    const settings = await this.getSettings();
    settings.customCategories = settings.customCategories.filter(cat => cat.id !== id);
    await this.saveSettings(settings);
    Logger.info('🗑️ Categoria customizada removida', { id }, 'SETTINGS');
  }

  async getCustomCategories(): Promise<CustomCategory[]> {
    const settings = await this.getSettings();
    return settings.customCategories;
  }

  /**
   * Backup e restore
   */
  async exportData(): Promise<string> {
    try {
      const [transactions, budgets, goals, settings] = await Promise.all([
        Storage.load('transactions'),
        Storage.load('budgets'),
        Storage.load('goals'),
        this.getSettings(),
      ]);

      const backup = {
        version: this.VERSION,
        exportDate: new Date().toISOString(),
        data: {
          transactions,
          budgets,
          goals,
          settings,
        },
      };

      const json = JSON.stringify(backup, null, 2);
      Logger.info('💾 Dados exportados', { size: json.length }, 'SETTINGS');
      
      return json;
    } catch (error) {
      Logger.error('Erro ao exportar dados', error as Error, 'SETTINGS');
      throw error;
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const backup = JSON.parse(jsonData);

      if (!backup.data) {
        throw new Error('Formato de backup inválido');
      }

      // Valida estrutura básica
      if (!backup.data.transactions || !backup.data.budgets || !backup.data.goals) {
        throw new Error('Backup incompleto');
      }

      // Importa dados
      await Storage.save('transactions', backup.data.transactions);
      await Storage.save('budgets', backup.data.budgets);
      await Storage.save('goals', backup.data.goals);
      
      if (backup.data.settings) {
        await this.saveSettings(backup.data.settings);
      }

      Logger.info('✅ Dados importados com sucesso', undefined, 'SETTINGS');
    } catch (error) {
      Logger.error('Erro ao importar dados', error as Error, 'SETTINGS');
      throw error;
    }
  }

  /**
   * Reset completo do sistema
   */
  async resetAll(): Promise<void> {
    try {
      await Storage.save('transactions', []);
      await Storage.save('budgets', []);
      await Storage.save('goals', []);
      await Storage.save('notifications', []);
      await this.saveSettings(this.defaultSettings);

      Logger.info('🔄 Sistema resetado completamente', undefined, 'SETTINGS');
    } catch (error) {
      Logger.error('Erro ao resetar sistema', error as Error, 'SETTINGS');
      throw error;
    }
  }

  /**
   * Obtém estatísticas do sistema
   */
  async getSystemStats(): Promise<{
    totalTransactions: number;
    totalBudgets: number;
    totalGoals: number;
    totalNotifications: number;
    storageUsed: string;
    lastBackup?: string;
  }> {
    try {
      const [transactions, budgets, goals, notifications] = await Promise.all([
        Storage.load('transactions'),
        Storage.load('budgets'),
        Storage.load('goals'),
        Storage.load('notifications'),
      ]);

      // Calcula tamanho aproximado do storage
      const allData = JSON.stringify({ transactions, budgets, goals, notifications });
      const sizeInBytes = new Blob([allData]).size;
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);

      return {
        totalTransactions: (transactions as any[])?.length || 0,
        totalBudgets: (budgets as any[])?.length || 0,
        totalGoals: (goals as any[])?.length || 0,
        totalNotifications: (notifications as any[])?.length || 0,
        storageUsed: `${sizeInKB} KB`,
      };
    } catch (error) {
      Logger.error('Erro ao obter estatísticas', error as Error, 'SETTINGS');
      return {
        totalTransactions: 0,
        totalBudgets: 0,
        totalGoals: 0,
        totalNotifications: 0,
        storageUsed: '0 KB',
      };
    }
  }
}

export default new SettingsService();
