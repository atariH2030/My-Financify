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
} from './WidgetTypes';
import WidgetService from '../../services/widget.service';
import Logger from '../../services/logger.service';
import './Widgets.css';
interface WidgetGridProps {
  onCustomize?: () => void;
}

const WidgetGrid: React.FC<WidgetGridProps> = ({ onCustomize }) => {
  const [widgets, setWidgets] = React.useState<WidgetConfig[]>([]);
  const [layoutMode, setLayoutMode] = React.useState<string>('grid-medium');
  const [updateKey, setUpdateKey] = React.useState<number>(0);
  const [expandedWidgets, setExpandedWidgets] = React.useState<Set<string>>(new Set());
  const [listViewMode, setListViewMode] = React.useState<'collapsed' | 'expanded' | 'all'>('collapsed');

  const loadLayoutSettings = React.useCallback(() => {
    const saved = localStorage.getItem('dashboardSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        const mode = settings.layoutMode || 'grid-medium';
        Logger.debug('Layout mode carregado', { mode }, 'WIDGETS');
        setLayoutMode(mode);
      } catch (error) {
        Logger.error('Error loading layout settings', error as Error, 'WIDGETS');
      }
    } else {
      Logger.debug('Nenhuma configuração salva, usando padrão', { mode: 'grid-medium' }, 'WIDGETS');
    }
  }, []);

  const mapWidgetIdToType = (id: string): WidgetType => {
    const typeMap: Record<string, WidgetType> = {
      'balance': 'balance',
      'expenses': 'expenses',
      'income': 'income',
      'goals': 'goals',
      'budgets': 'budget',
      'recurring': 'recurring',
      'recent': 'recent-transactions',
      'accounts': 'accounts',
      'categories': 'budget', // Fallback
    };
    return typeMap[id] || 'balance';
  };

  const loadWidgets = React.useCallback(() => {
    const saved = localStorage.getItem('dashboardSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        if (settings.widgets) {
          // Usar widgets personalizados se existirem
          const enabledWidgets = settings.widgets
            .filter((w: any) => w.enabled)
            .sort((a: any, b: any) => a.order - b.order);
          
          // Converter para WidgetConfig
          const widgetConfigs: WidgetConfig[] = enabledWidgets.map((w: any, index: number) => ({
            id: w.id,
            type: mapWidgetIdToType(w.id),
            title: w.name,
            isVisible: true,
            position: index,
            size: 'medium'
          }));
          
          setWidgets(widgetConfigs);
          return;
        }
      } catch (error) {
        Logger.error('Error loading custom widgets', error as Error, 'WIDGETS');
      }
    }
    
    // Fallback para widgets padrão
    const layout = WidgetService.getActiveLayout();
    setWidgets(layout.widgets.filter(w => w.isVisible).sort((a, b) => a.position - b.position));
  }, []);

  React.useEffect(() => {
    loadWidgets();
    loadLayoutSettings();
    
    // Listener para detectar mudanças no localStorage
    const handleStorageChange = () => {
      loadWidgets();
      loadLayoutSettings();
      setUpdateKey(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadWidgets, loadLayoutSettings]);

  const handleRemoveWidget = (widgetId: string) => {
    if (window.confirm('Deseja realmente remover este widget?')) {
      WidgetService.toggleWidgetVisibility(widgetId);
      loadWidgets();
    }
  };

  const toggleWidgetExpansion = (widgetId: string) => {
    setExpandedWidgets(prev => {
      const next = new Set(prev);
      if (next.has(widgetId)) {
        next.delete(widgetId);
      } else {
        next.add(widgetId);
      }
      return next;
    });
  };

  const toggleAllWidgets = () => {
    if (listViewMode === 'all') {
      setListViewMode('collapsed');
      setExpandedWidgets(new Set());
    } else {
      setListViewMode('all');
      setExpandedWidgets(new Set(widgets.map(w => w.id)));
    }
  };

  const renderWidget = (config: WidgetConfig) => {
    const isExpanded = layoutMode === 'list' ? 
      (listViewMode === 'all' || expandedWidgets.has(config.id)) : 
      true;
    
    const props = {
      config,
      onRemove: () => handleRemoveWidget(config.id),
      isListView: layoutMode === 'list',
      isExpanded,
      onToggleExpand: () => toggleWidgetExpansion(config.id),
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
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {layoutMode === 'list' && (
            <button 
              className="btn btn-secondary"
              onClick={toggleAllWidgets}
              title={listViewMode === 'all' ? 'Recolher todos' : 'Expandir todos'}
            >
              <i className={`fas fa-${listViewMode === 'all' ? 'compress' : 'expand'}-alt`}></i>
              {listViewMode === 'all' ? 'Recolher Todos' : 'Expandir Todos'}
            </button>
          )}
          {onCustomize && (
            <button className="btn btn-primary" onClick={onCustomize}>
              <i className="fas fa-cog"></i> Personalizar
            </button>
          )}
        </div>
      </div>
      
      <div 
        key={`${layoutMode}-${updateKey}`}
        className={`widget-grid widget-grid-${layoutMode}`}
      >
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
