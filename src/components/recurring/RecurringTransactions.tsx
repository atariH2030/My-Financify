import React, { useState, useEffect } from 'react';
import { Button, Modal } from '../common';
import RecurringForm from './RecurringForm';
import RecurringCard from './RecurringCard';
import RecurringService from '../../services/recurring.service';
import { formatCurrency } from '../../utils/performance';
import type { RecurringTransaction } from '../../types/financial.types';
import './Recurring.css';

const RecurringTransactions: React.FC = () => {
  const [recurrings, setRecurrings] = useState<RecurringTransaction[]>([]);
  const [filteredRecurrings, setFilteredRecurrings] = useState<RecurringTransaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | undefined>();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');

  useEffect(() => {
    loadRecurrings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recurrings, filterType, filterStatus]);

  const loadRecurrings = () => {
    const data = RecurringService.getAll();
    setRecurrings(data);
  };

  const applyFilters = () => {
    let filtered = [...recurrings];

    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Ordena por próxima ocorrência
    filtered.sort((a, b) => 
      new Date(a.nextOccurrence).getTime() - new Date(b.nextOccurrence).getTime()
    );

    setFilteredRecurrings(filtered);
  };

  const handleCreate = () => {
    setEditingRecurring(undefined);
    setShowModal(true);
  };

  const handleEdit = (recurring: RecurringTransaction) => {
    setEditingRecurring(recurring);
    setShowModal(true);
  };

  const handleSubmit = (data: Partial<RecurringTransaction>) => {
    if (editingRecurring) {
      RecurringService.update(editingRecurring.id, data);
    } else {
      RecurringService.create(data as Omit<RecurringTransaction, 'id' | 'createdAt' | 'generatedCount' | 'nextOccurrence'>);
    }
    loadRecurrings();
    setShowModal(false);
    setEditingRecurring(undefined);
  };

  const handleToggle = (recurring: RecurringTransaction) => {
    RecurringService.toggleStatus(recurring.id);
    loadRecurrings();
  };

  const handleDelete = (recurring: RecurringTransaction) => {
    if (window.confirm(`Deseja realmente excluir a recorrência "${recurring.name}"?`)) {
      RecurringService.remove(recurring.id);
      loadRecurrings();
    }
  };

  const summary = RecurringService.getSummary();
  const upcoming = RecurringService.getUpcoming(7);

  return (
    <div className="recurring-page">
      <div className="recurring-header">
        <h1>
          <i className="fas fa-sync-alt"></i>
          Transações Recorrentes
        </h1>
        <Button onClick={handleCreate}>
          <i className="fas fa-plus"></i> Nova Recorrência
        </Button>
      </div>

      {/* Resumo */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon income">
            <i className="fas fa-arrow-up"></i>
          </div>
          <div className="summary-content">
            <span className="summary-label">Receitas Mensais</span>
            <span className="summary-value positive">
              {formatCurrency(summary.totalMonthlyIncome)}
            </span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon expense">
            <i className="fas fa-arrow-down"></i>
          </div>
          <div className="summary-content">
            <span className="summary-label">Despesas Mensais</span>
            <span className="summary-value negative">
              {formatCurrency(summary.totalMonthlyExpense)}
            </span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon upcoming">
            <i className="fas fa-clock"></i>
          </div>
          <div className="summary-content">
            <span className="summary-label">Próximos 30 Dias</span>
            <span className="summary-value">
              {summary.upcomingCount} ({formatCurrency(summary.upcomingAmount)})
            </span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon total">
            <i className="fas fa-list"></i>
          </div>
          <div className="summary-content">
            <span className="summary-label">Total de Recorrências</span>
            <span className="summary-value">
              {summary.active} ativas / {summary.total} total
            </span>
          </div>
        </div>
      </div>

      {/* Próximas 7 dias */}
      {upcoming.length > 0 && (
        <div className="upcoming-section">
          <h2>
            <i className="fas fa-bell"></i>
            Próximos 7 Dias
          </h2>
          <div className="upcoming-list">
            {upcoming.map(rec => {
              const date = new Date(rec.nextOccurrence);
              const days = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isToday = days === 0;
              const isTomorrow = days === 1;
              
              return (
                <div key={rec.id} className={`upcoming-item ${isToday ? 'today' : ''} ${rec.type}`}>
                  <div className="upcoming-date">
                    <span className="day">{date.getDate()}</span>
                    <span className="month">{date.toLocaleDateString('pt-BR', { month: 'short' })}</span>
                  </div>
                  <div className="upcoming-info">
                    <strong>{rec.name}</strong>
                    <span className="upcoming-category">{rec.category}</span>
                  </div>
                  <div className="upcoming-amount">
                    <span className={rec.type}>{formatCurrency(rec.amount)}</span>
                    <span className="upcoming-label">
                      {isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : `${days} dias`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filters">
        <div className="filter-group">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Todas
          </button>
          <button
            className={`filter-btn ${filterType === 'income' ? 'active' : ''}`}
            onClick={() => setFilterType('income')}
          >
            <i className="fas fa-arrow-up"></i> Receitas
          </button>
          <button
            className={`filter-btn ${filterType === 'expense' ? 'active' : ''}`}
            onClick={() => setFilterType('expense')}
          >
            <i className="fas fa-arrow-down"></i> Despesas
          </button>
        </div>

        <div className="filter-group">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Todos Status
          </button>
          <button
            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            <i className="fas fa-check-circle"></i> Ativas
          </button>
          <button
            className={`filter-btn ${filterStatus === 'paused' ? 'active' : ''}`}
            onClick={() => setFilterStatus('paused')}
          >
            <i className="fas fa-pause-circle"></i> Pausadas
          </button>
        </div>
      </div>

      {/* Grid de Recorrências */}
      <div className="recurring-grid">
        {filteredRecurrings.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-sync-alt"></i>
            <h3>Nenhuma transação recorrente</h3>
            <p>Crie sua primeira recorrência para automatizar despesas e receitas fixas.</p>
            <Button onClick={handleCreate}>
              <i className="fas fa-plus"></i> Criar Primeira Recorrência
            </Button>
          </div>
        ) : (
          filteredRecurrings.map(recurring => (
            <RecurringCard
              key={recurring.id}
              recurring={recurring}
              onEdit={() => handleEdit(recurring)}
              onToggle={() => handleToggle(recurring)}
              onDelete={() => handleDelete(recurring)}
            />
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          title={editingRecurring ? 'Editar Recorrência' : 'Nova Recorrência'}
          onClose={() => {
            setShowModal(false);
            setEditingRecurring(undefined);
          }}
        >
          <RecurringForm
            recurring={editingRecurring}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowModal(false);
              setEditingRecurring(undefined);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default RecurringTransactions;
