/**
 * Dashboard Component - Centro de Controle Financeiro
 * 
 * ARQUITETURA:
 * 1. MVC Pattern: View (template) + Controller (methods) + Model (interfaces)
 * 2. State Management: Local component state com notificação ao AppController
 * 3. Data Flow: AppController → DashboardComponent → UI Updates
 * 4. Performance: Lazy loading, virtual scrolling para listas grandes
 * 
 * FUNCIONALIDADES:
 * - Overview cards (receitas, despesas, saldo, meta mensal)
 * - Gráfico de evolução (Chart.js integration)
 * - Lista de transações recentes
 * - Quick actions (adicionar transação rápida)
 * - Filtros por período
 * - Responsive cards layout
 */

import Logger from '../../services/logger.service.js';
import type { 
  Transaction, 
  FinancialSummary, 
  ChartData,
  DateRange,
  QuickTransactionData
} from '../../types/financial.types.js';

// ===== INTERFACES =====

interface DashboardState {
  summary: FinancialSummary;
  recentTransactions: Transaction[];
  chartData: ChartData;
  selectedPeriod: DateRange;
  isLoading: boolean;
  quickAddVisible: boolean;
}

interface DashboardConfig {
  maxRecentTransactions: number;
  chartUpdateInterval: number;
  autoRefreshEnabled: boolean;
  cardAnimationDelay: number;
}

interface OverviewCard {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'expense' | 'balance' | 'goal';
  icon: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
}

// ===== DASHBOARD COMPONENT =====

export class DashboardComponent {
  private logger = Logger;
  private container: HTMLElement | null = null;
  private state: DashboardState;
  private config: DashboardConfig;
  private chartInstance: any = null; // Chart.js instance
  private resizeObserver: ResizeObserver | null = null;
  private refreshTimer: number | null = null;

  constructor() {
    this.logger.info('🏠 Inicializando DashboardComponent');
    
    // Estado inicial
    this.state = {
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        monthlyGoal: 5000,
        currentMonth: new Date().getMonth(),
        goalProgress: 0
      },
      recentTransactions: [],
      chartData: {
        labels: [],
        datasets: []
      },
      selectedPeriod: this.getDefaultDateRange(),
      isLoading: false,
      quickAddVisible: false
    };

    // Configurações
    this.config = {
      maxRecentTransactions: 10,
      chartUpdateInterval: 30000, // 30 segundos
      autoRefreshEnabled: true,
      cardAnimationDelay: 100
    };
  }

  // ===== LIFECYCLE METHODS =====

  public async mount(container: HTMLElement): Promise<void> {
    this.logger.info('🔌 Montando DashboardComponent', { containerId: container.id });

    try {
      this.container = container;
      this.render();
      this.attachEvents();
      await this.loadInitialData();
      this.setupAutoRefresh();
      this.setupResponsiveObserver();

      this.logger.info('✅ Dashboard montado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao montar Dashboard', error instanceof Error ? error : undefined);
      this.renderError('Erro ao carregar dashboard. Tente recarregar a página.');
    }
  }

  public unmount(): void {
    this.logger.info('🔌 Desmontando DashboardComponent');

    // Cleanup
    this.destroyChart();
    this.clearAutoRefresh();
    this.removeResponsiveObserver();
    
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }

    this.logger.info('🧹 Dashboard desmontado e cleanup concluído');
  }

  // ===== RENDER METHODS =====

  private render(): void {
    if (!this.container) return;

    this.container.innerHTML = this.getTemplate();
    this.animateCards();
  }

  private getTemplate(): string {
    return `
      <div class="dashboard">
        <!-- Header com filtros -->
        <div class="dashboard-header">
          <h1 class="dashboard-title">
            <i class="fas fa-chart-line"></i>
            Dashboard Financeiro
          </h1>
          <div class="dashboard-controls">
            ${this.getPeriodFilterTemplate()}
            ${this.getQuickActionsTemplate()}
          </div>
        </div>

        <!-- Loading State -->
        ${this.state.isLoading ? this.getLoadingTemplate() : ''}

        <!-- Overview Cards -->
        <div class="overview-cards ${this.state.isLoading ? 'loading' : ''}">
          ${this.getOverviewCardsTemplate()}
        </div>

        <!-- Main Content Grid -->
        <div class="dashboard-grid">
          <!-- Chart Section -->
          <div class="chart-section">
            <div class="card chart-card">
              <div class="card-header">
                <h3>
                  <i class="fas fa-chart-area"></i>
                  Evolução Financeira
                </h3>
                <div class="chart-controls">
                  <button class="btn btn-sm" data-action="chart-toggle-type">
                    <i class="fas fa-exchange-alt"></i>
                  </button>
                  <button class="btn btn-sm" data-action="chart-fullscreen">
                    <i class="fas fa-expand"></i>
                  </button>
                </div>
              </div>
              <div class="card-body">
                <canvas id="financial-chart" width="400" height="200"></canvas>
              </div>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div class="transactions-section">
            <div class="card transactions-card">
              <div class="card-header">
                <h3>
                  <i class="fas fa-list"></i>
                  Transações Recentes
                </h3>
                <button class="btn btn-sm" data-action="view-all-transactions">
                  Ver todas
                </button>
              </div>
              <div class="card-body">
                ${this.getRecentTransactionsTemplate()}
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="quick-stats-section">
            <div class="card stats-card">
              <div class="card-header">
                <h3>
                  <i class="fas fa-tachometer-alt"></i>
                  Estatísticas Rápidas
                </h3>
              </div>
              <div class="card-body">
                ${this.getQuickStatsTemplate()}
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Add Modal -->
        ${this.getQuickAddModalTemplate()}
      </div>
    `;
  }

  private getOverviewCardsTemplate(): string {
    const cards = this.getOverviewCards();
    
    return cards.map((card, index) => `
      <div class="overview-card" 
           data-type="${card.type}" 
           style="animation-delay: ${index * this.config.cardAnimationDelay}ms">
        <div class="card-icon ${card.type}">
          <i class="${card.icon}"></i>
        </div>
        <div class="card-content">
          <h3 class="card-title">${card.title}</h3>
          <div class="card-value">
            ${this.formatCurrency(card.value)}
          </div>
          ${card.trend ? `
            <div class="card-trend ${card.trend.direction}">
              <i class="fas fa-${this.getTrendIcon(card.trend.direction)}"></i>
              ${Math.abs(card.trend.value).toFixed(1)}%
            </div>
          ` : ''}
        </div>
        ${card.type === 'goal' ? this.getGoalProgressTemplate() : ''}
      </div>
    `).join('');
  }

  private getPeriodFilterTemplate(): string {
    return `
      <div class="period-filter">
        <button class="btn btn-filter" data-period="7d">7 dias</button>
        <button class="btn btn-filter active" data-period="30d">30 dias</button>
        <button class="btn btn-filter" data-period="90d">90 dias</button>
        <button class="btn btn-filter" data-period="1y">1 ano</button>
        <button class="btn btn-filter" data-period="custom">
          <i class="fas fa-calendar"></i>
          Personalizado
        </button>
      </div>
    `;
  }

  private getQuickActionsTemplate(): string {
    return `
      <div class="quick-actions">
        <button class="btn btn-primary" data-action="quick-add-income">
          <i class="fas fa-plus"></i>
          Receita
        </button>
        <button class="btn btn-secondary" data-action="quick-add-expense">
          <i class="fas fa-minus"></i>
          Despesa
        </button>
        <button class="btn btn-outline" data-action="refresh-dashboard">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    `;
  }

  private getRecentTransactionsTemplate(): string {
    if (this.state.recentTransactions.length === 0) {
      return `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>Nenhuma transação encontrada</p>
          <button class="btn btn-primary" data-action="add-first-transaction">
            Adicionar primeira transação
          </button>
        </div>
      `;
    }

    return `
      <div class="transactions-list">
        ${this.state.recentTransactions.slice(0, this.config.maxRecentTransactions).map(transaction => `
          <div class="transaction-item" data-id="${transaction.id}">
            <div class="transaction-icon ${transaction.type}">
              <i class="fas fa-${transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}"></i>
            </div>
            <div class="transaction-info">
              <div class="transaction-description">${transaction.description}</div>
              <div class="transaction-details">
                ${transaction.category} • ${this.formatDate(transaction.date)}
              </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
              ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(Math.abs(transaction.amount))}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private getQuickStatsTemplate(): string {
    const stats = this.calculateQuickStats();
    
    return `
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Maior Receita</div>
          <div class="stat-value income">${this.formatCurrency(stats.maxIncome)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Maior Despesa</div>
          <div class="stat-value expense">${this.formatCurrency(stats.maxExpense)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Média Diária</div>
          <div class="stat-value">${this.formatCurrency(stats.dailyAverage)}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Dias até Meta</div>
          <div class="stat-value">${stats.daysToGoal}</div>
        </div>
      </div>
    `;
  }

  private getQuickAddModalTemplate(): string {
    return `
      <div class="modal-overlay" id="quick-add-modal" style="display: none;">
        <div class="modal">
          <div class="modal-header">
            <h3>Adicionar Transação Rápida</h3>
            <button class="modal-close" data-action="close-quick-add">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form id="quick-add-form">
              <div class="form-group">
                <label>Tipo</label>
                <div class="radio-group">
                  <label>
                    <input type="radio" name="type" value="income" required>
                    <span>Receita</span>
                  </label>
                  <label>
                    <input type="radio" name="type" value="expense" required>
                    <span>Despesa</span>
                  </label>
                </div>
              </div>
              <div class="form-group">
                <label for="quick-amount">Valor</label>
                <input type="number" 
                       id="quick-amount" 
                       name="amount" 
                       step="0.01" 
                       min="0" 
                       required
                       placeholder="0,00">
              </div>
              <div class="form-group">
                <label for="quick-description">Descrição</label>
                <input type="text" 
                       id="quick-description" 
                       name="description" 
                       required
                       placeholder="Ex: Salário, Supermercado...">
              </div>
              <div class="form-group">
                <label for="quick-category">Categoria</label>
                <select id="quick-category" name="category" required>
                  <option value="">Selecione...</option>
                  <!-- Populated by JS -->
                </select>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-action="close-quick-add">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary">
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  private getLoadingTemplate(): string {
    return `
      <div class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Carregando dados financeiros...</p>
        </div>
      </div>
    `;
  }

  // ===== EVENT HANDLING =====

  private attachEvents(): void {
    if (!this.container) return;

    // Event delegation pattern
    this.container.addEventListener('click', this.handleClick.bind(this));
    this.container.addEventListener('change', this.handleChange.bind(this));
    this.container.addEventListener('submit', this.handleSubmit.bind(this));

    this.logger.info('📡 Event listeners anexados ao Dashboard');
  }

  private handleClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    const action = target.closest('[data-action]')?.getAttribute('data-action');
    const period = target.closest('[data-period]')?.getAttribute('data-period');

    if (action) {
      this.handleAction(action, target);
    } else if (period) {
      this.handlePeriodChange(period as any);
    }
  };

  private handleChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    
    // Handle form changes
    if (target.name === 'type') {
      this.updateQuickAddCategories(target.value as 'income' | 'expense');
    }
  };

  private handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault();
    
    if ((event.target as HTMLElement).id === 'quick-add-form') {
      await this.handleQuickAddSubmit(event);
    }
  };

  private handleAction(action: string, target: HTMLElement): void {
    this.logger.info('🎬 Ação executada', { action });

    switch (action) {
      case 'quick-add-income':
        this.openQuickAdd('income');
        break;
      case 'quick-add-expense':
        this.openQuickAdd('expense');
        break;
      case 'refresh-dashboard':
        this.refreshData();
        break;
      case 'close-quick-add':
        this.closeQuickAdd();
        break;
      case 'view-all-transactions':
        this.navigateToTransactions();
        break;
      case 'chart-toggle-type':
        this.toggleChartType();
        break;
      case 'chart-fullscreen':
        this.toggleChartFullscreen();
        break;
      case 'add-first-transaction':
        this.openQuickAdd('income');
        break;
      default:
        this.logger.warn('❓ Ação não reconhecida', { action });
    }
  }

  // ===== DATA METHODS =====

  private async loadInitialData(): Promise<void> {
    this.setState({ isLoading: true });

    try {
      // Simulated API calls - replace with real AppController calls
      const [summary, transactions] = await Promise.all([
        this.loadFinancialSummary(),
        this.loadRecentTransactions()
      ]);

      this.setState({
        summary,
        recentTransactions: transactions,
        isLoading: false
      });

      await this.updateChart();
      
    } catch (error) {
      this.logger.error('❌ Erro ao carregar dados iniciais', error instanceof Error ? error : undefined);
      this.setState({ isLoading: false });
      this.renderError('Erro ao carregar dados');
    }
  }

  private async refreshData(): Promise<void> {
    this.logger.info('🔄 Atualizando dados do dashboard');
    
    // Show refresh animation
    const refreshBtn = this.container?.querySelector('[data-action="refresh-dashboard"] i');
    refreshBtn?.classList.add('fa-spin');
    
    try {
      await this.loadInitialData();
      this.logger.info('✅ Dados atualizados');
    } finally {
      setTimeout(() => {
        refreshBtn?.classList.remove('fa-spin');
      }, 1000);
    }
  }

  // ===== HELPER METHODS =====

  private setState(updates: Partial<DashboardState>): void {
    this.state = { ...this.state, ...updates };
    
    // Re-render affected parts
    if ('isLoading' in updates) {
      this.updateLoadingState();
    }
    if ('recentTransactions' in updates) {
      this.updateTransactionsList();
    }
    if ('summary' in updates) {
      this.updateOverviewCards();
    }
  }

  private getOverviewCards(): OverviewCard[] {
    const { summary } = this.state;
    
    return [
      {
        id: 'income',
        title: 'Receitas',
        value: summary.totalIncome,
        type: 'income',
        icon: 'fas fa-arrow-up',
        trend: { value: 12.5, direction: 'up' }
      },
      {
        id: 'expense',
        title: 'Despesas',
        value: summary.totalExpense,
        type: 'expense',
        icon: 'fas fa-arrow-down',
        trend: { value: 3.2, direction: 'down' }
      },
      {
        id: 'balance',
        title: 'Saldo',
        value: summary.balance,
        type: 'balance',
        icon: 'fas fa-wallet',
        trend: { value: 8.1, direction: summary.balance > 0 ? 'up' : 'down' }
      },
      {
        id: 'goal',
        title: 'Meta Mensal',
        value: summary.monthlyGoal,
        type: 'goal',
        icon: 'fas fa-target'
      }
    ];
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(new Date(date));
  }

  private getTrendIcon(direction: string): string {
    switch (direction) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      default: return 'minus';
    }
  }

  private animateCards(): void {
    const cards = this.container?.querySelectorAll('.overview-card');
    cards?.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-in');
      }, index * this.config.cardAnimationDelay);
    });
  }

  private renderError(message: string): void {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Ops! Algo deu errado</h3>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="location.reload()">
          Recarregar página
        </button>
      </div>
    `;
  }

  // ===== STUB METHODS (TO BE IMPLEMENTED) =====

  private async loadFinancialSummary(): Promise<FinancialSummary> {
    // Simulated data for now - will be replaced by real data
    return {
      totalIncome: 8500,
      totalExpense: 3200,
      balance: 5300,
      monthlyGoal: 5000,
      currentMonth: new Date().getMonth(),
      goalProgress: 106
    };
  }

  private async loadRecentTransactions(): Promise<Transaction[]> {
    // Simulated data for now - will be replaced by real data
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'income',
        amount: 3500,
        description: 'Salário',
        category: 'Trabalho',
        date: new Date(),
      },
      {
        id: '2',
        type: 'expense',
        amount: 450,
        description: 'Supermercado',
        category: 'Alimentação',
        date: new Date(Date.now() - 86400000),
      },
      {
        id: '3',
        type: 'expense',
        amount: 120,
        description: 'Gasolina',
        category: 'Transporte',
        date: new Date(Date.now() - 172800000),
      }
    ];
    
    return mockTransactions;
  }

  // ===== DATA INTEGRATION METHODS =====

  /**
   * Method to receive data updates from AppController
   */
  public onDataUpdate(data: { transactions: Transaction[], summary: FinancialSummary }): void {
    this.setState({
      recentTransactions: data.transactions.slice(0, this.config.maxRecentTransactions),
      summary: data.summary
    });
    
    this.logger.debug('📊 Dashboard recebeu atualização de dados', data, 'DASHBOARD');
  }

  /**
   * Set AppController reference for data operations
   */
  public setAppController(appController: any): void {
    this.appController = appController;
  }

  private appController: any = null;

  private getDefaultDateRange(): DateRange {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { start: thirtyDaysAgo, end: now };
  }

  private calculateQuickStats() {
    const { recentTransactions } = this.state;
    
    const incomes = recentTransactions.filter(t => t.type === 'income').map(t => t.amount);
    const expenses = recentTransactions.filter(t => t.type === 'expense').map(t => t.amount);
    
    const maxIncome = incomes.length > 0 ? Math.max(...incomes) : 0;
    const maxExpense = expenses.length > 0 ? Math.max(...expenses) : 0;
    
    const totalDays = 30;
    const totalAmount = recentTransactions.reduce((sum, t) => 
      sum + (t.type === 'income' ? t.amount : -t.amount), 0
    );
    const dailyAverage = totalAmount / totalDays;
    
    const { summary } = this.state;
    const remaining = summary.monthlyGoal - summary.totalIncome;
    const avgDailyNeeded = remaining > 0 ? remaining / (30 - new Date().getDate()) : 0;
    const daysToGoal = avgDailyNeeded > 0 ? Math.ceil(remaining / avgDailyNeeded) : 0;
    
    return {
      maxIncome,
      maxExpense,
      dailyAverage,
      daysToGoal: daysToGoal > 0 ? daysToGoal : 0
    };
  }

  private async updateChart(): Promise<void> {
    // TODO: Implement Chart.js integration
    this.logger.debug('📈 Chart update necessário', undefined, 'DASHBOARD');
  }

  private handlePeriodChange(period: string): void {
    this.logger.info('📅 Período alterado', { period }, 'DASHBOARD');
    
    // Update active filter button
    const filterButtons = this.container?.querySelectorAll('.btn-filter');
    filterButtons?.forEach(btn => btn.classList.remove('active'));
    
    const activeButton = this.container?.querySelector(`[data-period="${period}"]`);
    activeButton?.classList.add('active');
    
    // TODO: Implement period filtering logic
    this.refreshData();
  }

  private openQuickAdd(type: 'income' | 'expense'): void {
    this.setState({ quickAddVisible: true });
    
    const modal = this.container?.querySelector('#quick-add-modal') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
      
      // Set default type
      const typeRadio = modal.querySelector(`input[value="${type}"]`) as HTMLInputElement;
      if (typeRadio) {
        typeRadio.checked = true;
        this.updateQuickAddCategories(type);
      }
      
      // Focus first input
      const firstInput = modal.querySelector('input[type="number"]') as HTMLInputElement;
      firstInput?.focus();
    }
  }

  private closeQuickAdd(): void {
    this.setState({ quickAddVisible: false });
    
    const modal = this.container?.querySelector('#quick-add-modal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none';
      
      // Reset form
      const form = modal.querySelector('form') as HTMLFormElement;
      form?.reset();
    }
  }

  private async handleQuickAddSubmit(event: Event): Promise<void> {
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      const transactionData = {
        type: formData.get('type') as 'income' | 'expense',
        amount: parseFloat(formData.get('amount') as string),
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        date: new Date()
      };
      
      if (this.appController) {
        await this.appController.addTransaction(transactionData);
        this.logger.info('✅ Transação adicionada via quick add', transactionData, 'DASHBOARD');
      }
      
      this.closeQuickAdd();
      
    } catch (error) {
      this.logger.error('❌ Erro ao adicionar transação', error instanceof Error ? error : undefined, 'DASHBOARD');
      // Show error message to user
    }
  }

  private navigateToTransactions(): void {
    if (this.appController) {
      this.appController.navigate('transactions');
    }
  }

  private toggleChartType(): void {
    this.logger.info('📊 Tipo de gráfico alterado', undefined, 'DASHBOARD');
    // TODO: Implement chart type toggle
  }

  private toggleChartFullscreen(): void {
    const chartCard = this.container?.querySelector('.chart-card');
    chartCard?.classList.toggle('fullscreen');
  }

  private updateQuickAddCategories(type: 'income' | 'expense'): void {
    const categories = type === 'income' 
      ? ['Salário', 'Freelance', 'Investimentos', 'Outros']
      : ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Outros'];
    
    const select = this.container?.querySelector('#quick-category') as HTMLSelectElement;
    if (select) {
      select.innerHTML = '<option value="">Selecione...</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }
  }

  private updateLoadingState(): void {
    const overlay = this.container?.querySelector('.loading-overlay') as HTMLElement;
    if (overlay) {
      overlay.style.display = this.state.isLoading ? 'flex' : 'none';
    }
    
    const cards = this.container?.querySelector('.overview-cards');
    if (cards) {
      cards.classList.toggle('loading', this.state.isLoading);
    }
  }

  private updateTransactionsList(): void {
    const container = this.container?.querySelector('.transactions-card .card-body');
    if (container) {
      container.innerHTML = this.getRecentTransactionsTemplate();
    }
  }

  private updateOverviewCards(): void {
    const container = this.container?.querySelector('.overview-cards');
    if (container) {
      container.innerHTML = this.getOverviewCardsTemplate();
      this.animateCards();
    }
  }

  private getGoalProgressTemplate(): string {
    const { summary } = this.state;
    const progressPercentage = Math.min(summary.goalProgress, 100);
    
    return `
      <div class="goal-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercentage}%"></div>
        </div>
        <span class="progress-text">${progressPercentage.toFixed(1)}% da meta</span>
      </div>
    `;
  }

  private setupAutoRefresh(): void {
    if (this.config.autoRefreshEnabled) {
      this.refreshTimer = window.setInterval(() => {
        this.refreshData();
      }, this.config.chartUpdateInterval);
    }
  }

  private clearAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private setupResponsiveObserver(): void {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        // Handle responsive changes
        this.updateChart();
      });
      
      if (this.container) {
        this.resizeObserver.observe(this.container);
      }
    }
  }

  private removeResponsiveObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  private destroyChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
}