/**
 * @file sprint6.test.ts
 * @description Testes de validação para Sprint 6 services
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 * 
 * FOCO: Validar que os serviços existem e têm métodos básicos funcionando
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PDFExportService } from '../services/pdf-export.service';
import { AdvancedFilterService } from '../services/advanced-filter.service';
import { WidgetLayoutService } from '../services/widget-layout.service';

describe('Sprint 6 - Services Integration', () => {
  describe('PDFExportService', () => {
    it('should have singleton instance', () => {
      const instance1 = PDFExportService.getInstance();
      const instance2 = PDFExportService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should have static export methods', () => {
      expect(typeof PDFExportService.exportTransactionsReport).toBe('function');
      expect(typeof PDFExportService.exportBudgetAnalysis).toBe('function');
      expect(typeof PDFExportService.exportGoalsProgress).toBe('function');
      expect(typeof PDFExportService.exportCustomReport).toBe('function');
    });

    it('should have exportReport instance method', () => {
      const service = PDFExportService.getInstance();
      expect(typeof service.exportReport).toBe('function');
    });
  });

  describe('AdvancedFilterService', () => {
    let service: AdvancedFilterService;

    beforeEach(() => {
      service = AdvancedFilterService.getInstance();
      localStorage.clear();
    });

    it('should have singleton instance', () => {
      const instance1 = AdvancedFilterService.getInstance();
      const instance2 = AdvancedFilterService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should apply basic filter with AND logic', () => {
      const data = [
        { id: '1', amount: 100, type: 'income' },
        { id: '2', amount: 50, type: 'expense' },
        { id: '3', amount: 200, type: 'income' },
      ];

      const filter = {
        id: 'test-filter',
        logic: 'AND' as const,
        rules: [
          {
            id: 'rule-1',
            field: 'type' as const,
            operator: 'equals' as const,
            value: 'income',
          },
        ],
        groups: [],
      };

      const result = service.applyFilter(data, filter);
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('income');
      expect(result[1].type).toBe('income');
    });

    it('should apply filter with OR logic', () => {
      const data = [
        { id: '1', amount: 100 },
        { id: '2', amount: 50 },
        { id: '3', amount: 200 },
      ];

      const filter = {
        id: 'test-filter',
        logic: 'OR' as const,
        rules: [
          {
            id: 'rule-1',
            field: 'amount' as const,
            operator: 'equals' as const,
            value: 100,
          },
          {
            id: 'rule-2',
            field: 'amount' as const,
            operator: 'equals' as const,
            value: 200,
          },
        ],
        groups: [],
      };

      const result = service.applyFilter(data, filter);
      expect(result).toHaveLength(2);
    });

    it('should handle empty data', () => {
      const filter = {
        id: 'test',
        logic: 'AND' as const,
        rules: [],
        groups: [],
      };

      const result = service.applyFilter([], filter);
      expect(result).toEqual([]);
    });

    it('should save and retrieve filters', () => {
      const filter = {
        id: 'my-filter',
        name: 'Test Filter',
        rootGroup: {
          id: 'group-1',
          logic: 'AND' as const,
          rules: [],
          groups: [],
        },
        createdAt: new Date(),
      };

      service.saveFilter(filter);
      const saved = service.getSavedFilters();
      
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('my-filter');
      expect(saved[0].name).toBe('Test Filter');
    });

    it('should delete filters', () => {
      const filter = {
        id: 'delete-me',
        name: 'To Delete',
        rootGroup: {
          id: 'group-1',
          logic: 'AND' as const,
          rules: [],
          groups: [],
        },
        createdAt: new Date(),
      };

      service.saveFilter(filter);
      expect(service.getSavedFilters()).toHaveLength(1);

      service.deleteFilter('delete-me');
      expect(service.getSavedFilters()).toHaveLength(0);
    });

    it('should create empty filter', () => {
      const filter = service.createEmptyFilter();
      expect(filter).toHaveProperty('id');
      expect(filter).toHaveProperty('name');
      expect(filter).toHaveProperty('rootGroup');
      expect(filter.rootGroup.logic).toBe('AND');
    });

    it('should create empty rule', () => {
      const rule = service.createEmptyRule();
      expect(rule).toHaveProperty('id');
      expect(rule).toHaveProperty('field');
      expect(rule).toHaveProperty('operator');
      expect(rule).toHaveProperty('value');
    });

    it('should create empty group', () => {
      const group = service.createEmptyGroup();
      expect(group).toHaveProperty('id');
      expect(group).toHaveProperty('logic');
      expect(group).toHaveProperty('rules');
      expect(group).toHaveProperty('groups');
    });
  });

  describe('WidgetLayoutService', () => {
    let service: WidgetLayoutService;

    beforeEach(() => {
      service = WidgetLayoutService.getInstance();
      localStorage.clear();
    });

    it('should have singleton instance', () => {
      const instance1 = WidgetLayoutService.getInstance();
      const instance2 = WidgetLayoutService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should return default layout', () => {
      const layout = service.getLayout();
      expect(layout).toHaveProperty('widgets');
      expect(layout).toHaveProperty('lastUpdated');
      expect(layout.widgets).toBeInstanceOf(Array);
      expect(layout.widgets.length).toBeGreaterThan(0);
    });

    it('should have all default widgets', () => {
      const layout = service.getLayout();
      const widgetIds = layout.widgets.map((w) => w.id);

      expect(widgetIds).toContain('balance');
      expect(widgetIds).toContain('income-expense');
      expect(widgetIds).toContain('budget-progress');
      expect(widgetIds).toContain('goals');
      expect(widgetIds).toContain('recent-transactions');
      expect(widgetIds).toContain('spending-chart');
      expect(widgetIds).toContain('category-breakdown');
      expect(widgetIds).toContain('ai-insights');
    });

    it('should have widgets with required properties', () => {
      const layout = service.getLayout();
      
      layout.widgets.forEach((widget) => {
        expect(widget).toHaveProperty('id');
        expect(widget).toHaveProperty('enabled');
        expect(widget).toHaveProperty('order');
        expect(widget).toHaveProperty('size');
        expect(widget).toHaveProperty('title');
        expect(widget).toHaveProperty('icon');
      });
    });

    it('should have unique widget IDs', () => {
      const layout = service.getLayout();
      const ids = layout.widgets.map((w) => w.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have sequential order', () => {
      const layout = service.getLayout();
      const orders = layout.widgets.map((w) => w.order).sort((a, b) => a - b);
      
      for (let i = 0; i < orders.length; i++) {
        expect(orders[i]).toBe(i);
      }
    });
  });

  describe('Service Integration', () => {
    it('should have all Sprint 6 services available', () => {
      expect(PDFExportService).toBeDefined();
      expect(AdvancedFilterService).toBeDefined();
      expect(WidgetLayoutService).toBeDefined();
    });

    it('should all use singleton pattern', () => {
      const pdf1 = PDFExportService.getInstance();
      const pdf2 = PDFExportService.getInstance();
      expect(pdf1).toBe(pdf2);

      const filter1 = AdvancedFilterService.getInstance();
      const filter2 = AdvancedFilterService.getInstance();
      expect(filter1).toBe(filter2);

      const widget1 = WidgetLayoutService.getInstance();
      const widget2 = WidgetLayoutService.getInstance();
      expect(widget1).toBe(widget2);
    });
  });
});
