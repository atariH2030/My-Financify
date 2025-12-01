import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import Card from '../common/Card';
import Button from '../common/Button';
import StorageService from '../../services/storage.service';
import { formatCurrency, formatPercentage } from '../../utils/currency';
import type { Transaction, Budget, FinancialGoal } from '../../types/financial.types';
import './ReportsAdvanced.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler);

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

interface CategoryTrend {
  category: string;
  data: number[];
  total: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
}

const ReportsAdvanced: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [period, setPeriod] = useState<'6months' | '12months' | 'all'>('6months');
  const [_selectedCategory, _setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txns, bdgs, gls] = await Promise.all([
        StorageService.load<Transaction[]>('transactions'),
        StorageService.load<Budget[]>('budgets'),
        StorageService.load<FinancialGoal[]>('goals')
      ]);
      setTransactions(txns || []);
      setBudgets(bdgs || []);
      setGoals(gls || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get monthly data for comparison
  const getMonthlyData = (): MonthlyData[] => {
    const months = period === '6months' ? 6 : period === '12months' ? 12 : 24;
    const monthlyMap = new Map<string, { income: number; expenses: number }>();

    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      monthlyMap.set(key, { income: 0, expenses: 0 });
    }

    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      if (monthlyMap.has(key)) {
        const data = monthlyMap.get(key);
        if (data && t.type === 'income') {
          data.income += t.amount;
        } else if (data) {
          data.expenses += t.amount;
        }
      }
    });

    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses
    }));
  };

  // Get category trends
  const getCategoryTrends = (): CategoryTrend[] => {
    const months = period === '6months' ? 6 : period === '12months' ? 12 : 24;
    const categoryMap = new Map<string, number[]>();

    // Initialize categories
    const categories = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))];
    categories.forEach(cat => {
      categoryMap.set(cat, new Array(months).fill(0));
    });

    // Fill data
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const date = new Date(t.date);
      const monthsAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      if (monthsAgo < months) {
        const data = categoryMap.get(t.category);
        if (data) {
          data[months - monthsAgo - 1] += t.amount;
        }
      }
    });

    // Calculate trends
    return Array.from(categoryMap.entries()).map(([category, data]) => {
      const total = data.reduce((sum, val) => sum + val, 0);
      const average = total / data.length;
      
      // Calculate trend (comparing first half vs second half)
      const firstHalf = data.slice(0, Math.floor(data.length / 2));
      const secondHalf = data.slice(Math.floor(data.length / 2));
      const avgFirst = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      const diff = ((avgSecond - avgFirst) / (avgFirst || 1)) * 100;
      
      if (diff > 10) trend = 'up';
      else if (diff < -10) trend = 'down';
      
      return { category, data, total, average, trend };
    }).sort((a, b) => b.total - a.total);
  };

  // Predict next month expenses
  const predictNextMonth = () => {
    const monthlyData = getMonthlyData();
    const recentExpenses = monthlyData.slice(-3).map(m => m.expenses);
    const average = recentExpenses.reduce((sum, val) => sum + val, 0) / recentExpenses.length;
    
    // Simple linear regression for trend
    const trend = recentExpenses.length >= 2 
      ? (recentExpenses[recentExpenses.length - 1] - recentExpenses[0]) / recentExpenses.length
      : 0;
    
    return average + trend;
  };

  // Budget performance
  const getBudgetPerformance = () => {
    const activeBudgets = budgets.filter(b => b.status === 'active');
    const totalBudgeted = activeBudgets.reduce((sum, b) => sum + b.limitAmount, 0);
    const totalSpent = activeBudgets.reduce((sum, b) => sum + b.currentSpent, 0);
    const performance = totalBudgeted > 0 ? ((totalBudgeted - totalSpent) / totalBudgeted) * 100 : 0;
    
    return {
      totalBudgets: activeBudgets.length,
      totalBudgeted,
      totalSpent,
      remaining: totalBudgeted - totalSpent,
      performance,
      withinBudget: activeBudgets.filter(b => b.currentSpent <= b.limitAmount).length
    };
  };

  // Goal progress summary
  const getGoalsProgress = () => {
    const activeGoals = goals.filter(g => g.status === 'active');
    const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const avgProgress = activeGoals.length > 0 
      ? activeGoals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount) * 100, 0) / activeGoals.length
      : 0;
    
    return {
      totalGoals: activeGoals.length,
      totalTarget,
      totalSaved,
      remaining: totalTarget - totalSaved,
      avgProgress,
      completed: goals.filter(g => g.status === 'completed').length
    };
  };

  const monthlyData = getMonthlyData();
  const categoryTrends = getCategoryTrends();
  const prediction = predictNextMonth();
  const budgetPerf = getBudgetPerformance();
  const goalsProgress = getGoalsProgress();

  // Chart data
  const monthlyComparisonChart = {
    labels: monthlyData.map(m => m.month),
    datasets: [
      {
        label: 'Receitas',
        data: monthlyData.map(m => m.income),
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 2
      },
      {
        label: 'Despesas',
        data: monthlyData.map(m => m.expenses),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 2
      }
    ]
  };

  const balanceTrendChart = {
    labels: monthlyData.map(m => m.month),
    datasets: [
      {
        label: 'Saldo',
        data: monthlyData.map(m => m.balance),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const budgetDistributionChart = {
    labels: budgets.filter(b => b.status === 'active').map(b => b.category),
    datasets: [
      {
        data: budgets.filter(b => b.status === 'active').map(b => b.limitAmount),
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'],
        borderWidth: 0
      }
    ]
  };

  if (loading) {
    return (
      <div className="reports-advanced-page">
        <div className="loading-state">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="reports-advanced-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1><i className="fas fa-chart-line"></i> Relatórios Avançados</h1>
          <p>Análise detalhada de tendências e previsões financeiras</p>
        </div>
        <div className="header-actions">
          <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="period-select">
            <option value="6months">Últimos 6 meses</option>
            <option value="12months">Últimos 12 meses</option>
            <option value="all">Últimos 24 meses</option>
          </select>
          <Button variant="primary" onClick={() => window.print()}>
            <i className="fas fa-download"></i> Exportar PDF
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <Card className="summary-card">
          <div className="summary-icon income"><i className="fas fa-arrow-trend-up"></i></div>
          <div className="summary-content">
            <h4>Receita Média</h4>
            <p className="summary-value">{formatCurrency(monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length)}</p>
            <span className="summary-label">por mês</span>
          </div>
        </Card>

        <Card className="summary-card">
          <div className="summary-icon expense"><i className="fas fa-arrow-trend-down"></i></div>
          <div className="summary-content">
            <h4>Despesa Média</h4>
            <p className="summary-value">{formatCurrency(monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length)}</p>
            <span className="summary-label">por mês</span>
          </div>
        </Card>

        <Card className="summary-card">
          <div className="summary-icon prediction"><i className="fas fa-crystal-ball"></i></div>
          <div className="summary-content">
            <h4>Previsão Próximo Mês</h4>
            <p className="summary-value">{formatCurrency(prediction)}</p>
            <span className="summary-label">despesas estimadas</span>
          </div>
        </Card>

        <Card className="summary-card">
          <div className="summary-icon performance"><i className="fas fa-gauge-high"></i></div>
          <div className="summary-content">
            <h4>Performance Orçamentos</h4>
            <p className="summary-value">{formatPercentage(budgetPerf.performance)}</p>
            <span className="summary-label">{budgetPerf.withinBudget}/{budgetPerf.totalBudgets} dentro do limite</span>
          </div>
        </Card>
      </div>

      {/* Monthly Comparison */}
      <div className="charts-row">
        <Card className="chart-card">
          <h3><i className="fas fa-chart-bar"></i> Comparativo Mensal</h3>
          <div className="chart-container">
            <Bar 
              data={monthlyComparisonChart} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                  y: { beginAtZero: true, ticks: { callback: (value) => formatCurrency(value as number) } }
                }
              }}
            />
          </div>
        </Card>

        <Card className="chart-card">
          <h3><i className="fas fa-chart-line"></i> Tendência de Saldo</h3>
          <div className="chart-container">
            <Line 
              data={balanceTrendChart} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                  y: { ticks: { callback: (value) => formatCurrency(value as number) } }
                }
              }}
            />
          </div>
        </Card>
      </div>

      {/* Category Trends */}
      <Card className="trends-card">
        <h3><i className="fas fa-chart-pie"></i> Análise de Categorias</h3>
        <div className="trends-list">
          {categoryTrends.slice(0, 10).map((trend, idx) => (
            <div key={idx} className="trend-item">
              <div className="trend-info">
                <span className="trend-category">{trend.category}</span>
                <span className={`trend-indicator ${trend.trend}`}>
                  {trend.trend === 'up' && '📈 Subindo'}
                  {trend.trend === 'down' && '📉 Caindo'}
                  {trend.trend === 'stable' && '➡️ Estável'}
                </span>
              </div>
              <div className="trend-values">
                <span className="trend-total">{formatCurrency(trend.total)}</span>
                <span className="trend-average">Média: {formatCurrency(trend.average)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Budget & Goals Performance */}
      <div className="performance-row">
        <Card className="performance-card">
          <h3><i className="fas fa-wallet"></i> Performance de Orçamentos</h3>
          <div className="performance-stats">
            <div className="stat-item">
              <span className="stat-label">Total Orçado</span>
              <span className="stat-value">{formatCurrency(budgetPerf.totalBudgeted)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Gasto</span>
              <span className="stat-value expense">{formatCurrency(budgetPerf.totalSpent)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Restante</span>
              <span className={`stat-value ${budgetPerf.remaining >= 0 ? 'income' : 'expense'}`}>
                {formatCurrency(budgetPerf.remaining)}
              </span>
            </div>
          </div>
          {budgets.filter(b => b.status === 'active').length > 0 && (
            <div className="chart-container small">
              <Doughnut 
                data={budgetDistributionChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'right' } }
                }}
              />
            </div>
          )}
        </Card>

        <Card className="performance-card">
          <h3><i className="fas fa-bullseye"></i> Progresso de Metas</h3>
          <div className="performance-stats">
            <div className="stat-item">
              <span className="stat-label">Metas Ativas</span>
              <span className="stat-value">{goalsProgress.totalGoals}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Economizado</span>
              <span className="stat-value income">{formatCurrency(goalsProgress.totalSaved)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Progresso Médio</span>
              <span className="stat-value">{formatPercentage(goalsProgress.avgProgress)}</span>
            </div>
          </div>
          <div className="goals-summary">
            <div className="goal-stat">
              <span className="goal-icon">✅</span>
              <span>{goalsProgress.completed} metas concluídas</span>
            </div>
            <div className="goal-stat">
              <span className="goal-icon">🎯</span>
              <span>{formatCurrency(goalsProgress.remaining)} restantes</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsAdvanced;
