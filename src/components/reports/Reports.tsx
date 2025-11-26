import React from 'react';
import { useState } from 'react';
import Button from '../common/Button';
import ExportModal from '../export/ExportModal';
import { formatCurrency, formatPercentage } from '../../utils/currency';

interface KPICardProps {
  title: string;
  value: string;
  icon: string;
  trend: string;
  trendType: 'positive' | 'negative' | 'neutral';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, trendType }) => (
  <div className="kpi-card">
    <div className="kpi-header">
      <div className="kpi-title">{title}</div>
      <div className="kpi-icon">{icon}</div>
    </div>
    <div className="kpi-value">{value}</div>
    <div className={`kpi-trend trend-${trendType}`}>
      {trendType === 'positive' ? '↗' : trendType === 'negative' ? '↙' : '→'} {trend}
    </div>
  </div>
);

interface ReportsProps {
  className?: string;
}

const Reports: React.FC<ReportsProps> = ({ className }) => {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className={`reports-module ${className || ''}`}>
      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-card">
          <h3>🔍 Filtros de Relatório</h3>
          <div className="filter-controls">
            <div className="filter-group">
              <label>Período</label>
              <select>
                <option>Último mês</option>
                <option>Últimos 3 meses</option>
                <option>Últimos 6 meses</option>
                <option>Último ano</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Categoria</label>
              <select>
                <option>Todas as categorias</option>
                <option>Receitas</option>
                <option>Despesas</option>
                <option>Investimentos</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Data Inicial</label>
              <input type="date" />
            </div>
            <div className="filter-group">
              <label>Data Final</label>
              <input type="date" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Actions */}
      <div className="report-actions">
        <Button variant="primary" onClick={() => setShowExportModal(true)}>
          📥 Exportar Dados
        </Button>
        <button className="btn-powerbi">
          📈 Abrir no Power BI
        </button>
      </div>

      {/* Export Modal */}
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />

      {/* KPI Grid */}
      <div className="kpi-grid">
        <KPICard
          title="Receita Total"
          value={formatCurrency(45230)}
          icon="💰"
          trend="+12,5% vs mês anterior"
          trendType="positive"
        />
        <KPICard
          title="Despesas Totais"
          value={formatCurrency(32150)}
          icon="💸"
          trend="+3,2% vs mês anterior"
          trendType="negative"
        />
        <KPICard
          title="Lucro Líquido"
          value={formatCurrency(13080)}
          icon="📈"
          trend="+28,7% vs mês anterior"
          trendType="positive"
        />
        <KPICard
          title="ROI Investimentos"
          value={formatPercentage(8.4)}
          icon="🎯"
          trend="Estável"
          trendType="neutral"
        />
      </div>

      {/* Charts Container */}
      <div className="charts-container">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Evolução Mensal</div>
              <div className="chart-subtitle">Receitas vs Despesas</div>
            </div>
          </div>
          <div className="chart-container">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              background: 'var(--gradient-primary)',
              color: 'white',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              📊 Chart.js será integrado aqui
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Distribuição por Categoria</div>
              <div className="chart-subtitle">Gastos do mês</div>
            </div>
          </div>
          <div className="chart-container">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              background: 'var(--gradient-purple)',
              color: 'white',
              borderRadius: 'var(--border-radius-md)',
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              🥧 Pizza Chart aqui
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="data-table-container">
        <div className="table-header">
          <div className="table-title">📋 Transações Recentes</div>
          <div className="table-actions">
            <button className="btn-export">Exportar</button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>15/01/2024</td>
              <td>Salário Janeiro</td>
              <td>Renda</td>
              <td className="money-positive">{formatCurrency(8500)}</td>
              <td>Receita</td>
            </tr>
            <tr>
              <td>14/01/2024</td>
              <td>Aluguel Apartamento</td>
              <td>Moradia</td>
              <td className="money-negative">{formatCurrency(-2200)}</td>
              <td>Despesa</td>
            </tr>
            <tr>
              <td>12/01/2024</td>
              <td>Supermercado</td>
              <td>Alimentação</td>
              <td className="money-negative">{formatCurrency(-345.50)}</td>
              <td>Despesa</td>
            </tr>
            <tr>
              <td>10/01/2024</td>
              <td>Investimento CDB</td>
              <td>Investimento</td>
              <td className="money-neutral">{formatCurrency(1000)}</td>
              <td>Aplicação</td>
            </tr>
            <tr>
              <td>08/01/2024</td>
              <td>Freelance Design</td>
              <td>Renda Extra</td>
              <td className="money-positive">{formatCurrency(1200)}</td>
              <td>Receita</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;