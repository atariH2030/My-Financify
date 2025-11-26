import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: string | React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

/**
 * Componente Button reutilizável e acessível
 * Segue os padrões do Design System do Financify Life
 * v2.0 - Suporte a iconPosition, loading states, variante outline
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  disabled,
  className = '',
  ...props
}) => {
  const buttonClass = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    loading ? 'loading' : '',
    className
  ].filter(Boolean).join(' ');

  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <i className={`btn-icon ${icon}`}></i>;
    }
    return <span className="btn-icon">{icon}</span>;
  };

  return (
    <button 
      className={buttonClass} 
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn-icon">
            <i className="fas fa-spinner fa-spin"></i>
          </span>
          <span>Carregando...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && renderIcon()}
          <span className="btn-text">{children}</span>
          {icon && iconPosition === 'right' && renderIcon()}
        </>
      )}
    </button>
  );
};

export default Button;
