/**
 * @file ReportsPage.tsx
 * @description Página de relatórios com gráficos interativos
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FinancialEvolutionChart,
  CategoryDistributionChart,
  MonthlyComparisonChart,
  BudgetProgressChart
} from '../charts';
import { transactionsService } from '../../services/transactions.service';
import { budgetsService } from '../../services/budgets.service';
import { formatCurrency } from '../../utils/currency';
import Logger from '../../services/logger.service';
import ExportService from '../../services/export.service';
import type { Transaction, Budget } from '../../types/financial.types';
import './ReportsPage.css';

const ReportsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '12m'>('6m');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, budgetsData] = await Promise.all([
        transactionsService.getTransactions(),
        budgetsService.getBudgets()
      ]);
      
      setTransactions(transactionsData || []);
      setBudgets(budgetsData || []);
      Logger.info('Dados de relatórios carregados', { 
        transactions: transactionsData?.length,
        budgets: budgetsData?.length 
      }, 'REPORTS');
    } catch (error) {
      Logger.error('Erro ao carregar dados de relatórios', error as Error, 'REPORTS');
    } finally {
      setLoading(false);
    }
  };

  // Processar dados para Evolução Financeira
  const getEvolutionData = () => {
    const months = getLastNMonths(selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12);
    
    return months.map(month => {
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month.month && tDate.getFullYear() === month.year;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: month.label,
        income,
        expense,
        balance: income - expense
      };
    });
  };

  // Processar dados para Distribuição por Categoria
  const getCategoryData = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = new Map<string, number>();

    expenses.forEach(t => {
      const current = categoryTotals.get(t.category) || 0;
      categoryTotals.set(t.category, current + t.amount);
    });

    const total = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0);

    return Array.from(categoryTotals.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / total) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 categorias
  };

  // Processar dados para Comparativo Mensal
  const getComparisonData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear && t.type === 'expense';
    });

    const previousTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === previousMonth && tDate.getFullYear() === previousYear && t.type === 'expense';
    });

    const categories = new Set([
      ...currentTransactions.map(t => t.category),
      ...previousTransactions.map(t => t.category)
    ]);

    return Array.from(categories).map(category => {
      const currentMonth = currentTransactions
        .filter(t => t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);

      const previousMonth = previousTransactions
        .filter(t => t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);

      return { category, currentMonth, previousMonth };
    }).sort((a, b) => b.currentMonth - a.currentMonth).slice(0, 8);
  };

  // Processar dados para Progresso de Orçamentos
  const getBudgetData = () => {
    return budgets
      .filter(b => b.status === 'active')
      .map(budget => ({
        category: budget.category,
        spent: budget.currentSpent,
        limit: budget.limitAmount,
        percentage: (budget.currentSpent / budget.limitAmount) * 100
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  // Helper: Obter últimos N meses
  const getLastNMonths = (n: number) => {
    const months = [];
    const now = new Date();
    
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        label: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      });
    }
    
    return months;
  };

  // Calcular KPIs
  const calculateKPIs = () => {
    const currentMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      const now = new Date();
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    });

    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return { income, expense, balance, savingsRate };
  };

  /**
   * Exporta relatório em PDF
   */
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      Logger.info('Iniciando exportação de PDF', {}, 'REPORTS');

      const result = await ExportService.export({
        format: 'pdf',
        dataType: 'transactions',
        includeMetadata: true,
        fileName: `relatorio-${new Date().toISOString().split('T')[0]}.pdf`,
      });

      if (result.success) {
        Logger.info('PDF exportado com sucesso', result, 'REPORTS');
      } else {
        Logger.error('Erro ao exportar PDF', new Error(result.error || 'Unknown error'), 'REPORTS');
      }
    } catch (error) {
      Logger.error('Erro ao exportar PDF', error as Error, 'REPORTS');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Exporta relatório em Excel
   */
  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      Logger.info('Iniciando exportação de Excel', {}, 'REPORTS');

      const result = await ExportService.export({
        format: 'excel',
        dataType: 'transactions',
        includeMetadata: true,
        fileName: `relatorio-${new Date().toISOString().split('T')[0]}.xlsx`,
      });

      if (result.success) {
        Logger.info('Excel exportado com sucesso', result, 'REPORTS');
      } else {
        Logger.error('Erro ao exportar Excel', new Error(result.error || 'Unknown error'), 'REPORTS');
      }
    } catch (error) {
      Logger.error('Erro ao exportar Excel', error as Error, 'REPORTS');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="spinner"></div>
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  const kpis = calculateKPIs();
  const evolutionData = getEvolutionData();
  const categoryData = getCategoryData();
  const comparisonData = getComparisonData();
  const budgetData = getBudgetData();

  return (
    <motion.div 
      className="reports-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="reports-header">
        <div className="header-left">
          <h1>📊 Relatórios Financeiros</h1>
          <p>Análise visual completa das suas finanças</p>
        </div>
        <div className="header-right">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="period-selector"
          >
            <option value="3m">Últimos 3 meses</option>
            <option value="6m">Últimos 6 meses</option>
            <option value="12m">Último ano</option>
          </select>
          <button onClick={loadData} className="refresh-btn">
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="kpis-grid">
        <div className="kpi-card income">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <span className="kpi-label">Receitas do Mês</span>
            <span className="kpi-value">{formatCurrency(kpis.income)}</span>
          </div>
        </div>
        <div className="kpi-card expense">
          <div className="kpi-icon">💸</div>
          <div className="kpi-content">
            <span className="kpi-label">Despesas do Mês</span>
            <span className="kpi-value">{formatCurrency(kpis.expense)}</span>
          </div>
        </div>
        <div className="kpi-card balance">
          <div className="kpi-icon">📈</div>
          <div className="kpi-content">
            <span className="kpi-label">Saldo do Mês</span>
            <span className={`kpi-value ${kpis.balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(kpis.balance)}
            </span>
          </div>
        </div>
        <div className="kpi-card savings">
          <div className="kpi-icon">🎯</div>
          <div className="kpi-content">
            <span className="kpi-label">Taxa de Poupança</span>
            <span className={`kpi-value ${kpis.savingsRate >= 0 ? 'positive' : 'negative'}`}>
              {kpis.savingsRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-full">
          <FinancialEvolutionChart data={evolutionData} height={350} />
        </div>

        <div className="chart-half">
          <CategoryDistributionChart data={categoryData} height={400} />
        </div>

        <div className="chart-half">
          <BudgetProgressChart data={budgetData} height={400} />
        </div>

        <div className="chart-full">
          <MonthlyComparisonChart 
            data={comparisonData} 
            height={350}
            currentMonthName={new Date().toLocaleDateString('pt-BR', { month: 'long' })}
            previousMonthName={new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString('pt-BR', { month: 'long' })}
          />
        </div>
      </div>

      {/* Export Actions */}
      <div className="export-actions">
        <button 
          className="export-btn" 
          onClick={handleExportPDF}
          disabled={isExporting || transactions.length === 0}
        >
          📄 {isExporting ? 'Exportando...' : 'Exportar PDF'}
        </button>
        <button 
          className="export-btn" 
          onClick={handleExportExcel}
          disabled={isExporting || transactions.length === 0}
        >
          📊 {isExporting ? 'Exportando...' : 'Exportar Excel'}
        </button>
        <button className="export-btn" disabled>
          📧 Enviar por Email
        </button>
        {transactions.length === 0 && (
          <p className="export-note">💡 Adicione transações para exportar relatórios</p>
        )}
      </div>
    </motion.div>
  );
};

export default ReportsPage;
