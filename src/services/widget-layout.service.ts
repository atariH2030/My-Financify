/**
 * @file widget-layout.service.ts
 * @description Gerenciamento de layout de widgets customizáveis - Sprint 6.1
 * @version 3.13.0
 * @author DEV - Rickson (TQM)
 * 
 * PILARES:
 * - Persistência de layout customizado
 * - Drag & Drop para reorganização
 * - Widgets habilitados/desabilitados
 * - Reset para layout padrão
 * - Logs para debugging
 */

import Logger from './logger.service';

export type WidgetType = 
  | 'balance'
  | 'income-expense'
  | 'budget-progress'
  | 'goals'
  | 'recent-transactions'
  | 'spending-chart'
  | 'category-breakdown'
  | 'ai-insights';

export interface Widget {
  id: WidgetType;
  enabled: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
  title: string;
  icon: string;
}

export interface WidgetLayout {
  widgets: Widget[];
  lastUpdated: Date;
}

class WidgetLayoutService {
  private static instance: WidgetLayoutService;
  private readonly STORAGE_KEY = 'dashboard_widget_layout';

  private constructor() {
    Logger.info('WidgetLayoutService inicializado', undefined, 'WIDGETS');
  }

  static getInstance(): WidgetLayoutService {
    if (!WidgetLayoutService.instance) {
      WidgetLayoutService.instance = new WidgetLayoutService();
    }
    return WidgetLayoutService.instance;
  }

  /**
   * Obter layout padrão de widgets
   */
  private getDefaultLayout(): WidgetLayout {
    return {
      widgets: [
        {
          id: 'balance',
          enabled: true,
          order: 0,
          size: 'large',
          title: 'Saldo Total',
          icon: 'fas fa-wallet',
        },
        {
          id: 'income-expense',
          enabled: true,
          order: 1,
          size: 'large',
          title: 'Receitas vs Despesas',
          icon: 'fas fa-chart-line',
        },
        {
          id: 'budget-progress',
          enabled: true,
          order: 2,
          size: 'medium',
          title: 'Progresso de Orçamentos',
          icon: 'fas fa-tasks',
        },
        {
          id: 'goals',
          enabled: true,
          order: 3,
          size: 'medium',
          title: 'Metas Financeiras',
          icon: 'fas fa-bullseye',
        },
        {
          id: 'recent-transactions',
          enabled: true,
          order: 4,
          size: 'large',
          title: 'Transações Recentes',
          icon: 'fas fa-list',
        },
        {
          id: 'spending-chart',
          enabled: true,
          order: 5,
          size: 'medium',
          title: 'Gastos por Mês',
          icon: 'fas fa-chart-bar',
        },
        {
          id: 'category-breakdown',
          enabled: true,
          order: 6,
          size: 'medium',
          title: 'Gastos por Categoria',
          icon: 'fas fa-chart-pie',
        },
        {
          id: 'ai-insights',
          enabled: true,
          order: 7,
          size: 'large',
          title: 'Insights de IA',
          icon: 'fas fa-brain',
        },
      ],
      lastUpdated: new Date(),
    };
  }

  /**
   * Obter layout atual (ou padrão se não existir)
   */
  getLayout(): WidgetLayout {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      
      if (data) {
        const layout = JSON.parse(data);
        // Converter lastUpdated de string para Date
        layout.lastUpdated = new Date(layout.lastUpdated);
        return layout;
      }

      return this.getDefaultLayout();
    } catch (error) {
      Logger.error('Erro ao carregar layout', error as Error, 'WIDGETS');
      return this.getDefaultLayout();
    }
  }

  /**
   * Salvar layout customizado
   */
  saveLayout(layout: WidgetLayout): void {
    try {
      layout.lastUpdated = new Date();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(layout));
      Logger.info('Layout salvo', { widgetCount: layout.widgets.length }, 'WIDGETS');
    } catch (error) {
      Logger.error('Erro ao salvar layout', error as Error, 'WIDGETS');
    }
  }

  /**
   * Atualizar ordem de um widget (após drag & drop)
   */
  updateWidgetOrder(widgetId: WidgetType, newOrder: number): void {
    try {
      const layout = this.getLayout();
      const widget = layout.widgets.find((w) => w.id === widgetId);

      if (!widget) {
        throw new Error(`Widget não encontrado: ${widgetId}`);
      }

      const oldOrder = widget.order;
      
      // Reordenar widgets
      layout.widgets.forEach((w) => {
        if (w.id === widgetId) {
          w.order = newOrder;
        } else if (oldOrder < newOrder && w.order > oldOrder && w.order <= newOrder) {
          w.order--;
        } else if (oldOrder > newOrder && w.order >= newOrder && w.order < oldOrder) {
          w.order++;
        }
      });

      // Ordenar array por ordem
      layout.widgets.sort((a, b) => a.order - b.order);

      this.saveLayout(layout);
      Logger.info('Widget reordenado', { widgetId, oldOrder, newOrder }, 'WIDGETS');
    } catch (error) {
      Logger.error('Erro ao reordenar widget', error as Error, 'WIDGETS');
    }
  }

  /**
   * Habilitar/desabilitar widget
   */
  toggleWidget(widgetId: WidgetType): void {
    try {
      const layout = this.getLayout();
      const widget = layout.widgets.find((w) => w.id === widgetId);

      if (!widget) {
        throw new Error(`Widget não encontrado: ${widgetId}`);
      }

      widget.enabled = !widget.enabled;
      this.saveLayout(layout);
      
      Logger.info('Widget alternado', { widgetId, enabled: widget.enabled }, 'WIDGETS');
    } catch (error) {
      Logger.error('Erro ao alternar widget', error as Error, 'WIDGETS');
    }
  }

  /**
   * Obter apenas widgets habilitados e ordenados
   */
  getEnabledWidgets(): Widget[] {
    const layout = this.getLayout();
    return layout.widgets
      .filter((w) => w.enabled)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Obter todos os widgets (para configuração)
   */
  getAllWidgets(): Widget[] {
    const layout = this.getLayout();
    return layout.widgets.sort((a, b) => a.order - b.order);
  }

  /**
   * Resetar para layout padrão
   */
  resetToDefault(): void {
    try {
      const defaultLayout = this.getDefaultLayout();
      this.saveLayout(defaultLayout);
      Logger.info('Layout resetado para padrão', undefined, 'WIDGETS');
    } catch (error) {
      Logger.error('Erro ao resetar layout', error as Error, 'WIDGETS');
    }
  }

  /**
   * Atualizar tamanho do widget
   */
  updateWidgetSize(widgetId: WidgetType, size: Widget['size']): void {
    try {
      const layout = this.getLayout();
      const widget = layout.widgets.find((w) => w.id === widgetId);

      if (!widget) {
        throw new Error(`Widget não encontrado: ${widgetId}`);
      }

      widget.size = size;
      this.saveLayout(layout);
      
      Logger.info('Tamanho do widget atualizado', { widgetId, size }, 'WIDGETS');
    } catch (error) {
      Logger.error('Erro ao atualizar tamanho', error as Error, 'WIDGETS');
    }
  }

  /**
   * Mover widget para posição específica
   */
  moveWidget(fromIndex: number, toIndex: number): void {
    try {
      const layout = this.getLayout();
      const [movedWidget] = layout.widgets.splice(fromIndex, 1);
      layout.widgets.splice(toIndex, 0, movedWidget);

      // Recalcular orders
      layout.widgets.forEach((widget, index) => {
        widget.order = index;
      });

      this.saveLayout(layout);
      Logger.info('Widget movido', { fromIndex, toIndex }, 'WIDGETS');
    } catch (error) {
      Logger.error('Erro ao mover widget', error as Error, 'WIDGETS');
    }
  }

  /**
   * Verificar se tem customizações
   */
  hasCustomLayout(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }
}

export { WidgetLayoutService };
export default WidgetLayoutService.getInstance();
