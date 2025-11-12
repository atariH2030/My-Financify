/**
 * App Controller - Controlador principal da aplicação
 * Responsável por orquestrar componentes e gerenciar estado global
 */

import Logger from './services/logger.service.js';
import Storage from './services/storage.service.js';
import { SidebarComponent } from './components/sidebar/sidebar.component.js';
import { DashboardComponent } from './components/dashboard/dashboard.component.js';
import type { 
  Transaction, 
  FinancialSummary,
  AppState as FinancialAppState 
} from './types/financial.types.js';

export interface AppState {
  currentRoute: string;
  user: {
    name: string;
    email: string;
  };
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  // Dados financeiros
  transactions: Transaction[];
  summary: FinancialSummary;
  isLoading: boolean;
}

export class AppController {
  private state: AppState;
  private components: Map<string, any> = new Map();

  constructor() {
    this.state = {
      currentRoute: 'dashboard',
      user: {
        name: 'Usuário',
        email: 'usuario@email.com'
      },
      theme: 'light',
      sidebarOpen: false,
      // Dados financeiros iniciais
      transactions: [],
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        monthlyGoal: 5000,
        currentMonth: new Date().getMonth(),
        goalProgress: 0
      },
      isLoading: false
    };
  }

  /**
   * Inicializa o controlador e componentes
   */
  async initialize(): Promise<void> {
    try {
      Logger.info('🎮 Inicializando AppController', undefined, 'APP');

      // Carregar estado persistido
      await this.loadPersistedState();

      // Inicializar componentes
      await this.initializeComponents();

      // Configurar roteamento
      this.setupRouting();

      // Configurar event listeners globais
      this.setupGlobalEventListeners();

      // Aplicar tema inicial
      this.applyTheme(this.state.theme);

      Logger.info('✅ AppController inicializado', this.state, 'APP');

    } catch (error) {
      Logger.error('Falha ao inicializar AppController', error as Error, 'APP');
      throw error;
    }
  }

  /**
   * Carrega estado salvo anteriormente
   */
  private async loadPersistedState(): Promise<void> {
    try {
      const savedState = await Storage.load<Partial<AppState>>('app-state');
      
      if (savedState) {
        this.state = { ...this.state, ...savedState };
        Logger.info('📚 Estado carregado do storage', savedState, 'APP');
      }

    } catch (error) {
      Logger.warn('Falha ao carregar estado', error, 'APP');
      // Usar estado padrão
    }
  }

  /**
   * Salva estado atual
   */
  private async saveState(): Promise<void> {
    try {
      await Storage.save('app-state', this.state);
      Logger.debug('💾 Estado salvo', this.state, 'APP');
    } catch (error) {
      Logger.warn('Falha ao salvar estado', error, 'APP');
    }
  }

  /**
   * Inicializa todos os componentes da aplicação
   */
  private async initializeComponents(): Promise<void> {
    try {
      const appContainer = document.getElementById('app');
      if (!appContainer) throw new Error('Container da aplicação não encontrado');

      // Criar estrutura básica
      appContainer.innerHTML = `
        <div id="sidebar-container"></div>
        <div id="main-content" class="main-content">
          <div id="page-container"></div>
        </div>
      `;

      // Inicializar Sidebar
      const sidebarContainer = document.getElementById('sidebar-container')!;
      const sidebarConfig = {
        onNavigate: (route: string) => this.navigate(route),
        onThemeToggle: () => this.toggleTheme(),
        currentRoute: this.state.currentRoute,
        user: this.state.user
      };
      
      const sidebarComponent = new SidebarComponent(sidebarContainer, sidebarConfig);
      
      this.components.set('sidebar', sidebarComponent);
      await sidebarComponent.render();

      // Inicializar Dashboard (página inicial)
      await this.loadComponent('dashboard');

      Logger.info('🧩 Componentes inicializados', Array.from(this.components.keys()), 'APP');

    } catch (error) {
      Logger.error('Falha ao inicializar componentes', error as Error, 'APP');
      throw error;
    }
  }

  /**
   * Carrega componente específico
   */
  private async loadComponent(componentName: string): Promise<void> {
    try {
      const pageContainer = document.getElementById('page-container');
      if (!pageContainer) throw new Error('Container da página não encontrado');

      // Remover componente anterior se existir
      const currentComponent = this.components.get('current-page');
      if (currentComponent && typeof currentComponent.unmount === 'function') {
        currentComponent.unmount();
      } else if (currentComponent && typeof currentComponent.destroy === 'function') {
        currentComponent.destroy();
      }

      // Carregar novo componente
      let component;
      switch (componentName) {
        case 'dashboard':
          component = new DashboardComponent();
          await component.mount(pageContainer);
          
          // Configurar integração com dados
          component.setAppController(this);
          component.onDataUpdate({
            transactions: this.state.transactions,
            summary: this.state.summary
          });
          break;
        
        case 'reports':
          // TODO: Implementar ReportsComponent
          pageContainer.innerHTML = '<div class="page-placeholder">📊 Relatórios em desenvolvimento...</div>';
          return;
        
        case 'transactions':
          // TODO: Implementar TransactionsComponent
          pageContainer.innerHTML = '<div class="page-placeholder">💳 Transações em desenvolvimento...</div>';
          return;
        
        case 'goals':
          // TODO: Implementar GoalsComponent
          pageContainer.innerHTML = '<div class="page-placeholder">🎯 Metas em desenvolvimento...</div>';
          return;
        
        case 'settings':
          // TODO: Implementar SettingsComponent
          pageContainer.innerHTML = '<div class="page-placeholder">⚙️ Configurações em desenvolvimento...</div>';
          return;
        
        default:
          throw new Error(`Componente desconhecido: ${componentName}`);
      }

      if (component) {
        this.components.set('current-page', component);
      }

      Logger.info(`📄 Componente ${componentName} carregado`, undefined, 'APP');

    } catch (error) {
      Logger.error(`Falha ao carregar componente ${componentName}`, error as Error, 'APP');
      throw error;
    }
  }

  /**
   * Navegação entre páginas
   */
  public async navigate(route: string): Promise<void> {
    try {
      if (route === this.state.currentRoute) return;

      this.state.currentRoute = route;
      await this.loadComponent(route);
      
      // Atualizar sidebar
      const sidebar = this.components.get('sidebar');
      if (sidebar) sidebar.updateActiveRoute(route);

      // Salvar estado
      await this.saveState();

      Logger.info(`🧭 Navegação para ${route}`, undefined, 'APP');

    } catch (error) {
      Logger.error('Falha na navegação', error as Error, 'APP');
    }
  }

  /**
   * Alternância de tema
   */
  public toggleTheme(): void {
    try {
      this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
      this.applyTheme(this.state.theme);
      this.saveState();

      Logger.info(`🎨 Tema alterado para ${this.state.theme}`, undefined, 'APP');

    } catch (error) {
      Logger.error('Falha ao alternar tema', error as Error, 'APP');
    }
  }

  /**
   * Aplica tema na aplicação
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Smooth transition
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  /**
   * Configurar roteamento simples
   */
  private setupRouting(): void {
    // TODO: Implementar roteamento mais robusto no futuro
    // Por enquanto, navegação é controlada pelo sidebar
  }

  /**
   * Event listeners globais
   */
  private setupGlobalEventListeners(): void {
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'd':
            event.preventDefault();
            this.navigate('dashboard');
            break;
          case 'r':
            event.preventDefault();
            this.navigate('reports');
            break;
          case 't':
            event.preventDefault();
            this.navigate('transactions');
            break;
        }
      }
    });

    // Window resize para responsividade
    window.addEventListener('resize', () => {
      // Notificar componentes sobre mudança de tamanho
      this.components.forEach(component => {
        if (typeof component.onResize === 'function') {
          component.onResize();
        }
      });
    });
  }

  /**
   * Getter para estado (read-only)
   */
  public getState(): Readonly<AppState> {
    return { ...this.state };
  }

  /**
   * ===== MÉTODOS PARA INTEGRAÇÃO COM DADOS FINANCEIROS =====
   */

  /**
   * Carrega dados financeiros do storage
   */
  public async loadFinancialData(): Promise<void> {
    try {
      this.state.isLoading = true;
      Logger.info('💰 Carregando dados financeiros...', undefined, 'APP');

      // Carregar transações
      const transactions = await Storage.load<Transaction[]>('transactions') || [];
      
      // Calcular summary
      const summary = this.calculateSummary(transactions);

      // Atualizar estado
      this.state.transactions = transactions;
      this.state.summary = summary;
      this.state.isLoading = false;

      // Notificar componentes sobre atualização
      this.notifyComponentsDataUpdate();

      Logger.info('✅ Dados financeiros carregados', { 
        transactions: transactions.length, 
        balance: summary.balance 
      }, 'APP');

    } catch (error) {
      this.state.isLoading = false;
      Logger.error('❌ Erro ao carregar dados financeiros', error as Error, 'APP');
      throw error;
    }
  }

  /**
   * Adiciona nova transação
   */
  public async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    try {
      // Gerar ID único
      const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newTransaction: Transaction = {
        ...transaction,
        id,
        date: transaction.date || new Date()
      };

      // Adicionar ao estado
      this.state.transactions.push(newTransaction);

      // Recalcular summary
      this.state.summary = this.calculateSummary(this.state.transactions);

      // Salvar no storage
      await Storage.save('transactions', this.state.transactions);
      await this.saveState();

      // Notificar componentes
      this.notifyComponentsDataUpdate();

      Logger.info('➕ Transação adicionada', newTransaction, 'APP');
      return newTransaction;

    } catch (error) {
      Logger.error('❌ Erro ao adicionar transação', error as Error, 'APP');
      throw error;
    }
  }

  /**
   * Remove transação
   */
  public async removeTransaction(id: string): Promise<void> {
    try {
      this.state.transactions = this.state.transactions.filter(t => t.id !== id);
      this.state.summary = this.calculateSummary(this.state.transactions);

      await Storage.save('transactions', this.state.transactions);
      await this.saveState();

      this.notifyComponentsDataUpdate();

      Logger.info('🗑️ Transação removida', { id }, 'APP');

    } catch (error) {
      Logger.error('❌ Erro ao remover transação', error as Error, 'APP');
      throw error;
    }
  }

  /**
   * Atualiza transação existente
   */
  public async updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id'>>): Promise<Transaction> {
    try {
      const index = this.state.transactions.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Transação não encontrada');

      this.state.transactions[index] = { ...this.state.transactions[index], ...updates };
      this.state.summary = this.calculateSummary(this.state.transactions);

      await Storage.save('transactions', this.state.transactions);
      await this.saveState();

      this.notifyComponentsDataUpdate();

      Logger.info('✏️ Transação atualizada', this.state.transactions[index], 'APP');
      return this.state.transactions[index];

    } catch (error) {
      Logger.error('❌ Erro ao atualizar transação', error as Error, 'APP');
      throw error;
    }
  }

  /**
   * Obtém transações com filtros
   */
  public getTransactions(filters?: {
    type?: 'income' | 'expense';
    category?: string;
    dateRange?: { start: Date; end: Date };
    limit?: number;
  }): Transaction[] {
    let filtered = [...this.state.transactions];

    if (filters?.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters?.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters?.dateRange) {
      filtered = filtered.filter(t => 
        new Date(t.date) >= filters.dateRange!.start && 
        new Date(t.date) <= filters.dateRange!.end
      );
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  /**
   * Obtém resumo financeiro
   */
  public getFinancialSummary(): FinancialSummary {
    return { ...this.state.summary };
  }

  /**
   * ===== MÉTODOS PRIVADOS DE SUPORTE =====
   */

  /**
   * Calcula resumo financeiro baseado nas transações
   */
  private calculateSummary(transactions: Transaction[]): FinancialSummary {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filtrar transações do mês atual
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;
    const monthlyGoal = this.state.summary?.monthlyGoal || 5000;
    const goalProgress = monthlyGoal > 0 ? (totalIncome / monthlyGoal) * 100 : 0;

    return {
      totalIncome,
      totalExpense,
      balance,
      monthlyGoal,
      currentMonth,
      goalProgress
    };
  }

  /**
   * Notifica componentes sobre atualização de dados
   */
  private notifyComponentsDataUpdate(): void {
    // Notificar Dashboard se estiver ativo
    const dashboard = this.components.get('current-page');
    if (dashboard && typeof dashboard.onDataUpdate === 'function') {
      dashboard.onDataUpdate({
        transactions: this.state.transactions,
        summary: this.state.summary
      });
    }

    // Notificar outros componentes conforme necessário
    this.components.forEach((component, key) => {
      if (key !== 'current-page' && typeof component.onDataUpdate === 'function') {
        component.onDataUpdate({
          transactions: this.state.transactions,
          summary: this.state.summary
        });
      }
    });

    Logger.debug('📡 Componentes notificados sobre atualização de dados', {
      transactions: this.state.transactions.length,
      balance: this.state.summary.balance
    }, 'APP');
  }

  /**
   * Cleanup (para futuras necessidades)
   */
  public destroy(): void {
    this.components.forEach(component => {
      if (typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components.clear();
    
    Logger.info('🧹 AppController destruído', undefined, 'APP');
  }
}