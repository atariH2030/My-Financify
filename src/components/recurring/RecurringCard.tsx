import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/performance';
import type { RecurringTransaction } from '../../types/financial.types';

interface RecurringCardProps {
  recurring: RecurringTransaction;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

const RecurringCard: React.FC<RecurringCardProps> = ({
  recurring,
  onEdit,
  onToggle,
  onDelete,
}) => {
  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      daily: 'Diariamente',
      weekly: 'Semanalmente',
      biweekly: 'Quinzenalmente',
      monthly: 'Mensalmente',
      bimonthly: 'Bimestralmente',
      quarterly: 'Trimestralmente',
      semiannual: 'Semestralmente',
      yearly: 'Anualmente',
    };
    return labels[freq] || freq;
  };

  const getFrequencyIcon = (freq: string) => {
    const icons: Record<string, string> = {
      daily: 'fa-sun',
      weekly: 'fa-calendar-week',
      biweekly: 'fa-calendar-alt',
      monthly: 'fa-calendar',
      bimonthly: 'fa-calendar-plus',
      quarterly: 'fa-calendar-check',
      semiannual: 'fa-calendar-minus',
      yearly: 'fa-calendar-day',
    };
    return icons[freq] || 'fa-calendar';
  };

  const getStatusBadge = () => {
    const badges: Record<string, { label: string; class: string }> = {
      active: { label: 'Ativa', class: 'status-active' },
      paused: { label: 'Pausada', class: 'status-paused' },
      completed: { label: 'Concluída', class: 'status-completed' },
      cancelled: { label: 'Cancelada', class: 'status-cancelled' },
    };
    return badges[recurring.status] || badges.active;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getDaysUntil = (dateString: string) => {
    const target = new Date(dateString);
    const now = new Date();
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return 'Atrasada';
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    return `${diff} dias`;
  };

  const status = getStatusBadge();
  const isActive = recurring.status === 'active';
  const daysUntil = getDaysUntil(recurring.nextOccurrence);
  const isUrgent = daysUntil === 'Hoje' || daysUntil === 'Amanhã' || daysUntil === 'Atrasada';

  return (
    <Card className={`recurring-card ${!isActive ? 'inactive' : ''} ${recurring.type}`}>
      <div className="recurring-header">
        <div className="recurring-icon" style={{ 
          background: recurring.type === 'income' 
            ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
            : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        }}>
          <i className={`fas ${recurring.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
        </div>
        <div className="recurring-info">
          <h3>{recurring.name}</h3>
          <span className="recurring-category">
            <i className="fas fa-tag"></i> {recurring.category}
          </span>
        </div>
        <span className={`status-badge ${status.class}`}>
          {status.label}
        </span>
      </div>

      <div className="recurring-details">
        <div className="detail-row main">
          <div className="amount-info">
            <span className="amount-label">Valor</span>
            <span className={`amount-value ${recurring.type}`}>
              {formatCurrency(recurring.amount)}
            </span>
          </div>
          <div className="frequency-info">
            <i className={`fas ${getFrequencyIcon(recurring.frequency)}`}></i>
            <span>{getFrequencyLabel(recurring.frequency)}</span>
          </div>
        </div>

        <div className="detail-row">
          <div className="next-occurrence">
            <span className="label">
              <i className="fas fa-clock"></i> Próxima ocorrência
            </span>
            <span className={`value ${isUrgent ? 'urgent' : ''}`}>
              {formatDate(recurring.nextOccurrence)} ({daysUntil})
            </span>
          </div>
        </div>

        {recurring.generatedCount > 0 && (
          <div className="detail-row stats">
            <span className="stat">
              <i className="fas fa-check-circle"></i> {recurring.generatedCount} geradas
            </span>
            {recurring.lastGenerated && (
              <span className="stat">
                <i className="fas fa-history"></i> Última: {formatDate(recurring.lastGenerated)}
              </span>
            )}
          </div>
        )}

        {recurring.autoGenerate && (
          <div className="auto-generate-badge">
            <i className="fas fa-magic"></i> Auto-geração ativa
          </div>
        )}

        {recurring.notes && (
          <div className="notes">
            <i className="fas fa-sticky-note"></i> {recurring.notes}
          </div>
        )}
      </div>

      <div className="recurring-actions">
        <Button variant="secondary" size="sm" onClick={onEdit}>
          <i className="fas fa-edit"></i> Editar
        </Button>
        <Button 
          variant={isActive ? 'warning' : 'success'} 
          size="sm" 
          onClick={onToggle}
        >
          <i className={`fas ${isActive ? 'fa-pause' : 'fa-play'}`}></i>
          {isActive ? 'Pausar' : 'Retomar'}
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete}>
          <i className="fas fa-trash"></i> Excluir
        </Button>
      </div>
    </Card>
  );
};

export default RecurringCard;
