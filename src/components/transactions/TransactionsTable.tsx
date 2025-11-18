/**
 * TransactionsTable - Visualização Híbrida de Transações
 * 
 * DECISÃO: Combina tabela tradicional com design moderno e cards visuais
 * BENEFÍCIO: Fácil leitura, agrupamento por sessões, filtros poderosos
 * 
 * @version 3.0.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/performance';
import { formatDate } from '../../utils/date';
import type { Transaction } from '../../types/financial.types';
import { getSectionById, getCategoriesBySection, EXPENSE_TYPE_COLORS, EXPENSE_TYPE_LABELS } from '../../config/categories.config';
import Tooltip from '../common/Tooltip';
import './TransactionsTable.css';

interface TransactionsTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

interface GroupedTransactions {
  sectionId: string;
  sectionName: string;
  sectionIcon: string;
  sectionColor: string;
  transactions: Transaction[];
  total: number;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['income', 'home-expenses', 'personal-expenses']));
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterExpenseType, setFilterExpenseType] = useState<'all' | 'fixed' | 'variable'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrar e ordenar transações
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filtro por tipo de despesa
    if (filterExpenseType !== 'all') {
      filtered = filtered.filter(t => t.expenseType === filterExpenseType);
    }

    // Filtro por busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(search) ||
        t.section.toLowerCase().includes(search) ||
        t.category.toLowerCase().includes(search) ||
        t.subcategory?.toLowerCase().includes(search)
      );
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
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, filterType, filterExpenseType, searchTerm, sortBy, sortOrder]);

  // Agrupar por sessão
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, GroupedTransactions> = {};

    filteredTransactions.forEach(transaction => {
      const sectionId = transaction.section;
      
      if (!groups[sectionId]) {
        const section = getSectionById(sectionId);
        groups[sectionId] = {
          sectionId,
          sectionName: section?.name || sectionId,
          sectionIcon: section?.icon || '📦',
          sectionColor: section?.color || '#6b7280',
          transactions: [],
          total: 0,
        };
      }

      groups[sectionId].transactions.push(transaction);
      groups[sectionId].total += transaction.type === 'income' ? transaction.amount : -transaction.amount;
    });

    return Object.values(groups);
  }, [filteredTransactions]);

  // Totais gerais
  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = (transaction: Transaction) => {
    if (window.confirm(`Tem certeza que deseja excluir "${transaction.description}"?`)) {
      onDelete(transaction.id);
    }
  };

  return (
    <div className="transactions-table-container">
      {/* Filtros e Busca */}
      <div className="table-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 Buscar por descrição, categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Todas
          </button>
          <button
            className={`filter-btn income ${filterType === 'income' ? 'active' : ''}`}
            onClick={() => setFilterType('income')}
          >
            📈 Receitas
          </button>
          <button
            className={`filter-btn expense ${filterType === 'expense' ? 'active' : ''}`}
            onClick={() => setFilterType('expense')}
          >
            📉 Despesas
          </button>
        </div>

        {filterType === 'expense' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="filter-buttons"
          >
            <button
              className={`filter-btn ${filterExpenseType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterExpenseType('all')}
            >
              Todos Tipos
            </button>
            <button
              className={`filter-btn ${filterExpenseType === 'fixed' ? 'active' : ''}`}
              style={{ borderColor: EXPENSE_TYPE_COLORS.fixed }}
              onClick={() => setFilterExpenseType('fixed')}
            >
              📌 Gastos Fixos
            </button>
            <button
              className={`filter-btn ${filterExpenseType === 'variable' ? 'active' : ''}`}
              style={{ borderColor: EXPENSE_TYPE_COLORS.variable }}
              onClick={() => setFilterExpenseType('variable')}
            >
              🔄 Gastos Variáveis
            </button>
          </motion.div>
        )}
      </div>

      {/* Resumo */}
      <div className="table-summary">
        <div className="summary-card income">
          <span className="summary-label">Receitas</span>
          <span className="summary-value">{formatCurrency(totals.income)}</span>
        </div>
        <div className="summary-card expense">
          <span className="summary-label">Despesas</span>
          <span className="summary-value">{formatCurrency(totals.expense)}</span>
        </div>
        <div className={`summary-card balance ${totals.balance >= 0 ? 'positive' : 'negative'}`}>
          <span className="summary-label">Saldo</span>
          <span className="summary-value">{formatCurrency(totals.balance)}</span>
        </div>
        <div className="summary-card count">
          <span className="summary-label">Total de Registros</span>
          <span className="summary-value">{totals.count}</span>
        </div>
      </div>

      {/* Tabela Agrupada */}
      <div className="transactions-table">
        {groupedTransactions.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>Nenhum registro encontrado</h3>
            <p>Tente ajustar os filtros ou adicione um novo registro</p>
          </div>
        ) : (
          groupedTransactions.map((group) => (
            <div key={group.sectionId} className="section-group">
              {/* Header da Sessão */}
              <div
                className="section-header"
                onClick={() => toggleSection(group.sectionId)}
                style={{ borderLeftColor: group.sectionColor }}
              >
                <div className="section-info">
                  <span className="section-toggle">
                    {expandedSections.has(group.sectionId) ? '▼' : '▶'}
                  </span>
                  <span className="section-icon">{group.sectionIcon}</span>
                  <span className="section-name">{group.sectionName}</span>
                  <span className="section-count">{group.transactions.length} registros</span>
                </div>
                <div className="section-total" style={{ color: group.sectionColor }}>
                  {formatCurrency(Math.abs(group.total))}
                </div>
              </div>

              {/* Transações da Sessão */}
              <AnimatePresence>
                {expandedSections.has(group.sectionId) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="section-content"
                  >
                    <div className="table-scroll-wrapper">
                      <table className="transactions-list">
                        <thead>
                          <tr>
                            <th onClick={() => handleSort('date')} className="sortable">
                              Data {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('description')} className="sortable">
                              Descrição {sortBy === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Categoria</th>
                            <th>Tipo</th>
                            <th onClick={() => handleSort('amount')} className="sortable amount-col">
                              Valor {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="actions-col">Ações</th>
                          </tr>
                        </thead>
                      <tbody>
                        {group.transactions.map((transaction, index) => {
                          const category = getCategoriesBySection(transaction.section).find(
                            c => c.id === transaction.category
                          );

                          return (
                            <motion.tr
                              key={transaction.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.03 }}
                              className={transaction.type}
                            >
                              <td className="date-col">
                                {formatDate(transaction.date)}
                              </td>
                              <td className="description-col">
                                <div className="description-content">
                                  <span className="description-text">{transaction.description}</span>
                                  {transaction.subcategory && (
                                    <span className="subcategory-badge">{transaction.subcategory}</span>
                                  )}
                                  {transaction.recurring?.enabled && (
                                    <Tooltip text="🔄" explanation="Esta é uma transação recorrente que se repete automaticamente">
                                      <span className="recurring-badge">🔄</span>
                                    </Tooltip>
                                  )}
                                </div>
                              </td>
                              <td className="category-col">
                                <span className="category-badge" style={{ borderColor: category?.color }}>
                                  {category?.icon} {category?.name}
                                </span>
                              </td>
                              <td className="type-col">
                                {transaction.expenseType && (
                                  <span
                                    className="expense-type-badge"
                                    style={{
                                      backgroundColor: EXPENSE_TYPE_COLORS[transaction.expenseType] + '20',
                                      borderColor: EXPENSE_TYPE_COLORS[transaction.expenseType],
                                      color: EXPENSE_TYPE_COLORS[transaction.expenseType],
                                    }}
                                  >
                                    {transaction.expenseType === 'fixed' ? '📌' : '🔄'}
                                    {EXPENSE_TYPE_LABELS[transaction.expenseType]}
                                  </span>
                                )}
                              </td>
                              <td className={`amount-col ${transaction.type}`}>
                                {transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </td>
                              <td className="actions-col">
                                <button
                                  className="action-btn edit"
                                  onClick={() => onEdit(transaction)}
                                  title="Editar registro"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="action-btn delete"
                                  onClick={() => handleDelete(transaction)}
                                  title="Excluir registro"
                                >
                                  🗑️
                                </button>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsTable;
