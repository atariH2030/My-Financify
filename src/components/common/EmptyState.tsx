/**
 * @file EmptyState.tsx
 * @description Estado vazio melhorado com ilustrações e CTAs
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 */

import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string | React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string | React.ReactNode;
  };
  helpLink?: {
    label: string;
    href: string;
  };
  illustration?: 'transactions' | 'goals' | 'budgets' | 'reports' | 'accounts' | 'recurring';
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  helpLink,
  illustration,
  compact = false,
}) => {
  const getIllustrationEmoji = () => {
    const illustrations = {
      transactions: '💸',
      goals: '🎯',
      budgets: '💰',
      reports: '📊',
      accounts: '🏦',
      recurring: '🔄',
    };
    return illustration ? illustrations[illustration] : icon;
  };

  return (
    <motion.div
      className={`empty-state ${compact ? 'empty-state-compact' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Ilustração/Ícone */}
      <motion.div
        className="empty-state-icon"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
      >
        {typeof getIllustrationEmoji() === 'string' ? (
          <span className="empty-state-emoji">{getIllustrationEmoji()}</span>
        ) : (
          getIllustrationEmoji()
        )}
      </motion.div>

      {/* Conteúdo */}
      <div className="empty-state-content">
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-description">{description}</p>
      </div>

      {/* Ações */}
      {(primaryAction || secondaryAction) && (
        <div className="empty-state-actions">
          {primaryAction && (
            <Button
              variant="primary"
              size="lg"
              icon={primaryAction.icon}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              size="lg"
              icon={secondaryAction.icon}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}

      {/* Link de ajuda */}
      {helpLink && (
        <a
          href={helpLink.href}
          className="empty-state-help"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="help-icon">🎓</span>
          <span className="help-text">{helpLink.label}</span>
        </a>
      )}
    </motion.div>
  );
};

export default EmptyState;
