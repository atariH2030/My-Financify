import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

/**
 * SkeletonLoader - Loading placeholder animado
 * Melhora UX durante carregamento de dados
 * Implementa TQM: Performance + UX profissional
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = ''
}) => {
  const baseClass = `skeleton skeleton-${variant} ${className}`;

  const style: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
  };

  // Text variant com múltiplas linhas
  if (variant === 'text' && lines > 1) {
    return (
      <div className="skeleton-group">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={baseClass}
            style={{
              ...style,
              width: index === lines - 1 ? '80%' : style.width || '100%'
            }}
          />
        ))}
      </div>
    );
  }

  // Card variant (layout completo)
  if (variant === 'card') {
    return (
      <div className="skeleton-card">
        <div className="skeleton-card-header">
          <div className="skeleton skeleton-circular" style={{ width: 40, height: 40 }} />
          <div className="skeleton-card-text">
            <div className="skeleton skeleton-text" style={{ width: '60%', height: 16 }} />
            <div className="skeleton skeleton-text" style={{ width: '40%', height: 12 }} />
          </div>
        </div>
        <div className="skeleton-card-body">
          <div className="skeleton skeleton-text" style={{ width: '100%', height: 12 }} />
          <div className="skeleton skeleton-text" style={{ width: '90%', height: 12 }} />
          <div className="skeleton skeleton-text" style={{ width: '75%', height: 12 }} />
        </div>
      </div>
    );
  }

  // Variantes simples
  return <div className={baseClass} style={style} />;
};

/**
 * Skeleton presets para casos comuns
 */
// eslint-disable-next-line react-refresh/only-export-components
export const SkeletonPresets = {
  /**
   * KPI Card loading
   */
  KPICard: () => (
    <div className="skeleton-kpi-card">
      <div className="skeleton skeleton-text" style={{ width: '40%', height: 14 }} />
      <div className="skeleton skeleton-text" style={{ width: '60%', height: 32, marginTop: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: '30%', height: 12, marginTop: 4 }} />
    </div>
  ),

  /**
   * Table row loading
   */
  TableRow: ({ columns = 4 }: { columns?: number }) => (
    <div className="skeleton-table-row">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text" style={{ height: 16 }} />
      ))}
    </div>
  ),

  /**
   * List item loading
   */
  ListItem: () => (
    <div className="skeleton-list-item">
      <div className="skeleton skeleton-circular" style={{ width: 44, height: 44 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-text" style={{ width: '60%', height: 16 }} />
        <div className="skeleton skeleton-text" style={{ width: '40%', height: 12, marginTop: 4 }} />
      </div>
    </div>
  ),

  /**
   * Avatar loading
   */
  Avatar: ({ size = 44 }: { size?: number }) => (
    <div className="skeleton skeleton-circular" style={{ width: size, height: size }} />
  )
};

export default SkeletonLoader;
