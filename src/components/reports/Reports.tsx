import React, { useState, useEffect, useCallback } from 'react';
import Button from '../common/Button';
import ExportModal from '../export/ExportModal';
import { formatCurrency, formatPercentage } from '../../utils/currency';
import { transactionsService } from '../../services/transactions.service';
import type { Transaction } from '../../types/financial.types';

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [period, setPeriod] = useState<'month' | '3months' | '6months' | 'year' | 'custom'>('month');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calcular datas baseadas no período
      const now = new Date();
      let filterStartDate = startDate;
      let filterEndDate = endDate;
      
      if (period !== 'custom') {
        const start = new Date();
        switch (period) {
          case 'month':
            start.setMonth(start.getMonth() - 1);
            break;
          case '3months':
            start.setMonth(start.getMonth() - 3);
            break;
          case '6months':
            start.setMonth(start.getMonth() - 6);
            break;
          case 'year':
            start.setFullYear(start.getFullYear() - 1);
            break;
        }
        filterStartDate = start.toISOString().split('T')[0];
        filterEndDate = now.toISOString().split('T')[0];
      }
      
      const [transactionsData, _summaryData] = await Promise.all([
        transactionsService.getTransactions(),
        transactionsService.getFinancialSummary()
      ]);
      
      // Aplicar filtros
      let filtered = transactionsData || [];
      
      // Filtro de data
      if (filterStartDate && filterEndDate) {
        const start = new Date(filterStartDate);
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(t => {
          const date = new Date(t.date);
          return date >= start && date <= end;
        });
      }
      
      // Filtro de categoria
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.type === categoryFilter);
      }
      
      // Recalcular summary com dados filtrados
      const filteredSummary = {
        income: filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expenses: filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        balance: 0,
        transactionCount: filtered.length
      };
      filteredSummary.balance = filteredSummary.income - filteredSummary.expenses;
      
      setTransactions(filtered);
      setSummary(filteredSummary);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [period, categoryFilter, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className={`reports-module ${className || ''}`}>
      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-card">
          <h3>🔍 Filtros de Relatório</h3>
          <div className="filter-controls">
            <div className="filter-group">
              <label>Período</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value as any)}>
                <option value="month">Último mês</option>
                <option value="3months">Últimos 3 meses</option>
                <option value="6months">Últimos 6 meses</option>
                <option value="year">Último ano</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Categoria</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)}>
                <option value="all">Todas as categorias</option>
                <option value="income">📈 Receitas</option>
                <option value="expense">📉 Despesas</option>
              </select>
            </div>
            {period === 'custom' && (
              <>
                <div className="filter-group">
                  <label>Data Inicial</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>Data Final</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
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
          value={formatCurrency(summary.income)}
          icon="💰"
          trend={loading ? 'Carregando...' : `${summary.transactionCount} transações`}
          trendType="positive"
        />
        <KPICard
          title="Despesas Totais"
          value={formatCurrency(summary.expenses)}
          icon="💸"
          trend={loading ? 'Carregando...' : 'Total do mês'}
          trendType="negative"
        />
        <KPICard
          title="Saldo"
          value={formatCurrency(summary.balance)}
          icon="📈"
          trend={summary.balance >= 0 ? 'Positivo' : 'Atenção'}
          trendType={summary.balance >= 0 ? 'positive' : 'negative'}
        />
        <KPICard
          title="Taxa de Economia"
          value={formatPercentage(summary.income > 0 ? (summary.balance / summary.income) * 100 : 0)}
          icon="🎯"
          trend={loading ? 'Carregando...' : 'Do rendimento'}
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
            <button className="btn-export" onClick={() => setShowExportModal(true)}>Exportar</button>
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
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  Carregando transações...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                  Nenhuma transação encontrada
                </td>
              </tr>
            ) : (
              transactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.date).toLocaleDateString('pt-BR')}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.category}</td>
                  <td className={transaction.type === 'income' ? 'money-positive' : 'money-negative'}>
                    {formatCurrency(transaction.type === 'income' ? transaction.amount : -transaction.amount)}
                  </td>
                  <td>{transaction.type === 'income' ? 'Receita' : 'Despesa'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;