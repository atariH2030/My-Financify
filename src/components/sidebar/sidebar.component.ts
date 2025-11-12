/**
 * Sidebar Component - Navegação Principal
 * 
 * DECISÕES ARQUITETURAIS:
 * 1. State interno para responsividade (mobile/desktop)
 * 2. Event-driven communication com parent (callbacks)
 * 3. Render method imperativo para controle total
 * 4. Lifecycle hooks para cleanup (memória)
 */

import Logger from '../../services/logger.service.js';
import './sidebar.css';

export interface SidebarConfig {
  onNavigate: (route: string) => void;
  onThemeToggle: () => void;
  currentRoute: string;
  user: {
    name: string;
    email: string;
  };
}

export interface SidebarState {
  isOpen: boolean;
  isMobile: boolean;
  autoHideTimer?: number;
}

export class SidebarComponent {
  private container: HTMLElement;
  private config: SidebarConfig;
  private state: SidebarState;
  private eventListeners: Array<{ element: Element, event: string, handler: EventListener }> = [];

  constructor(container: HTMLElement, config: SidebarConfig) {
    this.container = container;
    this.config = config;
    this.state = {
      isOpen: false,
      isMobile: window.innerWidth < 1024
    };

    Logger.debug('🧩 SidebarComponent criado', this.state, 'SIDEBAR');
  }

  /**
   * RENDER - Cria DOM e configura eventos
   * Por que imperativo? Controle total sobre quando e como renderizar
   */
  async render(): Promise<void> {
    try {
      this.container.innerHTML = this.getTemplate();
      this.setupEventListeners();
      this.updateActiveRoute(this.config.currentRoute);
      this.setupResponsiveBehavior();

      Logger.info('✅ Sidebar renderizada', undefined, 'SIDEBAR');

    } catch (error) {
      Logger.error('Falha ao renderizar sidebar', error as Error, 'SIDEBAR');
      throw error;
    }
  }

  /**
   * TEMPLATE - HTML puro para máxima performance
   * Por que template strings? Sem dependência de libs, controle total
   */
  private getTemplate(): string {
    return `
      <!-- Mobile Toggle -->
      <button class="mobile-menu-toggle" data-action="toggle-mobile">
        <i class="fas fa-bars"></i>
      </button>

      <!-- Sidebar Overlay (mobile) -->
      <div class="sidebar-overlay" data-action="close-sidebar"></div>

      <!-- Sidebar Container -->
      <aside class="sidebar" role="navigation" aria-label="Navegação principal">
        <!-- Header -->
        <header class="sidebar-header">
          <h1 class="sidebar-title">
            <i class="fas fa-chart-line" aria-hidden="true"></i>
            <span>Financy Life</span>
          </h1>
          <button class="theme-toggle" data-action="toggle-theme" 
                  title="Alternar tema" aria-label="Alternar entre tema claro e escuro">
            <i class="fas fa-moon"></i>
          </button>
        </header>

        <!-- Navigation -->
        <nav class="sidebar-nav" role="navigation">
          <ul class="nav-list">
            ${this.getNavigationItems()}
          </ul>
        </nav>

        <!-- Footer -->
        <footer class="sidebar-footer">
          <div class="user-profile">
            <div class="user-avatar" aria-hidden="true">
              <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
              <span class="user-name">${this.config.user.name}</span>
              <small class="user-email">${this.config.user.email}</small>
            </div>
          </div>
          <button class="logout-btn" data-action="logout" aria-label="Sair da aplicação">
            <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
            <span>Sair</span>
          </button>
        </footer>
      </aside>
    `;
  }

  /**
   * NAVEGAÇÃO - Configuração centralizada
   * Por que array? Fácil manutenção, possível vir de API futuramente
   */
  private getNavigationItems(): string {
    const navItems = [
      { route: 'dashboard', icon: 'fas fa-home', label: 'Dashboard', shortcut: 'Ctrl+D' },
      { route: 'reports', icon: 'fas fa-chart-bar', label: 'Relatórios', shortcut: 'Ctrl+R' },
      { route: 'transactions', icon: 'fas fa-exchange-alt', label: 'Transações', shortcut: 'Ctrl+T' },
      { route: 'goals', icon: 'fas fa-bullseye', label: 'Metas', shortcut: '' },
      { route: 'settings', icon: 'fas fa-cog', label: 'Configurações', shortcut: '' }
    ];

    return navItems.map(item => `
      <li class="nav-item">
        <button class="nav-link" 
                data-route="${item.route}" 
                data-action="navigate"
                title="${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}"
                aria-label="Ir para ${item.label}">
          <i class="${item.icon}" aria-hidden="true"></i>
          <span class="nav-label">${item.label}</span>
        </button>
      </li>
    `).join('');
  }

  /**
   * EVENT LISTENERS - Padrão Event Delegation
   * Por que delegation? Performance (1 listener vs N listeners)
   */
  private setupEventListeners(): void {
    const sidebar = this.container.querySelector('.sidebar');
    if (!sidebar) return;

    // Event delegation principal
    const mainHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('[data-action]') as HTMLElement;
      
      if (!button) return;

      const action = button.getAttribute('data-action');
      this.handleAction(action!, button, event);
    };

    // Registrar listeners (para cleanup posterior)
    this.addEventListener(this.container, 'click', mainHandler);
    this.addEventListener(window, 'resize', () => this.onResize());

    Logger.debug('🎛️ Event listeners configurados', undefined, 'SIDEBAR');
  }

  /**
   * ACTION HANDLER - Central de ações
   * Por que switch? Fácil debug, possível logging de todas ações
   */
  private handleAction(action: string, element: HTMLElement, event: Event): void {
    try {
      switch (action) {
        case 'navigate':
          const route = element.getAttribute('data-route');
          if (route) {
            this.config.onNavigate(route);
            if (this.state.isMobile) this.closeSidebar();
          }
          break;

        case 'toggle-theme':
          this.config.onThemeToggle();
          this.updateThemeIcon();
          break;

        case 'toggle-mobile':
          this.toggleSidebar();
          break;

        case 'close-sidebar':
          this.closeSidebar();
          break;

        case 'logout':
          this.handleLogout();
          break;

        default:
          Logger.warn(`Ação desconhecida: ${action}`, undefined, 'SIDEBAR');
      }

      Logger.debug(`🎯 Ação executada: ${action}`, { element: element.tagName }, 'SIDEBAR');

    } catch (error) {
      Logger.error(`Falha ao executar ação: ${action}`, error as Error, 'SIDEBAR');
    }
  }

  /**
   * RESPONSIVIDADE - Comportamento inteligente
   * Por que listener? Adapta automaticamente sem refresh
   */
  private setupResponsiveBehavior(): void {
    this.updateSidebarVisibility();

    // Auto-hide em split-screen
    if (this.state.isMobile) {
      this.setupAutoHide();
    }
  }

  private updateSidebarVisibility(): void {
    const sidebar = this.container.querySelector('.sidebar') as HTMLElement;
    const toggle = this.container.querySelector('.mobile-menu-toggle') as HTMLElement;
    
    if (!sidebar || !toggle) return;

    if (this.state.isMobile) {
      toggle.style.display = 'block';
      sidebar.classList.toggle('open', this.state.isOpen);
    } else {
      toggle.style.display = 'none';
      sidebar.classList.remove('open');
      this.state.isOpen = false;
    }
  }

  private setupAutoHide(): void {
    const sidebar = this.container.querySelector('.sidebar');
    if (!sidebar) return;

    this.addEventListener(sidebar, 'mouseenter', () => {
      if (this.state.autoHideTimer) {
        clearTimeout(this.state.autoHideTimer);
      }
    });

    this.addEventListener(sidebar, 'mouseleave', () => {
      if (this.state.isMobile && this.state.isOpen) {
        this.state.autoHideTimer = window.setTimeout(() => {
          this.closeSidebar();
        }, 3000);
      }
    });
  }

  /**
   * MÉTODOS PÚBLICOS - API do componente
   */
  public updateActiveRoute(route: string): void {
    const navLinks = this.container.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const linkRoute = link.getAttribute('data-route');
      link.classList.toggle('active', linkRoute === route);
    });

    Logger.debug(`📍 Rota ativa atualizada: ${route}`, undefined, 'SIDEBAR');
  }

  public toggleSidebar(): void {
    this.state.isOpen = !this.state.isOpen;
    this.updateSidebarVisibility();

    const overlay = this.container.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.classList.toggle('active', this.state.isOpen);
    }
  }

  public closeSidebar(): void {
    this.state.isOpen = false;
    this.updateSidebarVisibility();

    const overlay = this.container.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  public onResize(): void {
    const wasMobile = this.state.isMobile;
    this.state.isMobile = window.innerWidth < 1024;

    if (wasMobile !== this.state.isMobile) {
      this.updateSidebarVisibility();
      Logger.debug('📱 Modo responsivo alterado', { isMobile: this.state.isMobile }, 'SIDEBAR');
    }
  }

  /**
   * MÉTODOS PRIVADOS - Helpers
   */
  private updateThemeIcon(): void {
    const themeIcon = this.container.querySelector('.theme-toggle i');
    if (themeIcon) {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  private handleLogout(): void {
    // TODO: Implementar logout real
    if (confirm('Tem certeza que deseja sair?')) {
      Logger.info('👋 Usuário fez logout', undefined, 'SIDEBAR');
      // Future: Clear storage, redirect to login
    }
  }

  /**
   * HELPER para registrar event listeners (para cleanup)
   */
  private addEventListener(element: Element | Window, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element: element as Element, event, handler });
  }

  /**
   * CLEANUP - Previne memory leaks
   * Por que importante? SPA não recarrega página, componentes acumulam
   */
  public destroy(): void {
    // Limpar timers
    if (this.state.autoHideTimer) {
      clearTimeout(this.state.autoHideTimer);
    }

    // Remover event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    // Limpar DOM
    this.container.innerHTML = '';

    Logger.info('🧹 SidebarComponent destruído', undefined, 'SIDEBAR');
  }
}