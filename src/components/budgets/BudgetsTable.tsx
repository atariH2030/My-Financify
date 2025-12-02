import React, { useState, useMemo } from 'react';
import './BudgetsTable.css';
import Card from '../common/Card';
import Tooltip from '../common/Tooltip';
import { formatCurrency, formatPercentage } from '../../utils/currency';
import type { Budget } from '../../types/financial.types';

interface BudgetsTableProps {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

const BudgetsTable: React.FC<BudgetsTableProps> = ({ budgets, onEdit, onDelete }) => {
  const [filters, setFilters] = useState({
    search: '',
    period: 'all',
    status: 'all'
  });

  // Calculate statistics
  const statistics = useMemo(() => {
    const activeBudgets = budgets.filter(b => b.status === 'active');
    const totalBudgeted = activeBudgets.reduce((sum, b) => sum + b.limitAmount, 0);
    const totalSpent = activeBudgets.reduce((sum, b) => sum + b.currentSpent, 0);
    const totalRemaining = totalBudgeted - totalSpent;
    const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    return {
      totalBudgets: budgets.length,
      activeBudgets: activeBudgets.length,
      totalBudgeted,
      totalSpent,
      totalRemaining,
      overallPercentage
    };
  }, [budgets]);

  // Filter budgets
  const filteredBudgets = useMemo(() => {
    return budgets.filter(budget => {
      const matchesSearch = budget.category.toLowerCase().includes(filters.search.toLowerCase()) ||
                           budget.description?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesPeriod = filters.period === 'all' || budget.period === filters.period;
      const matchesStatus = filters.status === 'all' || budget.status === filters.status;

      return matchesSearch && matchesPeriod && matchesStatus;
    });
  }, [budgets, filters]);

  // Get progress color and status
  const getProgressInfo = (budget: Budget) => {
    const percentage = budget.limitAmount > 0 ? (budget.currentSpent / budget.limitAmount) * 100 : 0;
    const remaining = budget.limitAmount - budget.currentSpent;

    let status: 'safe' | 'warning' | 'danger' | 'over';
    let colorClass: string;

    if (percentage >= 100) {
      status = 'over';
      colorClass = 'over';
    } else if (percentage >= budget.alertThreshold) {
      status = 'danger';
      colorClass = 'danger';
    } else if (percentage >= budget.alertThreshold - 15) {
      status = 'warning';
      colorClass = 'warning';
    } else {
      status = 'safe';
      colorClass = 'safe';
    }

    return { percentage, remaining, status, colorClass };
  };

  // Get period label
  const getPeriodLabel = (period: string): string => {
    const labels: Record<string, string> = {
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      yearly: 'Anual'
    };
    return labels[period] || period;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Empty state
  if (budgets.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💰</div>
        <div className="empty-state-text">Nenhum orçamento cadastrado</div>
        <div className="empty-state-hint">Clique em &quot;Novo Orçamento&quot; para começar a controlar seus gastos</div>
      </div>
    );
  }

  return (
    <div className="budgets-table-container">
      {/* Statistics Cards */}
      <div className="budget-statistics">
        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total de Orçamentos</span>
            <span className="stat-icon">📊</span>
          </div>
          <div className="stat-value">{statistics.totalBudgets}</div>
          <div className="stat-detail">{statistics.activeBudgets} ativos</div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Orçado</span>
            <span className="stat-icon">💵</span>
          </div>
          <div className="stat-value">{formatCurrency(statistics.totalBudgeted)}</div>
          <div className="stat-detail">Orçamentos ativos</div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Gasto</span>
            <span className="stat-icon">💸</span>
          </div>
          <div className="stat-value">{formatCurrency(statistics.totalSpent)}</div>
          <div className="stat-detail">
            {formatPercentage(statistics.overallPercentage)} do orçado
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Disponível</span>
            <span className="stat-icon">💰</span>
          </div>
          <div className="stat-value" style={{ color: statistics.totalRemaining >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatCurrency(statistics.totalRemaining)}
          </div>
          <div className="stat-detail">
            {statistics.totalRemaining >= 0 ? 'Dentro do limite' : 'Acima do limite'}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="budget-filters">
        <div className="filter-group">
          <label className="filter-label">🔍 Buscar</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar por categoria ou descrição..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">📅 Período</label>
          <select
            className="filter-select"
            value={filters.period}
            onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
          >
            <option value="all">Todos os Períodos</option>
            <option value="monthly">Mensal</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">📊 Status</label>
          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="paused">Pausados</option>
            <option value="completed">Concluídos</option>
          </select>
        </div>
      </div>

      {/* Budgets List */}
      <div className="budgets-list">
        {filteredBudgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-text">Nenhum orçamento encontrado</div>
            <div className="empty-state-hint">Tente ajustar os filtros de busca</div>
          </div>
        ) : (
          filteredBudgets.map(budget => {
            const progressInfo = getProgressInfo(budget);

            return (
              <Card key={budget.id} className={`budget-card ${progressInfo.colorClass}`}>
                <div className="budget-header">
                  <div className="budget-info">
                    <h3 className="budget-category">
                      {budget.category}
                      <span className={`status-badge-display ${budget.status}`}>
                        {budget.status === 'active' && '✅ Ativo'}
                        {budget.status === 'paused' && '⏸️ Pausado'}
                        {budget.status === 'completed' && '🏁 Concluído'}
                      </span>
                    </h3>
                    <div className="budget-meta">
                      <div className="budget-meta-item">
                        <i className="fas fa-calendar"></i>
                        <span>{getPeriodLabel(budget.period)}</span>
                      </div>
                      <div className="budget-meta-item">
                        <i className="fas fa-calendar-day"></i>
                        <span>Início: {formatDate(budget.startDate)}</span>
                      </div>
                      {budget.alertThreshold && (
                        <div className="budget-meta-item">
                          <i className="fas fa-bell"></i>
                          <span>Alerta: {budget.alertThreshold}%</span>
                          <Tooltip text="ℹ️" explanation={`Você será alertado ao atingir ${budget.alertThreshold}% do limite`} />
                        </div>
                      )}
                    </div>
                    {budget.description && (
                      <div className="budget-meta">
                        <div className="budget-meta-item">
                          <i className="fas fa-file-alt"></i>
                          <span>{budget.description}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="budget-actions">
                    <button
                      className="icon-button edit"
                      onClick={() => onEdit(budget)}
                      title="Editar orçamento"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="icon-button delete"
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir o orçamento de ${budget.category}?`)) {
                          onDelete(budget.id);
                        }
                      }}
                      title="Excluir orçamento"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <div className="budget-progress">
                  <div className="progress-header">
                    <span className="progress-label">Progresso do Orçamento</span>
                    <div className="progress-amounts">
                      <span className="amount-spent">{formatCurrency(budget.currentSpent)}</span>
                      <span>/</span>
                      <span className="amount-limit">{formatCurrency(budget.limitAmount)}</span>
                    </div>
                  </div>

                  <div className="progress-bar-container">
                    <div
                      className={`progress-bar ${progressInfo.colorClass}`}
                      style={{ width: `${Math.min(progressInfo.percentage, 100)}%` }}
                    >
                      {progressInfo.percentage >= 10 && formatPercentage(progressInfo.percentage)}
                    </div>
                  </div>

                  <div className="progress-details">
                    <div className="detail-item">
                      <span className="detail-label">Disponível</span>
                      <span className={`detail-value ${progressInfo.remaining >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(Math.abs(progressInfo.remaining))}
                        {progressInfo.remaining < 0 && ' acima'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">% Utilizado</span>
                      <span className="detail-value" style={{ color: 'var(--text-primary)' }}>
                        {formatPercentage(progressInfo.percentage)}
                      </span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-label">% Restante</span>
                      <span className="detail-value" style={{ color: 'var(--text-primary)' }}>
                        {formatPercentage(100 - progressInfo.percentage)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alert Messages */}
                {progressInfo.status === 'over' && (
                  <div className="budget-alert danger">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Orçamento ultrapassado! Você gastou {formatCurrency(budget.currentSpent - budget.limitAmount)} a mais do que o planejado.</span>
                  </div>
                )}
                {progressInfo.status === 'danger' && progressInfo.percentage < 100 && (
                  <div className="budget-alert danger">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>Atenção! Você atingiu {progressInfo.percentage.toFixed(1)}% do seu orçamento. Restam apenas {formatCurrency(progressInfo.remaining)}.</span>
                  </div>
                )}
                {progressInfo.status === 'warning' && (
                  <div className="budget-alert warning">
                    <i className="fas fa-info-circle"></i>
                    <span>Você está próximo do limite de alerta ({budget.alertThreshold}%). Ainda restam {formatCurrency(progressInfo.remaining)}.</span>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetsTable;
