import React, { useState, useEffect } from "react";

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

interface FinancialItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingItem: FinancialItem | null;
  category: keyof FinancialData;
}

const FinancialItemModal: React.FC<FinancialItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  category,
}) => {
  const [formData, setFormData] = useState({
    title: editingItem?.title || "",
    amount: editingItem?.amount || "",
    date: editingItem?.date || new Date().toISOString().split("T")[0],
    description: editingItem?.description || "",
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title,
        amount: editingItem.amount.toString(),
        date: editingItem.date,
        description: editingItem.description || "",
      });
    } else {
      setFormData({
        title: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
    }
  }, [editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getCategoryTitle = () => {
    switch (category) {
      case "income":
        return "Receita";
      case "fixedExpenses":
        return "Gasto Fixo";
      case "variableExpenses":
        return "Gasto Variável";
      default:
        return "Item";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {editingItem ? "Editar" : "Adicionar"} {getCategoryTitle()}
          </h3>
          <span className="close" onClick={onClose}>
            &times;
          </span>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="item-title">Título:</label>
              <input
                type="text"
                id="item-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="item-date">Data:</label>
              <input
                type="date"
                id="item-date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="item-description">Descrição (opcional):</label>
              <textarea
                id="item-description"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              ></textarea>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-save" onClick={handleSubmit}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    income: [],
    fixedExpenses: [],
    variableExpenses: [],
  });

  const [marketData, setMarketData] = useState({
    usdRate: "Carregando...",
    selicRate: "Carregando...",
  });

  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<keyof FinancialData>("income");
  const [editingItem, setEditingItem] = useState<FinancialItem | null>(null);

  useEffect(() => {
    loadFinancialData();
    fetchMarketData();
  }, []);

  const loadFinancialData = () => {
    const savedData = localStorage.getItem("my-financify-data");
    if (savedData) {
      setFinancialData(JSON.parse(savedData));
    }
  };

  const saveFinancialData = (data: FinancialData) => {
    localStorage.setItem("my-financify-data", JSON.stringify(data));
    setFinancialData(data);
  };

  const fetchMarketData = async () => {
    // Simulando dados de mercado
    setTimeout(() => {
      setMarketData({
        usdRate: "R$ 5,25",
        selicRate: "11,75%",
      });
    }, 1000);
  };

  const calculateTotals = () => {
    const totalIncome = financialData.income.reduce(
      (sum: number, item: FinancialItem) => sum + item.amount,
      0
    );
    const totalExpenses =
      financialData.fixedExpenses.reduce(
        (sum: number, item: FinancialItem) => sum + item.amount,
        0
      ) +
      financialData.variableExpenses.reduce(
        (sum: number, item: FinancialItem) => sum + item.amount,
        0
      );
    const balance = totalIncome - totalExpenses;

    return {
      totalIncome: totalIncome.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      totalExpenses: totalExpenses.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      balance: balance.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
    };
  };

  const totals = calculateTotals();

  const addItem = (category: keyof FinancialData) => {
    setCurrentCategory(category);
    setEditingItem(null);
    setShowModal(true);
  };

  const saveItem = (formData: any) => {
    const newItem: FinancialItem = {
      id: editingItem?.id || Date.now().toString(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description || "",
    };

    const newData = { ...financialData };

    if (editingItem) {
      const index = newData[currentCategory].findIndex(
        (item) => item.id === editingItem.id
      );
      newData[currentCategory][index] = newItem;
    } else {
      newData[currentCategory].push(newItem);
    }

    saveFinancialData(newData);
    setShowModal(false);
  };

  const editItem = (item: FinancialItem, category: keyof FinancialData) => {
    setCurrentCategory(category);
    setEditingItem(item);
    setShowModal(true);
  };

  const deleteItem = (itemId: string, category: keyof FinancialData) => {
    if (window.confirm("Deseja realmente excluir este item?")) {
      const newData = { ...financialData };
      newData[category] = newData[category].filter(
        (item) => item.id !== itemId
      );
      saveFinancialData(newData);
    }
  };

  return (
    <>
      {/* Header */}
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

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card income-card">
          <div className="card-icon income">
            <i className="fas fa-arrow-up"></i>
          </div>
          <div className="card-content">
            <h3>{totals.totalIncome}</h3>
            <p>Total de Receitas</p>
          </div>
        </div>
        <div className="card expense-card">
          <div className="card-icon expense">
            <i className="fas fa-arrow-down"></i>
          </div>
          <div className="card-content">
            <h3>{totals.totalExpenses}</h3>
            <p>Total de Gastos</p>
          </div>
        </div>
        <div className="card balance-card">
          <div className="card-icon balance">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="card-content">
            <h3>{totals.balance}</h3>
            <p>Saldo Atual</p>
          </div>
        </div>
      </div>

      {/* Financial Sections */}
      <div className="financial-sections">
        {/* Receitas Section */}
        <section className="section">
          <div className="section-header">
            <h2>
              <i className="fas fa-plus-circle"></i> Receitas
            </h2>
            <button className="btn-add" onClick={() => addItem("income")}>
              <i className="fas fa-plus"></i> Adicionar Receita
            </button>
          </div>
          <div className="section-content">
            <div className="items-list">
              {financialData.income.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>
                    Nenhuma receita cadastrada. Clique em "Adicionar Receita"
                    para começar.
                  </p>
                </div>
              ) : (
                financialData.income.map((item) => (
                  <div key={item.id} className="item">
                    <div className="item-info">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                      <span className="item-date">
                        {new Date(item.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="item-amount">
                      {item.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                    <div className="item-actions">
                      <button
                        className="btn-edit"
                        onClick={() => editItem(item, "income")}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteItem(item.id, "income")}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Gastos Fixos Section */}
        <section className="section">
          <div className="section-header">
            <h2>
              <i className="fas fa-calendar-check"></i> Gastos Fixos
            </h2>
            <button
              className="btn-add"
              onClick={() => addItem("fixedExpenses")}
            >
              <i className="fas fa-plus"></i> Adicionar Gasto Fixo
            </button>
          </div>
          <div className="section-content">
            <div className="items-list">
              {financialData.fixedExpenses.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>
                    Nenhum gasto fixo cadastrado. Clique em "Adicionar Gasto
                    Fixo" para começar.
                  </p>
                </div>
              ) : (
                financialData.fixedExpenses.map((item) => (
                  <div key={item.id} className="item">
                    <div className="item-info">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                      <span className="item-date">
                        {new Date(item.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="item-amount">
                      {item.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                    <div className="item-actions">
                      <button
                        className="btn-edit"
                        onClick={() => editItem(item, "fixedExpenses")}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteItem(item.id, "fixedExpenses")}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Gastos Variáveis Section */}
        <section className="section">
          <div className="section-header">
            <h2>
              <i className="fas fa-shopping-cart"></i> Gastos Variáveis
            </h2>
            <button
              className="btn-add"
              onClick={() => addItem("variableExpenses")}
            >
              <i className="fas fa-plus"></i> Adicionar Gasto Variável
            </button>
          </div>
          <div className="section-content">
            <div className="items-list">
              {financialData.variableExpenses.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>
                    Nenhum gasto variável cadastrado. Clique em "Adicionar Gasto
                    Variável" para começar.
                  </p>
                </div>
              ) : (
                financialData.variableExpenses.map((item) => (
                  <div key={item.id} className="item">
                    <div className="item-info">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                      <span className="item-date">
                        {new Date(item.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="item-amount">
                      {item.amount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                    <div className="item-actions">
                      <button
                        className="btn-edit"
                        onClick={() => editItem(item, "variableExpenses")}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteItem(item.id, "variableExpenses")}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Modal */}
      {showModal && (
        <FinancialItemModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={saveItem}
          editingItem={editingItem}
          category={currentCategory}
        />
      )}
    </>
  );
};

export default Dashboard;
