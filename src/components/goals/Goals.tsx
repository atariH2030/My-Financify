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
import { goalsService } from '../../services/goals.service';
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
      const data = await goalsService.getGoals();
      setGoals(data || []);
      Logger.info('Metas carregadas', { count: (data || []).length }, 'GOALS');
    } catch (error) {
      Logger.error('Erro ao carregar metas', error as Error, 'GOALS');
      showToast('Erro ao carregar metas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
    try {
      await goalsService.createGoal(data as any);
      await loadGoals();
      showToast(`Meta "${data.title}" criada com sucesso! 🎯`, 'success');
      setIsFormOpen(false);
      Logger.info('Meta criada', { type: data.type }, 'GOALS');
    } catch (error) {
      showToast('Erro ao criar meta', 'error');
      Logger.error('Erro ao criar meta', error as Error, 'GOALS');
    }
  };
  };

  const handleUpdate = async (data: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => {
    if (!editingGoal) return;

    try {
      await goalsService.updateGoal(editingGoal.id, data as any);
      await loadGoals();
      showToast(`Meta "${data.title}" atualizada! ✅`, 'success');
      setIsFormOpen(false);
      setEditingGoal(undefined);
      Logger.info('Meta atualizada', { id: editingGoal.id }, 'GOALS');
    } catch (error) {
      showToast('Erro ao atualizar meta', 'error');
      Logger.error('Erro ao atualizar meta', error as Error, 'GOALS');
    }
  };

  const handleDelete = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    if (!window.confirm(`Tem certeza que deseja excluir a meta "${goal.title}"?`)) return;

    try {
      await goalsService.deleteGoal(goalId);
      await loadGoals();
      showToast('Meta excluída com sucesso', 'success');
      Logger.info('Meta excluída', { id: goalId }, 'GOALS');
    } catch (error) {
      showToast('Erro ao excluir meta', 'error');
      Logger.error('Erro ao excluir meta', error as Error, 'GOALS');
    }
  };

  const handleAddProgress = async (goalId: string, amount: number) => {
    try {
      await goalsService.addContribution(goalId, amount);
      await loadGoals();
      showToast(`💰 ${formatCurrency(amount)} adicionado à meta!`, 'success');
      Logger.info('Progresso adicionado', { id: goalId, amount }, 'GOALS');
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
