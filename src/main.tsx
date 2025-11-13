import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import Dashboard from './components/dashboard/Dashboard';
import Reports from './components/reports/Reports';

// Componente App principal com sidebar (idêntico à pagina_home.html)
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [sidebarActive, setSidebarActive] = React.useState(false);

  // Initialize theme
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Remove loading screen when app loads
  React.useEffect(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add transition effect
    document.body.style.transition = 'all 0.5s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 500);
  };

  const toggleMobileSidebar = () => {
    setSidebarActive(!sidebarActive);
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
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleMobileSidebar}
        style={{ display: 'none' }}
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarActive ? 'active' : ''}`}
        onClick={() => setSidebarActive(false)}
      ></div>

      {/* Sidebar (estrutura idêntica ao HTML original) */}
      <div className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h3><i className="fas fa-chart-line"></i> My Financify</h3>
          <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
          </button>
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
                <i className="fas fa-home"></i> Dashboard
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
                <i className="fas fa-chart-bar"></i> Relatórios
              </a>
            </li>
            <li>
              <a href="#" className="nav-item" onClick={(e) => e.preventDefault()}>
                <i className="fas fa-exchange-alt"></i> Transações
              </a>
            </li>
            <li>
              <a href="#" className="nav-item" onClick={(e) => e.preventDefault()}>
                <i className="fas fa-bullseye"></i> Metas
              </a>
            </li>
            <li>
              <a href="#" className="nav-item" onClick={(e) => e.preventDefault()}>
                <i className="fas fa-cog"></i> Configurações
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
      <div className="main-content">
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