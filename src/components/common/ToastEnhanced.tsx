/**
 * @file ToastEnhanced.tsx
 * @description Sistema de Toast melhorado com ações e ícones contextuais
 * @version 2.0.0
 * @author DEV - Rickson (TQM)
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ToastEnhanced.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastEnhanced {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  icon?: string | React.ReactNode;
  action?: ToastAction;
  dismissible?: boolean;
}

interface ToastEnhancedOptions {
  title?: string;
  duration?: number;
  icon?: string | React.ReactNode;
  action?: ToastAction;
  dismissible?: boolean;
}

interface ToastContextValue {
  toasts: ToastEnhanced[];
  showToast: (message: string, type?: ToastType, options?: ToastEnhancedOptions) => void;
  success: (message: string, options?: ToastEnhancedOptions) => void;
  error: (message: string, options?: ToastEnhancedOptions) => void;
  warning: (message: string, options?: ToastEnhancedOptions) => void;
  info: (message: string, options?: ToastEnhancedOptions) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useToastEnhanced = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastEnhanced deve ser usado dentro de ToastEnhancedProvider');
  }
  return context;
};

interface ToastEnhancedProviderProps {
  children: ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastEnhancedProvider: React.FC<ToastEnhancedProviderProps> = ({ 
  children, 
  maxToasts = 5,
  position = 'top-right'
}) => {
  const [toasts, setToasts] = useState<ToastEnhanced[]>([]);

  const generateId = (): string => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const getDefaultIcon = (type: ToastType): string => {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ⓘ'
    };
    return icons[type];
  };

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((
    message: string, 
    type: ToastType = 'info', 
    options: ToastEnhancedOptions = {}
  ) => {
    const id = generateId();
    const newToast: ToastEnhanced = {
      id,
      type,
      title: options.title,
      message,
      duration: options.duration ?? 5000,
      icon: options.icon ?? getDefaultIcon(type),
      action: options.action,
      dismissible: options.dismissible ?? true
    };

    setToasts(prev => {
      const updated = [...prev, newToast];
      return updated.slice(-maxToasts);
    });

    // Auto-dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => removeToast(id), newToast.duration);
    }
  }, [maxToasts, removeToast]);

  const success = useCallback((message: string, options?: ToastEnhancedOptions) => {
    showToast(message, 'success', options);
  }, [showToast]);

  const error = useCallback((message: string, options?: ToastEnhancedOptions) => {
    showToast(message, 'error', options);
  }, [showToast]);

  const warning = useCallback((message: string, options?: ToastEnhancedOptions) => {
    showToast(message, 'warning', options);
  }, [showToast]);

  const info = useCallback((message: string, options?: ToastEnhancedOptions) => {
    showToast(message, 'info', options);
  }, [showToast]);

  const value: ToastContextValue = {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={`toast-container toast-${position}`}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              onDismiss={() => removeToast(toast.id)} 
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

interface ToastItemProps {
  toast: ToastEnhanced;
  onDismiss: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  return (
    <motion.div
      className={`toast-enhanced toast-${toast.type}`}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', duration: 0.4 }}
      role="alert"
      aria-live="polite"
    >
      {/* Ícone */}
      <div className="toast-icon">
        {typeof toast.icon === 'string' ? (
          <span>{toast.icon}</span>
        ) : (
          toast.icon
        )}
      </div>

      {/* Conteúdo */}
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
        
        {/* Ação */}
        {toast.action && (
          <button
            className="toast-action"
            onClick={() => {
              toast.action?.onClick();
              onDismiss();
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Botão Fechar */}
      {toast.dismissible && (
        <button
          className="toast-close"
          onClick={onDismiss}
          aria-label="Fechar notificação"
        >
          ✕
        </button>
      )}

      {/* Barra de progresso */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className="toast-progress"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};

export default ToastEnhancedProvider;
