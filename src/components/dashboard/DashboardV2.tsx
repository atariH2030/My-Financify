/**
 * @file DashboardV2.tsx
 * @description Dashboard moderno com gráficos interativos e KPIs
 * @version 2.5.0
 * @author DEV - Rickson (TQM)
 */

import React, { useState, useMemo } from 'react';
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
import { formatMonthYear, getLastNMonths } from '../../utils/date';
import Card from '../common/Card';
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

  // Mock data - substituir com dados reais do Storage
  const kpis: KPI[] = useMemo(
    () => [
      {
        id: 'balance',
        label: 'Saldo Total',
        value: 15420.5,
        change: 12.5,
        icon: '💰',
        color: 'var(--primary)',
      },
      {
        id: 'income',
        label: 'Receitas',
        value: 8500.0,
        change: 8.2,
        icon: '📈',
        color: 'var(--success)',
      },
      {
        id: 'expenses',
        label: 'Despesas',
        value: 5234.75,
        change: -3.1,
        icon: '📉',
        color: 'var(--danger)',
      },
      {
        id: 'savings',
        label: 'Economia',
        value: 3265.25,
        change: 15.7,
        icon: '🎯',
        color: 'var(--warning)',
      },
    ],
    []
  );

  // Dados do gráfico de linha (últimos 6 meses)
  const lineChartData = useMemo(() => {
    const months = getLastNMonths(6).map((date) => formatMonthYear(date));

    return {
      labels: months,
      datasets: [
        {
          label: 'Receitas',
          data: [7200, 7500, 8100, 7800, 8200, 8500],
          borderColor: 'var(--success)',
          backgroundColor: 'var(--success-transparent)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Despesas',
          data: [5100, 5400, 5800, 5200, 5600, 5234],
          borderColor: 'var(--danger)',
          backgroundColor: 'var(--danger-transparent)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, []);

  // Dados do gráfico de barras (categorias)
  const barChartData = useMemo(
    () => ({
      labels: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Outros'],
      datasets: [
        {
          label: 'Despesas por Categoria',
          data: [1250, 850, 1800, 450, 380, 504.75],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 2,
        },
      ],
    }),
    []
  );

  // Dados do gráfico de rosca (distribuição)
  const doughnutData = useMemo(
    () => ({
      labels: ['Necessidades', 'Desejos', 'Investimentos'],
      datasets: [
        {
          label: 'Distribuição 50/30/20',
          data: [2617, 1570, 1047],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)',
          ],
          borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
          borderWidth: 2,
        },
      ],
    }),
    []
  );

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
                    {kpi.change >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(kpi.change) / 100, 1)}
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

        <Card title="Despesas por Categoria" className="chart-card">
          <div className="chart-container">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </Card>

        <Card title="Regra 50/30/20" className="chart-card chart-small">
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
    </motion.div>
  );
};

export default DashboardV2;
