import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import './styles/smooth-transitions.css';
import './styles/mobile-ux-fixes.css'; // ✅ Mobile UX Fixes v3.14.0 - WCAG 2.5.5 compliance
import './utils/i18n-validator'; // ✅ Auto-valida traduções ao iniciar

// ✅ APP NORMAL COM AUTENTICAÇÃO INTEGRADA
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserHeader from './components/auth/UserHeader';
import OnlineStatus from './components/common/OnlineStatus';
import SyncIndicator from './components/common/SyncIndicator';
import AIChatButton from './components/common/AIChatButton';

// Core Components (carregados imediatamente)
import {ErrorBoundary, ToastProvider, ToastEnhancedProvider, useKeyboardShortcuts, KeyboardShortcutsHelp, type KeyboardShortcut} from './components/common';
import CommandPalette from './components/common/CommandPalette';
import GlobalCommandPalette from './components/common/GlobalCommandPalette';
import ThemeCustomizer from './components/common/ThemeCustomizer';
import LanguageSelector from './components/common/LanguageSelector';
import WidgetCustomizer from './components/dashboard/WidgetCustomizer';
import WorkspaceSwitcher from './components/workspace/WorkspaceSwitcher';

// Lazy Loading Components (carregados sob demanda)
const LandingPage = lazy(() => import('./components/landing/LandingPage'));
const DashboardV2 = lazy(() => import('./components/dashboard/DashboardV2'));
const Transactions = lazy(() => import('./components/transactions/Transactions'));
const Reports = lazy(() => import('./components/reports/Reports'));
const ReportsAdvanced = lazy(() => import('./components/reports/ReportsAdvanced'));
const Goals = lazy(() => import('./components/goals/Goals'));
const Budgets = lazy(() => import('./components/budgets/Budgets'));
const Settings = lazy(() => import('./components/settings/Settings'));
const ProfilePage = lazy(() => import('./components/profile/ProfilePage'));
const NotificationCenter = lazy(() => import('./components/notifications/NotificationCenter'));
const Accounts = lazy(() => import('./components/accounts/Accounts'));
const RecurringTransactions = lazy(() => import('./components/recurring/RecurringTransactions'));
const Fase2Example = lazy(() => import('./components/common/Fase2Example'));
const AIAnalyticsDashboard = lazy(() => import('./components/analytics/AIAnalyticsDashboard'));
const WorkspaceSettings = lazy(() => import('./components/workspace/WorkspaceSettings'));

import Logger from './services/logger.service';
import Seeder from './services/seeder.service';
import MigrationService from './services/migration.service';
import AnalyticsService from './services/analytics.service';
import { sentry } from './services/sentry.service';
// Inicializa Supabase
import './config/supabase.config';

// Inicializar serviços de monitoramento
sentry.initialize();
AnalyticsService.initializeGA().catch((error) => {
  Logger.error('Failed to initialize Google Analytics', error as Error, 'APP');
});

// Executa migrações antes do seeder
MigrationService.runMigrations()
  .then(() => {
    Logger.info('✅ Migrações concluídas', undefined, 'APP');
  })
  .catch(error => {
    Logger.error('Falha nas migrações', error as Error, 'APP');
  });

// Inicializa Database Seeder automaticamente em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  Seeder.seed({ forceReset: false })
    .then(() => Seeder.getStats())
    .then(stats => {
      Logger.info('📊 Database Stats', stats, 'APP');
    })
    .catch(error => {
      Logger.error('Falha ao executar seeder', error as Error, 'APP');
    });
}

// Componente App principal com sidebar
const App: React.FC = () => {
  // ============================================================================
  // HOOKS DE TRADUÇÃO
  // ============================================================================
  const { t } = useLanguage();
  
  // ============================================================================
  // ESTADOS
  // ============================================================================
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [showShortcutsHelp, setShowShortcutsHelp] = React.useState(false);
  const [showCommandPalette, setShowCommandPalette] = React.useState(false);
  const [showGlobalCommandPalette, setShowGlobalCommandPalette] = React.useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = React.useState(false);
  const [showWidgetCustomizer, setShowWidgetCustomizer] = React.useState(false);
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [sidebarActive, setSidebarActive] = React.useState(() => {
    // Carregar estado salvo ou usar padrão baseado no tamanho da tela
    const savedState = localStorage.getItem('sidebarActive');
    if (savedState !== null) {
      return JSON.parse(savedState);
    }
    // Padrão: ativo em desktop, inativo em mobile
    return window.innerWidth > 768;
  });

  // Atualizar tema no DOM
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme;
  }, [theme]);

  // Salvar estado do sidebar
  React.useEffect(() => {
    localStorage.setItem('sidebarActive', JSON.stringify(sidebarActive));
  }, [sidebarActive]);

  // Listener para navegação via eventos customizados (ex: UserHeader)
  React.useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setCurrentPage(customEvent.detail);
        // Fechar sidebar em mobile
        if (window.innerWidth <= 768) {
          setSidebarActive(false);
        }
      }
    };

    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  // Responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const savedState = localStorage.getItem('sidebarActive');
      
      if (width <= 768 && sidebarActive) {
        // Mobile: sempre fechar sidebar
        setSidebarActive(false);
      } else if (width > 768 && !sidebarActive && savedState === null) {
        // Desktop sem estado salvo: abrir por padrão
        setSidebarActive(true);
      }
    };

    // Detectar mudanças de tamanho
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarActive]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  // ============================================================================
  // KEYBOARD SHORTCUTS - Atalhos de teclado globais com traduções
  // ============================================================================
  
  const shortcuts: KeyboardShortcut[] = React.useMemo(() => [
    // Navegação
    {
      key: 'd',
      ctrl: true,
      description: t('shortcuts.dashboard'),
      action: () => setCurrentPage('dashboard'),
      category: 'navigation',
    },
    {
      key: 't',
      ctrl: true,
      description: t('shortcuts.transactions'),
      action: () => setCurrentPage('transactions'),
      category: 'navigation',
    },
    {
      key: 'g',
      ctrl: true,
      description: t('shortcuts.goals'),
      action: () => setCurrentPage('goals'),
      category: 'navigation',
    },
    {
      key: 'r',
      ctrl: true,
      description: t('shortcuts.reports'),
      action: () => setCurrentPage('reports'),
      category: 'navigation',
    },
    {
      key: 'a',
      ctrl: true,
      description: t('shortcuts.analytics'),
      action: () => setCurrentPage('analytics'),
      category: 'navigation',
    },
    {
      key: 'b',
      ctrl: true,
      description: t('shortcuts.budgets'),
      action: () => setCurrentPage('budgets'),
      category: 'navigation',
    },
    {
      key: ',',
      ctrl: true,
      description: t('shortcuts.settings'),
      action: () => setCurrentPage('settings'),
      category: 'navigation',
    },
    // Ações Rápidas
    {
      key: 'k',
      ctrl: true,
      description: t('shortcuts.commandPalette'),
      action: () => setShowCommandPalette(true),
      category: 'actions',
    },
    {
      key: 'b',
      ctrl: true,
      shift: true,
      description: t('shortcuts.toggleSidebar'),
      action: toggleSidebar,
      category: 'actions',
    },
    {
      key: 'l',
      ctrl: true,
      description: t('shortcuts.toggleTheme'),
      action: toggleTheme,
      category: 'actions',
    },
    {
      key: 't',
      ctrl: true,
      shift: true,
      description: t('shortcuts.themeCustomizer'),
      action: () => setShowThemeCustomizer(true),
      category: 'actions',
    },
    {
      key: 'w',
      ctrl: true,
      description: t('shortcuts.widgetCustomizer'),
      action: () => setShowWidgetCustomizer(true),
      category: 'actions',
    },
    // Geral
    {
      key: '/',
      ctrl: true,
      description: t('shortcuts.showHelp'),
      action: () => setShowShortcutsHelp(true),
      category: 'general',
    },
    {
      key: 'p',
      ctrl: true,
      description: t('shortcuts.globalPalette'),
      action: () => setShowGlobalCommandPalette(true),
      category: 'general',
    },
    {
      key: 'h',
      ctrl: true,
      description: t('shortcuts.help'),
      action: () => setShowShortcutsHelp(true),
      category: 'general',
    },
    {
      key: 'Escape',
      description: t('shortcuts.closeModal'),
      action: () => {
        setShowShortcutsHelp(false);
        setShowGlobalCommandPalette(false);
        setShowThemeCustomizer(false);
      },
      category: 'general',
    },
  ], [t, setCurrentPage, toggleSidebar, toggleTheme]);

  // Registrar atalhos
  useKeyboardShortcuts({ shortcuts });

  const renderPage = () => {
    // Loading fallback para componentes lazy
    const LoadingFallback = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner" style={{
          width: '48px',
          height: '48px',
          border: '4px solid var(--border-color)',
          borderTopColor: 'var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Carregando...</p>
      </div>
    );

    const pageContent = () => {
      switch (currentPage) {
        case 'dashboard':
          return <DashboardV2 />;
        case 'transactions':
          return <Transactions />;
        case 'accounts':
          return <Accounts />;
        case 'recurring':
          return <RecurringTransactions />;
        case 'goals':
          return <Goals />;
        case 'budgets':
          return <Budgets />;
        case 'reports':
          return <Reports />;
        case 'reports-advanced':
          return <ReportsAdvanced />;
        case 'analytics':
          return <AIAnalyticsDashboard />;
        case 'settings':
          return <Settings />;
        case 'workspace-settings':
          return <WorkspaceSettings />;
        case 'profile':
          return <ProfilePage />;
        case 'fase2-demo':
          return <Fase2Example />;
        default:
          return <DashboardV2 />;
      }
    };

    return (
      <Suspense fallback={<LoadingFallback />}>
        {pageContent()}
      </Suspense>
    );
  };

  return (
    <>
      {/* Notification Center - Fixed top-right (unchanged) */}
      <NotificationCenter />

      {/* Top-Right Controls - Language + Keyboard (ao lado esquerdo do sininho) */}
      <div className="top-right-controls">
        <LanguageSelector />
        <button 
          className="keyboard-shortcuts-btn"
          onClick={() => setShowShortcutsHelp(true)}
          title="Atalhos de Teclado (Ctrl+H)"
        >
          <i className="fas fa-keyboard"></i>
        </button>
      </div>

      {/* Botão flutuante para abrir sidebar quando fechado */}
      {!sidebarActive && (
        <button 
          className="floating-toggle-btn"
          onClick={toggleSidebar}
          title="Abrir sidebar"
        >
          <i className="fas fa-bars"></i>
        </button>
      )}

      {/* Mobile Sidebar Toggle - apenas visível no mobile */}
      <button 
        className="mobile-sidebar-toggle" 
        onClick={toggleSidebar}
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarActive ? 'active' : ''}`}
        onClick={() => setSidebarActive(false)}
      ></div>

      {/* Sidebar (estrutura idêntica ao HTML original) */}
      <div className={`sidebar ${sidebarActive ? 'active' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <h3><i className="fas fa-chart-line"></i> My Financify</h3>
            {/* User Header - Mostra usuário logado */}
            <UserHeader />
          </div>
          <div className="sidebar-header-bottom">
            <button className="sidebar-toggle" onClick={toggleSidebar} title="Alternar sidebar">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
              <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
            </button>
          </div>
        </div>
        
        {/* Workspace Switcher */}
        <WorkspaceSwitcher onCreateNew={() => {
          // TODO: Abrir modal de criação de workspace
          console.log('Criar novo workspace');
        }} />
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('dashboard');
                  // Fecha sidebar apenas no mobile
                  if (window.innerWidth <= 768) {
                    setSidebarActive(false);
                  }
                }}
              >
                <i className="fas fa-tachometer-alt"></i>
                <span>{t('nav.dashboard')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('reports');
                  // Fecha sidebar apenas no mobile
                  if (window.innerWidth <= 768) {
                    setSidebarActive(false);
                  }
                }}
              >
                <i className="fas fa-chart-bar"></i>
                <span>{t('nav.reports')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'reports-advanced' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('reports-advanced');
                  // Fecha sidebar apenas no mobile
                  if (window.innerWidth <= 768) {
                    setSidebarActive(false);
                  }
                }}
              >
                <i className="fas fa-chart-line"></i>
                <span>{t('nav.reportsAdvanced')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('analytics');
                  // Fecha sidebar apenas no mobile
                  if (window.innerWidth <= 768) {
                    setSidebarActive(false);
                  }
                }}
              >
                <i className="fas fa-brain"></i>
                <span>{t('nav.analytics')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'transactions' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('transactions');
                  // Fecha sidebar apenas no mobile
                  if (window.innerWidth <= 768) {
                    setSidebarActive(false);
                  }
                }}
              >
                <i className="fas fa-wallet"></i>
                <span>{t('nav.transactions')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'accounts' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('accounts');
                  // Fecha sidebar apenas no mobile
                  if (window.innerWidth <= 768) {
                    setSidebarActive(false);
                  }
                }}
              >
                <i className="fas fa-credit-card"></i>
                <span>{t('nav.accounts')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'recurring' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('recurring');
                  // Fecha sidebar apenas no mobile
                  if (window.innerWidth <= 768) {
                    setSidebarActive(false);
                  }
                }}
              >
                <i className="fas fa-sync-alt"></i>
                <span>{t('nav.recurring')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'goals' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('goals');
                  // Fecha sidebar apenas no mobile
                  if (window.innerWidth <= 768) {
                    setSidebarActive(false);
                  }
                }}
              >
                <i className="fas fa-bullseye"></i>
                <span>{t('nav.goals')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'budgets' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('budgets');
                  // Fecha sidebar apenas no mobile
                  if (window.innerWidth <= 768) {
                    setSidebarActive(false);
                  }
                }}
              >
                <i className="fas fa-wallet"></i>
                <span>{t('nav.budgets')}</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('settings');
                  if (window.innerWidth <= 768) {
                    setSidebarActive(false);
                  }
                }}
              >
                <i className="fas fa-cog"></i>
                <span>{t('nav.settings')}</span>
              </a>
            </li>
            {/* 🆕 Workspace Settings */}
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'workspace-settings' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('workspace-settings');
                  if (window.innerWidth <= 768) {
                    setSidebarActive(false);
                  }
                }}
              >
                <i className="fas fa-users-cog"></i>
                <span>Workspace</span>
              </a>
            </li>
            {/* 🆕 Demo Fase 2 */}
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'fase2-demo' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('fase2-demo');
                  if (window.innerWidth <= 768) {
                    setSidebarActive(false);
                  }
                }}
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 600
                }}
              >
                <i className="fas fa-flask"></i>
                <span>🎓 Fase 2 Demo</span>
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          {/* Sync Indicator - Status de conexão com opção de reconectar */}
          <SyncIndicator />
        </div>
      </div>

      {/* Main Content (estrutura idêntica ao HTML) */}
      <div className={`main-content ${
        sidebarActive ? 'sidebar-active' : 'sidebar-collapsed'
      }`}>
        {renderPage()}
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        shortcuts={shortcuts}
        onClose={() => setShowShortcutsHelp(false)}
      />

      {/* Command Palette - Busca Global */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={(page) => {
          setCurrentPage(page);
          setShowCommandPalette(false);
        }}
      />

      {/* Global Command Palette - Navegação Rápida (Ctrl+P) */}
      <GlobalCommandPalette
        isOpen={showGlobalCommandPalette}
        onClose={() => setShowGlobalCommandPalette(false)}
        onNavigate={(page) => {
          setCurrentPage(page);
          if (window.innerWidth <= 768) {
            setSidebarActive(false);
          }
        }}
      />

      {/* Theme Customizer - Personalização de Temas (Ctrl+Shift+T) */}
      <ThemeCustomizer
        isOpen={showThemeCustomizer}
        onClose={() => setShowThemeCustomizer(false)}
      />

      {/* Widget Customizer - Sprint 6.1 (Ctrl+W) */}
      <WidgetCustomizer
        isOpen={showWidgetCustomizer}
        onClose={() => setShowWidgetCustomizer(false)}
        onApply={() => {
          // Refresh dashboard widgets
          if (currentPage === 'dashboard') {
            window.location.reload();
          }
        }}
      />

      {/* AI Chat Button - Canto inferior direito */}
      <AIChatButton />
    </>
  );
};

// Mount React App
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

// Estado de rota global simples
let currentRoute = window.location.hash.replace('#', '') || '/';

const RootApp: React.FC = () => {
  const [route, setRoute] = React.useState(currentRoute);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const handleHashChange = () => {
      const newRoute = window.location.hash.replace('#', '') || '/';
      setRoute(newRoute);
      currentRoute = newRoute;
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Verificar autenticação
    const session = localStorage.getItem('supabase.auth.token');
    setIsAuthenticated(!!session);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Função global de navegação
  (window as any).navigateTo = (path: string) => {
    window.location.hash = path;
  };

  const renderContent = () => {
    // Se não autenticado e não está em rota pública, mostrar landing/login
    if (!isAuthenticated && !route.startsWith('/login') && !route.startsWith('/register') && route !== '/') {
      return (
        <Suspense fallback={<div className="loading">Carregando...</div>}>
          <LandingPage />
        </Suspense>
      );
    }

    // Rotas públicas
    if (route === '/' || route === '') {
      return (
        <Suspense fallback={<div className="loading">Carregando...</div>}>
          <LandingPage />
        </Suspense>
      );
    }

    // Rotas autenticadas
    return (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    );
  };

  return renderContent();
};

// ✅ APP COM ROUTING SIMPLES
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <ToastProvider>
              <ToastEnhancedProvider position="top-right" maxToasts={5}>
                <RootApp />
              </ToastEnhancedProvider>
            </ToastProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Função para esconder loading screen de forma robusta
const hideLoadingScreen = () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    // Backup: remover após animação
    setTimeout(() => {
      if (loadingScreen.parentNode) {
        loadingScreen.parentNode.removeChild(loadingScreen);
      }
    }, 500);
  }
};

// Esconder loading screen após React carregar
setTimeout(hideLoadingScreen, 100);

// Backup case: esconder loading screen quando a página estiver totalmente carregada
if (document.readyState === 'complete') {
  hideLoadingScreen();
} else {
  window.addEventListener('load', hideLoadingScreen);
}