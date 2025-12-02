/**
 * @file GoalsTable.tsx
 * @description Tabela interativa de metas com barras de progresso e filtros
 * @version 3.0.0
 * @author DEV - Rickson (TQM)
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import Card from '../common/Card';
import type { FinancialGoal, GoalType } from '../../types/financial.types';
import { formatCurrency, formatPercentage } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import './GoalsTable.css';

interface GoalsTableProps {
  goals: FinancialGoal[];
  onEdit: (goal: FinancialGoal) => void;
  onDelete: (goalId: string) => void;
  onAddProgress: (goalId: string, amount: number) => void;
}

type FilterType = 'all' | GoalType;
type FilterStatus = 'all' | 'active' | 'completed' | 'paused';

const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  'emergency': 'Emergência',
  'savings': 'Poupança',
  'investment': 'Investimento',
  'wishlist': 'Lista de Desejos',
  'debt-payment': 'Pagamento de Dívida',
};

export const GoalsTable: React.FC<GoalsTableProps> = ({
  goals,
  onEdit,
  onDelete,
  onAddProgress,
}) => {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [addingProgressTo, setAddingProgressTo] = useState<string | null>(null);
  const [progressAmount, setProgressAmount] = useState('');

  // Filtrar metas
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesType = filterType === 'all' || goal.type === filterType;
      const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
      const matchesSearch =
        searchTerm === '' ||
        goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [goals, filterType, filterStatus, searchTerm]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const active = goals.filter((g) => g.status === 'active');
    const totalTarget = active.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = active.reduce((sum, g) => sum + g.currentAmount, 0);
    const completed = goals.filter((g) => g.status === 'completed').length;

    return {
      total: goals.length,
      active: active.length,
      completed,
      totalTarget,
      totalCurrent,
      progress: totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0,
    };
  }, [goals]);

  const calculateProgress = (goal: FinancialGoal): number => {
    if (goal.targetAmount === 0) return 0;
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const calculateDaysRemaining = (deadline: Date): number => {
    const now = new Date();
    const diff = new Date(deadline).getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleAddProgress = (goalId: string) => {
    const amount = parseFloat(progressAmount);
    if (amount > 0) {
      onAddProgress(goalId, amount);
      setAddingProgressTo(null);
      setProgressAmount('');
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'active':
        return 'badge-active';
      case 'completed':
        return 'badge-completed';
      case 'paused':
        return 'badge-paused';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return '';
    }
  };

  const getPriorityBadgeClass = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'badge-priority-high';
      case 'medium':
        return 'badge-priority-medium';
      case 'low':
        return 'badge-priority-low';
      default:
        return '';
    }
  };

  if (goals.length === 0) {
    return (
      <div className="goals-empty">
        <span className="goals-empty-icon">🎯</span>
        <p className="goals-empty-title">Nenhuma meta cadastrada</p>
        <p className="goals-empty-hint">
          Crie sua primeira meta financeira e comece a alcançar seus objetivos!
        </p>
      </div>
    );
  }

  return (
    <div className="goals-table-container">
      {/* Estatísticas */}
      <div className="goals-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-icon">🎯</span>
            <div className="stat-details">
              <p className="stat-label">Total de Metas</p>
              <h3 className="stat-value">{stats.total}</h3>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-icon">⚡</span>
            <div className="stat-details">
              <p className="stat-label">Ativas</p>
              <h3 className="stat-value">{stats.active}</h3>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="stat-content">
            <span className="stat-icon">✅</span>
            <div className="stat-details">
              <p className="stat-label">Concluídas</p>
              <h3 className="stat-value">{stats.completed}</h3>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card-wide">
          <div className="stat-content">
            <span className="stat-icon">💰</span>
            <div className="stat-details">
              <p className="stat-label">Progresso Total</p>
              <h3 className="stat-value">
                {formatCurrency(stats.totalCurrent)} / {formatCurrency(stats.totalTarget)}
              </h3>
              <div className="stat-progress-bar">
                <div
                  className="stat-progress-fill"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
              <span className="stat-percentage">{formatPercentage(stats.progress)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="goals-filters">
        <div className="filters-left">
          <input
            type="text"
            placeholder="🔍 Buscar meta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search"
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="filter-select"
          >
            <option value="all">Todos os Tipos</option>
            <option value="emergency">🚨 Emergência</option>
            <option value="savings">💰 Poupança</option>
            <option value="investment">📈 Investimento</option>
            <option value="wishlist">🎁 Lista de Desejos</option>
            <option value="debt-payment">💳 Dívida</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="filter-select"
          >
            <option value="all">Todos os Status</option>
            <option value="active">⚡ Ativas</option>
            <option value="completed">✅ Concluídas</option>
            <option value="paused">⏸️ Pausadas</option>
          </select>
        </div>

        <div className="filters-count">
          {filteredGoals.length} meta{filteredGoals.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Lista de Metas */}
      <div className="goals-grid">
        <AnimatePresence>
          {filteredGoals.map((goal) => {
            const progress = calculateProgress(goal);
            const daysRemaining = calculateDaysRemaining(goal.deadline);
            const isOverdue = daysRemaining < 0 && goal.status === 'active';

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="goal-card">
                  <div className="goal-header">
                    <div className="goal-icon" style={{ color: goal.color }}>
                      {goal.icon}
                    </div>
                    <div className="goal-title-section">
                      <h3 className="goal-title">{goal.title}</h3>
                      <div className="goal-badges">
                        <span className={`goal-badge ${getStatusBadgeClass(goal.status)}`}>
                          {goal.status === 'active' && '⚡ Ativa'}
                          {goal.status === 'completed' && '✅ Concluída'}
                          {goal.status === 'paused' && '⏸️ Pausada'}
                          {goal.status === 'cancelled' && '❌ Cancelada'}
                        </span>
                        <span className={`goal-badge ${getPriorityBadgeClass(goal.priority)}`}>
                          {goal.priority === 'high' && '🔴 Alta'}
                          {goal.priority === 'medium' && '🟡 Média'}
                          {goal.priority === 'low' && '🟢 Baixa'}
                        </span>
                        <span className="goal-badge badge-type">
                          {GOAL_TYPE_LABELS[goal.type]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="goal-description">{goal.description}</p>
                  )}

                  {/* Imagem da Wishlist */}
                  {goal.isWishlist && goal.imageUrl && (
                    <div className="goal-image">
                      <img src={goal.imageUrl} alt={goal.title} />
                    </div>
                  )}

                  {/* Progresso */}
                  <div className="goal-progress-section">
                    <div className="goal-progress-header">
                      <span className="goal-progress-label">Progresso</span>
                      <span className="goal-progress-percentage">
                        {formatPercentage(progress)}
                      </span>
                    </div>
                    <div className="goal-progress-bar">
                      <motion.div
                        className="goal-progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{
                          backgroundColor:
                            progress >= 100
                              ? 'var(--success)'
                              : progress >= 75
                              ? 'var(--primary)'
                              : progress >= 50
                              ? 'var(--warning)'
                              : 'var(--danger)',
                        }}
                      />
                    </div>
                    <div className="goal-amounts">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  {/* Prazo */}
                  <div className="goal-deadline">
                    <span className="goal-deadline-label">📅 Prazo:</span>
                    <span className={`goal-deadline-value ${isOverdue ? 'overdue' : ''}`}>
                      {formatDate(goal.deadline)}
                      {goal.status === 'active' && (
                        <span className="goal-days-badge">
                          {isOverdue ? `⚠️ -${Math.abs(daysRemaining)}d` : `⏰ ${daysRemaining}d`}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Link da Wishlist */}
                  {goal.link && (
                    <a
                      href={goal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="goal-link"
                    >
                      🔗 Ver produto/serviço
                    </a>
                  )}

                  {/* Ações */}
                  <div className="goal-actions">
                    {goal.status === 'active' && progress < 100 && (
                      <>
                        {addingProgressTo === goal.id ? (
                          <div className="add-progress-form">
                            <input
                              type="number"
                              placeholder="R$ 0,00"
                              value={progressAmount}
                              onChange={(e) => setProgressAmount(e.target.value)}
                              className="progress-input"
                              min="0"
                              step="0.01"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddProgress(goal.id)}
                              disabled={!progressAmount || parseFloat(progressAmount) <= 0}
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setAddingProgressTo(null);
                                setProgressAmount('');
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setAddingProgressTo(goal.id)}
                          >
                            💰 Adicionar Valor
                          </Button>
                        )}
                      </>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => onEdit(goal)}>
                      ✏️ Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(goal.id)}>
                      🗑️ Excluir
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredGoals.length === 0 && goals.length > 0 && (
        <div className="goals-no-results">
          <p>Nenhuma meta encontrada com os filtros selecionados</p>
        </div>
      )}
    </div>
  );
};

export default GoalsTable;
