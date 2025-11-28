/**
 * @file MonthlyComparisonChart.tsx
 * @description Gráfico de barras comparando mês atual vs anterior
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
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/currency';
import './Charts.css';

interface ComparisonData {
  category: string;
  currentMonth: number;
  previousMonth: number;
}

interface MonthlyComparisonChartProps {
  data: ComparisonData[];
  height?: number;
  currentMonthName?: string;
  previousMonthName?: string;
}

const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ 
  data, 
  height = 300,
  currentMonthName = 'Mês Atual',
  previousMonthName = 'Mês Anterior'
}) => {
  const CustomTooltip = useMemo(() => {
    return ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="custom-tooltip">
            <p className="label">{payload[0].payload.category}</p>
            <p className="current">
              {currentMonthName}: <strong>{formatCurrency(payload[0].value)}</strong>
            </p>
            <p className="previous">
              {previousMonthName}: <strong>{formatCurrency(payload[1].value)}</strong>
            </p>
            <p className="diff">
              Variação: <strong className={payload[0].value > payload[1].value ? 'negative' : 'positive'}>
                {payload[0].value > payload[1].value ? '▲' : '▼'} {formatCurrency(Math.abs(payload[0].value - payload[1].value))}
              </strong>
            </p>
          </div>
        );
      }
      return null;
    };
  }, [currentMonthName, previousMonthName]);

  return (
    <div className="chart-container">
      <h3 className="chart-title">📊 Comparativo Mensal</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="category" 
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#666"
            style={{ fontSize: '12px' }}
            tickFormatter={(value: number) => formatCurrency(value).replace('R$', '').trim()}
          />
          <Tooltip content={CustomTooltip} />
          <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
          <Bar 
            dataKey="currentMonth" 
            name={currentMonthName}
            fill="#3b82f6" 
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            dataKey="previousMonth" 
            name={previousMonthName}
            fill="#94a3b8" 
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyComparisonChart;
