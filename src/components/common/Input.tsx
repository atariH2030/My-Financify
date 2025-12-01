import React, { useState } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
  fullWidth?: boolean;
}

/**
 * Componente Input reutilizável
 * Com validação visual e acessibilidade
 */
const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const [generatedId] = useState(() => `input-${Math.random().toString(36).substr(2, 9)}`);
  const inputId = id || generatedId;
  const hasError = Boolean(error);

  const containerClass = [
    'input-container',
    fullWidth ? 'input-fullwidth' : '',
    hasError ? 'input-error' : '',
    icon ? 'input-with-icon' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {props.required && <span className="input-required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <i className={`input-icon ${icon}`}></i>}
        <input
          id={inputId}
          className={`input ${className}`}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
      </div>
      {error && (
        <span id={`${inputId}-error`} className="input-error-message" role="alert">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className="input-helper-text">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
