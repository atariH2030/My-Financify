/**
 * Financy Life - Main Entry Point
 * Arquitetura moderna com TypeScript, modularização e error handling robusto
 */

import Logger from './services/logger.service.js';
import Storage from './services/storage.service.js';
import { AppController } from './app.controller.js';
import './styles/globals.css';

// Global error handler
window.addEventListener('error', (event) => {
  Logger.error('Erro não capturado', event.error, 'GLOBAL');
  showErrorBoundary();
});

window.addEventListener('unhandledrejection', (event) => {
  Logger.error('Promise rejeitada não capturada', new Error(event.reason), 'GLOBAL');
  event.preventDefault();
});

/**
 * Inicialização da aplicação
 */
async function initializeApp(): Promise<void> {
  try {
    Logger.info('🚀 Inicializando Financy Life v2.0.0', undefined, 'MAIN');
    
    // Verificar suporte do browser
    if (!checkBrowserSupport()) {
      throw new Error('Browser não suportado');
    }

    // Inicializar serviços
    await initializeServices();
    
    // Carregar dados persistidos
    await loadPersistedData();
    
    // Inicializar controlador principal
    const appController = new AppController();
    await appController.initialize();
    
    // Carregar dados financeiros
    await appController.loadFinancialData();
    
    // Tornar AppController globalmente acessível para debugging
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      (window as any).app = appController;
      Logger.debug('🔧 AppController disponível globalmente como window.app', undefined, 'MAIN');
    }
    
    // Remover loading screen
    hideLoadingScreen();
    
    Logger.info('✅ Aplicação inicializada com sucesso', undefined, 'MAIN');

  } catch (error) {
    Logger.error('❌ Falha crítica na inicialização', error as Error, 'MAIN');
    showErrorBoundary();
  }
}

/**
 * Verifica suporte do browser
 */
function checkBrowserSupport(): boolean {
  const requiredFeatures = [
    'localStorage' in window,
    'fetch' in window,
    'Promise' in window,
    'CSS' in window && 'supports' in CSS
  ];

  const isSupported = requiredFeatures.every(feature => feature);
  
  if (!isSupported) {
    Logger.error('Browser não possui recursos necessários', undefined, 'MAIN');
  }
  
  return isSupported;
}

/**
 * Inicializa serviços da aplicação
 */
async function initializeServices(): Promise<void> {
  try {
    // Configurar logger baseado no ambiente
    const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    Logger.setLogLevel(isDevelopment ? 0 : 2); // DEBUG em dev, WARN+ em prod
    
    // Verificar integridade do storage
    const storageInfo = Storage.getStorageInfo();
    Logger.info('📦 Storage inicializado', storageInfo, 'STORAGE');
    
    // Configurar service worker (futuro PWA)
    if ('serviceWorker' in navigator) {
      Logger.debug('Service Worker disponível para futuras funcionalidades', undefined, 'MAIN');
    }

  } catch (error) {
    Logger.error('Falha ao inicializar serviços', error as Error, 'MAIN');
    throw error;
  }
}

/**
 * Carrega dados persistidos anteriormente
 */
async function loadPersistedData(): Promise<void> {
  try {
    // Verificar se há dados da versão anterior (migração)
    const legacyData = localStorage.getItem('financialData');
    if (legacyData) {
      Logger.info('📊 Dados legados detectados, iniciando migração...', undefined, 'MIGRATION');
      await migrateLegacyData(JSON.parse(legacyData));
    }

    Logger.info('📂 Dados persistidos carregados', undefined, 'MAIN');

  } catch (error) {
    Logger.warn('Falha ao carregar dados persistidos', error, 'MAIN');
    // Não é crítico, aplicação pode continuar
  }
}

/**
 * Migra dados da versão anterior
 */
async function migrateLegacyData(legacyData: any): Promise<void> {
  try {
    // Salvar dados no novo formato
    await Storage.save('financial-data', legacyData, { backup: true });
    
    // Remover dados antigos após migração bem-sucedida
    localStorage.removeItem('financialData');
    
    Logger.info('✅ Migração de dados concluída com sucesso', undefined, 'MIGRATION');

  } catch (error) {
    Logger.error('Falha na migração de dados', error as Error, 'MIGRATION');
    // Manter dados antigos em caso de falha
  }
}

/**
 * Remove tela de loading
 */
function hideLoadingScreen(): void {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 300);
  }
}

/**
 * Mostra tela de erro
 */
function showErrorBoundary(): void {
  const errorBoundary = document.getElementById('error-boundary');
  const loadingScreen = document.getElementById('loading-screen');
  
  if (loadingScreen) loadingScreen.style.display = 'none';
  if (errorBoundary) errorBoundary.style.display = 'flex';
}

/**
 * Performance monitoring
 */
function trackPerformance(): void {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      Logger.info('⚡ Performance', {
        loadTime: `${loadTime}ms`,
        domContentLoaded: `${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`
      }, 'PERFORMANCE');
    });
  }
}

// Inicializar aplicação quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Track performance
trackPerformance();