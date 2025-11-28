/**
 * @file FinancialEvolutionChart.tsx
 * @description Gráfico de linha mostrando evolução de receitas e despesas ao longo do tempo
 * @version 1.0.0
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/currency';
import './Charts.css';

interface DataPoint {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

interface FinancialEvolutionChartProps {
  data: DataPoint[];
  height?: number;
}

// Tooltip component (module-level para evitar re-criação)
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{payload[0].payload.month}</p>
        <p className="income">
          Receitas: <strong>{formatCurrency(payload[0].value)}</strong>
        </p>
        <p className="expense">
          Despesas: <strong>{formatCurrency(payload[1].value)}</strong>
        </p>
        <p className="balance">
          Saldo: <strong>{formatCurrency(payload[2].value)}</strong>
        </p>
      </div>
    );
  }
  return null;
};
CustomTooltip.displayName = 'CustomTooltip';

const FinancialEvolutionChart: React.FC<FinancialEvolutionChartProps> = ({ 
  data, 
  height = 300 
}) => {
  return (
    <div className="chart-container">
      <h3 className="chart-title">📈 Evolução Financeira</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="month" 
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#666"
            style={{ fontSize: '12px' }}
            tickFormatter={(value: number) => formatCurrency(value).replace('R$', '').trim()}
          />
          <Tooltip content={CustomTooltip} />
          <Legend 
            wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="Receitas"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Despesas"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            name="Saldo"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialEvolutionChart;
