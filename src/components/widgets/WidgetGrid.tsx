/**
 * Widget Grid - Container de widgets do dashboard
 * v3.9.0 - Dashboard Personalizável
 */

import React from 'react';
import type { WidgetConfig, WidgetType } from '../../types/financial.types';
import {
  BalanceWidget,
  ExpensesWidget,
  IncomeWidget,
  BudgetWidget,
  GoalsWidget,
  RecurringWidget,
  RecentTransactionsWidget,
  AccountsWidget,
} from './WidgetTypes.tsx';
import WidgetService from '../../services/widget.service';
import './Widgets.css';

interface WidgetGridProps {
  onCustomize?: () => void;
}

const WidgetGrid: React.FC<WidgetGridProps> = ({ onCustomize }) => {
  const [widgets, setWidgets] = React.useState<WidgetConfig[]>([]);

  React.useEffect(() => {
    loadWidgets();
  }, []);

  const loadWidgets = () => {
    const layout = WidgetService.getActiveLayout();
    setWidgets(layout.widgets.filter(w => w.isVisible).sort((a, b) => a.position - b.position));
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (window.confirm('Deseja realmente remover este widget?')) {
      WidgetService.toggleWidgetVisibility(widgetId);
      loadWidgets();
    }
  };

  const renderWidget = (config: WidgetConfig) => {
    const props = {
      config,
      onRemove: () => handleRemoveWidget(config.id),
    };

    switch (config.type) {
      case 'balance':
        return <BalanceWidget key={config.id} {...props} />;
      case 'expenses':
        return <ExpensesWidget key={config.id} {...props} />;
      case 'income':
        return <IncomeWidget key={config.id} {...props} />;
      case 'budget':
        return <BudgetWidget key={config.id} {...props} />;
      case 'goals':
        return <GoalsWidget key={config.id} {...props} />;
      case 'recurring':
        return <RecurringWidget key={config.id} {...props} />;
      case 'recent-transactions':
        return <RecentTransactionsWidget key={config.id} {...props} />;
      case 'accounts':
        return <AccountsWidget key={config.id} {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="widget-grid-container">
      <div className="widget-grid-header">
        <h2>
          <i className="fas fa-th"></i> Dashboard
        </h2>
        {onCustomize && (
          <button className="btn btn-primary" onClick={onCustomize}>
            <i className="fas fa-cog"></i> Personalizar
          </button>
        )}
      </div>
      
      <div className="widget-grid">
        {widgets.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-th-large"></i>
            <h3>Nenhum widget visível</h3>
            <p>Adicione widgets para personalizar seu dashboard</p>
            {onCustomize && (
              <button className="btn btn-primary" onClick={onCustomize}>
                <i className="fas fa-plus"></i> Adicionar Widgets
              </button>
            )}
          </div>
        ) : (
          widgets.map(renderWidget)
        )}
      </div>
    </div>
  );
};

export default WidgetGrid;
