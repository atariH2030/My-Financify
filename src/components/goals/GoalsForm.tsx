/**
 * @file GoalsForm.tsx
 * @description Formulário para criar/editar metas financeiras e lista de desejos
 * @version 3.0.0
 * @author DEV - Rickson (TQM)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Input from '../common/Input';
import { Tooltip } from '../common';
import type { FinancialGoal, GoalType } from '../../types/financial.types';
import { goalSchema } from '../../utils/validation';
import Logger from '../../services/logger.service';
import './GoalsForm.css';

interface GoalsFormProps {
  goal?: FinancialGoal;
  onSubmit: (data: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>) => void;
  onCancel: () => void;
}

const GOAL_TYPES: Array<{ value: GoalType; label: string; icon: string; color: string }> = [
  { value: 'emergency', label: 'Emergência', icon: '🚨', color: '#ef4444' },
  { value: 'savings', label: 'Poupança', icon: '💰', color: '#10b981' },
  { value: 'investment', label: 'Investimento', icon: '📈', color: '#3b82f6' },
  { value: 'wishlist', label: 'Lista de Desejos', icon: '🎁', color: '#f59e0b' },
  { value: 'debt-payment', label: 'Pagamento de Dívida', icon: '💳', color: '#8b5cf6' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa', icon: '🟢' },
  { value: 'medium', label: 'Média', icon: '🟡' },
  { value: 'high', label: 'Alta', icon: '🔴' },
];

export const GoalsForm: React.FC<GoalsFormProps> = ({ goal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    type: goal?.type || 'savings' as GoalType,
    targetAmount: goal?.targetAmount || 0,
    currentAmount: goal?.currentAmount || 0,
    deadline: goal?.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
    priority: goal?.priority || 'medium' as 'low' | 'medium' | 'high',
    status: goal?.status || 'active' as 'active' | 'completed' | 'paused' | 'cancelled',
    icon: goal?.icon || '🎯',
    color: goal?.color || '#3b82f6',
    imageUrl: goal?.imageUrl || '',
    link: goal?.link || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isWishlist, setIsWishlist] = useState(goal?.type === 'wishlist');

  useEffect(() => {
    setIsWishlist(formData.type === 'wishlist');
  }, [formData.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeChange = (type: GoalType) => {
    const selectedType = GOAL_TYPES.find(t => t.value === type);
    setFormData(prev => ({
      ...prev,
      type,
      icon: selectedType?.icon || '🎯',
      color: selectedType?.color || '#3b82f6',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar com Zod
      const validationData = {
        ...formData,
        deadline: new Date(formData.deadline),
        targetAmount: Number(formData.targetAmount),
        currentAmount: Number(formData.currentAmount),
      };

      const result = goalSchema.safeParse(validationData);

      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        Logger.warn('Validação falhou no GoalsForm', { errors: newErrors }, 'GOALS');
        return;
      }

      // Submeter dados
      onSubmit({
        ...result.data,
        status: formData.status,
        isWishlist: result.data.type === 'wishlist',
      });

      Logger.info('Meta submetida com sucesso', { type: result.data.type }, 'GOALS');
    } catch (error) {
      Logger.error('Erro ao submeter meta', error as Error, 'GOALS');
      setErrors({ submit: 'Erro ao processar formulário' });
    }
  };

  return (
    <motion.form
      className="goals-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="goals-form-header">
        <h2>{goal ? 'Editar Meta' : 'Nova Meta Financeira'}</h2>
      </div>

      {/* Tipo de Meta */}
      <div className="form-group">
        <label className="form-label">
          Tipo de Meta
          <Tooltip text="ℹ️" explanation="Escolha o tipo de objetivo financeiro que você deseja alcançar" />
        </label>
        <div className="goal-type-grid">
          {GOAL_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              className={`goal-type-card ${formData.type === type.value ? 'active' : ''}`}
              onClick={() => handleTypeChange(type.value)}
              style={{ '--type-color': type.color } as React.CSSProperties}
            >
              <span className="goal-type-icon">{type.icon}</span>
              <span className="goal-type-label">{type.label}</span>
            </button>
          ))}
        </div>
        {errors.type && <span className="form-error">{errors.type}</span>}
      </div>

      {/* Título */}
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Título da Meta *
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: Fundo de emergência, Viagem para Europa"
          error={errors.title}
          required
        />
      </div>

      {/* Descrição */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Adicione mais detalhes sobre sua meta..."
          className="form-textarea"
          rows={3}
        />
      </div>

      {/* Valores e Prazo */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="targetAmount" className="form-label">
            Valor Alvo * (R$)
            <Tooltip text="ℹ️" explanation="Quanto você quer alcançar nesta meta" />
          </label>
          <Input
            id="targetAmount"
            name="targetAmount"
            type="number"
            value={formData.targetAmount}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            error={errors.targetAmount}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="currentAmount" className="form-label">
            Valor Atual (R$)
            <Tooltip text="ℹ️" explanation="Quanto você já tem guardado para esta meta" />
          </label>
          <Input
            id="currentAmount"
            name="currentAmount"
            type="number"
            value={formData.currentAmount}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            error={errors.currentAmount}
          />
        </div>

        <div className="form-group">
          <label htmlFor="deadline" className="form-label">
            Prazo Final *
          </label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            error={errors.deadline}
            required
          />
        </div>
      </div>

      {/* Prioridade */}
      <div className="form-group">
        <label className="form-label">
          Prioridade
          <Tooltip text="ℹ️" explanation="Defina quão urgente é esta meta" />
        </label>
        <div className="priority-grid">
          {PRIORITY_OPTIONS.map((priority) => (
            <button
              key={priority.value}
              type="button"
              className={`priority-btn ${formData.priority === priority.value ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
            >
              <span>{priority.icon}</span>
              <span>{priority.label}</span>
            </button>
          ))}
        </div>
        {errors.priority && <span className="form-error">{errors.priority}</span>}
      </div>

      {/* Campos Específicos para Lista de Desejos */}
      {isWishlist && (
        <motion.div
          className="wishlist-fields"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="form-group">
            <label htmlFor="imageUrl" className="form-label">
              🖼️ URL da Imagem
              <Tooltip text="ℹ️" explanation="Link da imagem do produto/serviço desejado" />
            </label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="link" className="form-label">
              🔗 Link do Produto/Serviço
            </label>
            <Input
              id="link"
              name="link"
              type="url"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://loja.com/produto"
            />
          </div>
        </motion.div>
      )}

      {/* Status (apenas para edição) */}
      {goal && (
        <div className="form-group">
          <label htmlFor="status" className="form-label">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-select"
          >
            <option value="active">Ativa</option>
            <option value="paused">Pausada</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      )}

      {/* Erro Geral */}
      {errors.submit && (
        <div className="form-error-banner">
          {errors.submit}
        </div>
      )}

      {/* Ações */}
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {goal ? 'Atualizar Meta' : 'Criar Meta'}
        </Button>
      </div>
    </motion.form>
  );
};

export default GoalsForm;
