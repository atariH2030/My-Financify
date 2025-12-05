/**
 * @file advanced-filter.service.ts
 * @description Sistema de filtros avançados - Sprint 6.3
 * @version 3.13.0
 * @author DEV - Rickson (TQM)
 */

import Logger from './logger.service';

export type FilterOperator = 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
export type FilterField = 'amount' | 'date' | 'category' | 'description' | 'type' | 'account';
export type FilterLogic = 'AND' | 'OR';

export interface FilterRule {
  id: string;
  field: FilterField;
  operator: FilterOperator;
  value: unknown;
  value2?: unknown; // Para 'between'
}

export interface FilterGroup {
  id: string;
  logic: FilterLogic;
  rules: FilterRule[];
  groups?: FilterGroup[];
}

export interface AdvancedFilter {
  id: string;
  name: string;
  rootGroup: FilterGroup;
  createdAt: Date;
  lastUsed?: Date;
}

class AdvancedFilterService {
  private static instance: AdvancedFilterService;
  private readonly STORAGE_KEY = 'advanced_filters';

  private constructor() {
    Logger.info('AdvancedFilterService inicializado', undefined, 'FILTERS');
  }

  static getInstance(): AdvancedFilterService {
    if (!AdvancedFilterService.instance) {
      AdvancedFilterService.instance = new AdvancedFilterService();
    }
    return AdvancedFilterService.instance;
  }

  /**
   * Aplicar filtro a um conjunto de dados
   */
  applyFilter<T>(data: T[], filter: FilterGroup): T[] {
    try {
      return data.filter((item) => this.evaluateGroup(item, filter));
    } catch (error) {
      Logger.error('Erro ao aplicar filtro', error as Error, 'FILTERS');
      return data;
    }
  }

  /**
   * Avaliar grupo de filtros recursivamente
   */
  private evaluateGroup<T>(item: T, group: FilterGroup): boolean {
    const ruleResults = group.rules.map((rule) => this.evaluateRule(item, rule));
    const groupResults = (group.groups || []).map((subGroup) =>
      this.evaluateGroup(item, subGroup)
    );

    const allResults = [...ruleResults, ...groupResults];

    if (group.logic === 'AND') {
      return allResults.every((result) => result);
    } else {
      return allResults.some((result) => result);
    }
  }

  /**
   * Avaliar regra individual
   */
  private evaluateRule<T>(item: T, rule: FilterRule): boolean {
    const itemValue = (item as Record<string, unknown>)[rule.field];

    switch (rule.operator) {
      case 'equals':
        return itemValue === rule.value;
      case 'not_equals':
        return itemValue !== rule.value;
      case 'contains':
        return String(itemValue).toLowerCase().includes(String(rule.value).toLowerCase());
      case 'greater_than':
        return Number(itemValue) > Number(rule.value);
      case 'less_than':
        return Number(itemValue) < Number(rule.value);
      case 'between':
        return (
          Number(itemValue) >= Number(rule.value) &&
          Number(itemValue) <= Number(rule.value2)
        );
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(itemValue);
      case 'not_in':
        return Array.isArray(rule.value) && !rule.value.includes(itemValue);
      default:
        return true;
    }
  }

  /**
   * Salvar filtro personalizado
   */
  saveFilter(filter: AdvancedFilter): void {
    try {
      const filters = this.getSavedFilters();
      const existingIndex = filters.findIndex((f) => f.id === filter.id);

      if (existingIndex >= 0) {
        filters[existingIndex] = filter;
      } else {
        filters.push(filter);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filters));
      Logger.info('Filtro salvo', { filterId: filter.id }, 'FILTERS');
    } catch (error) {
      Logger.error('Erro ao salvar filtro', error as Error, 'FILTERS');
    }
  }

  /**
   * Obter filtros salvos
   */
  getSavedFilters(): AdvancedFilter[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      Logger.error('Erro ao carregar filtros', error as Error, 'FILTERS');
      return [];
    }
  }

  /**
   * Deletar filtro
   */
  deleteFilter(filterId: string): void {
    try {
      const filters = this.getSavedFilters().filter((f) => f.id !== filterId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filters));
      Logger.info('Filtro deletado', { filterId }, 'FILTERS');
    } catch (error) {
      Logger.error('Erro ao deletar filtro', error as Error, 'FILTERS');
    }
  }

  /**
   * Criar filtro vazio
   */
  createEmptyFilter(): AdvancedFilter {
    return {
      id: `filter-${Date.now()}`,
      name: 'Novo Filtro',
      rootGroup: {
        id: `group-${Date.now()}`,
        logic: 'AND',
        rules: [],
        groups: [],
      },
      createdAt: new Date(),
    };
  }

  /**
   * Criar regra vazia
   */
  createEmptyRule(): FilterRule {
    return {
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      field: 'amount',
      operator: 'equals',
      value: '',
    };
  }

  /**
   * Criar grupo vazio
   */
  createEmptyGroup(): FilterGroup {
    return {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      logic: 'AND',
      rules: [],
      groups: [],
    };
  }
}

export { AdvancedFilterService };
export default AdvancedFilterService.getInstance();
