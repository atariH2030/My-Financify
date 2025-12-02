/**
 * TransactionFormV3 - Formulário de Transações com Hierarquia
 * 
 * DECISÃO: Seleção em cascata Sessão → Categoria → Subcategoria
 * BENEFÍCIO: UX intuitivo, validação robusta, dados estruturados
 * 
 * @version 3.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { transactionSchema } from '../../utils/validation';
import type { Transaction, ExpenseType, PaymentMethod } from '../../types/financial.types';
import { 
  SECTIONS_CONFIG, 
  getSectionById, 
  getCategoriesBySection,
  EXPENSE_TYPE_COLORS,
  EXPENSE_TYPE_LABELS 
} from '../../config/categories.config';
import './TransactionForm.css';
import './TransactionFormV3.css';

interface TransactionFormV3Props {
  transaction?: Transaction;
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const TransactionFormV3: React.FC<TransactionFormV3Props> = ({ 
  transaction, 
  onSubmit, 
  onCancel 
}) => {
  // Estado do formulário
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense' as 'income' | 'expense',
    section: transaction?.section || '',
    category: transaction?.category || '',
    subcategory: transaction?.subcategory || '',
    expenseType: transaction?.expenseType || 'variable' as ExpenseType,
    amount: transaction?.amount.toString() || '',
    description: transaction?.description || '',
    date: transaction?.date 
      ? new Date(transaction.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    tags: transaction?.tags?.join(', ') || '',
    recurring: transaction?.recurring?.enabled || false,
    recurringFrequency: transaction?.recurring?.frequency || 'monthly' as const,
    paymentMethod: transaction?.metadata?.method || 'pix' as PaymentMethod,
    notes: transaction?.metadata?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para cascata
  const [availableSections, setAvailableSections] = useState(SECTIONS_CONFIG);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);

  // Atualiza seções disponíveis baseado no tipo
  useEffect(() => {
    if (formData.type === 'income') {
      const incomeSection = SECTIONS_CONFIG.filter(s => s.id === 'income');
      setAvailableSections(incomeSection);
      if (incomeSection.length > 0 && !formData.section) {
        setFormData(prev => ({ ...prev, section: incomeSection[0].id }));
      }
    } else {
      const expenseSections = SECTIONS_CONFIG.filter(s => s.id !== 'income');
      setAvailableSections(expenseSections);
      if (!formData.section) {
        setFormData(prev => ({ ...prev, section: '' }));
      }
    }
  }, [formData.type, formData.section]);

  // Atualiza categorias quando sessão muda
  useEffect(() => {
    if (formData.section) {
      const categories = getCategoriesBySection(formData.section);
      setAvailableCategories(categories);
      
      // Reset categoria e subcategoria se não for válida
      if (!categories.find(c => c.id === formData.category)) {
        setFormData(prev => ({ ...prev, category: '', subcategory: '' }));
      }
    } else {
      setAvailableCategories([]);
      setFormData(prev => ({ ...prev, category: '', subcategory: '' }));
    }
  }, [formData.section, formData.category]);

  // Atualiza subcategorias quando categoria muda
  useEffect(() => {
    if (formData.category && formData.section) {
      const category = availableCategories.find(c => c.id === formData.category);
      if (category?.subcategories) {
        setAvailableSubcategories(category.subcategories);
        
        // Reset subcategoria se não for válida
        if (!category.subcategories.includes(formData.subcategory || '')) {
          setFormData(prev => ({ ...prev, subcategory: '' }));
        }
      } else {
        setAvailableSubcategories([]);
      }
    } else {
      setAvailableSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  }, [formData.category, formData.section, formData.subcategory, availableCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpar erro do campo
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
        section: formData.section,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        expenseType: formData.type === 'expense' ? formData.expenseType : undefined,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        recurring: formData.recurring ? {
          enabled: true,
          frequency: formData.recurringFrequency,
        } : undefined,
        metadata: {
          method: formData.paymentMethod,
          notes: formData.notes || undefined,
        },
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

      // Submeter com Date convertida
      await onSubmit({
        ...result.data,
        section: result.data.section || 'Geral', // Garantir section nunca é undefined
        date: new Date(result.data.date),
        recurring: result.data.recurring ? {
          ...result.data.recurring,
          endDate: result.data.recurring.endDate 
            ? new Date(result.data.recurring.endDate) 
            : undefined,
        } : undefined,
      });
      
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
      setErrors({ submit: 'Erro ao salvar transação. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Busca informações da sessão/categoria selecionada
  const _selectedSection = getSectionById(formData.section);
  const _selectedCategory = availableCategories.find(c => c.id === formData.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="transaction-form-overlay"
    >
      <Card className="transaction-form-card">
        <form onSubmit={handleSubmit} className="transaction-form">
          {/* Header */}
          <div className="form-header">
            <h2>
              {transaction ? '✏️ Editar Transação' : '➕ Nova Transação'}
            </h2>
            <p className="form-subtitle">
              Preencha os dados da transação financeira
            </p>
          </div>

          {/* Tipo de Transação */}
          <div className="form-group">
            <label className="form-label required">Tipo de Transação</label>
            <div className="button-group">
              <button
                type="button"
                className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  type: 'income', 
                  section: '', 
                  category: '',
                  subcategory: '' 
                }))}
              >
                <span className="icon">📈</span>
                <span>Receita</span>
              </button>
              <button
                type="button"
                className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  type: 'expense',
                  section: '', 
                  category: '',
                  subcategory: '' 
                }))}
              >
                <span className="icon">📉</span>
                <span>Despesa</span>
              </button>
            </div>
          </div>

          {/* Sessão (Hierarquia nível 1) */}
          <div className="form-group">
            <label htmlFor="section" className="form-label required">
              Sessão
            </label>
            <select
              id="section"
              name="section"
              value={formData.section}
              onChange={handleChange}
              className={`form-select ${errors.section ? 'error' : ''}`}
              required
            >
              <option value="">Selecione uma sessão...</option>
              {availableSections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.icon} {section.name}
                </option>
              ))}
            </select>
            {errors.section && <span className="error-message">{errors.section}</span>}
          </div>

          {/* Categoria (Hierarquia nível 2) */}
          {formData.section && (
            <div className="form-group">
              <label htmlFor="category" className="form-label required">
                Categoria
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`form-select ${errors.category ? 'error' : ''}`}
                required
              >
                <option value="">Selecione uma categoria...</option>
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>
          )}

          {/* Subcategoria (Hierarquia nível 3) */}
          {formData.category && availableSubcategories.length > 0 && (
            <div className="form-group">
              <label htmlFor="subcategory" className="form-label">
                Subcategoria <span className="optional">(opcional)</span>
              </label>
              <select
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Nenhuma</option>
                {availableSubcategories.map(sub => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tipo de Despesa (apenas para expenses) */}
          {formData.type === 'expense' && (
            <div className="form-group">
              <label className="form-label required">Tipo de Despesa</label>
              <div className="button-group">
                <button
                  type="button"
                  className={`expense-type-btn ${formData.expenseType === 'fixed' ? 'active' : ''}`}
                  style={{ 
                    borderColor: formData.expenseType === 'fixed' ? EXPENSE_TYPE_COLORS.fixed : '#ddd',
                    backgroundColor: formData.expenseType === 'fixed' ? EXPENSE_TYPE_COLORS.fixed + '20' : 'transparent'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, expenseType: 'fixed' }))}
                >
                  <span className="icon">📌</span>
                  <span>{EXPENSE_TYPE_LABELS.fixed}</span>
                </button>
                <button
                  type="button"
                  className={`expense-type-btn ${formData.expenseType === 'variable' ? 'active' : ''}`}
                  style={{ 
                    borderColor: formData.expenseType === 'variable' ? EXPENSE_TYPE_COLORS.variable : '#ddd',
                    backgroundColor: formData.expenseType === 'variable' ? EXPENSE_TYPE_COLORS.variable + '20' : 'transparent'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, expenseType: 'variable' }))}
                >
                  <span className="icon">🔄</span>
                  <span>{EXPENSE_TYPE_LABELS.variable}</span>
                </button>
              </div>
            </div>
          )}

          {/* Valor e Descrição (lado a lado) */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount" className="form-label required">
                Valor (R$)
              </label>
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
            </div>

            <div className="form-group">
              <label htmlFor="date" className="form-label required">
                Data
              </label>
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
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label htmlFor="description" className="form-label required">
              Descrição
            </label>
            <Input
              id="description"
              name="description"
              type="text"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ex: Aluguel do apartamento"
              error={errors.description}
              required
            />
          </div>

          {/* Método de Pagamento */}
          <div className="form-group">
            <label htmlFor="paymentMethod" className="form-label">
              Forma de Pagamento
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="form-select"
            >
              <option value="pix">💸 PIX</option>
              <option value="debit">💳 Cartão de Débito</option>
              <option value="credit">💳 Cartão de Crédito</option>
              <option value="transfer">🏦 Transferência Bancária</option>
              <option value="cash">💵 Dinheiro</option>
              <option value="other">📋 Outra Forma</option>
            </select>
          </div>

          {/* Recorrência */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="recurring"
                checked={formData.recurring}
                onChange={handleChange}
              />
              <span>Esta é uma transação recorrente</span>
            </label>
            
            {formData.recurring && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="recurring-options"
              >
                <select
                  name="recurringFrequency"
                  value={formData.recurringFrequency}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="daily">Todos os dias</option>
                  <option value="weekly">Toda semana</option>
                  <option value="monthly">Todo mês</option>
                  <option value="yearly">Todo ano</option>
                </select>
              </motion.div>
            )}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              Etiquetas <span className="optional">(separadas por vírgula)</span>
            </label>
            <Input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Ex: casa, urgente, parcelado"
            />
          </div>

          {/* Notas */}
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Observações <span className="optional">(opcional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Informações adicionais..."
              className="form-textarea"
              rows={3}
            />
          </div>

          {/* Erro geral */}
          {errors.submit && (
            <div className="error-banner">
              <span className="icon">⚠️</span>
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Botões de Ação */}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : transaction ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default TransactionFormV3;
