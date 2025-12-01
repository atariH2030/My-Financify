/**
 * Widget Service
 * Gerencia layouts personalizáveis do dashboard
 * 
 * @version 3.9.0
 */

import StorageService from './storage.service';
import Logger from './logger.service';
import type { WidgetConfig, DashboardLayout, WidgetType } from '../types/financial.types';

const STORAGE_KEY = 'dashboard_layouts';
const ACTIVE_LAYOUT_KEY = 'active_dashboard_layout';

class WidgetService {
  /**
   * Layout padrão inicial
   */
  private getDefaultLayout(): DashboardLayout {
    return {
      id: 'default',
      name: 'Padrão',
      isDefault: true,
      createdAt: new Date().toISOString(),
      widgets: [
        {
          id: 'balance-widget',
          type: 'balance',
          title: 'Saldo Total',
          size: 'medium',
          position: 0,
          isVisible: true,
        },
        {
          id: 'expenses-widget',
          type: 'expenses',
          title: 'Despesas do Mês',
          size: 'medium',
          position: 1,
          isVisible: true,
        },
        {
          id: 'income-widget',
          type: 'income',
          title: 'Receitas do Mês',
          size: 'medium',
          position: 2,
          isVisible: true,
        },
        {
          id: 'budget-widget',
          type: 'budget',
          title: 'Orçamentos',
          size: 'medium',
          position: 3,
          isVisible: true,
        },
        {
          id: 'chart-widget',
          type: 'chart',
          title: 'Gráfico Mensal',
          size: 'large',
          position: 4,
          isVisible: true,
          settings: { chartType: 'line', period: 'month' },
        },
        {
          id: 'goals-widget',
          type: 'goals',
          title: 'Metas em Progresso',
          size: 'medium',
          position: 5,
          isVisible: true,
        },
        {
          id: 'recurring-widget',
          type: 'recurring',
          title: 'Próximas Contas',
          size: 'medium',
          position: 6,
          isVisible: true,
        },
        {
          id: 'recent-transactions-widget',
          type: 'recent-transactions',
          title: 'Transações Recentes',
          size: 'large',
          position: 7,
          isVisible: true,
        },
      ],
    };
  }

  /**
   * Obtém todos os layouts
   */
  getAllLayouts(): DashboardLayout[] {
    try {
      const layouts = StorageService.loadSync<DashboardLayout[]>(STORAGE_KEY);
      
      if (!layouts || layouts.length === 0) {
        const defaultLayout = this.getDefaultLayout();
        this.saveLayout(defaultLayout);
        return [defaultLayout];
      }
      
      return layouts;
    } catch (error) {
      Logger.error('Erro ao buscar layouts', error as Error, 'WIDGET_SERVICE');
      return [this.getDefaultLayout()];
    }
  }

  /**
   * Obtém layout ativo
   */
  getActiveLayout(): DashboardLayout {
    try {
      const activeId = StorageService.loadSync<string>(ACTIVE_LAYOUT_KEY);
      const layouts = this.getAllLayouts();
      
      const active = layouts.find(l => l.id === activeId);
      return active || layouts.find(l => l.isDefault) || layouts[0];
    } catch (error) {
      Logger.error('Erro ao buscar layout ativo', error as Error, 'WIDGET_SERVICE');
      return this.getDefaultLayout();
    }
  }

  /**
   * Define layout ativo
   */
  setActiveLayout(layoutId: string): void {
    try {
      StorageService.saveSync(ACTIVE_LAYOUT_KEY, layoutId);
      Logger.info('Layout ativo alterado', { layoutId }, 'WIDGET_SERVICE');
    } catch (error) {
      Logger.error('Erro ao definir layout ativo', error as Error, 'WIDGET_SERVICE');
    }
  }

  /**
   * Salva ou atualiza layout
   */
  saveLayout(layout: DashboardLayout): DashboardLayout {
    try {
      const layouts = this.getAllLayouts();
      const index = layouts.findIndex(l => l.id === layout.id);

      const updatedLayout = {
        ...layout,
        updatedAt: new Date().toISOString(),
      };

      if (index >= 0) {
        layouts[index] = updatedLayout;
      } else {
        layouts.push(updatedLayout);
      }

      StorageService.saveSync(STORAGE_KEY, layouts);
      Logger.info('Layout salvo', { id: layout.id, name: layout.name }, 'WIDGET_SERVICE');
      
      return updatedLayout;
    } catch (error) {
      Logger.error('Erro ao salvar layout', error as Error, 'WIDGET_SERVICE');
      throw error;
    }
  }

  /**
   * Remove layout
   */
  deleteLayout(layoutId: string): boolean {
    try {
      const layouts = this.getAllLayouts();
      const layout = layouts.find(l => l.id === layoutId);

      if (layout?.isDefault) {
        throw new Error('Não é possível excluir o layout padrão');
      }

      const filtered = layouts.filter(l => l.id !== layoutId);
      
      if (filtered.length === layouts.length) {
        return false;
      }

      StorageService.saveSync(STORAGE_KEY, filtered);

      // Se era o layout ativo, volta para o padrão
      const activeId = StorageService.loadSync<string>(ACTIVE_LAYOUT_KEY);
      if (activeId === layoutId) {
        const defaultLayout = filtered.find(l => l.isDefault);
        this.setActiveLayout(defaultLayout?.id || filtered[0].id);
      }

      Logger.info('Layout excluído', { layoutId }, 'WIDGET_SERVICE');
      return true;
    } catch (error) {
      Logger.error('Erro ao excluir layout', error as Error, 'WIDGET_SERVICE');
      return false;
    }
  }

  /**
   * Duplica layout
   */
  duplicateLayout(layoutId: string, newName: string): DashboardLayout {
    try {
      const layouts = this.getAllLayouts();
      const source = layouts.find(l => l.id === layoutId);

      if (!source) {
        throw new Error('Layout não encontrado');
      }

      const newLayout: DashboardLayout = {
        ...source,
        id: this.generateId(),
        name: newName,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: undefined,
      };

      return this.saveLayout(newLayout);
    } catch (error) {
      Logger.error('Erro ao duplicar layout', error as Error, 'WIDGET_SERVICE');
      throw error;
    }
  }

  /**
   * Atualiza widget no layout ativo
   */
  updateWidget(widgetId: string, updates: Partial<WidgetConfig>): void {
    try {
      const layout = this.getActiveLayout();
      const widgetIndex = layout.widgets.findIndex(w => w.id === widgetId);

      if (widgetIndex < 0) {
        throw new Error('Widget não encontrado');
      }

      layout.widgets[widgetIndex] = {
        ...layout.widgets[widgetIndex],
        ...updates,
      };

      this.saveLayout(layout);
      Logger.info('Widget atualizado', { widgetId, updates }, 'WIDGET_SERVICE');
    } catch (error) {
      Logger.error('Erro ao atualizar widget', error as Error, 'WIDGET_SERVICE');
      throw error;
    }
  }

  /**
   * Adiciona widget ao layout ativo
   */
  addWidget(widget: Omit<WidgetConfig, 'id' | 'position'>): WidgetConfig {
    try {
      const layout = this.getActiveLayout();
      
      const newWidget: WidgetConfig = {
        ...widget,
        id: this.generateWidgetId(widget.type),
        position: layout.widgets.length,
      };

      layout.widgets.push(newWidget);
      this.saveLayout(layout);

      Logger.info('Widget adicionado', { widgetId: newWidget.id }, 'WIDGET_SERVICE');
      return newWidget;
    } catch (error) {
      Logger.error('Erro ao adicionar widget', error as Error, 'WIDGET_SERVICE');
      throw error;
    }
  }

  /**
   * Remove widget do layout ativo
   */
  removeWidget(widgetId: string): void {
    try {
      const layout = this.getActiveLayout();
      layout.widgets = layout.widgets.filter(w => w.id !== widgetId);

      // Reorganiza posições
      layout.widgets.forEach((w, index) => {
        w.position = index;
      });

      this.saveLayout(layout);
      Logger.info('Widget removido', { widgetId }, 'WIDGET_SERVICE');
    } catch (error) {
      Logger.error('Erro ao remover widget', error as Error, 'WIDGET_SERVICE');
      throw error;
    }
  }

  /**
   * Reordena widgets (drag-and-drop)
   */
  reorderWidgets(widgetIds: string[]): void {
    try {
      const layout = this.getActiveLayout();
      
      // Cria mapa de widgets por ID
      const widgetMap = new Map(layout.widgets.map(w => [w.id, w]));
      
      // Reordena baseado na nova ordem
      layout.widgets = widgetIds
        .map(id => widgetMap.get(id))
        .filter((w): w is WidgetConfig => w !== undefined)
        .map((w, index) => ({ ...w, position: index }));

      this.saveLayout(layout);
      Logger.info('Widgets reordenados', { count: widgetIds.length }, 'WIDGET_SERVICE');
    } catch (error) {
      Logger.error('Erro ao reordenar widgets', error as Error, 'WIDGET_SERVICE');
      throw error;
    }
  }

  /**
   * Toggle visibilidade de widget
   */
  toggleWidgetVisibility(widgetId: string): void {
    try {
      const layout = this.getActiveLayout();
      const widget = layout.widgets.find(w => w.id === widgetId);

      if (widget) {
        widget.isVisible = !widget.isVisible;
        this.saveLayout(layout);
        Logger.info('Visibilidade do widget alterada', { widgetId, isVisible: widget.isVisible }, 'WIDGET_SERVICE');
      }
    } catch (error) {
      Logger.error('Erro ao alterar visibilidade', error as Error, 'WIDGET_SERVICE');
      throw error;
    }
  }

  /**
   * Reseta layout para padrão
   */
  resetToDefault(): DashboardLayout {
    try {
      const defaultLayout = this.getDefaultLayout();
      defaultLayout.id = this.generateId(); // Novo ID para não sobrescrever
      const saved = this.saveLayout(defaultLayout);
      this.setActiveLayout(saved.id);
      
      Logger.info('Layout resetado para padrão', undefined, 'WIDGET_SERVICE');
      return saved;
    } catch (error) {
      Logger.error('Erro ao resetar layout', error as Error, 'WIDGET_SERVICE');
      throw error;
    }
  }

  /**
   * Obtém widgets disponíveis para adicionar
   */
  getAvailableWidgets(): Array<{ type: WidgetType; title: string; icon: string; description: string }> {
    return [
      { type: 'balance', title: 'Saldo Total', icon: 'fa-wallet', description: 'Exibe o saldo atual de todas as contas' },
      { type: 'expenses', title: 'Despesas', icon: 'fa-arrow-down', description: 'Resumo das despesas do período' },
      { type: 'income', title: 'Receitas', icon: 'fa-arrow-up', description: 'Resumo das receitas do período' },
      { type: 'budget', title: 'Orçamentos', icon: 'fa-chart-pie', description: 'Progresso dos orçamentos ativos' },
      { type: 'goals', title: 'Metas', icon: 'fa-bullseye', description: 'Metas em progresso e concluídas' },
      { type: 'recurring', title: 'Contas Recorrentes', icon: 'fa-sync-alt', description: 'Próximas contas a vencer' },
      { type: 'accounts', title: 'Contas', icon: 'fa-credit-card', description: 'Resumo de contas e cartões' },
      { type: 'chart', title: 'Gráfico', icon: 'fa-chart-line', description: 'Gráficos de tendências' },
      { type: 'recent-transactions', title: 'Transações Recentes', icon: 'fa-list', description: 'Últimas transações registradas' },
      { type: 'quick-actions', title: 'Ações Rápidas', icon: 'fa-bolt', description: 'Botões para ações frequentes' },
    ];
  }

  /**
   * Gera ID único
   */
  private generateId(): string {
    return `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gera ID de widget
   */
  private generateWidgetId(type: WidgetType): string {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new WidgetService();
