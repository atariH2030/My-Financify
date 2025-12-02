import React, { useState, useEffect, useCallback } from 'react';
import SyncIndicator from '../common/SyncIndicator';
import AIFloatingButton from '../ai/AIFloatingButton';
import AIChat from '../ai/AIChat';
import AIInsights from '../ai/AIInsights';
import AIService from '../../services/ai.service';
import type { AIContext } from '../../types/ai.types';
import './dashboard.css';

// Interfaces para manter type safety
interface FinancialItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  description?: string;
}

interface FinancialData {
  income: FinancialItem[];
  fixedExpenses: FinancialItem[];
  variableExpenses: FinancialItem[];
}

interface MarketData {
  usdRate: string;
  selicRate: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<FinancialItem, 'id'>) => void;
  title: string;
  editingItem?: FinancialItem | null;
}

// Utility functions (migradas do base.js)
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Função para buscar dados de mercado (simulada)
const fetchMarketData = async (): Promise<MarketData> => {
  try {
    // Simula API call - substitua com endpoints reais
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      usdRate: 'R$ 5,25',
      selicRate: '11,25%'
    };
  } catch (error) {
    console.error('Erro ao buscar dados do mercado:', error);
    return {
      usdRate: 'Erro',
      selicRate: 'Erro'
    };
  }
};

// Financial Item Component (equivalente aos itens da lista HTML)
const FinancialItemComponent: React.FC<{
  item: FinancialItem;
  onEdit: (item: FinancialItem) => void;
  onDelete: (id: string) => void;
  type: 'income' | 'expense';
}> = ({ item, onEdit, onDelete, type }) => (
  <div className="financial-item">
    <div className="item-info">
      <h4>{item.title}</h4>
      <p>{item.description}</p>
      <span className="item-date">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
    </div>
    <div className="item-amount">
      <span className={type === 'income' ? 'income' : 'expense'}>
        {formatCurrency(item.amount)}
      </span>
    </div>
    <div className="item-actions">
      <button onClick={() => onEdit(item)} className="btn-edit" title="Editar">
        <i className="fas fa-edit"></i>
      </button>
      <button onClick={() => onDelete(item.id)} className="btn-delete" title="Excluir">
        <i className="fas fa-trash"></i>
      </button>
    </div>
  </div>
);

// Empty State Component (equivalente aos empty states HTML)
const EmptyState: React.FC<{ message: string; icon: string }> = ({ message, icon }) => (
  <div className="empty-state">
    <i className={icon}></i>
    <p>{message}</p>
  </div>
);

// Modal Component (equivalente ao modal HTML)
const ItemModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, title, editingItem }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: '',
    description: ''
  });

  useEffect(() => {
    if (editingItem) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: editingItem.title,
        amount: editingItem.amount.toString(),
        date: editingItem.date,
        description: editingItem.description || ''
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    }
  }, [editingItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description
    });
    setFormData({
      title: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <span className="close" onClick={onClose}>&times;</span>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="item-title">Título:</label>
              <input
                type="text"
                id="item-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="item-amount">Valor (R$):</label>
              <input
                type="number"
                id="item-amount"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="item-date">Data:</label>
              <input
                type="date"
                id="item-date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="item-description">Descrição (opcional):</label>
              <textarea
                id="item-description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-save">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component (estrutura idêntica à pagina_home.html)
const Dashboard: React.FC<{ className?: string }> = ({ className: _className }) => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    income: [],
    fixedExpenses: [],
    variableExpenses: []
  });

  const [marketData, setMarketData] = useState<MarketData>({
    usdRate: 'Carregando...',
    selicRate: 'Carregando...'
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '' as 'income' | 'fixedExpenses' | 'variableExpenses' | '',
    title: '',
    editingItem: null as FinancialItem | null
  });

  // Estados da IA
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [hasNewInsights, setHasNewInsights] = useState(false);

  // Load data from localStorage on mount (implementação do base.js)
  useEffect(() => {
    const savedData = localStorage.getItem('financialData');
    if (savedData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFinancialData(JSON.parse(savedData));
    }
    
    // Fetch market data
    fetchMarketData().then(setMarketData);

    // Update market data every 5 minutes (como no base.js)
    const interval = setInterval(() => {
      fetchMarketData().then(setMarketData);
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);

  // Save data to localStorage whenever financialData changes (como no base.js)
  useEffect(() => {
    localStorage.setItem('financialData', JSON.stringify(financialData));
  }, [financialData]);

  // Verificar insights da IA periodicamente
  useEffect(() => {
    const checkInsights = async () => {
      try {
        const isConfigured = await AIService.isConfigured();
        if (isConfigured) {
          const insights = await AIService.getInsights();
          const unreadInsights = insights.filter(i => 
            i.priority === 'high' || i.priority === 'medium'
          );
          setHasNewInsights(unreadInsights.length > 0);
        }
      } catch (error) {
        console.error('Erro ao verificar insights:', error);
      }
    };

    checkInsights();
    const interval = setInterval(checkInsights, 60000); // A cada minuto
    return () => clearInterval(interval);
  }, []);

  // Construir contexto financeiro para IA
  const buildAIContext = useCallback((): AIContext => {
    const totalIncome = financialData.income.reduce((sum, item) => sum + item.amount, 0);
    const totalFixedExpenses = financialData.fixedExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalVariableExpenses = financialData.variableExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = totalFixedExpenses + totalVariableExpenses;

    const byCategory: Record<string, number> = {};
    [...financialData.fixedExpenses, ...financialData.variableExpenses].forEach(item => {
      const category = item.title.split(' ')[0]; // Categoria simplificada
      byCategory[category] = (byCategory[category] || 0) + item.amount;
    });

    return {
      userId: 'current_user',
      timeRange: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        end: new Date().toISOString(),
      },
      transactions: {
        total: financialData.income.length + financialData.fixedExpenses.length + financialData.variableExpenses.length,
        income: totalIncome,
        expenses: totalExpenses,
        byCategory,
      },
      budgets: {
        total: totalIncome,
        used: totalExpenses,
        percentage: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0,
        alerts: totalExpenses > totalIncome * 0.8 ? 1 : 0,
      },
      patterns: {
        topCategories: Object.entries(byCategory)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([cat]) => cat),
        avgMonthlySpending: totalExpenses,
        recurringTransactions: financialData.fixedExpenses.length,
      },
    };
  }, [financialData]);

  const openModal = (type: 'income' | 'fixedExpenses' | 'variableExpenses', editingItem?: FinancialItem) => {
    const titles = {
      income: editingItem ? 'Editar Receita' : 'Adicionar Receita',
      fixedExpenses: editingItem ? 'Editar Gasto Fixo' : 'Adicionar Gasto Fixo', 
      variableExpenses: editingItem ? 'Editar Gasto Variável' : 'Adicionar Gasto Variável'
    };

    setModalState({
      isOpen: true,
      type,
      title: titles[type],
      editingItem: editingItem || null
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: '',
      title: '',
      editingItem: null
    });
  };

  const saveItem = (itemData: Omit<FinancialItem, 'id'>) => {
    const { type, editingItem } = modalState;
    
    if (!type) return;
    
    if (editingItem) {
      // Edit existing item
      setFinancialData(prev => ({
        ...prev,
        [type]: prev[type as keyof FinancialData].map((item: FinancialItem) => 
          item.id === editingItem.id 
            ? { ...itemData, id: editingItem.id }
            : item
        )
      }));
    } else {
      // Add new item
      const newItem: FinancialItem = {
        ...itemData,
        id: generateId()
      };
      
      setFinancialData(prev => ({
        ...prev,
        [type]: [...prev[type as keyof FinancialData], newItem]
      }));
    }
    
    closeModal();
  };

  const deleteItem = (id: string, type: 'income' | 'fixedExpenses' | 'variableExpenses') => {
    if (window.confirm('Deseja realmente excluir este item?')) {
      setFinancialData(prev => ({
        ...prev,
        [type]: prev[type as keyof FinancialData].filter((item: FinancialItem) => item.id !== id)
      }));
    }
  };

  // Calculate summary values (implementação do updateSummaryCards do base.js)
  const totalIncome = financialData.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = [...financialData.fixedExpenses, ...financialData.variableExpenses]
    .reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="header-left">
          <h1>Dashboard Financeiro</h1>
          <p>Gerencie suas finanças de forma inteligente</p>
        </div>
        <div className="header-right">
          <div className="market-info">
            <div className="market-item">
              <span className="label">USD/BRL:</span>
              <span className="value">{marketData.usdRate}</span>
            </div>
            <div className="market-item">
              <span className="label">SELIC:</span>
              <span className="value">{marketData.selicRate}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Summary Cards (estrutura idêntica ao HTML) */}
        <div className="summary-cards">
        <div className="card income-card">
          <div className="card-icon income">
            <i className="fas fa-arrow-up"></i>
          </div>
          <div className="card-content">
            <h3 id="total-income">{formatCurrency(totalIncome)}</h3>
            <p>Total de Receitas</p>
          </div>
        </div>
        <div className="card expense-card">
          <div className="card-icon expense">
            <i className="fas fa-arrow-down"></i>
          </div>
          <div className="card-content">
            <h3 id="total-expenses">{formatCurrency(totalExpenses)}</h3>
            <p>Total de Gastos</p>
          </div>
        </div>
        <div className="card balance-card">
          <div className="card-icon balance">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="card-content">
            <h3 id="balance" style={{ color: balance >= 0 ? '#059669' : '#dc2626' }}>
              {formatCurrency(balance)}
            </h3>
            <p>Saldo Atual</p>
          </div>
        </div>
      </div>

      {/* Financial Sections (estrutura idêntica ao HTML) */}
      <div className="financial-sections">
        {/* Receitas Section */}
        <section className="section">
          <div className="section-header">
            <h2><i className="fas fa-plus-circle"></i> Receitas</h2>
            <button className="btn-add" onClick={() => openModal('income')}>
              <i className="fas fa-plus"></i> Adicionar Receita
            </button>
          </div>
          <div className="section-content">
            <div id="income-list" className="items-list">
              {financialData.income.length > 0 ? (
                financialData.income.map(item => (
                  <FinancialItemComponent
                    key={item.id}
                    item={item}
                    onEdit={(item) => openModal('income', item)}
                    onDelete={(id) => deleteItem(id, 'income')}
                    type="income"
                  />
                ))
              ) : (
                <EmptyState
                  message="Nenhuma receita cadastrada. Clique em 'Adicionar Receita' para começar."
                  icon="fas fa-inbox"
                />
              )}
            </div>
          </div>
        </section>

        {/* Gastos Fixos Section */}
        <section className="section">
          <div className="section-header">
            <h2><i className="fas fa-calendar-check"></i> Gastos Fixos</h2>
            <button className="btn-add" onClick={() => openModal('fixedExpenses')}>
              <i className="fas fa-plus"></i> Adicionar Gasto Fixo
            </button>
          </div>
          <div className="section-content">
            <div id="fixed-expenses-list" className="items-list">
              {financialData.fixedExpenses.length > 0 ? (
                financialData.fixedExpenses.map(item => (
                  <FinancialItemComponent
                    key={item.id}
                    item={item}
                    onEdit={(item) => openModal('fixedExpenses', item)}
                    onDelete={(id) => deleteItem(id, 'fixedExpenses')}
                    type="expense"
                  />
                ))
              ) : (
                <EmptyState
                  message="Nenhum gasto fixo cadastrado. Clique em 'Adicionar Gasto Fixo' para começar."
                  icon="fas fa-inbox"
                />
              )}
            </div>
          </div>
        </section>

        {/* Gastos Variáveis Section */}
        <section className="section">
          <div className="section-header">
            <h2><i className="fas fa-shopping-cart"></i> Gastos Variáveis</h2>
            <button className="btn-add" onClick={() => openModal('variableExpenses')}>
              <i className="fas fa-plus"></i> Adicionar Gasto Variável
            </button>
          </div>
          <div className="section-content">
            <div id="variable-expenses-list" className="items-list">
              {financialData.variableExpenses.length > 0 ? (
                financialData.variableExpenses.map(item => (
                  <FinancialItemComponent
                    key={item.id}
                    item={item}
                    onEdit={(item) => openModal('variableExpenses', item)}
                    onDelete={(id) => deleteItem(id, 'variableExpenses')}
                    type="expense"
                  />
                ))
              ) : (
                <EmptyState
                  message="Nenhum gasto variável cadastrado. Clique em 'Adicionar Gasto Variável' para começar."
                  icon="fas fa-inbox"
                />
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Modal (estrutura idêntica ao HTML) */}
        <ItemModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onSave={saveItem}
          title={modalState.title}
          editingItem={modalState.editingItem}
        />
      </div>
      
      {/* Indicador de Sincronização */}
      <SyncIndicator />

      {/* Botão Flutuante da IA */}
      <AIFloatingButton 
        onClick={() => setIsChatOpen(true)}
        hasNewInsights={hasNewInsights}
      />

      {/* Modal de Chat IA */}
      {isChatOpen && (
        <div className="ai-modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setIsChatOpen(false);
        }}>
          <div className="ai-modal-content">
            <AIChat 
              context={buildAIContext()}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Widget de Insights (opcional, pode ser adicionado no grid depois) */}
      {showInsights && (
        <div className="ai-insights-container">
          <AIInsights onOpenChat={() => setIsChatOpen(true)} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;