import React, { useState, useEffect } from 'react';
import { Button, Modal } from '../common';
import RecurringForm from './RecurringForm';
import RecurringCard from './RecurringCard';
import { recurringTransactionsService } from '../../services/recurring.service';
import { formatCurrency } from '../../utils/currency';
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

  const loadRecurrings = async () => {
    const data = await recurringTransactionsService.getRecurringTransactions();
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

  const handleSubmit = async (data: Partial<RecurringTransaction>) => {
    if (editingRecurring) {
      await recurringTransactionsService.updateRecurring(editingRecurring.id, data as any);
    } else {
      await recurringTransactionsService.createRecurring(data as any);
    }
    await loadRecurrings();
    setShowModal(false);
    setEditingRecurring(undefined);
  };

  const handleToggle = async (recurring: RecurringTransaction) => {
    const newStatus = recurring.isActive ? false : true;
    await recurringTransactionsService.updateRecurring(recurring.id, { isActive: newStatus } as any);
    await loadRecurrings();
  };

  const handleDelete = async (recurring: RecurringTransaction) => {
    if (!window.confirm(`Deseja realmente excluir a recorrência "${recurring.name}"?`)) return;
    
    await recurringTransactionsService.deleteRecurring(recurring.id);
    await loadRecurrings();
  };

  // TODO: Implementar getSummary e getUpcoming no recurringTransactionsService
  // const summary = recurringTransactionsService.getSummary();
  // const upcoming = recurringTransactionsService.getUpcoming(7);

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
      {/* TODO: Implementar getSummary e getUpcoming no recurringTransactionsService
      <div className="summary-cards">
        ... summary cards ...
      </div>
      */}

      {/* Próximas 7 dias */}
      {/* TODO: Implementar getUpcoming no recurringTransactionsService
      {upcoming.length > 0 && (
        <div className="upcoming-section">
          ...
        </div>
      )}
      */}

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
