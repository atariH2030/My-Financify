/**
 * Transactions - Página de Gestão de Transações
 * v3.0.0 - CRUD Completo com nova estrutura hierárquica + Tabela Híbrida
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionFormV3 from './TransactionFormV3';
import TransactionsTable from './TransactionsTable';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useToast } from '../common/Toast';
import StorageService from '../../services/storage.service';
import NotificationService from '../../services/notification.service';
import Logger from '../../services/logger.service';
import type { Transaction } from '../../types/financial.types';
import './Transactions.css';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Carregar transações
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await StorageService.load<Transaction[]>('transactions');
      setTransactions(data || []);
      Logger.info('Transações carregadas', { count: (data || []).length }, 'TRANSACTIONS');
    } catch (error) {
      Logger.error('Erro ao carregar transações', error as Error, 'TRANSACTIONS');
      showToast('Erro ao carregar transações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveTransactions = async (data: Transaction[]) => {
    try {
      await StorageService.save('transactions', data);
      setTransactions(data);
      Logger.info('Transações salvas', { count: data.length }, 'TRANSACTIONS');
    } catch (error) {
      Logger.error('Erro ao salvar transações', error as Error, 'TRANSACTIONS');
      throw error;
    }
  };

  const handleCreate = (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction: Transaction = {
        ...data,
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date: new Date(data.date),
      };

      const updated = [newTransaction, ...transactions];
      saveTransactions(updated);

      showToast(
        `Transação "${data.description}" adicionada com sucesso!`,
        'success'
      );

      // Notify about new transaction
      NotificationService.notifyTransaction('created', data.description, data.amount);

      setIsFormOpen(false);
      Logger.info('Transação criada', { id: newTransaction.id }, 'TRANSACTIONS');
    } catch (error) {
      showToast('Erro ao criar transação', 'error');
      Logger.error('Erro ao criar transação', error as Error, 'TRANSACTIONS');
    }
  };

  const handleUpdate = (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTransaction) return;

    try {
      const updated = transactions.map(t =>
        t.id === editingTransaction.id
          ? { ...t, ...data, updatedAt: new Date().toISOString() }
          : t
      );

      saveTransactions(updated);

      showToast(
        `Transação "${data.description}" atualizada com sucesso!`,
        'success'
      );

      // Notify about updated transaction
      NotificationService.notifyTransaction('updated', data.description, data.amount);

      setIsFormOpen(false);
      setEditingTransaction(undefined);
      Logger.info('Transação atualizada', { id: editingTransaction.id }, 'TRANSACTIONS');
    } catch (error) {
      showToast('Erro ao atualizar transação', 'error');
      Logger.error('Erro ao atualizar transação', error as Error, 'TRANSACTIONS');
    }
  };

  const handleDelete = (id: string) => {
    try {
      const transaction = transactions.find(t => t.id === id);
      const updated = transactions.filter(t => t.id !== id);
      
      saveTransactions(updated);

      showToast(
        `Transação "${transaction?.description}" excluída com sucesso!`,
        'success'
      );

      // Notify about deleted transaction
      if (transaction) {
        NotificationService.notifyTransaction('deleted', transaction.description, transaction.amount);
      }

      Logger.info('Transação excluída', { id }, 'TRANSACTIONS');
    } catch (error) {
      showToast('Erro ao excluir transação', 'error');
      Logger.error('Erro ao excluir transação', error as Error, 'TRANSACTIONS');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };

  return (
    <div className="transactions-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <div>
          <h1>
            <i className="fas fa-wallet"></i>
            Receitas e Despesas
          </h1>
          <p>Registre e acompanhe todo o seu dinheiro que entra e sai</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsFormOpen(true)}
        >
          <i className="fas fa-plus"></i>
          Adicionar Novo Registro
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <TransactionsTable
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </motion.div>

      {/* Modal de Formulário */}
      <AnimatePresence>
        {isFormOpen && (
          <Modal isOpen={isFormOpen} onClose={handleCloseForm}>
            <TransactionFormV3
              transaction={editingTransaction}
              onSubmit={editingTransaction ? handleUpdate : handleCreate}
              onCancel={handleCloseForm}
            />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
