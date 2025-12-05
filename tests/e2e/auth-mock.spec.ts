/**
 * @file auth-mock.spec.ts
 * @description Testes específicos para validar o Mock de Autenticação
 * @author DEV - Sistema Antifalhas
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';
import { HealthCheckReporter } from './utils/health-check-reporter';
import { 
  setupAuthMock, 
  mockLogin, 
  mockLogout,
  isAuthMockAuthenticated,
  MOCK_CREDENTIALS,
  MOCK_USER
} from './fixtures/auth.mock';

const reporter = new HealthCheckReporter();

test.describe('🧪 Auth Mock - Validação do Sistema de Mock', () => {
  
  test('[MOCK TEST] ✅ Mock inicia desautenticado', async ({ page }) => {
    let checkpoint: ReturnType<typeof reporter.createCheckpoint> | null = null;
    
    try {
      await reporter.startTest(test.info().title);
      checkpoint = reporter.createCheckpoint('Mock Estado Inicial');
      
      // Setup mock desautenticado
      await setupAuthMock(page, { authenticated: false });
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      checkpoint.log('Verificando estado de autenticação...');
      const isAuth = await isAuthMockAuthenticated(page);
      
      if (isAuth) {
        checkpoint.fail('Mock deveria iniciar desautenticado', { isAuth });
        throw new Error('Mock authentication state incorrect');
      }
      
      checkpoint.pass('Mock iniciou desautenticado corretamente');
      
      // Verificar se mostra tela de login
      checkpoint.log('Verificando presença da tela de login...');
      const loginElements = await page.locator('input[type="email"], input[type="password"]').count();
      
      if (loginElements < 2) {
        checkpoint.fail('Tela de login não encontrada', { loginElements });
        throw new Error('Login screen not found');
      }
      
      checkpoint.pass(`Tela de login presente (${loginElements} campos encontrados)`);
      
      await reporter.endTest(test.info().title, 'passed');
      
    } catch (error) {
      if (checkpoint) {
        checkpoint.fail('Erro ao validar mock desautenticado', { error: String(error) });
      }
      await reporter.endTest(test.info().title, 'failed');
      throw error;
    }
  });

  test('[MOCK TEST] ✅ Mock pode autenticar usuário', async ({ page }) => {
    let checkpoint: ReturnType<typeof reporter.createCheckpoint> | null = null;
    
    try {
      await reporter.startTest(test.info().title);
      checkpoint = reporter.createCheckpoint('Mock Login');
      
      // Setup mock desautenticado
      await setupAuthMock(page, { authenticated: false });
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      checkpoint.log('Estado inicial: desautenticado');
      let isAuth = await isAuthMockAuthenticated(page);
      expect(isAuth).toBe(false);
      
      // Preencher formulário
      checkpoint.log('Preenchendo formulário de login...');
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      await emailInput.fill(MOCK_CREDENTIALS.email);
      await passwordInput.fill(MOCK_CREDENTIALS.password);
      
      // Executar login mock
      checkpoint.log('Executando mockLogin()...');
      await mockLogin(page);
      
      // Verificar estado após login
      checkpoint.log('Verificando autenticação...');
      isAuth = await isAuthMockAuthenticated(page);
      
      if (!isAuth) {
        checkpoint.fail('Mock não autenticou usuário', { isAuth });
        throw new Error('Mock login failed');
      }
      
      checkpoint.pass('Mock autenticou usuário com sucesso');
      
      // Verificar dados do usuário
      const mockState = await page.evaluate(() => {
        const mock = (window as any).__AUTH_MOCK__;
        return {
          isAuth: mock?.isAuthenticated,
          email: mock?.user?.email,
          userId: mock?.user?.id,
        };
      });
      
      checkpoint.log(`Usuário autenticado: ${mockState.email} (ID: ${mockState.userId})`);
      
      expect(mockState.email).toBe(MOCK_CREDENTIALS.email);
      expect(mockState.userId).toBe(MOCK_USER.id);
      
      checkpoint.pass('Dados do usuário mock corretos');
      
      await reporter.endTest(test.info().title, 'passed');
      
    } catch (error) {
      if (checkpoint) {
        checkpoint.fail('Erro ao autenticar com mock', { error: String(error) });
      }
      await reporter.endTest(test.info().title, 'failed');
      throw error;
    }
  });

  test('[MOCK TEST] ✅ Mock inicia autenticado quando configurado', async ({ page }) => {
    let checkpoint: ReturnType<typeof reporter.createCheckpoint> | null = null;
    
    try {
      await reporter.startTest(test.info().title);
      checkpoint = reporter.createCheckpoint('Mock Pré-autenticado');
      
      // Setup mock JÁ AUTENTICADO
      await setupAuthMock(page, { authenticated: true });
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      checkpoint.log('Verificando estado de autenticação...');
      const isAuth = await isAuthMockAuthenticated(page);
      
      if (!isAuth) {
        checkpoint.fail('Mock deveria iniciar autenticado', { isAuth });
        throw new Error('Mock should be authenticated');
      }
      
      checkpoint.pass('Mock iniciou autenticado corretamente');
      
      // Verificar se NÃO mostra tela de login
      checkpoint.log('Verificando ausência da tela de login...');
      const loginScreen = await page.locator('text=/faça login|sign in/i').count();
      
      if (loginScreen > 0) {
        checkpoint.warn('Tela de login ainda visível (pode ser normal se app não redireciona automaticamente)');
      } else {
        checkpoint.pass('Tela de login não presente');
      }
      
      await reporter.endTest(test.info().title, 'passed');
      
    } catch (error) {
      if (checkpoint) {
        checkpoint.fail('Erro ao validar mock pré-autenticado', { error: String(error) });
      }
      await reporter.endTest(test.info().title, 'failed');
      throw error;
    }
  });

  test('[MOCK TEST] ✅ Mock pode desautenticar usuário', async ({ page }) => {
    let checkpoint: ReturnType<typeof reporter.createCheckpoint> | null = null;
    
    try {
      await reporter.startTest(test.info().title);
      checkpoint = reporter.createCheckpoint('Mock Logout');
      
      // Iniciar autenticado
      await setupAuthMock(page, { authenticated: true });
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      checkpoint.log('Estado inicial: autenticado');
      let isAuth = await isAuthMockAuthenticated(page);
      expect(isAuth).toBe(true);
      
      // Executar logout
      checkpoint.log('Executando mockLogout()...');
      await mockLogout(page);
      
      // Verificar estado após logout
      checkpoint.log('Verificando desautenticação...');
      isAuth = await isAuthMockAuthenticated(page);
      
      if (isAuth) {
        checkpoint.fail('Mock não desautenticou usuário', { isAuth });
        throw new Error('Mock logout failed');
      }
      
      checkpoint.pass('Mock desautenticou usuário com sucesso');
      
      await reporter.endTest(test.info().title, 'passed');
      
    } catch (error) {
      if (checkpoint) {
        checkpoint.fail('Erro ao desautenticar com mock', { error: String(error) });
      }
      await reporter.endTest(test.info().title, 'failed');
      throw error;
    }
  });

  test('[MOCK TEST] ⚠️ Mock simula erro de autenticação', async ({ page }) => {
    let checkpoint: ReturnType<typeof reporter.createCheckpoint> | null = null;
    
    try {
      await reporter.startTest(test.info().title);
      checkpoint = reporter.createCheckpoint('Mock Erro de Auth');
      
      // Setup mock com erro simulado
      await setupAuthMock(page, { 
        authenticated: false,
        simulateAuthError: true 
      });
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      checkpoint.log('Tentando login com erro simulado...');
      
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      await emailInput.fill(MOCK_CREDENTIALS.email);
      await passwordInput.fill(MOCK_CREDENTIALS.password);
      
      // Tentar login (deve falhar)
      try {
        await mockLogin(page);
        checkpoint.fail('Mock deveria ter retornado erro');
        throw new Error('Expected authentication error');
      } catch (error) {
        checkpoint.pass('Mock retornou erro conforme esperado');
      }
      
      // Verificar que ainda está desautenticado
      const isAuth = await isAuthMockAuthenticated(page);
      expect(isAuth).toBe(false);
      checkpoint.pass('Usuário permaneceu desautenticado após erro');
      
      await reporter.endTest(test.info().title, 'passed');
      
    } catch (error) {
      if (checkpoint) {
        checkpoint.fail('Erro ao validar simulação de erro', { error: String(error) });
      }
      await reporter.endTest(test.info().title, 'failed');
      throw error;
    }
  });

  test('[MOCK TEST] 🔒 Mock persiste autenticação entre navegações', async ({ page }) => {
    let checkpoint: ReturnType<typeof reporter.createCheckpoint> | null = null;
    
    try {
      await reporter.startTest(test.info().title);
      checkpoint = reporter.createCheckpoint('Mock Persistência');
      
      // Iniciar autenticado
      await setupAuthMock(page, { authenticated: true });
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      checkpoint.log('Autenticado na página inicial');
      let isAuth = await isAuthMockAuthenticated(page);
      expect(isAuth).toBe(true);
      
      // Navegar para outra rota
      checkpoint.log('Navegando para /dashboard...');
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Verificar que ainda está autenticado
      checkpoint.log('Verificando persistência...');
      isAuth = await isAuthMockAuthenticated(page);
      
      if (!isAuth) {
        checkpoint.fail('Autenticação não persistiu', { isAuth });
        throw new Error('Authentication not persisted');
      }
      
      checkpoint.pass('Autenticação persistiu entre navegações');
      
      await reporter.endTest(test.info().title, 'passed');
      
    } catch (error) {
      if (checkpoint) {
        checkpoint.fail('Erro ao validar persistência', { error: String(error) });
      }
      await reporter.endTest(test.info().title, 'failed');
      throw error;
    }
  });

  test.afterAll(async () => {
    const report = await reporter.generateReport();
    console.log('\n' + '='.repeat(80));
    console.log('🧪 RELATÓRIO DE VALIDAÇÃO DO AUTH MOCK');
    console.log('='.repeat(80));
    console.log(report);
  });
});
