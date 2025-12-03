import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './InteractiveChart.css';

/**
 * InteractiveChart - Sprint 6.2
 * 
 * Gráfico interativo com funcionalidade de drill-down:
 * - Click em um segmento para expandir detalhes
 * - Navegação entre níveis (breadcrumb)
 * - Animações suaves
 * - Suporte a múltiplos níveis de detalhe
 */

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  icon?: string;
  children?: ChartDataPoint[];
  metadata?: Record<string, unknown>;
}

interface InteractiveChartProps {
  data: ChartDataPoint[];
  title: string;
  type?: 'bar' | 'pie' | 'line';
  onDrillDown?: (dataPoint: ChartDataPoint, level: number) => void;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({
  data,
  title,
  type = 'bar',
  onDrillDown,
}) => {
  const [currentData, setCurrentData] = useState<ChartDataPoint[]>(data);
  const [breadcrumb, setBreadcrumb] = useState<Array<{ label: string; data: ChartDataPoint[] }>>([
    { label: title, data },
  ]);

  const handleDrillDown = (dataPoint: ChartDataPoint) => {
    if (!dataPoint.children || dataPoint.children.length === 0) return;

    const newBreadcrumb = [...breadcrumb, { label: dataPoint.label, data: dataPoint.children }];
    setCurrentData(dataPoint.children);
    setBreadcrumb(newBreadcrumb);

    if (onDrillDown) {
      onDrillDown(dataPoint, breadcrumb.length);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setCurrentData(newBreadcrumb[index].data);
    setBreadcrumb(newBreadcrumb);
  };

  const maxValue = Math.max(...currentData.map((d) => d.value));

  return (
    <div className="interactive-chart">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        
        {breadcrumb.length > 1 && (
          <nav className="chart-breadcrumb">
            {breadcrumb.map((crumb, index) => (
              <React.Fragment key={index}>
                <button
                  className={`breadcrumb-item ${index === breadcrumb.length - 1 ? 'active' : ''}`}
                  onClick={() => handleBreadcrumbClick(index)}
                >
                  {crumb.label}
                </button>
                {index < breadcrumb.length - 1 && (
                  <i className="fas fa-chevron-right breadcrumb-separator"></i>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={breadcrumb.length}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="chart-content"
        >
          {type === 'bar' && (
            <div className="bar-chart">
              {currentData.map((dataPoint, index) => (
                <motion.div
                  key={`${dataPoint.label}-${index}`}
                  className={`bar-item ${dataPoint.children ? 'drillable' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => dataPoint.children && handleDrillDown(dataPoint)}
                  title={dataPoint.children ? 'Clique para expandir detalhes' : ''}
                >
                  <div className="bar-label">
                    {dataPoint.icon && <i className={dataPoint.icon}></i>}
                    <span>{dataPoint.label}</span>
                    {dataPoint.children && (
                      <i className="fas fa-chevron-down drill-icon"></i>
                    )}
                  </div>
                  <div className="bar-container">
                    <motion.div
                      className="bar-fill"
                      style={{
                        backgroundColor: dataPoint.color || '#3b82f6',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(dataPoint.value / maxValue) * 100}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                    >
                      <span className="bar-value">
                        R$ {dataPoint.value.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {type === 'pie' && (
            <div className="pie-chart">
              <div className="pie-legend">
                {currentData.map((dataPoint, index) => (
                  <motion.div
                    key={`${dataPoint.label}-${index}`}
                    className={`legend-item ${dataPoint.children ? 'drillable' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => dataPoint.children && handleDrillDown(dataPoint)}
                  >
                    <div
                      className="legend-color"
                      style={{ backgroundColor: dataPoint.color || '#3b82f6' }}
                    ></div>
                    <span className="legend-label">{dataPoint.label}</span>
                    <span className="legend-value">
                      R$ {dataPoint.value.toLocaleString('pt-BR')}
                    </span>
                    {dataPoint.children && (
                      <i className="fas fa-chevron-right drill-icon"></i>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {breadcrumb.length > 1 && (
        <button
          className="back-button"
          onClick={() => handleBreadcrumbClick(breadcrumb.length - 2)}
        >
          <i className="fas fa-arrow-left"></i>
          Voltar
        </button>
      )}
    </div>
  );
};

export default InteractiveChart;
