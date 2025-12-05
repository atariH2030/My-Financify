# 📚 API Reference - My-Financify v3.12.0

Documentação completa dos services, interfaces e APIs públicas do projeto.

---

## 📦 Services

### PDFExportService

**Path**: `src/services/pdf-export.service.ts`  
**Version**: 1.0.0  
**Dependencies**: jsPDF 2.5.2, jspdf-autotable 3.8.4

#### Descrição
Service para geração de relatórios em PDF com múltiplos templates e customização.

#### API Pública

```typescript
class PDFExportService {
  static getInstance(): PDFExportService
  
  static async exportTransactionsReport(
    config: PDFExportConfig
  ): Promise<ExportResult>
  
  static async exportBudgetAnalysis(
    config: PDFExportConfig
  ): Promise<ExportResult>
  
  static async exportGoalsProgress(
    config: PDFExportConfig
  ): Promise<ExportResult>
  
  static async exportCustomReport(
    config: PDFExportConfig
  ): Promise<ExportResult>
}
```

#### Interfaces

```typescript
interface PDFExportConfig {
  type: ReportType;
  title: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  data: any[];
  summary?: Record<string, string | number>;
  includeChart?: boolean;
  orientation?: 'portrait' | 'landscape';
  logo?: string;
}

type ReportType = 
  | 'transactions' 
  | 'budget-analysis' 
  | 'goals-progress' 
  | 'spending-by-category'
  | 'income-vs-expense'
  | 'custom';

interface ExportResult {
  success: boolean;
  filename: string;
  size?: number;
  error?: string;
}
```

#### Exemplo de Uso

```typescript
import { PDFExportService } from '@/services/pdf-export.service';

// Exportar relatório de transações
const result = await PDFExportService.exportTransactionsReport({
  type: 'transactions',
  title: 'Relatório de Transações - Janeiro 2025',
  dateRange: {
    start: new Date('2025-01-01'),
    end: new Date('2025-01-31')
  },
  data: transactions,
  summary: {
    'Total de Transações': 42,
    'Receitas': 'R$ 8.500,00',
    'Despesas': 'R$ 5.200,00',
    'Saldo': 'R$ 3.300,00'
  }
});

if (result.success) {
  console.log(`PDF gerado: ${result.filename}`);
} else {
  console.error(`Erro: ${result.error}`);
}
```

---

### WidgetLayoutService

**Path**: `src/services/widget-layout.service.ts`  
**Version**: 1.0.0

#### Descrição
Service para gerenciar layout e customização de widgets do dashboard.

#### API Pública

```typescript
class WidgetLayoutService {
  static getInstance(): WidgetLayoutService
  
  getLayout(): WidgetLayout
  saveLayout(layout: WidgetLayout): void
  getEnabledWidgets(): Widget[]
  getAllWidgets(): Widget[]
  updateWidgetOrder(widgetId: string, newOrder: number): void
  toggleWidget(widgetId: string): void
  resetToDefault(): void
}
```

#### Interfaces

```typescript
interface Widget {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  order: number;
  description?: string;
}

interface WidgetLayout {
  widgets: Widget[];
  lastUpdated: Date;
}
```

#### Widgets Disponíveis

```typescript
const DEFAULT_WIDGETS: Widget[] = [
  {
    id: 'balance',
    name: 'Saldo Total',
    icon: 'fa-wallet',
    enabled: true,
    order: 0
  },
  {
    id: 'income-expense',
    name: 'Receitas vs Despesas',
    icon: 'fa-chart-line',
    enabled: true,
    order: 1
  },
  // ... 6 widgets adicionais
];
```

#### Exemplo de Uso

```typescript
import { WidgetLayoutService } from '@/services/widget-layout.service';

const widgetService = WidgetLayoutService.getInstance();

// Obter widgets ativos
const enabledWidgets = widgetService.getEnabledWidgets();

// Reordenar widget
widgetService.updateWidgetOrder('balance', 3);

// Habilitar/desabilitar
widgetService.toggleWidget('ai-insights');

// Salvar alterações
widgetService.saveLayout({
  widgets: widgetService.getAllWidgets(),
  lastUpdated: new Date()
});
```

---

### AdvancedFilterService

**Path**: `src/services/advanced-filter.service.ts`  
**Version**: 1.0.0

#### Descrição
Service para construção e aplicação de filtros avançados com lógica complexa.

#### API Pública

```typescript
class AdvancedFilterService {
  static getInstance(): AdvancedFilterService
  
  applyFilter<T>(data: T[], filter: FilterGroup): T[]
  saveFilter(name: string, filter: FilterGroup): void
  loadFilter(name: string): FilterGroup | null
  listSavedFilters(): string[]
  deleteFilter(name: string): void
}
```

#### Interfaces

```typescript
type FilterOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'greater_than' 
  | 'less_than' 
  | 'between' 
  | 'in' 
  | 'not_in';

interface FilterRule {
  field: string;
  operator: FilterOperator;
  value: any;
}

interface FilterGroup {
  logic: 'AND' | 'OR';
  rules: FilterRule[];
  groups?: FilterGroup[];
}
```

#### Exemplo de Uso

```typescript
import { AdvancedFilterService } from '@/services/advanced-filter.service';

const filterService = AdvancedFilterService.getInstance();

// Definir filtro complexo
const filter: FilterGroup = {
  logic: 'AND',
  rules: [
    { field: 'amount', operator: 'greater_than', value: 100 },
    { field: 'category', operator: 'in', value: ['Alimentação', 'Transporte'] }
  ],
  groups: [
    {
      logic: 'OR',
      rules: [
        { field: 'date', operator: 'between', value: ['2025-01-01', '2025-03-31'] },
        { field: 'isPaid', operator: 'equals', value: false }
      ]
    }
  ]
};

// Aplicar filtro
const filteredTransactions = filterService.applyFilter(transactions, filter);

// Salvar filtro para uso futuro
filterService.saveFilter('despesas-importantes-q1', filter);

// Carregar filtro salvo
const savedFilter = filterService.loadFilter('despesas-importantes-q1');
```

---

### I18nService

**Path**: `src/services/i18n.service.ts`  
**Version**: 1.0.0

#### Descrição
Service para internacionalização e formatação de textos, moedas, datas e números.

#### API Pública

```typescript
class I18nService {
  static setLanguage(locale: SupportedLanguage): void
  static getCurrentLanguage(): SupportedLanguage
  static t(key: keyof TranslationKeys): string
  static tInterpolate(key: keyof TranslationKeys, params: Record<string, string>): string
  static formatCurrency(amount: number): string
  static formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string
  static formatNumber(num: number): string
  static detectLanguage(): SupportedLanguage
}
```

#### Interfaces

```typescript
type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES';

interface TranslationKeys {
  // Dashboard
  'dashboard.title': string;
  'dashboard.balance': string;
  'dashboard.income': string;
  'dashboard.expenses': string;
  
  // Transactions
  'transactions.title': string;
  'transactions.new': string;
  'transactions.filter': string;
  
  // ... 40+ keys
}
```

#### Exemplo de Uso

```typescript
import { I18nService } from '@/services/i18n.service';

// Definir idioma
I18nService.setLanguage('pt-BR');

// Traduzir chave
const title = I18nService.t('dashboard.title'); // "Dashboard"

// Traduzir com interpolação
const greeting = I18nService.tInterpolate('common.welcome', { name: 'Rickson' });
// "Bem-vindo, Rickson!"

// Formatações
I18nService.formatCurrency(1500.50); // "R$ 1.500,50"
I18nService.formatDate(new Date(), { dateStyle: 'full' }); // "terça-feira, 3 de dezembro de 2025"
I18nService.formatNumber(1234567.89); // "1.234.567,89"

// Detectar idioma do navegador
const userLang = I18nService.detectLanguage(); // "pt-BR"
```

---

### PushNotificationService

**Path**: `src/services/push-notification.service.ts`  
**Version**: 1.0.0

#### Descrição
Service para gerenciar notificações push do navegador usando Web Push API.

#### API Pública

```typescript
class PushNotificationService {
  static getInstance(): PushNotificationService
  
  async requestPermission(): Promise<NotificationPermission>
  async sendNotification(title: string, options?: NotificationOptions): Promise<void>
  
  // Notificações pré-configuradas
  async notifyBudgetAlert(budgetName: string, percentage: number): Promise<void>
  async notifyGoalAchieved(goalName: string, amount: number): Promise<void>
  async notifyRecurringTransactionDue(transactionName: string, dueDate: Date): Promise<void>
  async notifyInsightAvailable(insight: string): Promise<void>
  async notifySyncComplete(): Promise<void>
  
  getPermissionStatus(): NotificationPermission
  isSupported(): boolean
}
```

#### Exemplo de Uso

```typescript
import { PushNotificationService } from '@/services/push-notification.service';

const notificationService = PushNotificationService.getInstance();

// Verificar suporte
if (notificationService.isSupported()) {
  // Solicitar permissão
  const permission = await notificationService.requestPermission();
  
  if (permission === 'granted') {
    // Enviar notificação customizada
    await notificationService.sendNotification(
      'Nova Transação',
      {
        body: 'Pagamento de R$ 150,00 registrado',
        icon: '/icons/transaction.png',
        badge: '/icons/badge.png'
      }
    );
    
    // Ou usar notificações pré-configuradas
    await notificationService.notifyBudgetAlert('Alimentação', 85);
    await notificationService.notifyGoalAchieved('Viagem', 5000);
  }
}
```

---

## 🧩 Components

### InteractiveChart

**Path**: `src/components/charts/InteractiveChart.tsx`  
**Version**: 1.0.0

#### Props

```typescript
interface InteractiveChartProps {
  data: ChartDataPoint[];
  title: string;
  type?: 'bar' | 'pie' | 'line';
  onDrillDown?: (dataPoint: ChartDataPoint, level: number) => void;
}

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  icon?: string;
  children?: ChartDataPoint[];
  metadata?: Record<string, unknown>;
}
```

#### Exemplo de Uso

```tsx
import InteractiveChart from '@/components/charts/InteractiveChart';

const categoryData: ChartDataPoint[] = [
  {
    label: 'Alimentação',
    value: 1200,
    color: '#10b981',
    children: [
      { label: 'Restaurantes', value: 700 },
      { label: 'Supermercado', value: 500 }
    ]
  },
  {
    label: 'Transporte',
    value: 800,
    color: '#3b82f6'
  }
];

<InteractiveChart
  data={categoryData}
  title="Gastos por Categoria"
  type="bar"
  onDrillDown={(point, level) => {
    console.log(`Drill-down: ${point.label} (nível ${level})`);
  }}
/>
```

---

### WidgetCustomizer

**Path**: `src/components/dashboard/WidgetCustomizer.tsx`  
**Version**: 1.0.0

#### Props

```typescript
interface WidgetCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}
```

#### Exemplo de Uso

```tsx
import WidgetCustomizer from '@/components/dashboard/WidgetCustomizer';
import { useState } from 'react';

function Dashboard() {
  const [showCustomizer, setShowCustomizer] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowCustomizer(true)}>
        Personalizar Widgets
      </button>
      
      <WidgetCustomizer
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        onApply={() => {
          console.log('Widgets atualizados!');
          setShowCustomizer(false);
        }}
      />
    </>
  );
}
```

---

## 🎹 Keyboard Shortcuts

| Atalho | Ação | Componente |
|--------|------|------------|
| `Ctrl+W` | Abrir Widget Customizer | Dashboard |
| `Ctrl+A` | Abrir Analytics Dashboard | Sidebar |
| `Ctrl+K` | Abrir Command Palette | Global |
| `Escape` | Fechar modal ativo | Modais |

---

## 🎨 Design Tokens

### Cores (CSS Variables)

```css
/* Primary Colors */
--color-primary: #67E8F9;
--color-primary-dark: #22D3EE;

/* Text Colors */
--color-text: #111827;
--color-text-light: #6B7280;

/* Background */
--color-bg: #F9FAFB;
--color-bg-dark: #1F2937;

/* Status Colors */
--color-success: #10B981;
--color-error: #EF4444;
--color-warning: #F59E0B;
--color-info: #3B82F6;

/* Gradients */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-success: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
--gradient-danger: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
```

### Spacing

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
```

### Typography

```css
--font-size-xs: 0.75rem;   /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-md: 1rem;      /* 16px */
--font-size-lg: 1.125rem;  /* 18px */
--font-size-xl: 1.25rem;   /* 20px */
--font-size-2xl: 1.5rem;   /* 24px */
--font-size-3xl: 1.875rem; /* 30px */
```

---

## 📊 Performance Guidelines

### React Optimization

```typescript
// ✅ Use React.memo para componentes puros
const MyComponent = React.memo((props) => {
  return <div>{props.data}</div>;
});

// ✅ Use useMemo para cálculos pesados
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// ✅ Use useCallback para event handlers
const handleClick = useCallback(() => {
  doSomething(data);
}, [data]);

// ❌ Evite criar objetos/arrays em cada render
// ERRADO
<MyComponent config={{ theme: 'dark' }} />

// CORRETO
const config = useMemo(() => ({ theme: 'dark' }), []);
<MyComponent config={config} />
```

### Bundle Optimization

```typescript
// ✅ Use lazy loading para componentes pesados
const ReportsAdvanced = lazy(() => import('./components/reports/ReportsAdvanced'));

// ✅ Use dynamic imports para código condicional
if (needsPDF) {
  const { PDFExportService } = await import('./services/pdf-export.service');
  await PDFExportService.exportReport(config);
}
```

---

## 🧪 Testing Examples

### Unit Test (Service)

```typescript
import { describe, it, expect } from 'vitest';
import { AdvancedFilterService } from '@/services/advanced-filter.service';

describe('AdvancedFilterService', () => {
  it('should filter data with equals operator', () => {
    const service = AdvancedFilterService.getInstance();
    const data = [
      { id: 1, name: 'Item 1', price: 100 },
      { id: 2, name: 'Item 2', price: 200 }
    ];
    
    const filter = {
      logic: 'AND' as const,
      rules: [{ field: 'price', operator: 'equals' as const, value: 100 }]
    };
    
    const result = service.applyFilter(data, filter);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });
});
```

### Integration Test (Component)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InteractiveChart from '@/components/charts/InteractiveChart';

describe('InteractiveChart', () => {
  it('should render chart with data', () => {
    const data = [
      { label: 'Jan', value: 100 },
      { label: 'Feb', value: 200 }
    ];
    
    render(<InteractiveChart data={data} title="Test Chart" />);
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
    expect(screen.getByText('Jan')).toBeInTheDocument();
  });
  
  it('should trigger drill-down on click', () => {
    const onDrillDown = vi.fn();
    const data = [
      { 
        label: 'Category',
        value: 100,
        children: [{ label: 'Subcategory', value: 50 }]
      }
    ];
    
    render(
      <InteractiveChart 
        data={data} 
        title="Test" 
        onDrillDown={onDrillDown}
      />
    );
    
    fireEvent.click(screen.getByText('Category'));
    expect(onDrillDown).toHaveBeenCalledWith(data[0], 1);
  });
});
```

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)

### Guias Internos
- [Sprint 6 Complete](./docs/sprints/SPRINT_6_COMPLETE.md)
- [Accessibility Report](./docs/reports/ACCESSIBILITY_REPORT.md)
- [Professional Audit](./docs/reports/PROFESSIONAL_AUDIT_REPORT.md)

---

**Versão**: v3.12.0  
**Última Atualização**: 3 de dezembro de 2025  
**Autor**: DEV (Rickson - TQM)
