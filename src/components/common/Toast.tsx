import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  icon?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Hook para usar o sistema de notificações
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

/**
 * Provider do sistema de notificações Toast
 * Implementa TQM: Feedback visual consistente para o usuário
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Gera ID único para o toast
   */
  const generateId = (): string => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Ícones padrão por tipo
   */
  const getIconByType = (type: ToastType): string => {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type];
  };

  /**
   * Remove toast específico
   */
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * Adiciona novo toast
   */
  const showToast = useCallback((
    message: string, 
    type: ToastType = 'info', 
    duration: number = 5000
  ) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      type,
      message,
      duration,
      icon: getIconByType(type)
    };

    setToasts(prev => {
      // Limita quantidade de toasts simultâneos (Performance)
      const updated = [...prev, newToast];
      return updated.slice(-maxToasts);
    });

    // Auto-remove após duração
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [maxToasts, removeToast]);

  /**
   * Helpers para cada tipo
   */
  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Container que renderiza os toasts
 */
interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

/**
 * Item individual de toast
 */
interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const handleClose = () => {
    onRemove(toast.id);
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      {toast.icon && <i className={`toast-icon ${toast.icon}`}></i>}
      <span className="toast-message">{toast.message}</span>
      <button 
        className="toast-close" 
        onClick={handleClose}
        aria-label="Fechar notificação"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default ToastProvider;
