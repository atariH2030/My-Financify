/**
 * @file auth.mock.ts
 * @description Mock do AuthService para testes E2E sem dependência do Supabase
 * @author DEV - Sistema Antifalhas
 * @version 1.0.0
 */

import type { Page } from '@playwright/test';

/**
 * Dados de usuário fake para testes
 */
export const MOCK_USER = {
  id: 'test-user-e2e-12345',
  email: 'test@financify.com',
  created_at: new Date().toISOString(),
  user_metadata: {
    full_name: 'Test User E2E',
    avatar_url: null,
  },
  app_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
};

/**
 * Sessão fake para testes
 */
export const MOCK_SESSION = {
  access_token: 'mock-access-token-e2e',
  refresh_token: 'mock-refresh-token-e2e',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: MOCK_USER,
};

/**
 * Credenciais válidas para testes
 */
export const MOCK_CREDENTIALS = {
  email: 'test@financify.com',
  password: 'Test@123456',
};

/**
 * Setup de mock de autenticação para testes E2E
 * 
 * Este mock intercepta todas as chamadas ao Supabase e retorna
 * dados fake, permitindo testes sem configuração de backend.
 * 
 * @param page - Instância do Playwright Page
 * @param options - Opções de configuração do mock
 */
export async function setupAuthMock(page: Page, options: {
  /**
   * Se true, usuário inicia autenticado
   * Se false, usuário inicia desautenticado
   */
  authenticated?: boolean;
  /**
   * Dados customizados do usuário (sobrescreve MOCK_USER)
   */
  customUser?: Partial<typeof MOCK_USER>;
  /**
   * Se true, simula erro de autenticação
   */
  simulateAuthError?: boolean;
} = {}) {
  const {
    authenticated = false,
    customUser = {},
    simulateAuthError = false,
  } = options;

  // Dados do usuário (merge com customUser)
  const mockUser = { ...MOCK_USER, ...customUser };
  const mockSession = { ...MOCK_SESSION, user: mockUser };

  // Adicionar script de mock no contexto da página
  await page.addInitScript(({ 
    mockUser, 
    mockSession, 
    authenticated,
    simulateAuthError,
    mockCredentials,
  }) => {
    // Mock do localStorage
    const mockStorage = {
      user: authenticated ? mockUser : null,
      session: authenticated ? mockSession : null,
    };

    // Sobrescrever localStorage
    const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
    const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
    const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);

    window.localStorage.setItem = function(key: string, value: string) {
      if (key.includes('supabase.auth.token')) {
        console.log('[AUTH MOCK] localStorage.setItem intercepted:', key);
        if (authenticated) {
          mockStorage.session = mockSession;
          mockStorage.user = mockUser;
        }
        return originalSetItem(key, value);
      }
      return originalSetItem(key, value);
    };

    window.localStorage.getItem = function(key: string) {
      if (key.includes('supabase.auth.token')) {
        console.log('[AUTH MOCK] localStorage.getItem intercepted:', key);
        if (authenticated && mockStorage.session) {
          return JSON.stringify(mockStorage.session);
        }
        return null;
      }
      return originalGetItem(key);
    };

    window.localStorage.removeItem = function(key: string) {
      if (key.includes('supabase.auth.token')) {
        console.log('[AUTH MOCK] localStorage.removeItem intercepted:', key);
        mockStorage.session = null;
        mockStorage.user = null;
      }
      return originalRemoveItem(key);
    };

    // Verificar se há estado persistido no localStorage (sobrevive ao reload)
    let persistedAuth = authenticated;
    let persistedUser = authenticated ? mockUser : null;
    let persistedSession = authenticated ? mockSession : null;
    
    try {
      const storedAuth = originalGetItem.call(window.localStorage, '__e2e_mock_authenticated');
      if (storedAuth === 'true') {
        persistedAuth = true;
        const storedUser = originalGetItem.call(window.localStorage, '__e2e_mock_user');
        const storedSession = originalGetItem.call(window.localStorage, '__e2e_mock_session');
        if (storedUser) persistedUser = JSON.parse(storedUser);
        if (storedSession) persistedSession = JSON.parse(storedSession);
        console.log('[AUTH MOCK] Restored authenticated state from localStorage');
      }
    } catch (e) {
      console.log('[AUTH MOCK] Failed to restore from localStorage:', e);
    }

    // Mock de funções globais de autenticação (injetado no window)
    (window as any).__AUTH_MOCK__ = {
      isAuthenticated: persistedAuth,
      user: persistedUser,
      session: persistedSession,
      simulateAuthError,
      mockCredentials,

      // Simular login bem-sucedido
      login: function(email: string, password: string) {
        console.log('[AUTH MOCK] Login attempt:', email);
        
        if (simulateAuthError) {
          return {
            data: null,
            error: { message: 'Invalid login credentials' }
          };
        }

        if (email === mockCredentials.email && password === mockCredentials.password) {
          this.isAuthenticated = true;
          this.user = mockUser;
          this.session = mockSession;
          mockStorage.user = mockUser;
          mockStorage.session = mockSession;
          
          // Persistir estado no localStorage real para sobreviver ao page reload
          try {
            originalSetItem.call(window.localStorage, '__e2e_mock_authenticated', 'true');
            originalSetItem.call(window.localStorage, '__e2e_mock_user', JSON.stringify(mockUser));
            originalSetItem.call(window.localStorage, '__e2e_mock_session', JSON.stringify(mockSession));
          } catch (e) {
            console.log('[AUTH MOCK] Failed to persist to localStorage:', e);
          }
          
          console.log('[AUTH MOCK] Login successful');
          
          // Disparar evento customizado para notificar React
          const event = new CustomEvent('auth-mock-state-changed', {
            detail: { authenticated: true, user: mockUser, session: mockSession }
          });
          window.dispatchEvent(event);
          
          return {
            data: { user: mockUser, session: mockSession },
            error: null
          };
        }

        console.log('[AUTH MOCK] Invalid credentials');
        return {
          data: null,
          error: { message: 'Invalid login credentials' }
        };
      },

      // Simular logout
      logout: function() {
        console.log('[AUTH MOCK] Logout');
        this.isAuthenticated = false;
        this.user = null;
        this.session = null;
        mockStorage.user = null;
        mockStorage.session = null;
        
        // Limpar estado persistido
        try {
          originalRemoveItem.call(window.localStorage, '__e2e_mock_authenticated');
          originalRemoveItem.call(window.localStorage, '__e2e_mock_user');
          originalRemoveItem.call(window.localStorage, '__e2e_mock_session');
        } catch (e) {
          console.log('[AUTH MOCK] Failed to clear localStorage:', e);
        }
        
        return { error: null };
      },

      // Obter sessão atual
      getSession: function() {
        console.log('[AUTH MOCK] getSession called');
        return {
          data: {
            session: this.isAuthenticated ? mockSession : null,
          },
          error: null,
        };
      },

      // Obter usuário atual
      getUser: function() {
        console.log('[AUTH MOCK] getUser called');
        return {
          data: {
            user: this.isAuthenticated ? mockUser : null,
          },
          error: null,
        };
      },
    };

    console.log('[AUTH MOCK] Setup complete. Authenticated:', authenticated);
  }, {
    mockUser,
    mockSession,
    authenticated,
    simulateAuthError,
    mockCredentials: MOCK_CREDENTIALS,
  });

  // Interceptar requests HTTP para o Supabase
  await page.route('**/auth/v1/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    console.log(`[AUTH MOCK] Intercepted ${method} ${url}`);

    // POST /auth/v1/token (login)
    if (url.includes('/token') && method === 'POST') {
      if (simulateAuthError) {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'invalid_grant',
            error_description: 'Invalid login credentials',
          }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: mockSession.access_token,
          refresh_token: mockSession.refresh_token,
          expires_in: mockSession.expires_in,
          token_type: 'bearer',
          user: mockUser,
        }),
      });
    }

    // GET /auth/v1/user (get current user)
    if (url.includes('/user') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(authenticated ? mockUser : null),
      });
    }

    // POST /auth/v1/logout
    if (url.includes('/logout') && method === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    }

    // Outras rotas - continuar normalmente
    return route.continue();
  });

  console.log(`[AUTH MOCK] Auth mock configured. Authenticated: ${authenticated}`);
}

/**
 * Helper para fazer login mock durante o teste
 * 
 * @param page - Instância do Playwright Page
 * @param credentials - Credenciais (opcional, usa MOCK_CREDENTIALS por padrão)
 */
export async function mockLogin(
  page: Page,
  credentials: { email: string; password: string } = MOCK_CREDENTIALS
): Promise<void> {
  await page.evaluate(({ email, password }) => {
    const authMock = (window as any).__AUTH_MOCK__;
    if (authMock) {
      const result = authMock.login(email, password);
      if (result.error) {
        throw new Error(result.error.message);
      }
    }
  }, credentials);

  // Aguardar o app processar a mudança de autenticação
  await page.waitForTimeout(500);
}

/**
 * Helper para fazer logout mock durante o teste
 * 
 * @param page - Instância do Playwright Page
 */
export async function mockLogout(page: Page): Promise<void> {
  await page.evaluate(() => {
    const authMock = (window as any).__AUTH_MOCK__;
    if (authMock) {
      authMock.logout();
    }
  });

  await page.waitForTimeout(500);
}

/**
 * Helper para verificar estado de autenticação
 * 
 * @param page - Instância do Playwright Page
 * @returns true se autenticado, false caso contrário
 */
export async function isAuthMockAuthenticated(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const authMock = (window as any).__AUTH_MOCK__;
    return authMock ? authMock.isAuthenticated : false;
  });
}
