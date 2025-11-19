import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useToast } from '../common/Toast';
import AccountForm from './AccountForm.tsx';
import AccountCard from './AccountCard.tsx';
import AccountService from '../../services/account.service';
import StorageService from '../../services/storage.service';
import { formatCurrency } from '../../utils/performance';
import type { Account, Transaction } from '../../types/financial.types';
import './Accounts.css';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, transactionsData] = await Promise.all([
        AccountService.getAll(),
        StorageService.load<Transaction[]>('transactions'),
      ]);

      setAccounts(accountsData);
      setTransactions(transactionsData || []);

      // Calcula resumo
      const summaryData = await AccountService.getSummary(transactionsData || []);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar contas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await AccountService.create(data);
      await loadData();
      setIsModalOpen(false);
      showToast(`Conta "${data.name}" criada com sucesso!`, 'success');
    } catch (error) {
      showToast('Erro ao criar conta', 'error');
    }
  };

  const handleUpdate = async (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingAccount) return;

    try {
      await AccountService.update(editingAccount.id, data);
      await loadData();
      setIsModalOpen(false);
      setEditingAccount(undefined);
      showToast(`Conta "${data.name}" atualizada!`, 'success');
    } catch (error) {
      showToast('Erro ao atualizar conta', 'error');
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const account = accounts.find(a => a.id === id);
    if (!account) return;

    // Verifica se pode deletar
    const validation = await AccountService.canDelete(id, transactions);
    
    if (!validation.canDelete) {
      if (confirm(
        `⚠️ Esta conta possui ${validation.transactionCount} transações associadas.\n\n` +
        `Deseja desativar a conta ao invés de removê-la?`
      )) {
        try {
          await AccountService.remove(id);
          await loadData();
          showToast(`Conta "${account.name}" desativada`, 'success');
        } catch (error) {
          showToast('Erro ao desativar conta', 'error');
        }
      }
      return;
    }

    if (confirm(`Tem certeza que deseja remover a conta "${account.name}"?`)) {
      try {
        await AccountService.permanentDelete(id);
        await loadData();
        showToast(`Conta "${account.name}" removida`, 'success');
      } catch (error) {
        showToast('Erro ao remover conta', 'error');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(undefined);
  };

  if (loading) {
    return (
      <div className="accounts-page">
        <div className="loading">Carregando contas...</div>
      </div>
    );
  }

  return (
    <div className="accounts-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1><i className="fas fa-credit-card"></i> Minhas Contas</h1>
          <p>Gerencie suas carteiras, cartões e contas</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <i className="fas fa-plus"></i> Nova Conta
        </Button>
      </motion.div>

      {/* Summary */}
      {summary && (
        <div className="summary-cards">
          <Card className="summary-card">
            <div className="summary-icon balance">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="summary-content">
              <span className="summary-label">Saldo Total</span>
              <span className={`summary-value ${summary.totalBalance >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(summary.totalBalance)}
              </span>
            </div>
          </Card>

          <Card className="summary-card">
            <div className="summary-icon credit">
              <i className="fas fa-credit-card"></i>
            </div>
            <div className="summary-content">
              <span className="summary-label">Limite Total</span>
              <span className="summary-value">{formatCurrency(summary.totalCreditLimit)}</span>
              <span className="summary-hint">
                Usado: {formatCurrency(summary.totalCreditUsed)} ({summary.totalCreditLimit > 0 ? ((summary.totalCreditUsed / summary.totalCreditLimit) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </Card>

          <Card className="summary-card">
            <div className="summary-icon accounts">
              <i className="fas fa-layer-group"></i>
            </div>
            <div className="summary-content">
              <span className="summary-label">Contas Ativas</span>
              <span className="summary-value">{summary.activeAccounts}</span>
              <span className="summary-hint">de {summary.totalAccounts} total</span>
            </div>
          </Card>
        </div>
      )}

      {/* Accounts Grid */}
      {summary && summary.accounts.length > 0 ? (
        <div className="accounts-grid">
          {summary.accounts.map(({ account, balance, creditUsed, creditAvailable }: any) => (
            <AccountCard
              key={account.id}
              account={account}
              balance={balance}
              creditUsed={creditUsed}
              creditAvailable={creditAvailable}
              onEdit={() => handleEdit(account)}
              onDelete={() => handleDelete(account.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="empty-state">
          <i className="fas fa-credit-card"></i>
          <h3>Nenhuma conta cadastrada</h3>
          <p>Adicione suas contas, cartões e carteiras para começar a controlar melhor suas finanças.</p>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <i className="fas fa-plus"></i> Criar Primeira Conta
          </Button>
        </Card>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAccount ? 'Editar Conta' : 'Nova Conta'}
        size="md"
      >
        <AccountForm
          initialData={editingAccount}
          onSubmit={editingAccount ? handleUpdate : handleCreate}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default Accounts;
