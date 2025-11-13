import React, { useState, useEffect } from 'react';

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

const Dashboard: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    income: [],
    fixedExpenses: [],
    variableExpenses: []
  });

  const [marketData, setMarketData] = useState({
    usdRate: 'Carregando...',
    selicRate: 'Carregando...'
  });

  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<keyof FinancialData>('income');
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);

  useEffect(() => {
    loadFinancialData();
    fetchMarketData();
  }, []);

  const loadFinancialData = () => {
    const savedData = localStorage.getItem('my-financify-data');
    if (savedData) {
      setFinancialData(JSON.parse(savedData));
    }
  };

  const saveFinancialData = (data: FinancialData) => {
    localStorage.setItem('my-financify-data', JSON.stringify(data));
    setFinancialData(data);
  };

  const fetchMarketData = async () => {
    // Simulação de dados do mercado - pode ser integrado com API real
    setMarketData({
      usdRate: 'R$ 5,25',
      selicRate: '11,75%'
    });
  };

  const calculateTotals = () => {
    const totalIncome = financialData.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = financialData.fixedExpenses.reduce((sum, item) => sum + item.amount, 0) +
                          financialData.variableExpenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, balance };
  };

  const { totalIncome, totalExpenses, balance } = calculateTotals();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const openModal = (category: keyof FinancialData, item?: FinancialItem) => {
    setCurrentCategory(category);
    setEditingItem(item || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = (formData: FinancialItem) => {
    const updatedData = { ...financialData };
    
    if (editingItem) {
      const index = updatedData[currentCategory].findIndex(item => item.id === editingItem.id);
      if (index !== -1) {
        updatedData[currentCategory][index] = formData;
      }
    } else {
      updatedData[currentCategory].push({
        ...formData,
        id: Date.now().toString()
      });
    }

    saveFinancialData(updatedData);
    closeModal();
  };

  const deleteItem = (category: keyof FinancialData, id: string) => {
    const updatedData = { ...financialData };
    updatedData[category] = updatedData[category].filter(item => item.id !== id);
    saveFinancialData(updatedData);
  };

  const renderItemsList = (items: FinancialItem[], category: keyof FinancialData, emptyMessage: string) => {
    if (items.length === 0) {
      return (
        <div className="empty-state">
          <i className="fas fa-inbox"></i>
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="items-list">
        {items.map(item => (
          <div key={item.id} className="item-card">
            <div className="item-content">
              <div className="item-header">
                <h4>{item.title}</h4>
                <span className="item-amount">{formatCurrency(item.amount)}</span>
              </div>
              <div className="item-details">
                <span className="item-date">
                  <i className="fas fa-calendar"></i>
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </span>
                {item.description && (
                  <p className="item-description">{item.description}</p>
                )}
              </div>
            </div>
            <div className="item-actions">
              <button 
                className="btn-edit"
                onClick={() => openModal(category, item)}
                title="Editar"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button 
                className="btn-delete"
                onClick={() => deleteItem(category, item.id)}
                title="Excluir"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
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

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card income-card">
          <div className="card-icon income">
            <i className="fas fa-arrow-up"></i>
          </div>
          <div className="card-content">
            <h3>{formatCurrency(totalIncome)}</h3>
            <p>Total de Receitas</p>
          </div>
        </div>
        <div className="card expense-card">
          <div className="card-icon expense">
            <i className="fas fa-arrow-down"></i>
          </div>
          <div className="card-content">
            <h3>{formatCurrency(totalExpenses)}</h3>
            <p>Total de Gastos</p>
          </div>
        </div>
        <div className="card balance-card">
          <div className="card-icon balance">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="card-content">
            <h3 className={balance >= 0 ? 'positive' : 'negative'}>
              {formatCurrency(balance)}
            </h3>
            <p>Saldo Atual</p>
          </div>
        </div>
      </div>

      {/* Financial Sections */}
      <div className="financial-sections">
        {/* Receitas */}
        <section className="section">
          <div className="section-header">
            <h2><i className="fas fa-plus-circle"></i> Receitas</h2>
            <button className="btn-add" onClick={() => openModal('income')}>
              <i className="fas fa-plus"></i> Adicionar Receita
            </button>
          </div>
          <div className="section-content">
            {renderItemsList(
              financialData.income,
              'income',
              'Nenhuma receita cadastrada. Clique em "Adicionar Receita" para começar.'
            )}
          </div>
        </section>

        {/* Gastos Fixos */}
        <section className="section">
          <div className="section-header">
            <h2><i className="fas fa-calendar-check"></i> Gastos Fixos</h2>
            <button className="btn-add" onClick={() => openModal('fixedExpenses')}>
              <i className="fas fa-plus"></i> Adicionar Gasto Fixo
            </button>
          </div>
          <div className="section-content">
            {renderItemsList(
              financialData.fixedExpenses,
              'fixedExpenses',
              'Nenhum gasto fixo cadastrado. Clique em "Adicionar Gasto Fixo" para começar.'
            )}
          </div>
        </section>

        {/* Gastos Variáveis */}
        <section className="section">
          <div className="section-header">
            <h2><i className="fas fa-shopping-cart"></i> Gastos Variáveis</h2>
            <button className="btn-add" onClick={() => openModal('variableExpenses')}>
              <i className="fas fa-plus"></i> Adicionar Gasto Variável
            </button>
          </div>
          <div className="section-content">
            {renderItemsList(
              financialData.variableExpenses,
              'variableExpenses',
              'Nenhum gasto variável cadastrado. Clique em "Adicionar Gasto Variável" para começar.'
            )}
          </div>
        </section>
      </div>

      {/* Modal */}
      {showModal && (
        <ItemModal
          category={currentCategory}
          item={editingItem}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

// Modal Component
interface ItemModalProps {
  category: keyof FinancialData;
  item?: FinancialItem | null;
  onSubmit: (data: FinancialItem) => void;
  onClose: () => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ category, item, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    amount: item?.amount || 0,
    date: item?.date || new Date().toISOString().split('T')[0],
    description: item?.description || ''
  });

  const getCategoryTitle = () => {
    switch (category) {
      case 'income': return 'Receita';
      case 'fixedExpenses': return 'Gasto Fixo';
      case 'variableExpenses': return 'Gasto Variável';
      default: return 'Item';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: item?.id || Date.now().toString()
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? 'Editar' : 'Adicionar'} {getCategoryTitle()}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="title">Título:</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Valor (R$):</label>
            <input
              type="number"
              id="amount"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Data:</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Descrição (opcional):</label>
            <textarea
              id="description"
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
  );
};

export default Dashboard;