/**
 * TransactionList - Lista de Transações com Filtros
 * v2.5.0 - CRUD de Transações
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatCurrency } from '../../utils/performance';
import { formatRelativeDate } from '../../utils/date';
import type { Transaction } from '../../types/financial.types';
import './TransactionList.css';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

type SortBy = 'date' | 'amount' | 'category';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'income' | 'expense';

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  onEdit, 
  onDelete,
  loading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Categorias únicas
  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return ['all', ...Array.from(cats)];
  }, [transactions]);

  // Filtrar e ordenar transações
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term) ||
        t.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filtro de tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filtro de categoria
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, searchTerm, filterType, filterCategory, sortBy, sortOrder]);

  // Estatísticas
  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      total: filteredTransactions.length,
      income,
      expense,
      balance: income - expense,
    };
  }, [filteredTransactions]);

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm(`Deseja realmente excluir "${transaction.description}"?`)) {
      onDelete(transaction.id);
    }
  };

  const toggleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="transaction-list-container">
      {/* Filtros e Busca */}
      <Card className="filters-card">
        <div className="filters-header">
          <h3>Filtros</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterCategory('all');
            }}
          >
            Limpar
          </Button>
        </div>

        <div className="filters-grid">
          {/* Busca */}
          <div className="filter-group full-width">
            <Input
              placeholder="Buscar por descrição, categoria ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tipo */}
          <div className="filter-group">
            <label>Tipo</label>
            <div className="type-filters">
              <button
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                Todos
              </button>
              <button
                className={`filter-btn income ${filterType === 'income' ? 'active' : ''}`}
                onClick={() => setFilterType('income')}
              >
                Receitas
              </button>
              <button
                className={`filter-btn expense ${filterType === 'expense' ? 'active' : ''}`}
                onClick={() => setFilterType('expense')}
              >
                Despesas
              </button>
            </div>
          </div>

          {/* Categoria */}
          <div className="filter-group">
            <label>Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Todas' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item income">
            <span className="stat-label">Receitas</span>
            <span className="stat-value">{formatCurrency(stats.income)}</span>
          </div>
          <div className="stat-item expense">
            <span className="stat-label">Despesas</span>
            <span className="stat-value">{formatCurrency(stats.expense)}</span>
          </div>
          <div className={`stat-item ${stats.balance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
            <span className="stat-label">Saldo</span>
            <span className="stat-value">{formatCurrency(stats.balance)}</span>
          </div>
        </div>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <div className="list-header">
          <h3>Transações ({filteredTransactions.length})</h3>
          <div className="sort-controls">
            <button
              className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`}
              onClick={() => toggleSort('date')}
            >
              Data {sortBy === 'date' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
            </button>
            <button
              className={`sort-btn ${sortBy === 'amount' ? 'active' : ''}`}
              onClick={() => toggleSort('amount')}
            >
              Valor {sortBy === 'amount' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
            </button>
            <button
              className={`sort-btn ${sortBy === 'category' ? 'active' : ''}`}
              onClick={() => toggleSort('category')}
            >
              Categoria {sortBy === 'category' && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
            </button>
          </div>
        </div>

        <div className="transactions-list">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Carregando transações...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-state"
              >
                <i className="fas fa-inbox"></i>
                <h4>Nenhuma transação encontrada</h4>
                <p>Ajuste os filtros ou adicione uma nova transação</p>
              </motion.div>
            ) : (
              filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className={`transaction-item ${transaction.type}`}
                  layout
                >
                  <div className="transaction-main">
                    <div className="transaction-icon">
                      <i className={`fas fa-arrow-${transaction.type === 'income' ? 'up' : 'down'}`}></i>
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-header">
                        <h4>{transaction.description}</h4>
                        <span className={`transaction-amount ${transaction.type}`}>
                          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                      <div className="transaction-meta">
                        <span className="category">
                          <i className="fas fa-tag"></i>
                          {transaction.category}
                        </span>
                        <span className="date">
                          <i className="fas fa-calendar"></i>
                          {formatRelativeDate(new Date(transaction.date))}
                        </span>
                        {transaction.tags && transaction.tags.length > 0 && (
                          <span className="tags">
                            {transaction.tags.map(tag => (
                              <span key={tag} className="tag">{tag}</span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="transaction-actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(transaction)}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(transaction)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};

export default TransactionList;
