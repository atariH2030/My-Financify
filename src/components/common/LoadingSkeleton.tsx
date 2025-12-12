/**
 * @file LoadingSkeleton.tsx
 * @description Componente de loading skeleton otimizado para performance
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 * 
 * Features:
 * - GPU-accelerated animations
 * - Design tokens compliance
 * - Diferentes variantes (page, card, table, list)
 * - Acessível (aria-label, reduced-motion support)
 */

import React from 'react';
import './LoadingSkeleton.css';

export interface LoadingSkeletonProps {
  variant?: 'page' | 'card' | 'table' | 'list' | 'text' | 'avatar' | 'button';
  count?: number;
  height?: string | number;
  width?: string | number;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  count = 1,
  height,
  width,
  className = '',
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => index);

  const renderSkeleton = (index: number) => {
    switch (variant) {
      case 'page':
        return (
          <div key={index} className="skeleton-page" aria-label="Carregando página">
            <div className="skeleton-header">
              <div className="skeleton skeleton-avatar" />
              <div className="skeleton-header-text">
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-subtitle" />
              </div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton skeleton-card" />
              <div className="skeleton skeleton-card" />
              <div className="skeleton skeleton-card" />
            </div>
          </div>
        );

      case 'card':
        return (
          <div
            key={index}
            className={`skeleton skeleton-card ${className}`}
            style={{ height, width }}
            aria-label="Carregando card"
          />
        );

      case 'table':
        return (
          <div key={index} className="skeleton-table" aria-label="Carregando tabela">
            <div className="skeleton skeleton-table-header" />
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="skeleton skeleton-table-row" />
            ))}
          </div>
        );

      case 'list':
        return (
          <div key={index} className="skeleton-list" aria-label="Carregando lista">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="skeleton-list-item">
                <div className="skeleton skeleton-avatar-sm" />
                <div className="skeleton-list-content">
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-text skeleton-text-sm" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'avatar':
        return (
          <div
            key={index}
            className={`skeleton skeleton-avatar ${className}`}
            style={{ height, width }}
            aria-label="Carregando avatar"
          />
        );

      case 'button':
        return (
          <div
            key={index}
            className={`skeleton skeleton-button ${className}`}
            style={{ height, width }}
            aria-label="Carregando botão"
          />
        );

      case 'text':
      default:
        return (
          <div
            key={index}
            className={`skeleton skeleton-text ${className}`}
            style={{ height, width }}
            aria-label="Carregando texto"
          />
        );
    }
  };

  return <>{skeletons.map((_, index) => renderSkeleton(index))}</>;
};

export default LoadingSkeleton;

// Componentes específicos para casos comuns
export const DashboardSkeleton: React.FC = () => (
  <LoadingSkeleton variant="page" />
);

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <LoadingSkeleton variant="card" count={count} />
);

export const TableSkeleton: React.FC = () => (
  <LoadingSkeleton variant="table" />
);

export const ListSkeleton: React.FC = () => (
  <LoadingSkeleton variant="list" />
);
