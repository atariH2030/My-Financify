/**
 * @file theme.service.ts
 * @description Sistema de temas customizáveis com presets
 * @version 3.13.0
 * @author DEV - Rickson (TQM)
 */

import Logger from './logger.service';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryRgb: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  hoverBg: string;
}

export interface Theme {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
}

class ThemeService {
  private static instance: ThemeService;
  private readonly THEME_KEY = 'selected_theme';
  private readonly CUSTOM_THEME_KEY = 'custom_theme';

  private readonly presetThemes: Theme[] = [
    {
      id: 'light-default',
      name: 'Light (Padrão)',
      mode: 'light',
      colors: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryRgb: '59, 130, 246',
        secondary: '#64748b',
        success: '#059669',
        warning: '#f59e0b',
        error: '#dc2626',
        info: '#0ea5e9',
        background: '#ffffff',
        cardBg: '#f8fafc',
        textPrimary: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        hoverBg: '#f1f5f9',
      },
    },
    {
      id: 'dark-default',
      name: 'Dark (Padrão)',
      mode: 'dark',
      colors: {
        primary: '#3b82f6',
        primaryHover: '#60a5fa',
        primaryRgb: '59, 130, 246',
        secondary: '#94a3b8',
        success: '#10b981',
        warning: '#fbbf24',
        error: '#ef4444',
        info: '#38bdf8',
        background: '#0f172a',
        cardBg: '#1e293b',
        textPrimary: '#f1f5f9',
        textSecondary: '#cbd5e1',
        border: '#334155',
        hoverBg: '#334155',
      },
    },
    {
      id: 'light-ocean',
      name: 'Ocean Blue',
      mode: 'light',
      colors: {
        primary: '#0ea5e9',
        primaryHover: '#0284c7',
        primaryRgb: '14, 165, 233',
        secondary: '#64748b',
        success: '#059669',
        warning: '#f59e0b',
        error: '#dc2626',
        info: '#06b6d4',
        background: '#f0f9ff',
        cardBg: '#ffffff',
        textPrimary: '#0c4a6e',
        textSecondary: '#475569',
        border: '#bae6fd',
        hoverBg: '#e0f2fe',
      },
    },
    {
      id: 'dark-purple',
      name: 'Purple Night',
      mode: 'dark',
      colors: {
        primary: '#a855f7',
        primaryHover: '#c084fc',
        primaryRgb: '168, 85, 247',
        secondary: '#94a3b8',
        success: '#10b981',
        warning: '#fbbf24',
        error: '#ef4444',
        info: '#c084fc',
        background: '#1e1b2e',
        cardBg: '#2d2a3e',
        textPrimary: '#f3e8ff',
        textSecondary: '#d8b4fe',
        border: '#4c1d95',
        hoverBg: '#3b3454',
      },
    },
    {
      id: 'light-forest',
      name: 'Forest Green',
      mode: 'light',
      colors: {
        primary: '#059669',
        primaryHover: '#047857',
        primaryRgb: '5, 150, 105',
        secondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#dc2626',
        info: '#0ea5e9',
        background: '#f0fdf4',
        cardBg: '#ffffff',
        textPrimary: '#064e3b',
        textSecondary: '#475569',
        border: '#bbf7d0',
        hoverBg: '#dcfce7',
      },
    },
  ];

  private constructor() {}

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  /**
   * Obter temas disponíveis
   */
  getPresetThemes(): Theme[] {
    return this.presetThemes;
  }

  /**
   * Obter tema atual
   */
  getCurrentTheme(): Theme {
    const themeId = localStorage.getItem(this.THEME_KEY);
    const customTheme = this.getCustomTheme();

    if (themeId === 'custom' && customTheme) {
      return customTheme;
    }

    return this.presetThemes.find((t) => t.id === themeId) || this.presetThemes[0];
  }

  /**
   * Aplicar tema
   */
  applyTheme(themeId: string): void {
    try {
      const theme = themeId === 'custom' 
        ? this.getCustomTheme() 
        : this.presetThemes.find((t) => t.id === themeId);

      if (!theme) {
        throw new Error('Tema não encontrado');
      }

      this.setThemeVariables(theme);
      document.documentElement.setAttribute('data-theme', theme.mode);
      document.body.className = theme.mode;
      localStorage.setItem(this.THEME_KEY, themeId);

      Logger.info(`Tema aplicado: ${theme.name}`, { id: themeId }, 'THEME');
    } catch (error) {
      Logger.error('Erro ao aplicar tema', error as Error, 'THEME');
    }
  }

  /**
   * Criar tema customizado
   */
  createCustomTheme(name: string, mode: 'light' | 'dark', colors: Partial<ThemeColors>): void {
    try {
      const baseTheme = mode === 'dark' ? this.presetThemes[1] : this.presetThemes[0];
      
      const customTheme: Theme = {
        id: 'custom',
        name,
        mode,
        colors: {
          ...baseTheme.colors,
          ...colors,
        },
      };

      localStorage.setItem(this.CUSTOM_THEME_KEY, JSON.stringify(customTheme));
      this.applyTheme('custom');

      Logger.info('Tema customizado criado', { name }, 'THEME');
    } catch (error) {
      Logger.error('Erro ao criar tema customizado', error as Error, 'THEME');
      throw error;
    }
  }

  /**
   * Obter tema customizado
   */
  getCustomTheme(): Theme | null {
    try {
      const data = localStorage.getItem(this.CUSTOM_THEME_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      Logger.error('Erro ao obter tema customizado', error as Error, 'THEME');
      return null;
    }
  }

  /**
   * Deletar tema customizado
   */
  deleteCustomTheme(): void {
    localStorage.removeItem(this.CUSTOM_THEME_KEY);
    
    // Voltar para tema padrão
    const mode = document.documentElement.getAttribute('data-theme') || 'light';
    const defaultTheme = mode === 'dark' ? 'dark-default' : 'light-default';
    this.applyTheme(defaultTheme);

    Logger.info('Tema customizado deletado', {}, 'THEME');
  }

  /**
   * Alternar entre light/dark
   */
  toggleMode(): void {
    const current = this.getCurrentTheme();
    const newMode = current.mode === 'dark' ? 'light' : 'dark';
    
    // Encontrar tema correspondente no modo oposto
    const newTheme = this.presetThemes.find(
      (t) => t.mode === newMode && t.id.includes('default')
    );

    if (newTheme) {
      this.applyTheme(newTheme.id);
    }
  }

  /**
   * Exportar tema customizado
   */
  exportCustomTheme(): string | null {
    const theme = this.getCustomTheme();
    return theme ? JSON.stringify(theme, null, 2) : null;
  }

  /**
   * Importar tema customizado
   */
  importCustomTheme(themeJson: string): void {
    try {
      const theme = JSON.parse(themeJson) as Theme;
      
      // Validação básica
      if (!theme.name || !theme.mode || !theme.colors) {
        throw new Error('Formato de tema inválido');
      }

      theme.id = 'custom';
      localStorage.setItem(this.CUSTOM_THEME_KEY, JSON.stringify(theme));
      this.applyTheme('custom');

      Logger.info('Tema importado com sucesso', { name: theme.name }, 'THEME');
    } catch (error) {
      Logger.error('Erro ao importar tema', error as Error, 'THEME');
      throw new Error('Erro ao importar tema: formato inválido');
    }
  }

  /**
   * HELPERS PRIVADOS
   */

  private setThemeVariables(theme: Theme): void {
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });
  }
}

export default ThemeService.getInstance();
