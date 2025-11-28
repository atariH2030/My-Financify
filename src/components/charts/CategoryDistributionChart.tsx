/**
 * @file CategoryDistributionChart.tsx
 * @description Gráfico de pizza mostrando distribuição de despesas por categoria
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/currency';
import './Charts.css';

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface CategoryDistributionChartProps {
  data: CategoryData[];
  height?: number;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
];

const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ 
  data, 
  height = 350 
}) => {
  const CustomTooltip = useMemo(() => {
    return ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const item = payload[0].payload;
        return (
          <div className="custom-tooltip">
            <p className="label">{item.name}</p>
            <p className="value">
              <strong>{formatCurrency(item.value)}</strong>
            </p>
            <p className="percentage">
              {item.percentage.toFixed(1)}% do total
            </p>
          </div>
        );
      }
      return null;
    };
  }, []);

  const renderLabel = (entry: any) => {
    const categoryData = entry as CategoryData;
    return `${categoryData.percentage.toFixed(0)}%`;
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">🎯 Distribuição por Categoria</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data as any}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={CustomTooltip} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value: string) => {
              const item = data.find(d => d.name === value);
              return `${value} (${formatCurrency(item?.value || 0)})`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryDistributionChart;
