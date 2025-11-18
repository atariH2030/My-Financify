/**
 * Financial Types - Definições de tipos para sistema financeiro
 * 
 * DECISÃO: Tipos centralizados e bem definidos
 * BENEFÍCIO: Type safety + IntelliSense + documentação automática
 * 
 * @version 3.0.0 - Reestruturação com Sessões e Subcategorias
 */

// ===== CONFIGURAÇÃO DE CATEGORIAS =====

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  section: string; // Sessão à qual pertence
  subcategories?: string[]; // Subcategorias disponíveis
}

export interface SectionConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  categories: CategoryConfig[];
}

// ===== CORE TYPES =====

export type TransactionType = 'income' | 'expense';
export type ExpenseType = 'fixed' | 'variable'; // Fixo ou Variável
export type RecurrenceFrequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer' | 'pix' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  
  // Hierarquia: Sessão → Categoria → Subcategoria
  section: string;        // Ex: "Despesas da Casa"
  category: string;       // Ex: "Moradia"
  subcategory?: string;   // Ex: "Aluguel"
  
  // Tipo de despesa (apenas para expenses)
  expenseType?: ExpenseType; // 'fixed' | 'variable'
  
  date: Date;
  tags?: string[];
  
  // Recorrência
  recurring?: {
    enabled: boolean;
    frequency: RecurrenceFrequency;
    endDate?: Date;
    nextDate?: Date;
  };
  
  // Metadados
  metadata?: {
    location?: string;
    method?: PaymentMethod;
    notes?: string;
    attachment?: string; // URL do comprovante
  };
  
  // Auditoria
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthlyGoal: number;
  currentMonth: number;
  goalProgress: number; // Percentage
  categoriesBreakdown?: CategoryBreakdown[];
  monthlyTrend?: MonthlyTrendData[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactions: number;
  trend: 'up' | 'down' | 'stable';
}

export interface MonthlyTrendData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

// ===== CHART TYPES =====

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      display: boolean;
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip: {
      enabled: boolean;
      mode: 'index' | 'point' | 'nearest';
    };
  };
  scales: {
    x: ScaleConfig;
    y: ScaleConfig;
  };
}

export interface ScaleConfig {
  display: boolean;
  grid?: {
    display: boolean;
    color?: string;
  };
  ticks?: {
    callback?: (value: any) => string;
    color?: string;
    font?: {
      size: number;
    };
  };
}

// ===== DATE & FILTERING =====

export interface DateRange {
  start: Date;
  end: Date;
}

export interface FilterOptions {
  dateRange: DateRange;
  categories: string[];
  types: ('income' | 'expense')[];
  amountRange: {
    min: number;
    max: number;
  };
  tags: string[];
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: keyof Transaction;
  sortOrder: 'asc' | 'desc';
}

// ===== QUICK ACTIONS =====

export interface QuickTransactionData {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date?: Date; // Default to today
}

export interface CategoryTemplate {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string;
  color: string;
  isDefault: boolean;
}

// ===== GOALS & BUDGETS =====

export type GoalType = 'savings' | 'investment' | 'emergency' | 'wishlist' | 'debt-payment';

export interface FinancialGoal {
  id: string;
  title: string;
  description?: string;
  type: GoalType; // savings, investment, emergency, wishlist, debt-payment
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  section?: string; // Sessão relacionada
  category?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  icon?: string;
  color?: string;
  
  // Para lista de desejos
  isWishlist?: boolean;
  imageUrl?: string; // Imagem do desejo
  link?: string; // Link do produto/serviço
  
  // Auditoria
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface Budget {
  id: string;
  category: string;
  description?: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  limitAmount: number;
  currentSpent: number;
  alertThreshold: number; // Percentage (ex: 80 = alerta aos 80%)
  status: 'active' | 'paused' | 'completed';
  startDate: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== API RESPONSES =====

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface TransactionListResponse {
  transactions: Transaction[];
  summary: FinancialSummary;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== VALIDATION TYPES =====

export interface ValidationRule {
  field: string;
  rules: ('required' | 'positive' | 'maxLength' | 'minLength')[];
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
}

// ===== EXPORT TYPES =====

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  dateRange: DateRange;
  includeCategories: string[];
  includeFields: (keyof Transaction)[];
  groupBy?: 'category' | 'month' | 'type';
}

export interface ImportOptions {
  format: 'csv' | 'xlsx';
  mappings: {
    [key: string]: keyof Transaction;
  };
  skipFirstRow: boolean;
  dateFormat: string;
}

// ===== UTILITY TYPES =====

export type TransactionType = Transaction['type'];
export type CategoryType = CategoryTemplate['type'];
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type CurrencyCode = 'BRL' | 'USD' | 'EUR';

// ===== STATE MANAGEMENT =====

export interface AppState {
  user: {
    id: string;
    name: string;
    email: string;
    preferences: UserPreferences;
  };
  financial: {
    transactions: Transaction[];
    summary: FinancialSummary;
    goals: FinancialGoal[];
    budgets: Budget[];
  };
  ui: {
    currentPage: string;
    theme: ThemeMode;
    sidebar: {
      isOpen: boolean;
      activeItem: string;
    };
    dashboard: {
      selectedPeriod: DateRange;
      chartType: ChartType;
    };
    isLoading: boolean;
    errors: string[];
  };
}

export interface UserPreferences {
  currency: CurrencyCode;
  dateFormat: string;
  theme: ThemeMode;
  defaultTransactionType: TransactionType;
  autoSave: boolean;
  notifications: {
    budgetAlerts: boolean;
    goalReminders: boolean;
    weeklyReports: boolean;
  };
}

// ===== ACTION TYPES =====

export interface ActionPayload<T = any> {
  type: string;
  payload: T;
}

export interface AsyncAction<T = any> {
  pending: boolean;
  fulfilled: boolean;
  rejected: boolean;
  error?: string;
  data?: T;
}

// ===== COMPONENT PROPS =====

export interface ComponentProps {
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  'data-testid'?: string;
}

export interface DashboardProps extends ComponentProps {
  dateRange?: DateRange;
  autoRefresh?: boolean;
  chartType?: ChartType;
}

export interface TransactionListProps extends ComponentProps {
  transactions: Transaction[];
  filters?: FilterOptions;
  pagination?: PaginationOptions;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

// ===== ERROR TYPES =====

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  action?: string;
}

export interface ValidationError extends AppError {
  field: string;
  value: any;
  rule: string;
}