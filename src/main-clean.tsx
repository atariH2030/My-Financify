import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import './styles/smooth-transitions.css';
import Dashboard from './components/dashboard/Dashboard';
import Reports from './components/reports/Reports';

// Componente App principal com sidebar (idêntico à pagina_home.html)
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState('dashboard');
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

  const [isTransitioning, setIsTransitioning] = React.useState(false);

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
    setIsTransitioning(true);
    
    // Usar setTimeout para garantir que a classe seja aplicada no próximo frame
    setTimeout(() => {
      setSidebarActive(!sidebarActive);
      
      // Finalizar transição após a animação
      setTimeout(() => {
        setIsTransitioning(false);
      }, 350); // Mesmo tempo da CSS transition
    }, 16); // Um frame de delay
  };

  const logout = () => {
    if (window.confirm('Deseja realmente sair?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
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
                  setSidebarActive(false);
                }}
              >
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage('reports');
                  setSidebarActive(false);
                }}
              >
                <i className="fas fa-chart-bar"></i>
                <span>Relatórios</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-item">
                <i className="fas fa-exchange-alt"></i>
                <span>Transações</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-item">
                <i className="fas fa-bullseye"></i>
                <span>Metas</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-item">
                <i className="fas fa-cog"></i>
                <span>Configurações</span>
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
      } ${
        isTransitioning ? 'transitioning' : ''
      }`}>
        {renderPage()}
      </div>
    </>
  );
};

// Mount React App
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);