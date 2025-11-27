import React, { useState, useEffect } from 'react';
import { Input, Button } from '../common';
import type { RecurringTransaction, RecurringFrequency, TransactionType, PaymentMethod, Account } from '../../types/financial.types';
import { validateRecurring } from '../../utils/validation';
import { accountsService } from '../../services/accounts.service';

interface RecurringFormProps {
  recurring?: RecurringTransaction;
  onSubmit: (data: Partial<RecurringTransaction>) => void;
  onCancel: () => void;
}

const FREQUENCIES: { value: RecurringFrequency; label: string; icon: string }[] = [
  { value: 'daily', label: 'Diário', icon: 'fa-sun' },
  { value: 'weekly', label: 'Semanal', icon: 'fa-calendar-week' },
  { value: 'biweekly', label: 'Quinzenal', icon: 'fa-calendar-alt' },
  { value: 'monthly', label: 'Mensal', icon: 'fa-calendar' },
  { value: 'bimonthly', label: 'Bimestral', icon: 'fa-calendar-plus' },
  { value: 'quarterly', label: 'Trimestral', icon: 'fa-calendar-check' },
  { value: 'semiannual', label: 'Semestral', icon: 'fa-calendar-minus' },
  { value: 'yearly', label: 'Anual', icon: 'fa-calendar-day' },
];

const WEEKDAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

const CATEGORIES_EXPENSE = [
  'Moradia', 'Transporte', 'Alimentação', 'Saúde', 'Educação',
  'Lazer', 'Assinaturas', 'Vestuário', 'Tecnologia', 'Outros'
];

const CATEGORIES_INCOME = [
  'Salário', 'Freelance', 'Investimentos', 'Aluguel', 'Outros'
];

const RecurringForm: React.FC<RecurringFormProps> = ({ recurring, onSubmit, onCancel }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [formData, setFormData] = useState({
    name: recurring?.name || '',
    type: recurring?.type || ('expense' as TransactionType),
    amount: recurring?.amount || 0,
    section: recurring?.section || '',
    category: recurring?.category || '',
    subcategory: recurring?.subcategory || '',
    frequency: recurring?.frequency || ('monthly' as RecurringFrequency),
    dayOfMonth: recurring?.dayOfMonth || 1,
    dayOfWeek: recurring?.dayOfWeek || 0,
    startDate: recurring?.startDate ? recurring.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: recurring?.endDate ? recurring.endDate.split('T')[0] : '',
    accountId: recurring?.accountId || '',
    paymentMethod: recurring?.paymentMethod || ('' as PaymentMethod),
    autoGenerate: recurring?.autoGenerate ?? true,
    notifyBefore: recurring?.notifyBefore || 3,
    status: recurring?.status || 'active',
    isActive: recurring?.isActive ?? true,
    notes: recurring?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar contas do Supabase
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await accountsService.getAccounts();
        setAccounts(data.filter(a => a.isActive));
      } catch (error) {
        console.error('Erro ao carregar contas:', error);
        setAccounts([]);
      }
    };
    loadAccounts();
  }, []);

  const categories = formData.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateRecurring({
      ...formData,
      amount: Number(formData.amount),
      dayOfMonth: Number(formData.dayOfMonth),
      dayOfWeek: Number(formData.dayOfWeek),
      notifyBefore: Number(formData.notifyBefore),
    });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues?.forEach((err: any) => {
        newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
      dayOfMonth: Number(formData.dayOfMonth),
      dayOfWeek: Number(formData.dayOfWeek),
      notifyBefore: Number(formData.notifyBefore),
    });
  };

  const needsDayOfMonth = ['monthly', 'bimonthly', 'quarterly', 'semiannual', 'yearly'].includes(formData.frequency);
  const needsDayOfWeek = ['weekly', 'biweekly'].includes(formData.frequency);

  return (
    <form className="recurring-form" onSubmit={handleSubmit}>
      {/* Tipo */}
      <div className="form-section">
        <label className="form-section-title">
          <i className="fas fa-tag"></i> Tipo
        </label>
        <div className="type-selector">
          <button
            type="button"
            className={`type-option ${formData.type === 'income' ? 'selected' : ''}`}
            onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
          >
            <i className="fas fa-arrow-up"></i>
            <span>Receita</span>
          </button>
          <button
            type="button"
            className={`type-option ${formData.type === 'expense' ? 'selected' : ''}`}
            onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
          >
            <i className="fas fa-arrow-down"></i>
            <span>Despesa</span>
          </button>
        </div>
      </div>

      {/* Nome e Valor */}
      <div className="form-row">
        <Input
          label="Nome"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Netflix, Salário, Aluguel"
          error={errors.name}
          required
        />
        <Input
          label="Valor"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          placeholder="0,00"
          error={errors.amount}
          required
          min={0}
          step={0.01}
        />
      </div>

      {/* Categoria */}
      <div className="form-row">
        <div className="input-group">
          <label>Categoria</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="input"
            required
          >
            <option value="">Selecione...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <Input
          label="Seção (opcional)"
          value={formData.section}
          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
          placeholder="Ex: Despesas da Casa"
        />
      </div>

      {/* Frequência */}
      <div className="form-section">
        <label className="form-section-title">
          <i className="fas fa-sync-alt"></i> Frequência
        </label>
        <div className="frequency-selector">
          {FREQUENCIES.map(freq => (
            <button
              key={freq.value}
              type="button"
              className={`frequency-option ${formData.frequency === freq.value ? 'selected' : ''}`}
              onClick={() => setFormData({ ...formData, frequency: freq.value })}
            >
              <i className={`fas ${freq.icon}`}></i>
              <span>{freq.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dia do Mês ou Semana */}
      <div className="form-row">
        {needsDayOfMonth && (
          <div className="input-group">
            <label>Dia do Mês</label>
            <select
              value={formData.dayOfMonth}
              onChange={(e) => setFormData({ ...formData, dayOfMonth: Number(e.target.value) })}
              className="input"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        )}

        {needsDayOfWeek && (
          <div className="input-group">
            <label>Dia da Semana</label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
              className="input"
            >
              {WEEKDAYS.map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </div>
        )}

        <Input
          label="Data de Início"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          required
        />

        <Input
          label="Data de Término (opcional)"
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
        />
      </div>

      {/* Conta e Método de Pagamento */}
      <div className="form-row">
        <div className="input-group">
          <label>Conta (opcional)</label>
          <select
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            className="input"
          >
            <option value="">Nenhuma</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Método de Pagamento (opcional)</label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
            className="input"
          >
            <option value="">Nenhum</option>
            <option value="cash">Dinheiro</option>
            <option value="debit">Débito</option>
            <option value="credit">Crédito</option>
            <option value="transfer">Transferência</option>
            <option value="pix">PIX</option>
            <option value="other">Outro</option>
          </select>
        </div>
      </div>

      {/* Configurações */}
      <div className="form-section">
        <label className="form-section-title">
          <i className="fas fa-cog"></i> Configurações
        </label>
        
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.autoGenerate}
              onChange={(e) => setFormData({ ...formData, autoGenerate: e.target.checked })}
            />
            <span>Gerar transação automaticamente</span>
          </label>
        </div>

        <Input
          label="Notificar quantos dias antes?"
          type="number"
          value={formData.notifyBefore}
          onChange={(e) => setFormData({ ...formData, notifyBefore: Number(e.target.value) })}
          min={0}
          max={30}
        />

        <div className="input-group">
          <label>Observações (opcional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="input"
            rows={3}
            placeholder="Adicione observações sobre esta recorrência..."
          />
        </div>
      </div>

      {/* Ações */}
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {recurring ? 'Atualizar' : 'Criar'} Recorrência
        </Button>
      </div>
    </form>
  );
};

export default RecurringForm;
