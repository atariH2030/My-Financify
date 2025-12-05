/**
 * @file DashboardV2.tsx
 * @description Dashboard moderno com dados reais do Supabase
 * @version 4.0.0 - Integração com TransactionsService
 * @author DEV - Rickson (TQM)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { transactionsService } from '../../services/transactions.service';
import Logger from '../../services/logger.service';
import WidgetGrid from '../widgets/WidgetGrid';
import DashboardCustomizer from './DashboardCustomizer';
import './DashboardV2.css';

interface DashboardStats {
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

export const DashboardV2: React.FC = () => {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    income: 0,
    expenses: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const currentDate = new Date();
      const summary = await transactionsService.getFinancialSummary(
        currentDate.getMonth(),
        currentDate.getFullYear()
      );
      
      setStats(summary);
      Logger.info('✅ Dashboard carregado', { 
        income: summary.income,
        expenses: summary.expenses,
        balance: summary.balance,
        count: summary.transactionCount 
      }, 'DASHBOARD');
    } catch (error) {
      Logger.error('❌ Erro ao carregar dashboard', error as Error, 'DASHBOARD');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }, []);

  const currentMonth = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    }).format(new Date());
  }, []);

  return (
    <div className="dashboard-v2-container">
      {/* Header com resumo mensal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-header"
      >
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-period">{currentMonth}</p>
        </div>
      </motion.div>

      {/* Cards de resumo */}
      {loading ? (
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-summary">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="summary-card income-card"
            >
              <div className="card-icon">
                <i className="fas fa-arrow-up"></i>
              </div>
              <div className="card-content">
                <span className="card-label">Receitas</span>
                <h2 className="card-value income">{formatCurrency(stats.income)}</h2>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="summary-card expense-card"
            >
              <div className="card-icon">
                <i className="fas fa-arrow-down"></i>
              </div>
              <div className="card-content">
                <span className="card-label">Despesas</span>
                <h2 className="card-value expense">{formatCurrency(stats.expenses)}</h2>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`summary-card balance-card ${stats.balance >= 0 ? 'positive' : 'negative'}`}
            >
              <div className="card-icon">
                <i className={`fas fa-${stats.balance >= 0 ? 'wallet' : 'exclamation-triangle'}`}></i>
              </div>
              <div className="card-content">
                <span className="card-label">Saldo</span>
                <h2 className={`card-value ${stats.balance >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(stats.balance)}
                </h2>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="summary-card transactions-card"
            >
              <div className="card-icon">
                <i className="fas fa-list"></i>
              </div>
              <div className="card-content">
                <span className="card-label">Transações</span>
                <h2 className="card-value">{stats.transactionCount}</h2>
              </div>
            </motion.div>
          </div>

          {/* Widgets Grid */}
          <WidgetGrid onCustomize={() => setShowCustomizer(true)} />
        </>
      )}
      
      <DashboardCustomizer
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
      />
    </div>
  );
};

export default DashboardV2;
