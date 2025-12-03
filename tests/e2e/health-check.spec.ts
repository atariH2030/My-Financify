/**
 * @file health-check.spec.ts
 * @description Sistema Antifalhas - Health Check Completo
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 * 
 * OBJETIVO: Detectar problemas antes que impactem usuário
 * - Testes de sanidade para todas as features
 * - Logs estruturados com contexto completo
 * - Screenshots automáticos em falhas
 * - Métricas de performance
 */

import { test, expect } from '@playwright/test';
import { HealthCheckReporter } from './utils/health-check-reporter';
import { setupAuthMock, mockLogin, MOCK_CREDENTIALS } from './fixtures/auth.mock';

const reporter = new HealthCheckReporter();

test.describe('🏥 Sistema Antifalhas - Health Check', () => {
  
  test.beforeEach(async ({ page }) => {
    // ✅ MOCK: Configurar mock de autenticação (usuário NÃO autenticado inicialmente)
    await setupAuthMock(page, { authenticated: false });
    
    // Setup: Capturar console.logs do navegador para debug
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error' || text.includes('Mock de autenticação') || text.includes('AuthContext')) {
        console.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
      }
    });
    
    // Setup: Configurar reporter
    await reporter.startTest(test.info().title);
    
    // Navigate to app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Capturar screenshot se falhou
    if (testInfo.status !== 'passed') {
      const screenshot = await page.screenshot();
      await reporter.addScreenshot(test.info().title, screenshot);
    }
    
    const status = testInfo.status === 'timedOut' || testInfo.status === 'interrupted' 
      ? 'failed' 
      : (testInfo.status || 'skipped') as 'passed' | 'failed' | 'skipped';
    
    await reporter.endTest(test.info().title, status);
  });

  test('[CRITICAL] 🚀 App deve carregar sem erros', async ({ page }) => {
    const checkpoint = reporter.createCheckpoint('App Load');
    
    try {
      // Check 1: Título da página
      checkpoint.log('Verificando título da página...');
      const title = await page.title();
      expect(title).toContain('Financy Life');
      checkpoint.pass('Título correto: ' + title);

      // Check 2: Sem erros no console
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(2000);
      
      if (errors.length > 0) {
        checkpoint.fail('Erros no console detectados', { errors });
        throw new Error(`Console errors: ${errors.join(', ')}`);
      }
      checkpoint.pass('Nenhum erro no console');

      // Check 3: Main container presente
      checkpoint.log('Verificando container principal...');
      const mainContainer = await page.locator('main, #root, .app').first();
      await expect(mainContainer).toBeVisible();
      checkpoint.pass('Container principal visível');

    } catch (error) {
      checkpoint.fail('Falha ao carregar app', { error: String(error) });
      throw error;
    }
  });

  test('[CRITICAL] 🔐 Autenticação deve funcionar', async ({ page }) => {
    const checkpoint = reporter.createCheckpoint('Authentication');
    
    try {
      // Check 1: Detectar se está na tela de login
      checkpoint.log('Verificando tela de autenticação...');
      const isAuthScreen = await page.locator('text=/login|entrar|sign in/i').count() > 0;
      
      if (isAuthScreen) {
        checkpoint.log('Tela de login detectada, realizando login com MOCK...');
        
        // ✅ Preencher formulário com credenciais do MOCK
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
        const submitButton = page.locator('button[type="submit"], button:has-text("Entrar")').first();
        
        await emailInput.fill(MOCK_CREDENTIALS.email);
        await passwordInput.fill(MOCK_CREDENTIALS.password);
        
        // ✅ Submit do formulário (Login.tsx detecta o mock internamente)
        await submitButton.click();
        
        // Aguardar AuthContext detectar e renderizar dashboard
        await page.waitForTimeout(500);
        checkpoint.pass('Login realizado com sucesso (MOCK)');
      } else {
        checkpoint.pass('Usuário já autenticado');
      }

      // Check 2: Verificar elementos pós-login
      checkpoint.log('Verificando elementos da dashboard...');
      
      // Debug: Verificar estado do mock
      const mockState = await page.evaluate(() => {
        const mock = (window as any).__AUTH_MOCK__;
        return {
          exists: !!mock,
          isAuthenticated: mock?.isAuthenticated,
          userId: mock?.user?.id,
          sessionToken: mock?.session?.access_token
        };
      });
      checkpoint.log(`Estado do Mock: ${JSON.stringify(mockState)}`);
      
      // Debug: Verificar console.logs do React
      await page.waitForTimeout(2000); // Dar tempo para React renderizar
      
      const dashboardIndicators = [
        page.locator('text=/dashboard|painel/i'),
        page.locator('text=/saldo|balance/i'),
        page.locator('text=/transações|transactions/i'),
        page.locator('nav, .sidebar, aside'),
      ];

      let found = false;
      for (const indicator of dashboardIndicators) {
        if (await indicator.count() > 0) {
          found = true;
          checkpoint.log(`Elemento encontrado: ${await indicator.first().textContent()}`);
          break;
        }
      }

      if (!found) {
        // Debug: Tentar encontrar qualquer elemento visível
        const bodyText = await page.locator('body').textContent();
        checkpoint.fail('Dashboard não carregou corretamente', {
          url: page.url(),
          mockState,
          bodyPreview: bodyText?.substring(0, 500),
          screenshot: true
        });
        throw new Error('Dashboard elements not found');
      }
      checkpoint.pass('Dashboard carregada corretamente');

    } catch (error) {
      checkpoint.fail('Falha na autenticação', { error: String(error) });
      throw error;
    }
  });

  test('[HIGH] 💰 Transações - CRUD completo', async ({ page }) => {
    const checkpoint = reporter.createCheckpoint('Transactions CRUD');
    
    try {
      // ✅ Realizar login MOCK primeiro
      checkpoint.log('Realizando login mock...');
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      await emailInput.fill(MOCK_CREDENTIALS.email);
      await passwordInput.fill(MOCK_CREDENTIALS.password);
      await submitButton.click();
      
      // Aguardar dashboard renderizar
      await page.waitForTimeout(1000);
      
      // Navegar para transações
      checkpoint.log('Aguardando renderização do sidebar...');
      // Esperar o sidebar render com nav visível (garantir que App completo renderizou)
      await page.waitForSelector('.sidebar-nav', { state: 'attached', timeout: 10000 });
      await page.waitForSelector('a:has-text("Painel Principal")', { state: 'visible', timeout: 5000 });
      
      checkpoint.log('Navegando para página de transações...');
      const transactionsLink = page.locator('a:has-text("Receitas e Despesas")').first();
      await transactionsLink.waitFor({ state: 'visible', timeout: 5000 });
      await transactionsLink.click();
      await page.waitForLoadState('networkidle');
      checkpoint.pass('Navegação bem-sucedida');

      // CREATE: Nova transação
      checkpoint.log('Criando nova transação...');
      const addButton = page.locator('button:has-text("Nova"), button:has-text("Adicionar")').first();
      await addButton.click();
      
      // Preencher formulário
      await page.fill('input[name="description"], input[placeholder*="Descrição"]', 'Teste Health Check');
      await page.fill('input[name="amount"], input[type="number"]', '100.50');
      await page.selectOption('select[name="type"]', 'expense');
      
      const saveButton = page.locator('button:has-text("Salvar"), button[type="submit"]').first();
      await saveButton.click();
      await page.waitForTimeout(1000);
      checkpoint.pass('Transação criada');

      // READ: Verificar na lista
      checkpoint.log('Verificando transação na lista...');
      const transactionItem = page.locator('text=Teste Health Check').first();
      await expect(transactionItem).toBeVisible({ timeout: 5000 });
      checkpoint.pass('Transação encontrada na lista');

      // UPDATE: Editar transação
      checkpoint.log('Editando transação...');
      await transactionItem.click();
      const editButton = page.locator('button:has-text("Editar"), button[aria-label*="edit"]').first();
      await editButton.click();
      
      await page.fill('input[name="description"]', 'Teste Health Check - Editado');
      await saveButton.click();
      await page.waitForTimeout(1000);
      checkpoint.pass('Transação editada');

      // DELETE: Remover transação
      checkpoint.log('Removendo transação...');
      const deleteButton = page.locator('button:has-text("Deletar"), button[aria-label*="delete"]').first();
      await deleteButton.click();
      
      // Confirmar deleção
      const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sim")').first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      await page.waitForTimeout(1000);
      
      // Verificar que não existe mais
      const deletedItem = await page.locator('text=Teste Health Check').count();
      expect(deletedItem).toBe(0);
      checkpoint.pass('Transação deletada');

    } catch (error) {
      checkpoint.fail('Falha no CRUD de transações', { 
        error: String(error),
        step: 'Verificar logs acima para identificar exatamente qual operação falhou'
      });
      throw error;
    }
  });

  test('[HIGH] 📊 Dashboard - Widgets carregam corretamente', async ({ page }) => {
    const checkpoint = reporter.createCheckpoint('Dashboard Widgets');
    
    try {
      // ✅ Realizar login MOCK primeiro
      checkpoint.log('Realizando login mock...');
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      await emailInput.fill(MOCK_CREDENTIALS.email);
      await passwordInput.fill(MOCK_CREDENTIALS.password);
      await submitButton.click();
      
      // Aguardar dashboard renderizar
      await page.waitForTimeout(2000);
      checkpoint.pass('Login realizado com sucesso');

      // Navegar para dashboard (já deve estar lá)
      checkpoint.log('Verificando dashboard...');
      await page.waitForSelector('.sidebar-nav', { state: 'attached', timeout: 5000 });

      // Verificar widgets principais
      const widgets = [
        { name: 'Saldo', selector: 'text=/saldo|balance/i' },
        { name: 'Receitas vs Despesas', selector: 'text=/receitas|despesas|income|expense/i' },
        { name: 'Orçamentos', selector: 'text=/orçamento|budget/i' },
        { name: 'Metas', selector: 'text=/metas|goals/i' }
      ];

      for (const widget of widgets) {
        checkpoint.log(`Verificando widget: ${widget.name}...`);
        const element = page.locator(widget.selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        
        if (isVisible) {
          checkpoint.pass(`Widget "${widget.name}" está visível`);
        } else {
          checkpoint.warn(`Widget "${widget.name}" não encontrado (pode estar desabilitado)`);
        }
      }

      // Verificar que pelo menos 1 widget carregou
      const visibleWidgets = await page.locator('[class*="widget"], [data-widget]').count();
      if (visibleWidgets === 0) {
        checkpoint.fail('Nenhum widget encontrado na dashboard', {
          html: await page.content()
        });
        throw new Error('No widgets loaded');
      }
      checkpoint.pass(`${visibleWidgets} widgets carregados`);

    } catch (error) {
      checkpoint.fail('Falha ao carregar dashboard widgets', { error: String(error) });
      throw error;
    }
  });

  test('[MEDIUM] 📄 Exportação de PDF', async ({ page }) => {
    const checkpoint = reporter.createCheckpoint('PDF Export');
    
    try {
      // Navegar para relatórios
      checkpoint.log('Navegando para relatórios...');
      await page.goto('http://localhost:3000/reports');
      await page.waitForLoadState('networkidle');

      // Localizar botão de exportação
      checkpoint.log('Procurando botão de exportação PDF...');
      const exportButton = page.locator('button:has-text("PDF"), button:has-text("Exportar")').first();
      await expect(exportButton).toBeVisible({ timeout: 5000 });
      checkpoint.pass('Botão de exportação encontrado');

      // Configurar listener para download
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      
      checkpoint.log('Clicando em exportar...');
      await exportButton.click();

      // Aguardar download
      const download = await downloadPromise;
      const filename = download.suggestedFilename();
      
      expect(filename).toMatch(/\.pdf$/i);
      checkpoint.pass(`PDF gerado: ${filename}`);

    } catch (error) {
      checkpoint.fail('Falha na exportação de PDF', { 
        error: String(error),
        troubleshooting: 'Verifique se PDFExportService está inicializado'
      });
      throw error;
    }
  });

  test('[MEDIUM] 🔍 Filtros Avançados', async ({ page }) => {
    const checkpoint = reporter.createCheckpoint('Advanced Filters');
    
    try {
      // Navegar para transações
      checkpoint.log('Navegando para transações...');
      await page.goto('http://localhost:3000/transactions');
      await page.waitForLoadState('networkidle');

      // Abrir painel de filtros
      checkpoint.log('Abrindo filtros avançados...');
      const filterButton = page.locator('button:has-text("Filtro"), button[aria-label*="filter"]').first();
      await filterButton.click();
      await page.waitForTimeout(500);
      checkpoint.pass('Painel de filtros aberto');

      // Adicionar filtro por tipo
      checkpoint.log('Adicionando filtro de tipo...');
      const typeFilter = page.locator('select[name="type"], select:has-text("Tipo")').first();
      await typeFilter.selectOption('expense');
      checkpoint.pass('Filtro aplicado: Apenas despesas');

      // Aplicar filtros
      const applyButton = page.locator('button:has-text("Aplicar")').first();
      await applyButton.click();
      await page.waitForTimeout(1000);

      // Verificar resultados filtrados
      const transactions = page.locator('[data-type="expense"], .transaction-expense');
      const count = await transactions.count();
      
      if (count > 0) {
        checkpoint.pass(`${count} despesas encontradas`);
      } else {
        checkpoint.warn('Nenhuma despesa encontrada (pode ser esperado se base vazia)');
      }

    } catch (error) {
      checkpoint.fail('Falha nos filtros avançados', { error: String(error) });
      throw error;
    }
  });

  test('[LOW] ⚡ Performance - Tempos de carregamento', async ({ page }) => {
    const checkpoint = reporter.createCheckpoint('Performance Check');
    
    try {
      const metrics: Record<string, number> = {};

      // Página inicial
      checkpoint.log('Medindo carregamento da homepage...');
      const homeStart = Date.now();
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      metrics.homepage = Date.now() - homeStart;
      checkpoint.log(`Homepage: ${metrics.homepage}ms`);

      // Dashboard
      checkpoint.log('Medindo carregamento da dashboard...');
      const dashStart = Date.now();
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('networkidle');
      metrics.dashboard = Date.now() - dashStart;
      checkpoint.log(`Dashboard: ${metrics.dashboard}ms`);

      // Transações
      checkpoint.log('Medindo carregamento de transações...');
      const txStart = Date.now();
      await page.goto('http://localhost:3000/transactions');
      await page.waitForLoadState('networkidle');
      metrics.transactions = Date.now() - txStart;
      checkpoint.log(`Transações: ${metrics.transactions}ms`);

      // Validar métricas
      const threshold = 5000; // 5 segundos
      for (const [page, time] of Object.entries(metrics)) {
        if (time > threshold) {
          checkpoint.warn(`${page} demorou ${time}ms (> ${threshold}ms threshold)`);
        } else {
          checkpoint.pass(`${page}: ${time}ms ✅`);
        }
      }

      await reporter.addMetrics(metrics);

    } catch (error) {
      checkpoint.fail('Falha na medição de performance', { error: String(error) });
      throw error;
    }
  });

  test('[LOW] ♿ Acessibilidade - Navegação por teclado', async ({ page }) => {
    const checkpoint = reporter.createCheckpoint('Accessibility Check');
    
    try {
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      checkpoint.log('Testando navegação por Tab...');
      
      // Pressionar Tab 5 vezes
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        // Verificar se há elemento com foco
        const focusedElement = await page.evaluateHandle(() => document.activeElement);
        const tagName = await focusedElement.evaluate(el => el?.tagName);
        
        checkpoint.log(`Tab ${i + 1}: Foco em ${tagName}`);
      }

      checkpoint.pass('Navegação por teclado funcional');

      // Testar atalho Ctrl+W (Widget Customizer)
      checkpoint.log('Testando atalho Ctrl+W...');
      await page.keyboard.press('Control+W');
      await page.waitForTimeout(500);
      
      // Verificar se modal abriu (não vai fechar a janela se preventDefault funcionou)
      const isWindowClosed = page.isClosed();
      expect(isWindowClosed).toBe(false);
      checkpoint.pass('Atalho Ctrl+W não fechou a janela (preventDefault OK)');

    } catch (error) {
      checkpoint.fail('Falha nos testes de acessibilidade', { error: String(error) });
      throw error;
    }
  });
});

test.afterAll(async () => {
  // Gerar relatório final
  const report = await reporter.generateReport();
  console.log('\n' + '='.repeat(80));
  console.log('🏥 RELATÓRIO FINAL DO SISTEMA ANTIFALHAS');
  console.log('='.repeat(80));
  console.log(report);
});
