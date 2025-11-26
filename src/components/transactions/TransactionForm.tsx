/**
 * TransactionForm - Formulário de Transações
 * v2.5.0 - CRUD de Transações
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { transactionSchema } from '../../utils/validation';
import { formatCurrency } from '../../utils/performance';
import type { Transaction } from '../../types/financial.types';
import './TransactionForm.css';

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const categories = [
  { value: 'Alimentação', icon: '🍔', color: '#FF6B6B' },
  { value: 'Transporte', icon: '🚗', color: '#4ECDC4' },
  { value: 'Moradia', icon: '🏠', color: '#45B7D1' },
  { value: 'Saúde', icon: '⚕️', color: '#96CEB4' },
  { value: 'Educação', icon: '📚', color: '#FFEAA7' },
  { value: 'Lazer', icon: '🎮', color: '#DDA15E' },
  { value: 'Compras', icon: '🛍️', color: '#BC6C25' },
  { value: 'Outros', icon: '📦', color: '#6C757D' },
];

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense' as 'income' | 'expense',
    amount: transaction?.amount.toString() || '',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    tags: transaction?.tags?.join(', ') || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo ao digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validar com Zod
      const validationData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      const result = transactionSchema.safeParse(validationData);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach(issue => {
          fieldErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      // Submeter dados com Date convertida
      await onSubmit({
        ...result.data,
        date: new Date(result.data.date),
      });
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
      setErrors({ submit: 'Erro ao salvar transação. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <form onSubmit={handleSubmit} className="transaction-form">
          <h2>{transaction ? 'Editar Transação' : 'Nova Transação'}</h2>

          {/* Tipo de Transação */}
          <div className="form-group type-selector">
            <button
              type="button"
              className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
            >
              <i className="fas fa-arrow-up"></i>
              Receita
            </button>
            <button
              type="button"
              className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
            >
              <i className="fas fa-arrow-down"></i>
              Despesa
            </button>
          </div>

          {/* Valor */}
          <div className="form-group">
            <label htmlFor="amount">Valor *</label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0,00"
              error={errors.amount}
              required
            />
            {formData.amount && (
              <small className="preview-value">
                {formatCurrency(parseFloat(formData.amount))}
              </small>
            )}
          </div>

          {/* Categoria */}
          <div className="form-group">
            <label htmlFor="category">Categoria *</label>
            <div className="category-grid">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-btn ${formData.category === cat.value ? 'active' : ''}`}
                  style={{ 
                    borderColor: formData.category === cat.value ? cat.color : 'transparent',
                    background: formData.category === cat.value ? `${cat.color}15` : 'transparent'
                  }}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, category: cat.value }));
                    if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                  }}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-label">{cat.value}</span>
                </button>
              ))}
            </div>
            {errors.category && <small className="error-text">{errors.category}</small>}
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label htmlFor="description">Descrição *</label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ex: Supermercado, Salário, etc."
              error={errors.description}
              required
            />
          </div>

          {/* Data */}
          <div className="form-group">
            <label htmlFor="date">Data *</label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              error={errors.date}
              required
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags">Tags (separadas por vírgula)</label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Ex: essencial, recorrente, investimento"
            />
            <small className="help-text">
              Tags ajudam a organizar e filtrar suas transações
            </small>
          </div>

          {/* Erro geral */}
          {errors.submit && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {errors.submit}
            </div>
          )}

          {/* Ações */}
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {transaction ? 'Atualizar' : 'Adicionar'} Transação
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default TransactionForm;
