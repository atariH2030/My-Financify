import React from 'react';
import './Card.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  title?: string;
  subtitle?: string;
  icon?: string;
  actions?: React.ReactNode;
}

/**
 * Componente Card reutilizável
 * Base para KPIs, listas e containers
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  title,
  subtitle,
  icon,
  actions,
  ...props
}) => {
  const cardClass = [
    'card',
    `card-padding-${padding}`,
    hover ? 'card-hover' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass} {...props}>
      {(title || subtitle || icon || actions) && (
        <div className="card-header">
          <div className="card-header-content">
            {icon && <i className={`card-icon ${icon}`}></i>}
            <div className="card-header-text">
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
