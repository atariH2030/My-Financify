/**
 * @file DashboardCustomizer.tsx
 * @description Modal de personalização do dashboard
 * @version 2.0.0 - Otimizado para performance
 * @author DEV - Rickson (TQM)
 */

import React, { useState, useEffect } from 'react';
import './DashboardCustomizer.css';

interface Widget {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  order: number;
}

type LayoutMode = 'grid-large' | 'grid-medium' | 'grid-small' | 'list';

interface DashboardSettings {
  widgets: Widget[];
  layoutMode: LayoutMode;
  gridColumns: number;
}

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_WIDGETS: Omit<Widget, 'enabled' | 'order'>[] = [
  {
    id: 'balance',
    name: 'Saldo Total',
    icon: '💰',
    description: 'Visualize seu saldo atual consolidado',
  },
  {
    id: 'expenses',
    name: 'Despesas do Mês',
    icon: '📉',
    description: 'Acompanhe seus gastos mensais',
  },
  {
    id: 'income',
    name: 'Receitas do Mês',
    icon: '📈',
    description: 'Monitore suas entradas de dinheiro',
  },
  {
    id: 'goals',
    name: 'Metas Financeiras',
    icon: '🎯',
    description: 'Progresso das suas metas',
  },
  {
    id: 'budgets',
    name: 'Orçamentos',
    icon: '💼',
    description: 'Status dos seus orçamentos',
  },
  {
    id: 'recurring',
    name: 'Próximas Contas',
    icon: '🔔',
    description: 'Contas a vencer nos próximos dias',
  },
  {
    id: 'categories',
    name: 'Gastos por Categoria',
    icon: '📊',
    description: 'Distribuição dos seus gastos',
  },
  {
    id: 'recent',
    name: 'Transações Recentes',
    icon: '📝',
    description: 'Últimas movimentações financeiras',
  },
];

const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({ isOpen, onClose }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid-medium');
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Carregar widgets salvos do localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('dashboardSettings');
      if (saved) {
        const settings: DashboardSettings = JSON.parse(saved);
        setWidgets(settings.widgets);
        setLayoutMode(settings.layoutMode || 'grid-medium');
      } else {
        // Configuração padrão
        const defaultWidgets = AVAILABLE_WIDGETS.map((w, index) => ({
          ...w,
          enabled: true,
          order: index,
        }));
        setWidgets(defaultWidgets);
        setLayoutMode('grid-medium');
      }
    }
  }, [isOpen]);

  const handleToggleWidget = (widgetId: string) => {
    setWidgets(prev =>
      prev.map(w =>
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      )
    );
  };

  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetId) return;

    setWidgets(prev => {
      const newWidgets = [...prev];
      const draggedIndex = newWidgets.findIndex(w => w.id === draggedWidget);
      const targetIndex = newWidgets.findIndex(w => w.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      // Swap
      const [removed] = newWidgets.splice(draggedIndex, 1);
      newWidgets.splice(targetIndex, 0, removed);

      // Update order
      return newWidgets.map((w, index) => ({ ...w, order: index }));
    });
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const handleSave = () => {
    const settings: DashboardSettings = {
      widgets,
      layoutMode,
      gridColumns: getGridColumns(layoutMode),
    };
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    onClose();
    // Recarregar página para aplicar mudanças
    window.location.reload();
  };

  const handleReset = () => {
    if (window.confirm('Deseja restaurar a configuração padrão do dashboard?')) {
      const defaultWidgets = AVAILABLE_WIDGETS.map((w, index) => ({
        ...w,
        enabled: true,
        order: index,
      }));
      setWidgets(defaultWidgets);
      setLayoutMode('grid-medium');
      const settings: DashboardSettings = {
        widgets: defaultWidgets,
        layoutMode: 'grid-medium',
        gridColumns: 3,
      };
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    }
  };

  const getGridColumns = (mode: LayoutMode): number => {
    switch (mode) {
      case 'grid-large':
        return 2;
      case 'grid-medium':
        return 3;
      case 'grid-small':
        return 4;
      case 'list':
        return 1;
      default:
        return 3;
    }
  };

  const layoutOptions = [
    {
      id: 'grid-large' as LayoutMode,
      name: 'Quadros Grandes',
      icon: '🔲',
      description: '2 colunas - Widgets grandes com mais detalhes',
      preview: '▢▢',
    },
    {
      id: 'grid-medium' as LayoutMode,
      name: 'Quadros Médios',
      icon: '◻️',
      description: '3 colunas - Balanço entre tamanho e quantidade',
      preview: '▢▢▢',
    },
    {
      id: 'grid-small' as LayoutMode,
      name: 'Quadros Pequenos',
      icon: '▫️',
      description: '4 colunas - Mais widgets na tela',
      preview: '▢▢▢▢',
    },
    {
      id: 'list' as LayoutMode,
      name: 'Lista',
      icon: '☰',
      description: '1 coluna - Vista em lista vertical',
      preview: '▬',
    },
  ];

  if (!isOpen) return null;

  const enabledCount = widgets.filter(w => w.enabled).length;

  return (
    <div className="customizer-overlay" onClick={onClose}>
      <div
        className="customizer-modal"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="customizer-header">
            <div className="header-content">
              <h2>
                <i className="fas fa-sliders-h"></i> Personalizar Dashboard
              </h2>
              <p>Configure os widgets exibidos e sua ordem</p>
            </div>
            <button className="close-btn" onClick={onClose} title="Fechar">
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Stats */}
          <div className="customizer-stats">
            <div className="stat-item">
              <span className="stat-label">Widgets Ativos</span>
              <span className="stat-value">{enabledCount}/{widgets.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Layout</span>
              <span className="stat-badge success">
                {layoutOptions.find(l => l.id === layoutMode)?.name || 'Médio'}
              </span>
            </div>
          </div>

          {/* Layout Mode Selection */}
          <div className="layout-selection-section">
            <h3>
              <i className="fas fa-th"></i> Modo de Visualização
            </h3>
            <div className="layout-options">
              {layoutOptions.map((option) => (
                <div
                  key={option.id}
                  className={`layout-option ${layoutMode === option.id ? 'active' : ''}`}
                  onClick={() => setLayoutMode(option.id)}
                >
                  <div className="layout-option-header">
                    <span className="layout-icon">{option.icon}</span>
                    <span className="layout-name">{option.name}</span>
                    {layoutMode === option.id && (
                      <i className="fas fa-check-circle layout-check"></i>
                    )}
                  </div>
                  <div className="layout-preview">{option.preview}</div>
                  <p className="layout-description">{option.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Widgets List */}
          <div className="customizer-content">
            <h3>
              <i className="fas fa-puzzle-piece"></i> Widgets Disponíveis
            </h3>
            <div className="widgets-list">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className={`widget-card ${widget.enabled ? 'enabled' : 'disabled'} ${
                    draggedWidget === widget.id ? 'dragging' : ''
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(widget.id)}
                  onDragOver={(e) => handleDragOver(e, widget.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="widget-drag-handle">
                    <i className="fas fa-grip-vertical"></i>
                  </div>

                  <div className="widget-info">
                    <div className="widget-header-row">
                      <span className="widget-icon">{widget.icon}</span>
                      <span className="widget-name">{widget.name}</span>
                    </div>
                    <p className="widget-description">{widget.description}</p>
                  </div>

                  <label className="widget-toggle">
                    <input
                      type="checkbox"
                      checked={widget.enabled}
                      onChange={() => handleToggleWidget(widget.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="customizer-instructions">
              <h3>
                <i className="fas fa-info-circle"></i> Como usar
              </h3>
              <ul>
                <li>
                  <i className="fas fa-toggle-on"></i>
                  <strong>Ativar/Desativar:</strong> Use o botão à direita para mostrar ou ocultar widgets
                </li>
                <li>
                  <i className="fas fa-arrows-alt"></i>
                  <strong>Reordenar:</strong> Arraste e solte os cards para mudar a ordem
                </li>
                <li>
                  <i className="fas fa-save"></i>
                  <strong>Salvar:</strong> Clique em "Salvar" para aplicar as mudanças
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="customizer-footer">
            <button className="btn btn-secondary" onClick={handleReset}>
              <i className="fas fa-undo"></i> Restaurar Padrão
            </button>
            <div className="footer-actions">
              <button className="btn btn-outline" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                <i className="fas fa-check"></i> Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default DashboardCustomizer;
