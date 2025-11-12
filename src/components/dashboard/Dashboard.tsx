import React from 'react';

interface OverviewCardProps {
  title: string;
  value: string;
  icon: string;
  trend?: string;
  className?: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, icon, trend, className }) => (
  <div className={`overview-card ${className || ''}`}>
    <div className="overview-header">
      <h3>{title}</h3>
      <span className="overview-icon">{icon}</span>
    </div>
    <div className="overview-value">{value}</div>
    {trend && <div className="overview-trend">{trend}</div>}
  </div>
);

interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  return (
    <div className={`dashboard-container ${className || ''}`}>
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📊 Dashboard Financeiro</h1>
          <p>Visão geral das suas finanças</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            ➕ Nova Transação
          </button>
        </div>
      </header>

      {/* Overview Section */}
      <section className="overview-section">
        <div className="overview-grid">
          <OverviewCard
            title="Saldo Total"
            value="R$ 15.430,50"
            icon="💰"
            trend="+12.5% este mês"
            className="card-primary"
          />
          <OverviewCard
            title="Receitas"
            value="R$ 8.500,00"
            icon="📈"
            trend="+5.2% vs mês anterior"
            className="card-success"
          />
          <OverviewCard
            title="Despesas"
            value="R$ 3.850,25"
            icon="📉"
            trend="+8.1% vs mês anterior"
            className="card-warning"
          />
          <OverviewCard
            title="Investimentos"
            value="R$ 12.250,00"
            icon="📊"
            trend="+15.7% este ano"
            className="card-info"
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <h2>⚡ Ações Rápidas</h2>
        <div className="quick-actions-grid">
          <button className="quick-action-btn income">
            <span className="action-icon">💵</span>
            <span className="action-text">Adicionar Receita</span>
          </button>
          <button className="quick-action-btn expense">
            <span className="action-icon">💸</span>
            <span className="action-text">Registrar Gasto</span>
          </button>
          <button className="quick-action-btn investment">
            <span className="action-icon">📈</span>
            <span className="action-text">Novo Investimento</span>
          </button>
          <button className="quick-action-btn transfer">
            <span className="action-icon">🔄</span>
            <span className="action-text">Transferência</span>
          </button>
        </div>
      </section>

      {/* Charts Section */}
      <section className="charts-section">
        <div className="charts-grid">
          <div className="chart-container">
            <h3>📊 Evolução Mensal</h3>
            <div className="chart-placeholder">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '200px',
                background: 'var(--gradient-primary)',
                color: 'white',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                📈 Gráfico Chart.js aqui
              </div>
            </div>
          </div>
          
          <div className="chart-container">
            <h3>🥧 Gastos por Categoria</h3>
            <div className="chart-placeholder">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '200px',
                background: 'var(--gradient-purple)',
                color: 'white',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                🍰 Pizza Chart aqui
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="recent-transactions">
        <div className="section-header">
          <h2>📋 Transações Recentes</h2>
          <button className="btn-secondary">Ver todas</button>
        </div>
        <div className="transactions-list">
          <div className="transaction-item income">
            <div className="transaction-icon">💰</div>
            <div className="transaction-details">
              <div className="transaction-description">Salário Janeiro</div>
              <div className="transaction-date">15/01/2024</div>
            </div>
            <div className="transaction-amount positive">+R$ 8.500,00</div>
          </div>
          
          <div className="transaction-item expense">
            <div className="transaction-icon">🏠</div>
            <div className="transaction-details">
              <div className="transaction-description">Aluguel</div>
              <div className="transaction-date">05/01/2024</div>
            </div>
            <div className="transaction-amount negative">-R$ 2.200,00</div>
          </div>
          
          <div className="transaction-item expense">
            <div className="transaction-icon">🛒</div>
            <div className="transaction-details">
              <div className="transaction-description">Supermercado</div>
              <div className="transaction-date">03/01/2024</div>
            </div>
            <div className="transaction-amount negative">-R$ 345,50</div>
          </div>
          
          <div className="transaction-item investment">
            <div className="transaction-icon">📈</div>
            <div className="transaction-details">
              <div className="transaction-description">Investimento CDB</div>
              <div className="transaction-date">01/01/2024</div>
            </div>
            <div className="transaction-amount neutral">R$ 1.000,00</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;