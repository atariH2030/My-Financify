/**
 * @file settings-backup.service.ts
 * @description Sistema de export/import de configurações completo
 * @version 3.13.0
 * @author DEV - Rickson (TQM)
 */

import Logger from './logger.service';
import SettingsService from './settings.service';
import ThemeService from './theme.service';

export interface BackupData {
  version: string;
  timestamp: string;
  settings: any;
  theme: any;
  accounts?: any[];
  budgets?: any[];
  goals?: any[];
  categories?: any[];
}

class SettingsBackupService {
  private static instance: SettingsBackupService;
  private readonly BACKUP_VERSION = '1.0.0';

  private constructor() {}

  static getInstance(): SettingsBackupService {
    if (!SettingsBackupService.instance) {
      SettingsBackupService.instance = new SettingsBackupService();
    }
    return SettingsBackupService.instance;
  }

  /**
   * Exportar todas as configurações
   */
  async exportSettings(includeData = false): Promise<string> {
    try {
      const backup: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        settings: await SettingsService.getSettings(),
        theme: ThemeService.getCurrentTheme(),
      };

      // Incluir dados se solicitado
      if (includeData) {
        backup.accounts = this.getLocalStorageItem('accounts');
        backup.budgets = this.getLocalStorageItem('budgets');
        backup.goals = this.getLocalStorageItem('goals');
        backup.categories = this.getLocalStorageItem('categories');
      }

      const json = JSON.stringify(backup, null, 2);
      Logger.info('Configurações exportadas', { size: json.length, includeData }, 'BACKUP');
      return json;
    } catch (error) {
      Logger.error('Erro ao exportar configurações', error as Error, 'BACKUP');
      throw new Error('Falha ao exportar configurações');
    }
  }

  /**
   * Importar configurações de JSON
   */
  async importSettings(jsonData: string, options = { overwrite: true }): Promise<void> {
    try {
      const backup: BackupData = JSON.parse(jsonData);

      // Validação
      if (!this.validateBackup(backup)) {
        throw new Error('Formato de backup inválido');
      }

      // Importar settings
      if (backup.settings) {
        await this.importSettingsData(backup.settings, options.overwrite);
      }

      // Importar tema
      if (backup.theme) {
        await this.importTheme(backup.theme);
      }

      // Importar dados (contas, budgets, goals)
      if (backup.accounts) {
        this.setLocalStorageItem('accounts', backup.accounts);
      }
      if (backup.budgets) {
        this.setLocalStorageItem('budgets', backup.budgets);
      }
      if (backup.goals) {
        this.setLocalStorageItem('goals', backup.goals);
      }
      if (backup.categories) {
        this.setLocalStorageItem('categories', backup.categories);
      }

      Logger.info('Configurações importadas com sucesso', { version: backup.version }, 'BACKUP');
    } catch (error) {
      Logger.error('Erro ao importar configurações', error as Error, 'BACKUP');
      throw new Error('Falha ao importar configurações: ' + (error as Error).message);
    }
  }

  /**
   * Download de arquivo de backup
   */
  async downloadBackup(includeData = false): Promise<void> {
    try {
      const json = await this.exportSettings(includeData);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `financy-backup-${timestamp}.json`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      
      URL.revokeObjectURL(url);
      
      Logger.info('Backup baixado', { filename }, 'BACKUP');
    } catch (error) {
      Logger.error('Erro ao baixar backup', error as Error, 'BACKUP');
      throw error;
    }
  }

  /**
   * Upload de arquivo de backup
   */
  async uploadBackup(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const json = e.target?.result as string;
          await this.importSettings(json);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Criar backup automático local
   */
  async createAutoBackup(): Promise<void> {
    try {
      const json = await this.exportSettings(true);
      localStorage.setItem('financy-auto-backup', json);
      localStorage.setItem('financy-auto-backup-date', new Date().toISOString());
      
      Logger.info('Backup automático criado', {}, 'BACKUP');
    } catch (error) {
      Logger.error('Erro ao criar backup automático', error as Error, 'BACKUP');
    }
  }

  /**
   * Restaurar backup automático
   */
  async restoreAutoBackup(): Promise<boolean> {
    try {
      const json = localStorage.getItem('financy-auto-backup');
      const date = localStorage.getItem('financy-auto-backup-date');
      
      if (!json) {
        Logger.info('Nenhum backup automático encontrado', {}, 'BACKUP');
        return false;
      }

      await this.importSettings(json);
      
      Logger.info('Backup automático restaurado', { date }, 'BACKUP');
      return true;
    } catch (error) {
      Logger.error('Erro ao restaurar backup automático', error as Error, 'BACKUP');
      return false;
    }
  }

  /**
   * Obter info do último backup automático
   */
  getAutoBackupInfo(): { exists: boolean; date: string | null; size: number } {
    const json = localStorage.getItem('financy-auto-backup');
    const date = localStorage.getItem('financy-auto-backup-date');
    
    return {
      exists: !!json,
      date,
      size: json ? json.length : 0,
    };
  }

  /**
   * HELPERS PRIVADOS
   */

  private validateBackup(backup: BackupData): boolean {
    return !!(
      backup.version &&
      backup.timestamp &&
      backup.settings &&
      typeof backup.settings === 'object'
    );
  }

  private async importSettingsData(settings: any, overwrite: boolean): Promise<void> {
    const current = await SettingsService.getSettings();
    
    const merged = overwrite ? settings : { ...current, ...settings };
    
    // Atualizar cada setting individualmente
    for (const [key, value] of Object.entries(merged)) {
      localStorage.setItem(`financy-life-${key}`, JSON.stringify({ 
        data: value, 
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }));
    }
  }

  private async importTheme(theme: any): Promise<void> {
    if (theme.id === 'custom') {
      ThemeService.importCustomTheme(JSON.stringify(theme));
    } else {
      ThemeService.applyTheme(theme.id);
    }
  }

  private getLocalStorageItem(key: string): any {
    try {
      const data = localStorage.getItem(`financy-life-${key}`);
      return data ? JSON.parse(data).data : null;
    } catch (error) {
      Logger.error(`Erro ao obter ${key}`, error as Error, 'BACKUP');
      return null;
    }
  }

  private setLocalStorageItem(key: string, value: any): void {
    try {
      localStorage.setItem(`financy-life-${key}`, JSON.stringify({ 
        data: value, 
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }));
    } catch (error) {
      Logger.error(`Erro ao salvar ${key}`, error as Error, 'BACKUP');
    }
  }
}

export default SettingsBackupService.getInstance();
