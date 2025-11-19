/**
 * @file Goals.tsx
 * @description Página de Gestão de Metas Financeiras e Lista de Desejos
 * @version 3.0.0
 * @author DEV - Rickson (TQM)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GoalsForm from './GoalsForm';
import GoalsTable from './GoalsTable';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useToast } from '../common/Toast';
import StorageService from '../../services/storage.service';
import Logger from '../../services/logger.service';
import { formatCurrency } from '../../utils/currency';
import type { FinancialGoal } from '../../types/financial.types';
import './Goals.css';

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | undefined>();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Carregar metas
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await StorageService.load<FinancialGoal[]>('goals');
      setGoals(data || []);
      Logger.info('Metas carregadas', { count: (data || []).length }, 'GOALS');
    } catch (error) {
      Logger.error('Erro ao carregar metas', error as Error, 'GOALS');
      showToast('Erro ao carregar metas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveGoals = async (data: FinancialGoal[]) => {
    try {
      await StorageService.save('goals', data);
      setGoals(data);
      Logger.info('Metas salvas', { count: data.length }, 'GOALS');
    } catch (error) {
      Logger.error('Erro ao salvar metas', error as Error, 'GOALS');
      throw error;
    }
  };

  const handleCreate = (data: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
    try {
      const newGoal: FinancialGoal = {
        ...data,
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [newGoal, ...goals];
      saveGoals(updated);

      showToast(
        `Meta "${data.title}" criada com sucesso! 🎯`,
        'success'
      );

      setIsFormOpen(false);
      Logger.info('Meta criada', { id: newGoal.id, type: newGoal.type }, 'GOALS');
    } catch (error) {
      showToast('Erro ao criar meta', 'error');
      Logger.error('Erro ao criar meta', error as Error, 'GOALS');
    }
  };

  const handleUpdate = (data: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
    if (!editingGoal) return;

    try {
      const updatedGoal: FinancialGoal = {
        ...editingGoal,
        ...data,
        updatedAt: new Date().toISOString(),
        completedAt:
          data.status === 'completed' && editingGoal.status !== 'completed'
            ? new Date().toISOString()
            : editingGoal.completedAt,
      };

      const updated = goals.map((g) => (g.id === editingGoal.id ? updatedGoal : g));
      saveGoals(updated);

      showToast(`Meta "${data.title}" atualizada! ✅`, 'success');

      setIsFormOpen(false);
      setEditingGoal(undefined);
      Logger.info('Meta atualizada', { id: updatedGoal.id }, 'GOALS');
    } catch (error) {
      showToast('Erro ao atualizar meta', 'error');
      Logger.error('Erro ao atualizar meta', error as Error, 'GOALS');
    }
  };

  const handleDelete = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    if (window.confirm(`Tem certeza que deseja excluir a meta "${goal.title}"?`)) {
      try {
        const updated = goals.filter((g) => g.id !== goalId);
        saveGoals(updated);

        showToast('Meta excluída com sucesso', 'success');
        Logger.info('Meta excluída', { id: goalId }, 'GOALS');
      } catch (error) {
        showToast('Erro ao excluir meta', 'error');
        Logger.error('Erro ao excluir meta', error as Error, 'GOALS');
      }
    }
  };

  const handleAddProgress = (goalId: string, amount: number) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    try {
      const newCurrent = goal.currentAmount + amount;
      const isCompleting = newCurrent >= goal.targetAmount && goal.status === 'active';

      const updatedGoal: FinancialGoal = {
        ...goal,
        currentAmount: Math.min(newCurrent, goal.targetAmount),
        status: isCompleting ? 'completed' : goal.status,
        updatedAt: new Date().toISOString(),
        completedAt: isCompleting ? new Date().toISOString() : goal.completedAt,
      };

      const updated = goals.map((g) => (g.id === goalId ? updatedGoal : g));
      saveGoals(updated);

      if (isCompleting) {
        showToast(`🎉 Parabéns! Meta "${goal.title}" concluída!`, 'success');
      } else {
        showToast(`💰 ${formatCurrency(amount)} adicionado à meta "${goal.title}"`, 'success');
      }

      Logger.info('Progresso adicionado', { id: goalId, amount, completed: isCompleting }, 'GOALS');
    } catch (error) {
      showToast('Erro ao adicionar progresso', 'error');
      Logger.error('Erro ao adicionar progresso', error as Error, 'GOALS');
    }
  };

  const handleEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGoal(undefined);
  };

  const handleSubmit = (data: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
    if (editingGoal) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  return (
    <motion.div
      className="goals-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="goals-header">
        <div className="goals-header-content">
          <h1>🎯 Metas e Objetivos</h1>
          <p className="goals-subtitle">
            Planeje seus objetivos financeiros e acompanhe seu progresso
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          + Nova Meta
        </Button>
      </div>

      {loading ? (
        <div className="goals-loading">
          <p>Carregando metas...</p>
        </div>
      ) : (
        <GoalsTable
          goals={goals}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddProgress={handleAddProgress}
        />
      )}

      {/* Modal do Formulário */}
      <AnimatePresence>
        {isFormOpen && (
          <Modal isOpen={isFormOpen} onClose={handleCloseForm} size="xl">
            <GoalsForm
              goal={editingGoal}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
            />
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Goals;
