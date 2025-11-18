import React, { useState, useEffect } from 'react';
import './Budgets.css';
import BudgetsForm from './BudgetsForm';
import BudgetsTable from './BudgetsTable';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import StorageService from '../../services/storage.service';
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
      const loadedBudgets = await StorageService.load<Budget[]>('budgets') || [];
      const loadedTransactions = await StorageService.load<Transaction[]>('transactions') || [];
      
      // Calculate current spent for each budget
      const updatedBudgets = loadedBudgets.map((budget: Budget) => {
        const spent = calculateSpentForBudget(budget, loadedTransactions);
        return { ...budget, currentSpent: spent };
      });

      setBudgets(updatedBudgets);
      setTransactions(loadedTransactions);
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
    let endDate = new Date(startDate);

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

  // Recalculate all budgets when transactions change
  const recalculateBudgets = async () => {
    const loadedTransactions = await StorageService.load<Transaction[]>('transactions') || [];
    const updatedBudgets = budgets.map(budget => {
      const spent = calculateSpentForBudget(budget, loadedTransactions);
      return { ...budget, currentSpent: spent };
    });
    setBudgets(updatedBudgets);
    setTransactions(loadedTransactions);
    
    // Save updated budgets
    await StorageService.save('budgets', updatedBudgets);
  };

  const handleCreate = async (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Calculate initial spent
    newBudget.currentSpent = calculateSpentForBudget(newBudget, transactions);

    const updatedBudgets = [...budgets, newBudget];
    await StorageService.save('budgets', updatedBudgets);
    setBudgets(updatedBudgets);
    setIsModalOpen(false);
    showToast('Orçamento criado com sucesso! 💰', 'success');
  };

  const handleUpdate = async (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingBudget) return;

    const updatedBudget: Budget = {
      ...budgetData,
      id: editingBudget.id,
      createdAt: editingBudget.createdAt,
      updatedAt: new Date().toISOString()
    };

    // Recalculate spent
    updatedBudget.currentSpent = calculateSpentForBudget(updatedBudget, transactions);

    const updatedBudgets = budgets.map(b =>
      b.id === updatedBudget.id ? updatedBudget : b
    );

    await StorageService.save('budgets', updatedBudgets);
    setBudgets(updatedBudgets);
    setIsModalOpen(false);
    setEditingBudget(undefined);
    showToast('Orçamento atualizado! ✅', 'success');
  };

  const handleDelete = async (id: string) => {
    const budget = budgets.find(b => b.id === id);
    const updatedBudgets = budgets.filter(b => b.id !== id);
    await StorageService.save('budgets', updatedBudgets);
    setBudgets(updatedBudgets);
    showToast(`Orçamento "${budget?.category}" excluído 🗑️`, 'success');
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
    recalculateBudgets();
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
