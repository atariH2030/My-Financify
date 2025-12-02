import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import type { Account, CardBrand } from '../../types/financial.types';

interface AccountFormProps {
  initialData?: Account;
  onSubmit: (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#84cc16'
];

const ICONS = [
  'fa-credit-card', 'fa-wallet', 'fa-piggy-bank', 'fa-university',
  'fa-money-bill-wave', 'fa-coins', 'fa-hand-holding-usd'
];

const AccountForm: React.FC<AccountFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>({
    name: initialData?.name || '',
    type: initialData?.type || 'debit',
    lastFourDigits: initialData?.lastFourDigits || '',
    brand: initialData?.brand || 'visa',
    color: initialData?.color || COLORS[0],
    icon: initialData?.icon || ICONS[0],
    creditLimit: initialData?.creditLimit,
    closingDay: initialData?.closingDay || 5,
    dueDay: initialData?.dueDay || 10,
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const showCardFields = formData.type === 'credit' || formData.type === 'debit';
  const showCreditFields = formData.type === 'credit';

  return (
    <form onSubmit={handleSubmit} className="account-form">
      <Input
        label="Nome da Conta"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ex: Nubank Crédito, Carteira"
        required
      />

      <div className="form-group">
        <label>Tipo de Conta</label>
        <div className="account-type-grid">
          <button
            type="button"
            className={`type-card ${formData.type === 'credit' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, type: 'credit' })}
          >
            <i className="fas fa-credit-card"></i>
            <span>Crédito</span>
          </button>
          <button
            type="button"
            className={`type-card ${formData.type === 'debit' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, type: 'debit' })}
          >
            <i className="fas fa-money-check"></i>
            <span>Débito</span>
          </button>
          <button
            type="button"
            className={`type-card ${formData.type === 'cash' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, type: 'cash' })}
          >
            <i className="fas fa-wallet"></i>
            <span>Dinheiro</span>
          </button>
          <button
            type="button"
            className={`type-card ${formData.type === 'savings' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, type: 'savings' })}
          >
            <i className="fas fa-piggy-bank"></i>
            <span>Poupança</span>
          </button>
          <button
            type="button"
            className={`type-card ${formData.type === 'investment' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, type: 'investment' })}
          >
            <i className="fas fa-chart-line"></i>
            <span>Investimento</span>
          </button>
        </div>
      </div>

      {showCardFields && (
        <>
          <Input
            label="Últimos 4 Dígitos"
            value={formData.lastFourDigits || ''}
            onChange={(e) => setFormData({ ...formData, lastFourDigits: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            placeholder="1234"
            maxLength={4}
          />

          <div className="form-group">
            <label>Bandeira</label>
            <select
              value={formData.brand || 'visa'}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value as CardBrand })}
              className="select-input"
            >
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="elo">Elo</option>
              <option value="amex">American Express</option>
              <option value="other">Outra</option>
            </select>
          </div>
        </>
      )}

      {showCreditFields && (
        <>
          <Input
            label="Limite do Cartão"
            type="number"
            value={formData.creditLimit || ''}
            onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || undefined })}
            placeholder="5000.00"
            step="0.01"
            min="0"
          />

          <div className="form-row">
            <Input
              label="Dia de Fechamento"
              type="number"
              value={formData.closingDay || 5}
              onChange={(e) => setFormData({ ...formData, closingDay: parseInt(e.target.value) || 5 })}
              min="1"
              max="31"
            />
            <Input
              label="Dia de Vencimento"
              type="number"
              value={formData.dueDay || 10}
              onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) || 10 })}
              min="1"
              max="31"
            />
          </div>
        </>
      )}

      <div className="form-group">
        <label>Cor de Identificação</label>
        <div className="color-picker">
          {COLORS.map(color => (
            <button
              key={color}
              type="button"
              className={`color-option ${formData.color === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Ícone</label>
        <div className="icon-picker">
          {ICONS.map(icon => (
            <button
              key={icon}
              type="button"
              className={`icon-option ${formData.icon === icon ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, icon })}
            >
              <i className={`fas ${icon}`}></i>
            </button>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          <i className="fas fa-save"></i> {initialData ? 'Atualizar' : 'Criar'} Conta
        </Button>
      </div>
    </form>
  );
};

export default AccountForm;
