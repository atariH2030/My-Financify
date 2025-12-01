/**
 * Widget Types - Componentes individuais de widgets
 * v4.0.0 - Com suporte a expandir/recolher no modo lista
 */

import React, { useState, useEffect } from 'react';
import type { WidgetConfig } from '../../types/financial.types';
import BaseWidget from './BaseWidget';
import { formatCurrency } from '../../utils/currency';
import './Widgets.css';

interface WidgetProps {
  config: WidgetConfig;
  onRemove?: () => void;
  isListView?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// ============================================================================
// BALANCE WIDGET
// ============================================================================

export const BalanceWidget: React.FC<WidgetProps> = ({ 
  config, 
  onRemove, 
  isListView, 
  isExpanded, 
  onToggleExpand 
}) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Dados mockados para desenvolvimento
    setBalance(15432.50);
  }, []);

  return (
    <BaseWidget 
      config={config}
      onRemove={onRemove}
      isListView={isListView}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="widget-content balance-widget">
        <div className="balance-main">
          <span className="amount">{formatCurrency(balance)}</span>
        </div>
        <div className="balance-trend positive">
          <span className="trend-icon">↑</span>
          <span className="trend-value">+12,5%</span>
          <span className="trend-label">este mês</span>
        </div>
      </div>
    </BaseWidget>
  );
};

// ============================================================================
// EXPENSES WIDGET
// ============================================================================

export const ExpensesWidget: React.FC<WidgetProps> = ({ 
  config, 
  onRemove, 
  isListView, 
  isExpanded, 
  onToggleExpand 
}) => {
  const [expenses, setExpenses] = useState(0);

  useEffect(() => {
    // Dados mockados para desenvolvimento
    setExpenses(4820.30);
  }, []);

  return (
    <BaseWidget 
      config={config}
      onRemove={onRemove}
      isListView={isListView}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="widget-content expenses-widget">
        <div className="stat-main">
          <span className="amount">{formatCurrency(expenses)}</span>
        </div>
        <div className="stat-meta">
          <span className="meta-label">Gastos este mês</span>
        </div>
      </div>
    </BaseWidget>
  );
};

// ============================================================================
// INCOME WIDGET
// ============================================================================

export const IncomeWidget: React.FC<WidgetProps> = ({ 
  config, 
  onRemove, 
  isListView, 
  isExpanded, 
  onToggleExpand 
}) => {
  const [income, setIncome] = useState(0);

  useEffect(() => {
    // Dados mockados para desenvolvimento
    setIncome(8500.00);
  }, []);

  return (
    <BaseWidget 
      config={config}
      onRemove={onRemove}
      isListView={isListView}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="widget-content income-widget">
        <div className="stat-main">
          <span className="amount">{formatCurrency(income)}</span>
        </div>
        <div className="stat-meta">
          <span className="meta-label">Receita este mês</span>
        </div>
      </div>
    </BaseWidget>
  );
};

// ============================================================================
// BUDGET WIDGET
// ============================================================================

export const BudgetWidget: React.FC<WidgetProps> = ({ 
  config, 
  onRemove, 
  isListView, 
  isExpanded, 
  onToggleExpand 
}) => {
  return (
    <BaseWidget 
      config={config}
      onRemove={onRemove}
      isListView={isListView}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="widget-content budget-widget">
        <div className="budget-summary">
          <div className="budget-item">
            <span className="budget-label">Alimentação</span>
            <div className="budget-progress">
              <div className="progress-bar" style={{ width: '65%' }}></div>
            </div>
            <span className="budget-values">{formatCurrency(650)} / {formatCurrency(1000)}</span>
          </div>
          <div className="budget-item">
            <span className="budget-label">Transporte</span>
            <div className="budget-progress">
              <div className="progress-bar" style={{ width: '42%' }}></div>
            </div>
            <span className="budget-values">{formatCurrency(210)} / {formatCurrency(500)}</span>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

// ============================================================================
// GOALS WIDGET
// ============================================================================

export const GoalsWidget: React.FC<WidgetProps> = ({ 
  config, 
  onRemove, 
  isListView, 
  isExpanded, 
  onToggleExpand 
}) => {
  return (
    <BaseWidget 
      config={config}
      onRemove={onRemove}
      isListView={isListView}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="widget-content goals-widget">
        <div className="goals-list">
          <div className="goal-item">
            <span className="goal-name">🏖️ Férias 2025</span>
            <div className="goal-progress">
              <div className="progress-bar" style={{ width: '78%' }}></div>
            </div>
            <span className="goal-values">{formatCurrency(7800)} / {formatCurrency(10000)}</span>
          </div>
          <div className="goal-item">
            <span className="goal-name">💻 Notebook Novo</span>
            <div className="goal-progress">
              <div className="progress-bar" style={{ width: '34%' }}></div>
            </div>
            <span className="goal-values">{formatCurrency(1700)} / {formatCurrency(5000)}</span>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

// ============================================================================
// RECURRING WIDGET
// ============================================================================

export const RecurringWidget: React.FC<WidgetProps> = ({ 
  config, 
  onRemove, 
  isListView, 
  isExpanded, 
  onToggleExpand 
}) => {
  return (
    <BaseWidget 
      config={config}
      onRemove={onRemove}
      isListView={isListView}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="widget-content recurring-widget">
        <div className="recurring-list">
          <div className="recurring-item expense">
            <span className="recurring-name">Netflix</span>
            <span className="recurring-value">{formatCurrency(-45.90)}</span>
          </div>
          <div className="recurring-item income">
            <span className="recurring-name">Salário</span>
            <span className="recurring-value">{formatCurrency(5000)}</span>
          </div>
          <div className="recurring-item expense">
            <span className="recurring-name">Aluguel</span>
            <span className="recurring-value">{formatCurrency(-1200)}</span>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

// ============================================================================
// RECENT TRANSACTIONS WIDGET
// ============================================================================

export const RecentTransactionsWidget: React.FC<WidgetProps> = ({ 
  config, 
  onRemove, 
  isListView, 
  isExpanded, 
  onToggleExpand 
}) => {
  return (
    <BaseWidget 
      config={config}
      onRemove={onRemove}
      isListView={isListView}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="widget-content transactions-widget">
        <div className="transactions-list">
          <div className="transaction-item expense">
            <div className="transaction-info">
              <span className="transaction-name">Supermercado</span>
              <span className="transaction-date">Hoje</span>
            </div>
            <span className="transaction-value">{formatCurrency(-234.50)}</span>
          </div>
          <div className="transaction-item income">
            <div className="transaction-info">
              <span className="transaction-name">Freelance</span>
              <span className="transaction-date">Ontem</span>
            </div>
            <span className="transaction-value">{formatCurrency(850.00)}</span>
          </div>
          <div className="transaction-item expense">
            <div className="transaction-info">
              <span className="transaction-name">Farmácia</span>
              <span className="transaction-date">2 dias atrás</span>
            </div>
            <span className="transaction-value">{formatCurrency(-67.80)}</span>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

// ============================================================================
// ACCOUNTS WIDGET
// ============================================================================

export const AccountsWidget: React.FC<WidgetProps> = ({ 
  config, 
  onRemove, 
  isListView, 
  isExpanded, 
  onToggleExpand 
}) => {
  return (
    <BaseWidget 
      config={config}
      onRemove={onRemove}
      isListView={isListView}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <div className="widget-content accounts-widget">
        <div className="accounts-list">
          <div className="account-item">
            <div className="account-info">
              <span className="account-name">🏦 Conta Corrente</span>
              <span className="account-type">Banco Inter</span>
            </div>
            <span className="account-balance">{formatCurrency(4320.50)}</span>
          </div>
          <div className="account-item">
            <div className="account-info">
              <span className="account-name">💰 Poupança</span>
              <span className="account-type">Nubank</span>
            </div>
            <span className="account-balance">{formatCurrency(8700.00)}</span>
          </div>
          <div className="account-item">
            <div className="account-info">
              <span className="account-name">📈 Investimentos</span>
              <span className="account-type">XP Investimentos</span>
            </div>
            <span className="account-balance">{formatCurrency(15432.00)}</span>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};
