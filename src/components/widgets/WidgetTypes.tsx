/**
 * Widget Types - Componentes individuais de widgets
 * v3.9.0 - Dashboard Personalizável
 */

import React, { useState, useEffect } from 'react';
import type { WidgetConfig } from '../../types/financial.types';
import BaseWidget from './BaseWidget';
import './Widgets.css';

// ============================================================================
// BALANCE WIDGET
// ============================================================================

export const BalanceWidget: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Dados mockados para desenvolvimento
    setBalance(15432.50);
  }, []);

  return (
    <BaseWidget config={config}>
      <div className="widget-content balance-widget">
        <div className="balance-main">
          <span className="currency">R$</span>
          <span className="amount">{balance.toFixed(2)}</span>
        </div>
        <div className="balance-trend positive">
          <span className="trend-icon">↑</span>
          <span className="trend-value">+12.5%</span>
          <span className="trend-label">este mês</span>
        </div>
      </div>
    </BaseWidget>
  );
};

// ============================================================================
// EXPENSES WIDGET
// ============================================================================

export const ExpensesWidget: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  const [expenses, setExpenses] = useState(0);

  useEffect(() => {
    // Dados mockados para desenvolvimento
    setExpenses(4820.30);
  }, []);

  return (
    <BaseWidget config={config}>
      <div className="widget-content expenses-widget">
        <div className="stat-main">
          <span className="currency">R$</span>
          <span className="amount">{expenses.toFixed(2)}</span>
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

export const IncomeWidget: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  const [income, setIncome] = useState(0);

  useEffect(() => {
    // Dados mockados para desenvolvimento
    setIncome(8500.00);
  }, []);

  return (
    <BaseWidget config={config}>
      <div className="widget-content income-widget">
        <div className="stat-main">
          <span className="currency">R$</span>
          <span className="amount">{income.toFixed(2)}</span>
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

export const BudgetWidget: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  return (
    <BaseWidget config={config}>
      <div className="widget-content budget-widget">
        <div className="budget-summary">
          <div className="budget-item">
            <span className="budget-label">Alimentação</span>
            <div className="budget-progress">
              <div className="progress-bar" style={{ width: '65%' }}></div>
            </div>
            <span className="budget-values">R$ 650 / R$ 1.000</span>
          </div>
          <div className="budget-item">
            <span className="budget-label">Transporte</span>
            <div className="budget-progress">
              <div className="progress-bar" style={{ width: '42%' }}></div>
            </div>
            <span className="budget-values">R$ 210 / R$ 500</span>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

// ============================================================================
// GOALS WIDGET
// ============================================================================

export const GoalsWidget: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  return (
    <BaseWidget config={config}>
      <div className="widget-content goals-widget">
        <div className="goals-list">
          <div className="goal-item">
            <span className="goal-name">🏖️ Férias 2025</span>
            <div className="goal-progress">
              <div className="progress-bar" style={{ width: '78%' }}></div>
            </div>
            <span className="goal-values">R$ 7.800 / R$ 10.000</span>
          </div>
          <div className="goal-item">
            <span className="goal-name">💻 Notebook Novo</span>
            <div className="goal-progress">
              <div className="progress-bar" style={{ width: '34%' }}></div>
            </div>
            <span className="goal-values">R$ 1.700 / R$ 5.000</span>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

// ============================================================================
// RECURRING WIDGET
// ============================================================================

export const RecurringWidget: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  return (
    <BaseWidget config={config}>
      <div className="widget-content recurring-widget">
        <div className="recurring-list">
          <div className="recurring-item expense">
            <span className="recurring-name">Netflix</span>
            <span className="recurring-value">-R$ 45,90</span>
          </div>
          <div className="recurring-item income">
            <span className="recurring-name">Salário</span>
            <span className="recurring-value">+R$ 5.000,00</span>
          </div>
          <div className="recurring-item expense">
            <span className="recurring-name">Aluguel</span>
            <span className="recurring-value">-R$ 1.200,00</span>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

// ============================================================================
// RECENT TRANSACTIONS WIDGET
// ============================================================================

export const RecentTransactionsWidget: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  return (
    <BaseWidget config={config}>
      <div className="widget-content transactions-widget">
        <div className="transactions-list">
          <div className="transaction-item expense">
            <div className="transaction-info">
              <span className="transaction-name">Supermercado</span>
              <span className="transaction-date">Hoje</span>
            </div>
            <span className="transaction-value">-R$ 234,50</span>
          </div>
          <div className="transaction-item income">
            <div className="transaction-info">
              <span className="transaction-name">Freelance</span>
              <span className="transaction-date">Ontem</span>
            </div>
            <span className="transaction-value">+R$ 850,00</span>
          </div>
          <div className="transaction-item expense">
            <div className="transaction-info">
              <span className="transaction-name">Farmácia</span>
              <span className="transaction-date">2 dias atrás</span>
            </div>
            <span className="transaction-value">-R$ 67,80</span>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

// ============================================================================
// ACCOUNTS WIDGET
// ============================================================================

export const AccountsWidget: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  return (
    <BaseWidget config={config}>
      <div className="widget-content accounts-widget">
        <div className="accounts-list">
          <div className="account-item">
            <div className="account-info">
              <span className="account-name">🏦 Conta Corrente</span>
              <span className="account-type">Banco Inter</span>
            </div>
            <span className="account-balance">R$ 4.320,50</span>
          </div>
          <div className="account-item">
            <div className="account-info">
              <span className="account-name">💰 Poupança</span>
              <span className="account-type">Nubank</span>
            </div>
            <span className="account-balance">R$ 8.700,00</span>
          </div>
          <div className="account-item">
            <div className="account-info">
              <span className="account-name">📈 Investimentos</span>
              <span className="account-type">XP Investimentos</span>
            </div>
            <span className="account-balance">R$ 15.432,00</span>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};
