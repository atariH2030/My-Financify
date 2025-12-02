/**
 * Transactions - Página de Gestão de Transações
 * v3.0.0 - CRUD Completo com nova estrutura hierárquica + Tabela Híbrida
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TransactionFormV3 from './TransactionFormV3';
import TransactionsTable from './TransactionsTable';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useToast } from '../common/Toast';
import { transactionsService } from '../../services/transactions.service';
import NotificationService from '../../services/notification.service';
import Logger from '../../services/logger.service';
import type { Transaction } from '../../types/financial.types';
import './Transactions.css';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [_loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionsService.getTransactions();
      setTransactions(data || []);
      Logger.info('✅ Transações carregadas', { count: data.length, source: 'Supabase/Cache' }, 'TRANSACTIONS');
    } catch (error) {
      Logger.error('❌ Erro ao carregar transações', error as Error, 'TRANSACTIONS');
      showToast('Erro ao carregar transações', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Carregar transações
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleCreate = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction = await transactionsService.createTransaction({
        description: data.description,
        amount: data.amount,
        type: data.type,
        section: data.section,
        category: data.category,
        subcategory: data.subcategory,
        date: data.date,
        accountId: data.accountId,
        notes: data.metadata?.notes,
        tags: data.tags,
      });

      // Recarregar lista
      await loadTransactions();

      showToast(
        `💰 Transação "${data.description}" adicionada com sucesso!`,
        'success'
      );

      NotificationService.notifyTransaction('created', data.description, data.amount);
      setIsFormOpen(false);
      Logger.info('✅ Transação criada', { id: newTransaction.id }, 'TRANSACTIONS');
    } catch (error) {
      showToast('❌ Erro ao criar transação', 'error');
      Logger.error('❌ Erro ao criar transação', error as Error, 'TRANSACTIONS');
    }
  };

  const handleUpdate = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTransaction) return;

    try {
      await transactionsService.updateTransaction(editingTransaction.id, {
        description: data.description,
        amount: data.amount,
        type: data.type,
        section: data.section,
        category: data.category,
        subcategory: data.subcategory,
        date: data.date,
        accountId: data.accountId,
        notes: data.metadata?.notes,
        tags: data.tags,
      });

      // Recarregar lista
      await loadTransactions();

      showToast(
        `✏️ Transação "${data.description}" atualizada com sucesso!`,
        'success'
      );

      NotificationService.notifyTransaction('updated', data.description, data.amount);
      setIsFormOpen(false);
      setEditingTransaction(undefined);
      Logger.info('✅ Transação atualizada', { id: editingTransaction.id }, 'TRANSACTIONS');
    } catch (error) {
      showToast('❌ Erro ao atualizar transação', 'error');
      Logger.error('❌ Erro ao atualizar transação', error as Error, 'TRANSACTIONS');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const transaction = transactions.find(t => t.id === id);
      
      await transactionsService.deleteTransaction(id);
      
      // Recarregar lista
      await loadTransactions();

      showToast(
        `🗑️ Transação "${transaction?.description}" excluída com sucesso!`,
        'success'
      );

      if (transaction) {
        NotificationService.notifyTransaction('deleted', transaction.description, transaction.amount);
      }

      Logger.info('✅ Transação excluída', { id }, 'TRANSACTIONS');
    } catch (error) {
      showToast('❌ Erro ao excluir transação', 'error');
      Logger.error('❌ Erro ao excluir transação', error as Error, 'TRANSACTIONS');
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
