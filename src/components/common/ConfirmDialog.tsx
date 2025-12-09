/**
 * @file ConfirmDialog.tsx
 * @description Modal de confirmação para ações destrutivas
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { useTranslation } from '../../contexts/LanguageContext';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  icon?: React.ReactNode;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  icon,
  loading = false,
}) => {
  const { t } = useTranslation();
  const finalConfirmText = confirmText || t('common.yes');
  const finalCancelText = cancelText || t('common.cancel');
  // Prevenir scroll quando modal aberto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fechar com ESC
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="confirm-dialog-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!loading ? onCancel : undefined}
      >
        <motion.div
          className="confirm-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          role="alertdialog"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-message"
          aria-modal="true"
        >
          {/* Ícone */}
          {icon && (
            <div className={`confirm-dialog-icon confirm-dialog-icon-${confirmVariant}`}>
              {icon}
            </div>
          )}

          {/* Conteúdo */}
          <div className="confirm-dialog-content">
            <h2 id="dialog-title" className="confirm-dialog-title">
              {title}
            </h2>
            <p id="dialog-message" className="confirm-dialog-message">
              {message}
            </p>
          </div>

          {/* Ações */}
          <div className="confirm-dialog-actions">
            <Button
              variant="outline"
              size="lg"
              onClick={onCancel}
              disabled={loading}
              fullWidth
            >
              {finalCancelText}
            </Button>
            <Button
              variant={confirmVariant}
              size="lg"
              onClick={onConfirm}
              loading={loading}
              fullWidth
            >
              {finalConfirmText}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
