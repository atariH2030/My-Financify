import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import Dashboard from './components/dashboard/Dashboard';
import Reports from './components/reports/Reports';

// Componente App principal
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState('dashboard');

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
    <div className="app">
      {/* Navigation Header */}
      <nav className="app-navigation">
        <div className="nav-brand">
          <h1>💰 My-Financify</h1>
        </div>
        <div className="nav-links">
          <button 
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-link ${currentPage === 'reports' ? 'active' : ''}`}
            onClick={() => setCurrentPage('reports')}
          >
            📈 Relatórios
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
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