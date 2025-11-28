import React, { useState, useEffect } from 'react';
import './Budgets.css';
import BudgetsForm from './BudgetsForm';
import BudgetsTable from './BudgetsTable';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import { budgetsService } from '../../services/budgets.service';
import { transactionsService } from '../../services/transactions.service';
import NotificationService from '../../services/notification.service';
import type { Budget, Transaction } from '../../types/financial.types';

const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Load budgets and transactions
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedBudgets, loadedTransactions] = await Promise.all([
        budgetsService.getBudgets(),
        transactionsService.getTransactions()
      ]);
      
      setBudgets(loadedBudgets);
      setTransactions(loadedTransactions || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Erro ao carregar orçamentos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate spent amount for a budget based on transactions
  const calculateSpentForBudget = (budget: Budget, allTransactions: Transaction[]): number => {
    if (budget.status !== 'active') return budget.currentSpent || 0;

    const startDate = new Date(budget.startDate);
    const endDate = new Date(startDate);

    // Calculate end date based on period
    switch (budget.period) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Sum expenses in the category within the period
    const spent = allTransactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.category === budget.category &&
          transactionDate >= startDate &&
          transactionDate < endDate
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return spent;
  };

  // Check budget alerts and notify if necessary
  const checkBudgetAlerts = (updatedBudgets: Budget[]) => {
    updatedBudgets.forEach(budget => {
      if (budget.status !== 'active') return;

      const percentage = (budget.currentSpent / budget.limitAmount) * 100;
      const alertThreshold = budget.alertThreshold || 80;

      // Notify if exceeded threshold
      if (percentage >= alertThreshold) {
        NotificationService.notifyBudgetAlert(
          budget.category,
          budget.currentSpent,
          budget.limitAmount,
          percentage
        );
      }
    });
  };

  const handleCreate = async (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await budgetsService.createBudget(budgetData as any);
      await loadData();
      setIsModalOpen(false);
      showToast(`Orçamento para "${budgetData.category}" criado!`, 'success');
    } catch (error) {
      showToast('Erro ao criar orçamento', 'error');
    }
  };

  const handleUpdate = async (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingBudget) return;

    try {
      await budgetsService.updateBudget(editingBudget.id, budgetData as any);
      await loadData();
      setIsModalOpen(false);
      setEditingBudget(undefined);
      showToast('Orçamento atualizado! ✅', 'success');
    } catch (error) {
      showToast('Erro ao atualizar orçamento', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const budget = budgets.find(b => b.id === id);
    if (!confirm(`Tem certeza que deseja excluir o orçamento "${budget?.category}"?`)) return;

    try {
      await budgetsService.deleteBudget(id);
      await loadData();
      showToast(`Orçamento "${budget?.category}" excluído 🗑️`, 'success');
    } catch (error) {
      showToast('Erro ao excluir orçamento', 'error');
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBudget(undefined);
  };

  const handleNewBudget = () => {
    setEditingBudget(undefined);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    loadData();
    showToast('Orçamentos atualizados! 🔄', 'success');
  };

  if (isLoading) {
    return (
      <div className="budgets-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i> Carregando orçamentos...
        </div>
      </div>
    );
  }

  return (
    <div className="budgets-container">
      <div className="budgets-header">
        <h1>
          <i className="fas fa-wallet"></i>
          Orçamentos
        </h1>
        <div className="budgets-actions">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            title="Recalcular gastos baseado nas transações"
          >
            <i className="fas fa-sync"></i> Atualizar
          </Button>
          <Button variant="primary" onClick={handleNewBudget}>
            <i className="fas fa-plus"></i> Novo Orçamento
          </Button>
        </div>
      </div>

      <div className="budgets-content">
        <BudgetsTable
          budgets={budgets}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBudget ? '✏️ Editar Orçamento' : '💰 Novo Orçamento'}
        size="xl"
      >
        <BudgetsForm
          budget={editingBudget}
          onSave={editingBudget ? handleUpdate : handleCreate}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default Budgets;
