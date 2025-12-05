/**
 * @file i18n.service.ts
 * @description Sistema de internacionalização (i18n) - Sprint 5.2
 * @version 3.12.0
 * @author DEV - Rickson (TQM)
 * 
 * PILARES:
 * - Suporte a múltiplos idiomas (pt-BR, en-US, es-ES)
 * - Detecção automática de idioma do navegador
 * - Tradução dinâmica de textos
 * - Armazenamento de preferência do usuário
 * - Logs para debugging
 */

import Logger from './logger.service';

export type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES';

interface TranslationKeys {
  // Navigation
  'nav.dashboard': string;
  'nav.transactions': string;
  'nav.accounts': string;
  'nav.recurring': string;
  'nav.goals': string;
  'nav.budgets': string;
  'nav.reports': string;
  'nav.analytics': string;
  'nav.settings': string;
  'nav.profile': string;

  // Common
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.add': string;
  'common.search': string;
  'common.filter': string;
  'common.export': string;
  'common.import': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.warning': string;
  'common.info': string;

  // Dashboard
  'dashboard.title': string;
  'dashboard.balance': string;
  'dashboard.income': string;
  'dashboard.expenses': string;
  'dashboard.savings': string;

  // Transactions
  'transactions.title': string;
  'transactions.new': string;
  'transactions.type': string;
  'transactions.amount': string;
  'transactions.date': string;
  'transactions.category': string;
  'transactions.description': string;

  // Analytics
  'analytics.title': string;
  'analytics.chatSessions': string;
  'analytics.messagesSent': string;
  'analytics.avgDuration': string;
  'analytics.insightsGenerated': string;

  // Settings
  'settings.title': string;
  'settings.language': string;
  'settings.theme': string;
  'settings.notifications': string;
  'settings.backup': string;

  [key: string]: string;
}

type Translations = {
  [K in SupportedLanguage]: TranslationKeys;
};

const translations: Translations = {
  'pt-BR': {
    // Navigation
    'nav.dashboard': 'Painel Principal',
    'nav.transactions': 'Transações',
    'nav.accounts': 'Contas',
    'nav.recurring': 'Recorrentes',
    'nav.goals': 'Metas e Objetivos',
    'nav.budgets': 'Orçamentos',
    'nav.reports': 'Relatórios',
    'nav.analytics': 'Analytics IA',
    'nav.settings': 'Configurações',
    'nav.profile': 'Perfil',

    // Common
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.add': 'Adicionar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.import': 'Importar',
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.warning': 'Aviso',
    'common.info': 'Informação',

    // Dashboard
    'dashboard.title': 'Painel Principal',
    'dashboard.balance': 'Saldo',
    'dashboard.income': 'Receitas',
    'dashboard.expenses': 'Despesas',
    'dashboard.savings': 'Economia',

    // Transactions
    'transactions.title': 'Transações',
    'transactions.new': 'Nova Transação',
    'transactions.type': 'Tipo',
    'transactions.amount': 'Valor',
    'transactions.date': 'Data',
    'transactions.category': 'Categoria',
    'transactions.description': 'Descrição',

    // Analytics
    'analytics.title': 'Estatísticas de Uso da IA',
    'analytics.chatSessions': 'Sessões de Chat',
    'analytics.messagesSent': 'Mensagens Enviadas',
    'analytics.avgDuration': 'Duração Média',
    'analytics.insightsGenerated': 'Insights Gerados',

    // Settings
    'settings.title': 'Configurações',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.notifications': 'Notificações',
    'settings.backup': 'Backup e Restauração',
  },

  'en-US': {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.transactions': 'Transactions',
    'nav.accounts': 'Accounts',
    'nav.recurring': 'Recurring',
    'nav.goals': 'Goals & Objectives',
    'nav.budgets': 'Budgets',
    'nav.reports': 'Reports',
    'nav.analytics': 'AI Analytics',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',

    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.balance': 'Balance',
    'dashboard.income': 'Income',
    'dashboard.expenses': 'Expenses',
    'dashboard.savings': 'Savings',

    // Transactions
    'transactions.title': 'Transactions',
    'transactions.new': 'New Transaction',
    'transactions.type': 'Type',
    'transactions.amount': 'Amount',
    'transactions.date': 'Date',
    'transactions.category': 'Category',
    'transactions.description': 'Description',

    // Analytics
    'analytics.title': 'AI Usage Statistics',
    'analytics.chatSessions': 'Chat Sessions',
    'analytics.messagesSent': 'Messages Sent',
    'analytics.avgDuration': 'Average Duration',
    'analytics.insightsGenerated': 'Insights Generated',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.notifications': 'Notifications',
    'settings.backup': 'Backup & Restore',
  },

  'es-ES': {
    // Navigation
    'nav.dashboard': 'Panel Principal',
    'nav.transactions': 'Transacciones',
    'nav.accounts': 'Cuentas',
    'nav.recurring': 'Recurrentes',
    'nav.goals': 'Metas y Objetivos',
    'nav.budgets': 'Presupuestos',
    'nav.reports': 'Informes',
    'nav.analytics': 'Analytics IA',
    'nav.settings': 'Configuración',
    'nav.profile': 'Perfil',

    // Common
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Añadir',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.import': 'Importar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.warning': 'Advertencia',
    'common.info': 'Información',

    // Dashboard
    'dashboard.title': 'Panel Principal',
    'dashboard.balance': 'Saldo',
    'dashboard.income': 'Ingresos',
    'dashboard.expenses': 'Gastos',
    'dashboard.savings': 'Ahorros',

    // Transactions
    'transactions.title': 'Transacciones',
    'transactions.new': 'Nueva Transacción',
    'transactions.type': 'Tipo',
    'transactions.amount': 'Cantidad',
    'transactions.date': 'Fecha',
    'transactions.category': 'Categoría',
    'transactions.description': 'Descripción',

    // Analytics
    'analytics.title': 'Estadísticas de Uso de IA',
    'analytics.chatSessions': 'Sesiones de Chat',
    'analytics.messagesSent': 'Mensajes Enviados',
    'analytics.avgDuration': 'Duración Promedio',
    'analytics.insightsGenerated': 'Insights Generados',

    // Settings
    'settings.title': 'Configuración',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.notifications': 'Notificaciones',
    'settings.backup': 'Copia de Seguridad y Restauración',
  },
};

class I18nService {
  private static instance: I18nService;
  private currentLanguage: SupportedLanguage;
  private readonly STORAGE_KEY = 'user_language';

  private constructor() {
    this.currentLanguage = this.detectLanguage();
    Logger.info('I18n Service inicializado', { language: this.currentLanguage }, 'I18N');
  }

  static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  /**
   * Detecta idioma do navegador ou carrega preferência salva
   */
  private detectLanguage(): SupportedLanguage {
    try {
      // 1. Verificar preferência salva
      const saved = localStorage.getItem(this.STORAGE_KEY) as SupportedLanguage;
      if (saved && this.isSupported(saved)) {
        return saved;
      }

      // 2. Detectar idioma do navegador
      const browserLang = navigator.language;
      
      // Mapear idiomas do navegador para nossos idiomas suportados
      if (browserLang.startsWith('pt')) return 'pt-BR';
      if (browserLang.startsWith('es')) return 'es-ES';
      if (browserLang.startsWith('en')) return 'en-US';

      // Padrão: pt-BR
      return 'pt-BR';
    } catch (error) {
      Logger.error('Erro ao detectar idioma', error as Error, 'I18N');
      return 'pt-BR';
    }
  }

  /**
   * Verifica se idioma é suportado
   */
  private isSupported(lang: string): lang is SupportedLanguage {
    return ['pt-BR', 'en-US', 'es-ES'].includes(lang);
  }

  /**
   * Obter idioma atual
   */
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Alterar idioma
   */
  setLanguage(language: SupportedLanguage): void {
    try {
      if (!this.isSupported(language)) {
        throw new Error(`Idioma não suportado: ${language}`);
      }

      this.currentLanguage = language;
      localStorage.setItem(this.STORAGE_KEY, language);
      
      // Disparar evento customizado para atualizar UI
      window.dispatchEvent(new CustomEvent('languageChange', { detail: { language } }));

      Logger.info('Idioma alterado', { newLanguage: language }, 'I18N');
    } catch (error) {
      Logger.error('Erro ao alterar idioma', error as Error, 'I18N');
    }
  }

  /**
   * Traduzir texto
   */
  t(key: keyof TranslationKeys): string {
    try {
      const translation = translations[this.currentLanguage][key];
      
      if (!translation) {
        Logger.warn(`Tradução não encontrada: ${String(key)}`, undefined, 'I18N');
        return String(key); // Retorna a chave se tradução não existir
      }

      return translation;
    } catch (error) {
      Logger.error('Erro ao traduzir', error as Error, 'I18N');
      return String(key);
    }
  }

  /**
   * Traduzir com interpolação
   */
  tInterpolate(key: keyof TranslationKeys, params: Record<string, string | number>): string {
    try {
      let text = this.t(key);
      
      // Substituir {{variable}} por valores
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      });

      return text;
    } catch (error) {
      Logger.error('Erro ao interpolar tradução', error as Error, 'I18N');
      return String(key);
    }
  }

  /**
   * Obter todos os idiomas suportados
   */
  getSupportedLanguages(): Array<{ code: SupportedLanguage; name: string; flag: string }> {
    return [
      { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
      { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
      { code: 'es-ES', name: 'Español (ES)', flag: '🇪🇸' },
    ];
  }

  /**
   * Formatar número com locale
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    try {
      return new Intl.NumberFormat(this.currentLanguage, options).format(value);
    } catch (error) {
      Logger.error('Erro ao formatar número', error as Error, 'I18N');
      return value.toString();
    }
  }

  /**
   * Formatar moeda com locale
   */
  formatCurrency(value: number, currency: string = 'BRL'): string {
    try {
      return new Intl.NumberFormat(this.currentLanguage, {
        style: 'currency',
        currency,
      }).format(value);
    } catch (error) {
      Logger.error('Erro ao formatar moeda', error as Error, 'I18N');
      return value.toString();
    }
  }

  /**
   * Formatar data com locale
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    try {
      return new Intl.DateTimeFormat(this.currentLanguage, options).format(date);
    } catch (error) {
      Logger.error('Erro ao formatar data', error as Error, 'I18N');
      return date.toISOString();
    }
  }
}

export { I18nService };
export default I18nService.getInstance();
