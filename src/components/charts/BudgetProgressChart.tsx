/**
 * @file BudgetProgressChart.tsx
 * @description Gráfico de barras horizontais mostrando progresso dos orçamentos
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/currency';
import './Charts.css';

interface BudgetData {
  category: string;
  spent: number;
  limit: number;
  percentage: number;
}

interface BudgetProgressChartProps {
  data: BudgetData[];
  height?: number;
}

const getBarColor = (percentage: number) => {
  if (percentage >= 100) return '#ef4444'; // red - excedido
  if (percentage >= 80) return '#f59e0b'; // amber - alerta
  if (percentage >= 50) return '#3b82f6'; // blue - normal
  return '#10b981'; // green - baixo uso
};

const BudgetProgressChart: React.FC<BudgetProgressChartProps> = ({ 
  data, 
  height = 300 
}) => {
  const CustomTooltip = useMemo(() => {
    return ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const item = payload[0].payload;
        return (
          <div className="custom-tooltip">
            <p className="label">{item.category}</p>
            <p className="spent">
              Gasto: <strong>{formatCurrency(item.spent)}</strong>
            </p>
            <p className="limit">
              Limite: <strong>{formatCurrency(item.limit)}</strong>
            </p>
            <p className="percentage">
              <strong style={{ color: getBarColor(item.percentage) }}>
                {item.percentage.toFixed(1)}%
              </strong> do orçamento
            </p>
            <p className="remaining">
              {item.percentage < 100 ? 'Restante' : 'Excedido'}: {' '}
              <strong className={item.percentage < 100 ? 'positive' : 'negative'}>
                {formatCurrency(Math.abs(item.limit - item.spent))}
              </strong>
            </p>
          </div>
        );
      }
      return null;
    };
  }, []);

  return (
    <div className="chart-container">
      <h3 className="chart-title">💰 Progresso dos Orçamentos</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={data} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            type="number" 
            stroke="#666"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
            tickFormatter={(value: number) => `${value}%`}
          />
          <YAxis 
            type="category" 
            dataKey="category" 
            stroke="#666"
            style={{ fontSize: '12px' }}
            width={90}
          />
          <Tooltip content={CustomTooltip} />
          <Bar 
            dataKey="percentage" 
            radius={[0, 8, 8, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="budget-legend">
        <span className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
          Baixo (&lt;50%)
        </span>
        <span className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
          Normal (50-80%)
        </span>
        <span className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
          Alerta (80-100%)
        </span>
        <span className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
          Excedido (&gt;100%)
        </span>
      </div>
    </div>
  );
};

export default BudgetProgressChart;
