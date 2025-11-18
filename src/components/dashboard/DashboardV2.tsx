/**
 * @file DashboardV2.tsx
 * @description Dashboard moderno com gráficos interativos e KPIs integrado com dados reais
 * @version 3.0.0
 * @author DEV - Rickson (TQM)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { fadeInUp, listContainer, listItem } from '../../utils/animations';
import { formatCurrency, formatPercentage } from '../../utils/performance';
import { formatMonthYear, getLastNMonths, isDateInPeriod, getCurrentPeriod } from '../../utils/date';
import Card from '../common/Card';
import StorageService from '../../services/storage.service';
import Logger from '../../services/logger.service';
import type { Transaction } from '../../types/financial.types';
import { SECTIONS_CONFIG } from '../../config/categories.config';
import './DashboardV2.css';

// Registrar componentes Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface KPI {
  id: string;
  label: string;
  value: number;
  change: number;
  icon: string;
  color: string;
}

export const DashboardV2: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar transações
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await StorageService.load<Transaction[]>('transactions');
      setTransactions(data || []);
      Logger.info('Transações carregadas no Dashboard', { count: (data || []).length }, 'DASHBOARD');
    } catch (error) {
      Logger.error('Erro ao carregar transações no Dashboard', error as Error, 'DASHBOARD');
    } finally {
      setLoading(false);
    }
  };

  // Calcular KPIs baseados nas transações reais
  const kpis: KPI[] = useMemo(() => {
    if (transactions.length === 0) {
      return [
        {
          id: 'balance',
          label: 'Saldo Total',
          value: 0,
          change: 0,
          icon: '💰',
          color: 'var(--primary)',
        },
        {
          id: 'income',
          label: 'Receitas',
          value: 0,
          change: 0,
          icon: '📈',
          color: 'var(--success)',
        },
        {
          id: 'expenses',
          label: 'Despesas',
          value: 0,
          change: 0,
          icon: '📉',
          color: 'var(--danger)',
        },
        {
          id: 'savings',
          label: 'Economia',
          value: 0,
          change: 0,
          icon: '🎯',
          color: 'var(--warning)',
        },
      ];
    }

    const now = new Date();
    const currentPeriod = getCurrentPeriod();
    
    // Transações do período atual
    const currentTransactions = transactions.filter((t) =>
      isDateInPeriod(new Date(t.date), currentPeriod.start, currentPeriod.end)
    );

    // Transações do período anterior (para calcular variação)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastTransactions = transactions.filter((t) =>
      isDateInPeriod(new Date(t.date), lastMonthStart, lastMonthEnd)
    );

    const currentIncome = currentTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentExpenses = currentTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastIncome = lastTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastExpenses = lastTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = currentIncome - currentExpenses;
    const lastBalance = lastIncome - lastExpenses;
    const currentSavings = currentIncome - currentExpenses;
    const lastSavings = lastIncome - lastExpenses;

    const calculateChange = (current: number, last: number): number => {
      if (last === 0) return current > 0 ? 100 : 0;
      return ((current - last) / last) * 100;
    };

    return [
      {
        id: 'balance',
        label: 'Saldo Total',
        value: currentBalance,
        change: calculateChange(currentBalance, lastBalance),
        icon: '💰',
        color: 'var(--primary)',
      },
      {
        id: 'income',
        label: 'Receitas',
        value: currentIncome,
        change: calculateChange(currentIncome, lastIncome),
        icon: '📈',
        color: 'var(--success)',
      },
      {
        id: 'expenses',
        label: 'Despesas',
        value: currentExpenses,
        change: calculateChange(currentExpenses, lastExpenses),
        icon: '📉',
        color: 'var(--danger)',
      },
      {
        id: 'savings',
        label: 'Economia',
        value: currentSavings,
        change: calculateChange(currentSavings, lastSavings),
        icon: '🎯',
        color: 'var(--warning)',
      },
    ];
  }, [transactions]);

  // Dados do gráfico de linha (últimos 6 meses)
  const lineChartData = useMemo(() => {
    const months = getLastNMonths(6);
    const monthsLabels = months.map((date) => formatMonthYear(date));

    const incomeData: number[] = [];
    const expenseData: number[] = [];

    months.forEach((monthDate) => {
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const monthTransactions = transactions.filter((t) =>
        isDateInPeriod(new Date(t.date), monthStart, monthEnd)
      );

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      incomeData.push(income);
      expenseData.push(expenses);
    });

    return {
      labels: monthsLabels,
      datasets: [
        {
          label: 'Receitas',
          data: incomeData,
          borderColor: 'var(--success)',
          backgroundColor: 'var(--success-transparent)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Despesas',
          data: expenseData,
          borderColor: 'var(--danger)',
          backgroundColor: 'var(--danger-transparent)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [transactions]);

  // Dados do gráfico de barras (top 6 categorias por gastos)
  const barChartData = useMemo(() => {
    const currentPeriod = getCurrentPeriod();
    const currentTransactions = transactions.filter(
      (t) =>
        t.type === 'expense' &&
        isDateInPeriod(new Date(t.date), currentPeriod.start, currentPeriod.end)
    );

    // Agrupar por categoria
    const categoryTotals = new Map<string, number>();
    currentTransactions.forEach((t) => {
      const current = categoryTotals.get(t.category) || 0;
      categoryTotals.set(t.category, current + t.amount);
    });

    // Ordenar e pegar top 6
    const sortedCategories = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const labels = sortedCategories.map(([cat]) => cat);
    const data = sortedCategories.map(([, total]) => total);

    return {
      labels: labels.length > 0 ? labels : ['Sem dados'],
      datasets: [
        {
          label: 'Despesas por Categoria',
          data: data.length > 0 ? data : [0],
          backgroundColor: [
            '#ef4444',
            '#3b82f6',
            '#f59e0b',
            '#10b981',
            '#8b5cf6',
            '#f97316',
          ],
          borderColor: [
            '#dc2626',
            '#2563eb',
            '#d97706',
            '#059669',
            '#7c3aed',
            '#ea580c',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [transactions]);

  // Dados do gráfico de rosca (distribuição por sessões)
  const doughnutData = useMemo(() => {
    const currentPeriod = getCurrentPeriod();
    const currentTransactions = transactions.filter(
      (t) =>
        t.type === 'expense' &&
        isDateInPeriod(new Date(t.date), currentPeriod.start, currentPeriod.end)
    );

    // Agrupar por sessão
    const sectionTotals = new Map<string, number>();
    currentTransactions.forEach((t) => {
      const section = SECTIONS_CONFIG.find((s) =>
        s.categories.some((c) => c.id === t.category)
      );
      if (section && section.id !== 'income') {
        const current = sectionTotals.get(section.name) || 0;
        sectionTotals.set(section.name, current + t.amount);
      }
    });

    const sortedSections = Array.from(sectionTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const labels = sortedSections.map(([name]) => name);
    const data = sortedSections.map(([, total]) => total);

    return {
      labels: labels.length > 0 ? labels : ['Sem dados'],
      datasets: [
        {
          label: 'Distribuição por Sessão',
          data: data.length > 0 ? data : [1],
          backgroundColor: [
            '#ef4444',
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#8b5cf6',
          ],
          borderColor: [
            '#dc2626',
            '#2563eb',
            '#059669',
            '#d97706',
            '#7c3aed',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [transactions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'var(--text-primary)',
          font: {
            family: 'var(--font-family)',
          },
        },
      },
      tooltip: {
        backgroundColor: 'var(--bg-tertiary)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'var(--border-color)',
        },
        ticks: {
          color: 'var(--text-secondary)',
        },
      },
      y: {
        grid: {
          color: 'var(--border-color)',
        },
        ticks: {
          color: 'var(--text-secondary)',
          callback: (value: any) => formatCurrency(value),
        },
      },
    },
  };

  return (
    <motion.div
      className="dashboard-v2"
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="dashboard-header">
        <h1>Dashboard Financeiro</h1>
        <div className="period-selector">
          <button
            className={period === 'week' ? 'active' : ''}
            onClick={() => setPeriod('week')}
          >
            Semana
          </button>
          <button
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            Mês
          </button>
          <button
            className={period === 'year' ? 'active' : ''}
            onClick={() => setPeriod('year')}
          >
            Ano
          </button>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">
          <p>Carregando dados financeiros...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="dashboard-empty">
          <p>📊 Nenhuma transação encontrada</p>
          <p className="dashboard-empty-hint">
            Adicione suas primeiras receitas e despesas para visualizar o dashboard
          </p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <motion.div
            className="kpi-grid"
            variants={listContainer}
            initial="initial"
            animate="animate"
          >
            {kpis.map((kpi) => (
              <motion.div key={kpi.id} variants={listItem}>
                <Card className="kpi-card" padding="md">
                  <div className="kpi-content">
                    <span className="kpi-icon">{kpi.icon}</span>
                    <div className="kpi-details">
                      <p className="kpi-label">{kpi.label}</p>
                      <h3 className="kpi-value" style={{ color: kpi.color }}>
                        {formatCurrency(kpi.value)}
                      </h3>
                      <span className={`kpi-change ${kpi.change >= 0 ? 'positive' : 'negative'}`}>
                        {kpi.change >= 0 ? '↑' : '↓'}{' '}
                        {formatPercentage(Math.abs(kpi.change) / 100, 1)}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Gráficos */}
          <div className="charts-grid">
            <Card title="Evolução Financeira" className="chart-card">
              <div className="chart-container">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </Card>

            <Card title="Top Categorias de Despesas" className="chart-card">
              <div className="chart-container">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </Card>

            <Card title="Distribuição por Sessão" className="chart-card chart-small">
              <div className="chart-container">
                <Doughnut
                  data={doughnutData}
                  options={{
                    ...chartOptions,
                    scales: undefined,
                  }}
                />
              </div>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default DashboardV2;
