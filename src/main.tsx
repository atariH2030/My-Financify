import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import './styles/smooth-transitions.css';

// 🧪 MODO TESTE DE AUTENTICAÇÃO
// Descomente a linha abaixo para voltar ao app normal
import AuthDemo from './components/auth/AuthDemo';

/* 
// App normal (comentado temporariamente)
import Dashboard from './components/dashboard/Dashboard';
import DashboardV2 from './components/dashboard/DashboardV2';
import Transactions from './components/transactions/Transactions';
import Reports from './components/reports/Reports';
import ReportsAdvanced from './components/reports/ReportsAdvanced';
import Goals from './components/goals/Goals';
import Budgets from './components/budgets/Budgets';
import Settings from './components/settings/Settings';
import NotificationCenter from './components/notifications/NotificationCenter';
import Accounts from './components/accounts/Accounts';
import RecurringTransactions from './components/recurring/RecurringTransactions';
import { ErrorBoundary, ToastProvider } from './components/common';
import { ToastEnhancedProvider } from './components/common';
import { useKeyboardShortcuts, KeyboardShortcutsHelp, type KeyboardShortcut } from './components/common';
import CommandPalette from './components/common/CommandPalette';
import Fase2Example from './components/common/Fase2Example';
*/

import Logger from './services/logger.service';
import Seeder from './services/seeder.service';
import MigrationService from './services/migration.service';
// Inicializa Supabase
import './config/supabase.config';

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
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [showShortcutsHelp, setShowShortcutsHelp] = React.useState(false);
  const [showCommandPalette, setShowCommandPalette] = React.useState(false);
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
  // KEYBOARD SHORTCUTS - Atalhos de teclado globais
  // ============================================================================
  
  const shortcuts: KeyboardShortcut[] = [
    // Navegação
    {
      key: 'd',
      ctrl: true,
      description: 'Ir para Dashboard',
      action: () => setCurrentPage('dashboard'),
      category: 'navigation',
    },
    {
      key: 't',
      ctrl: true,
      description: 'Ir para Transações',
      action: () => setCurrentPage('transactions'),
      category: 'navigation',
    },
    {
      key: 'g',
      ctrl: true,
      description: 'Ir para Metas',
      action: () => setCurrentPage('goals'),
      category: 'navigation',
    },
    {
      key: 'r',
      ctrl: true,
      description: 'Ir para Relatórios',
      action: () => setCurrentPage('reports'),
      category: 'navigation',
    },
    {
      key: 'b',
      ctrl: true,
      description: 'Ir para Orçamentos',
      action: () => setCurrentPage('budgets'),
      category: 'navigation',
    },
    {
      key: ',',
      ctrl: true,
      description: 'Ir para Configurações',
      action: () => setCurrentPage('settings'),
      category: 'navigation',
    },
    // Ações Rápidas
    {
      key: 'k',
      ctrl: true,
      description: 'Abrir Busca Global (Command Palette)',
      action: () => setShowCommandPalette(true),
      category: 'actions',
    },
    {
      key: 'b',
      ctrl: true,
      shift: true,
      description: 'Abrir/Fechar Sidebar',
      action: toggleSidebar,
      category: 'actions',
    },
    {
      key: 'l',
      ctrl: true,
      description: 'Alternar Tema (Light/Dark)',
      action: toggleTheme,
      category: 'actions',
    },
    // Geral
    {
      key: '/',
      ctrl: true,
      description: 'Mostrar Atalhos de Teclado',
      action: () => setShowShortcutsHelp(true),
      category: 'general',
    },
    {
      key: 'h',
      ctrl: true,
      description: 'Ajuda - Atalhos de Teclado',
      action: () => setShowShortcutsHelp(true),
      category: 'general',
    },
    {
      key: 'Escape',
      description: 'Fechar Modal/Diálogos',
      action: () => setShowShortcutsHelp(false),
      category: 'general',
    },
  ];

  // Registrar atalhos
  useKeyboardShortcuts({ shortcuts });

  const logout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderPage = () => {
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
      case 'settings':
        return <Settings />;
      case 'fase2-demo':
        return <Fase2Example />;
      default:
        return <DashboardV2 />;
    }
  };

  return (
    <>
      {/* Notification Center - Fixo no canto superior direito */}
      <NotificationCenter />

      {/* Keyboard Shortcuts Button - Fixo ao lado do NotificationCenter */}
      <button 
        className="keyboard-shortcuts-btn"
        onClick={() => setShowShortcutsHelp(true)}
        title="Atalhos de Teclado (Ctrl+H)"
      >
        <i className="fas fa-keyboard"></i>
      </button>

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
                <span>Painel Principal</span>
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
                <span>Relatórios</span>
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
                <span>Análise Avançada</span>
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
                <span>Receitas e Despesas</span>
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
                <span>Minhas Contas</span>
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
                <span>Contas Recorrentes</span>
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
                <span>Metas e Objetivos</span>
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
                <span>Orçamentos</span>
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
                <span>Configurações</span>
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
          <div className="user-profile">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="user-info">
              <span className="user-name">Usuário</span>
              <small className="user-email">usuario@email.com</small>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i> Sair
          </button>
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
    </>
  );
};

// Mount React App
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
// 🧪 RENDER - Modo Teste de Autenticação
root.render(
  <React.StrictMode>
    <AuthDemo />
  </React.StrictMode>
);

/* 
// App normal (temporariamente desativado para teste)
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <ToastEnhancedProvider position="top-right" maxToasts={5}>
          <App />
        </ToastEnhancedProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
*/

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