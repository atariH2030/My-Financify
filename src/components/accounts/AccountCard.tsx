import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';
import type { Account } from '../../types/financial.types';

interface AccountCardProps {
  account: Account;
  balance: number;
  creditUsed?: number;
  creditAvailable?: number;
  onEdit: () => void;
  onDelete: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  balance,
  creditUsed = 0,
  creditAvailable = 0,
  onEdit,
  onDelete,
}) => {
  const isCredit = account.type === 'credit';
  const percentage = isCredit && account.creditLimit
    ? (creditUsed / account.creditLimit) * 100
    : 0;

  const getCardBrandIcon = (brand?: string) => {
    const brandMap: Record<string, string> = {
      'visa': 'fa-cc-visa',
      'mastercard': 'fa-cc-mastercard',
      'elo': 'fa-credit-card',
      'amex': 'fa-cc-amex',
      'hipercard': 'fa-credit-card',
      'diners': 'fa-cc-diners-club',
      'discover': 'fa-cc-discover',
    };
    return brandMap[brand || ''] || 'fa-credit-card';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'checking': 'Conta Corrente',
      'savings': 'Poupança',
      'credit': 'Cartão de Crédito',
      'debit': 'Cartão de Débito',
      'cash': 'Dinheiro',
      'investment': 'Investimentos',
      'other': 'Outro',
    };
    return labels[type] || type;
  };

  return (
    <Card className={`account-card ${!account.isActive ? 'inactive' : ''}`}>
      <div className="account-card-header" style={{ borderTopColor: account.color }}>
        <div className="account-icon" style={{ backgroundColor: account.color }}>
          <i className={`fas ${account.icon}`}></i>
        </div>
        <div className="account-info">
          <h3>{account.name}</h3>
          <span className="account-type">{getTypeLabel(account.type)}</span>
        </div>
        {!account.isActive && (
          <span className="inactive-badge">Inativa</span>
        )}
      </div>

      <div className="account-details">
        {account.institution && (
          <div className="detail-row">
            <i className="fas fa-building"></i>
            <span>{account.institution}</span>
          </div>
        )}

        {account.lastDigits && (
          <div className="detail-row">
            <i className={`fab ${getCardBrandIcon(account.cardBrand)}`}></i>
            <span>•••• {account.lastDigits}</span>
          </div>
        )}

        {isCredit ? (
          <>
            <div className="balance-row credit">
              <div className="balance-info">
                <span className="balance-label">Fatura Atual</span>
                <span className="balance-value expense">{formatCurrency(creditUsed)}</span>
              </div>
              <div className="balance-info">
                <span className="balance-label">Disponível</span>
                <span className="balance-value">{formatCurrency(creditAvailable)}</span>
              </div>
            </div>

            {account.creditLimit && account.creditLimit > 0 && (
              <div className="credit-usage">
                <div className="credit-bar">
                  <div
                    className={`credit-fill ${percentage >= 80 ? 'danger' : percentage >= 50 ? 'warning' : ''}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <span className="credit-label">
                  {percentage.toFixed(0)}% de {formatCurrency(account.creditLimit)}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="balance-row">
            <span className="balance-label">Saldo Atual</span>
            <span className={`balance-value ${balance >= 0 ? 'income' : 'expense'}`}>
              {formatCurrency(balance)}
            </span>
          </div>
        )}
      </div>

      <div className="account-actions">
        <Button variant="secondary" size="sm" onClick={onEdit}>
          <i className="fas fa-edit"></i> Editar
        </Button>
        <Button variant="danger" size="sm" onClick={onDelete}>
          <i className="fas fa-trash"></i> Remover
        </Button>
      </div>
    </Card>
  );
};

export default AccountCard;
