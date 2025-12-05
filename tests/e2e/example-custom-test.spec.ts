/**
 * @file example-custom-test.spec.ts
 * @description Exemplo de como criar testes customizados com Sistema Antifalhas
 * @author DEV - Rickson (TQM)
 */

import { test, expect } from '@playwright/test';
import { HealthCheckReporter } from './utils/health-check-reporter';

const reporter = new HealthCheckReporter();

test.describe('📝 Exemplo - Teste Customizado', () => {
  
  test.beforeEach(async ({ page }) => {
    await reporter.startTest(test.info().title);
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      const screenshot = await page.screenshot();
      await reporter.addScreenshot(test.info().title, screenshot);
    }
    
    const status = testInfo.status === 'timedOut' || testInfo.status === 'interrupted' 
      ? 'failed' 
      : (testInfo.status || 'skipped') as 'passed' | 'failed' | 'skipped';
    
    await reporter.endTest(test.info().title, status);
  });

  /**
   * EXEMPLO 1: Teste simples com checkpoint único
   */
  test('[EXEMPLO] Validar botão existe', async ({ page }) => {
    const checkpoint = reporter.createCheckpoint('Validação de Botão');
    
    try {
      checkpoint.log('Procurando botão "Nova Transação"...');
      
      const button = page.locator('button:has-text("Nova Transação")').first();
      const isVisible = await button.isVisible();
      
      if (isVisible) {
        checkpoint.pass('Botão encontrado e visível');
      } else {
        checkpoint.fail('Botão não encontrado', {
          url: page.url(),
          html: await page.content()
        });
        throw new Error('Button not visible');
      }
      
    } catch (error) {
      checkpoint.fail('Erro ao validar botão', { error: String(error) });
      throw error;
    }
  });

  /**
   * EXEMPLO 2: Teste com múltiplos checkpoints (fluxo complexo)
   */
  test('[EXEMPLO] Fluxo completo de orçamento', async ({ page }) => {
    // Checkpoint 1: Navegação
    const navCheckpoint = reporter.createCheckpoint('Navegação');
    try {
      navCheckpoint.log('Navegando para /budgets...');
      await page.goto('http://localhost:3000/budgets');
      await page.waitForLoadState('networkidle');
      navCheckpoint.pass('Navegação bem-sucedida');
    } catch (error) {
      navCheckpoint.fail('Falha na navegação', { error: String(error) });
      throw error;
    }

    // Checkpoint 2: Criação
    const createCheckpoint = reporter.createCheckpoint('Criação de Orçamento');
    try {
      createCheckpoint.log('Abrindo modal de novo orçamento...');
      await page.click('button:has-text("Novo Orçamento")');
      await page.waitForTimeout(500);
      
      createCheckpoint.log('Preenchendo formulário...');
      await page.fill('input[name="category"]', 'Alimentação');
      await page.fill('input[name="amount"]', '1000');
      
      createCheckpoint.log('Salvando...');
      await page.click('button:has-text("Salvar")');
      await page.waitForTimeout(1000);
      
      createCheckpoint.pass('Orçamento criado com sucesso');
    } catch (error) {
      createCheckpoint.fail('Falha ao criar orçamento', { 
        error: String(error),
        screenshot: true 
      });
      throw error;
    }

    // Checkpoint 3: Validação
    const validationCheckpoint = reporter.createCheckpoint('Validação');
    try {
      validationCheckpoint.log('Verificando orçamento na lista...');
      
      const budgetItem = page.locator('text=Alimentação').first();
      await expect(budgetItem).toBeVisible({ timeout: 5000 });
      
      validationCheckpoint.pass('Orçamento encontrado na lista');
    } catch (error) {
      validationCheckpoint.fail('Orçamento não encontrado', { error: String(error) });
      throw error;
    }
  });

  /**
   * EXEMPLO 3: Teste com retry manual e logging detalhado
   */
  test('[EXEMPLO] Teste com retry manual', async ({ page }) => {
    const checkpoint = reporter.createCheckpoint('Operação com Retry');
    
    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      attempt++;
      checkpoint.log(`Tentativa ${attempt}/${maxRetries}...`);
      
      try {
        // Operação que pode falhar
        await page.goto('http://localhost:3000/dashboard');
        await page.waitForSelector('.widget', { timeout: 5000 });
        
        success = true;
        checkpoint.pass(`Sucesso na tentativa ${attempt}`);
      } catch (error) {
        checkpoint.warn(`Falha na tentativa ${attempt}: ${String(error)}`);
        
        if (attempt === maxRetries) {
          checkpoint.fail('Todas as tentativas falharam', {
            attempts: maxRetries,
            lastError: String(error)
          });
          throw error;
        }
        
        // Aguardar antes de tentar novamente
        await page.waitForTimeout(1000 * attempt);
      }
    }
  });

  /**
   * EXEMPLO 4: Teste de performance com métricas customizadas
   */
  test('[EXEMPLO] Medir performance de pesquisa', async ({ page }) => {
    const checkpoint = reporter.createCheckpoint('Performance de Pesquisa');
    
    try {
      await page.goto('http://localhost:3000/transactions');
      
      checkpoint.log('Medindo tempo de pesquisa...');
      const startTime = Date.now();
      
      // Realizar pesquisa
      await page.fill('input[placeholder*="Pesquisar"]', 'aluguel');
      await page.waitForTimeout(500); // Debounce
      
      // Aguardar resultados
      await page.waitForSelector('.transaction-item', { timeout: 3000 });
      
      const duration = Date.now() - startTime;
      checkpoint.log(`Pesquisa completada em ${duration}ms`);
      
      // Validar performance
      if (duration < 1000) {
        checkpoint.pass(`Performance excelente: ${duration}ms ✅`);
      } else if (duration < 2000) {
        checkpoint.warn(`Performance aceitável: ${duration}ms ⚠️`);
      } else {
        checkpoint.fail(`Performance ruim: ${duration}ms ❌`, {
          threshold: '2000ms',
          actual: `${duration}ms`
        });
      }
      
      // Adicionar às métricas globais
      await reporter.addMetrics({ searchPerformance: duration });
      
    } catch (error) {
      checkpoint.fail('Erro ao medir performance', { error: String(error) });
      throw error;
    }
  });

  /**
   * EXEMPLO 5: Teste de acessibilidade customizado
   */
  test('[EXEMPLO] Validar ARIA labels', async ({ page }) => {
    const checkpoint = reporter.createCheckpoint('Acessibilidade - ARIA');
    
    try {
      checkpoint.log('Verificando ARIA labels em botões principais...');
      
      const buttons = await page.locator('button').all();
      let missingAria = 0;
      
      for (const button of buttons) {
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        
        if (!ariaLabel && !text?.trim()) {
          missingAria++;
          checkpoint.warn('Botão sem aria-label e sem texto');
        }
      }
      
      if (missingAria === 0) {
        checkpoint.pass(`Todos os ${buttons.length} botões têm labels adequados`);
      } else {
        checkpoint.fail(`${missingAria} botões sem labels`, {
          total: buttons.length,
          missing: missingAria
        });
      }
      
    } catch (error) {
      checkpoint.fail('Erro ao validar ARIA', { error: String(error) });
      throw error;
    }
  });

  test.afterAll(async () => {
    const report = await reporter.generateReport();
    console.log('\n' + '='.repeat(80));
    console.log('📝 RELATÓRIO DOS TESTES CUSTOMIZADOS');
    console.log('='.repeat(80));
    console.log(report);
  });
});

/**
 * PADRÕES RECOMENDADOS:
 * 
 * 1. USE CHECKPOINTS para dividir lógica complexa
 * 2. SEMPRE capture contexto em falhas (error, url, html, screenshot)
 * 3. Use .log() para progresso, .pass() para sucesso, .fail() para erros
 * 4. .warn() para situações não ideais mas não bloqueantes
 * 5. Adicione métricas customizadas com reporter.addMetrics()
 * 6. Try-catch em TODOS os checkpoints críticos
 * 7. Timeout adequados (5s para elementos, 15s para navegação)
 * 8. Sempre use .first() em locators que podem retornar múltiplos
 */
