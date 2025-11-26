import React, { useState, useEffect } from 'react';
import './BudgetsForm.css';
import Button from '../common/Button';
import Input from '../common/Input';
import Tooltip from '../common/Tooltip';
import { validateBudget, type ValidationError } from '../../utils/validation';
import type { Budget } from '../../types/financial.types';

interface BudgetsFormProps {
  budget?: Budget;
  onSave: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

type PeriodType = 'monthly' | 'quarterly' | 'yearly';
type StatusType = 'active' | 'paused' | 'completed';

const PERIOD_OPTIONS = [
  { value: 'monthly', icon: '📅', name: 'Mensal', description: '1 mês' },
  { value: 'quarterly', icon: '📆', name: 'Trimestral', description: '3 meses' },
  { value: 'yearly', icon: '🗓️', name: 'Anual', description: '12 meses' }
];

const STATUS_OPTIONS = [
  { value: 'active', icon: '✅', label: 'Ativo' },
  { value: 'paused', icon: '⏸️', label: 'Pausado' },
  { value: 'completed', icon: '🏁', label: 'Concluído' }
];

const CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Vestuário',
  'Serviços',
  'Investimentos',
  'Outros'
];

const BudgetsForm: React.FC<BudgetsFormProps> = ({ budget, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    category: budget?.category || '',
    period: budget?.period || 'monthly' as PeriodType,
    limitAmount: budget?.limitAmount?.toString() || '',
    alertThreshold: budget?.alertThreshold || 80,
    status: budget?.status || 'active' as StatusType,
    description: budget?.description || '',
    startDate: budget?.startDate || new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors on field change
    setErrors(prev => prev.filter(e => e.path?.[0] !== field));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const budgetData = {
      category: formData.category,
      period: formData.period,
      limitAmount: parseFloat(formData.limitAmount),
      alertThreshold: formData.alertThreshold,
      status: formData.status,
      description: formData.description,
      startDate: formData.startDate,
      currentSpent: budget?.currentSpent || 0
    };

    const validation = validateBudget(budgetData);

    if (!validation.success) {
      setErrors(validation.error.issues);
      return;
    }

    onSave(budgetData);
  };

  const getErrorMessage = (field: string): string | undefined => {
    const error = errors.find(e => e.path?.[0] === field);
    return error?.message;
  };

  return (
    <form className="budgets-form" onSubmit={handleSubmit}>
      {/* Basic Information */}
      <div className="form-section">
        <h3 className="form-section-title">📋 Informações Básicas</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Categoria <span className="required">*</span>
              <Tooltip text="ℹ️" explanation="Selecione a categoria que este orçamento controlará" />
            </label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              required
            >
              <option value="">Selecione uma categoria...</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {getErrorMessage('category') && (
              <div className="form-error">
                <i className="fas fa-exclamation-circle"></i>
                {getErrorMessage('category')}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Data de Início <span className="required">*</span>
              <Tooltip text="ℹ️" explanation="Data em que este orçamento começa a ser contabilizado" />
            </label>
            <input
              type="date"
              className="form-input"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              required
            />
            {getErrorMessage('startDate') && (
              <div className="form-error">
                <i className="fas fa-exclamation-circle"></i>
                {getErrorMessage('startDate')}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Descrição (Opcional)
            <Tooltip text="ℹ️" explanation="Adicione observações ou detalhes sobre este orçamento" />
          </label>
          <textarea
            className="form-input form-textarea"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Ex: Orçamento para reduzir gastos com alimentação externa..."
            rows={3}
          />
        </div>
      </div>

      {/* Period Selection */}
      <div className="form-section">
        <h3 className="form-section-title">⏱️ Período do Orçamento</h3>
        <div className="period-cards">
          {PERIOD_OPTIONS.map(period => (
            <div
              key={period.value}
              className={`period-card ${formData.period === period.value ? 'selected' : ''}`}
              onClick={() => handleChange('period', period.value)}
            >
              <div className="period-icon">{period.icon}</div>
              <div className="period-name">{period.name}</div>
              <div className="period-description">{period.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Limit and Alert */}
      <div className="form-section">
        <h3 className="form-section-title">💰 Limite e Alertas</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Valor Limite <span className="required">*</span>
              <Tooltip text="ℹ️" explanation="Valor máximo permitido para gastos nesta categoria durante o período" />
            </label>
            <Input
              type="number"
              value={formData.limitAmount}
              onChange={(e) => handleChange('limitAmount', e.target.value)}
              placeholder="Ex: 1500.00"
              min="0"
              step="0.01"
              required
            />
            {getErrorMessage('limitAmount') && (
              <div className="form-error">
                <i className="fas fa-exclamation-circle"></i>
                {getErrorMessage('limitAmount')}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Alerta em {formData.alertThreshold}% do limite
            <Tooltip text="ℹ️" explanation="Você receberá um alerta visual quando atingir esta porcentagem do limite" />
          </label>
          <div className="alert-slider">
            <div className="slider-container">
              <input
                type="range"
                className="slider"
                min="50"
                max="100"
                step="5"
                value={formData.alertThreshold}
                onChange={(e) => handleChange('alertThreshold', parseInt(e.target.value))}
              />
              <div className="slider-value">{formData.alertThreshold}%</div>
            </div>
            <div className="slider-help">
              {formData.alertThreshold <= 70 && '🟢 Alerta antecipado - Mais controle'}
              {formData.alertThreshold > 70 && formData.alertThreshold <= 85 && '🟡 Alerta moderado - Balanceado'}
              {formData.alertThreshold > 85 && '🔴 Alerta tardio - Menos notificações'}
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="form-section">
        <h3 className="form-section-title">📊 Status</h3>
        <div className="status-badges">
          {STATUS_OPTIONS.map(status => (
            <div
              key={status.value}
              className={`status-badge ${formData.status === status.value ? 'selected' : ''}`}
              onClick={() => handleChange('status', status.value)}
            >
              <div className="icon">{status.icon}</div>
              <div className="label">{status.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {budget ? 'Atualizar Orçamento' : 'Criar Orçamento'}
        </Button>
      </div>
    </form>
  );
};

export default BudgetsForm;
