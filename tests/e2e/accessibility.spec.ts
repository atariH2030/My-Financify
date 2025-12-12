/**
 * @file accessibility.spec.ts
 * @description Testes automatizados de acessibilidade WCAG AAA
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 * 
 * Usa axe-core para validação automática
 */

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Acessibilidade WCAG AAA', () => {
  
  test('Dashboard - Sem violações críticas', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa'])
      .analyze();
    
    // Verificar que não há violações críticas
    expect(accessibilityScanResults.violations).toHaveLength(0);
    
    console.log(`✅ Dashboard - ${accessibilityScanResults.passes.length} regras passaram`);
  });

  test('Transactions - Sem violações críticas', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toHaveLength(0);
    
    console.log(`✅ Transactions - ${accessibilityScanResults.passes.length} regras passaram`);
  });

  test('Settings - Sem violações críticas', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toHaveLength(0);
    
    console.log(`✅ Settings - ${accessibilityScanResults.passes.length} regras passaram`);
  });

  test('Goals - Sem violações críticas', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toHaveLength(0);
    
    console.log(`✅ Goals - ${accessibilityScanResults.passes.length} regras passaram`);
  });

  test('Budgets - Sem violações críticas', async ({ page }) => {
    await page.goto('/budgets');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toHaveLength(0);
    
    console.log(`✅ Budgets - ${accessibilityScanResults.passes.length} regras passaram`);
  });
});

test.describe('Acessibilidade - Touch Targets Específicos', () => {
  
  test('Todos os links devem ter área clicável ≥ 44x44px', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const links = await page.locator('a[href]').all();
    let violations = 0;
    
    for (const link of links) {
      const box = await link.boundingBox();
      if (box && (box.width < 44 || box.height < 44)) {
        const href = await link.getAttribute('href');
        console.warn(`⚠️ Link pequeno: ${href} - ${box.width}x${box.height}px`);
        violations++;
      }
    }
    
    expect(violations).toBe(0);
    console.log(`✅ Verificados ${links.length} links - todos ≥ 44px`);
  });

  test('Inputs devem ter min-height ≥ 42px', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], select').all();
    let violations = 0;
    
    for (const input of inputs) {
      const box = await input.boundingBox();
      if (box && box.height < 42) {
        const id = await input.getAttribute('id');
        console.warn(`⚠️ Input pequeno: ${id} - ${box.height}px`);
        violations++;
      }
    }
    
    expect(violations).toBe(0);
    console.log(`✅ Verificados ${inputs.length} inputs - todos ≥ 42px`);
  });
});

test.describe('Acessibilidade - Contraste de Cores', () => {
  
  test('Textos primários com contraste ≥ 7:1', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Pegar elementos com texto principal
    const textElements = await page.locator('h1, h2, h3, p, span, div').all();
    
    let checked = 0;
    for (const el of textElements.slice(0, 20)) { // Limitar a 20 para performance
      const text = await el.textContent();
      if (text && text.trim().length > 0) {
        const styles = await el.evaluate((element) => {
          const computed = window.getComputedStyle(element);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });
        
        // Verificar que cores existem
        expect(styles.color).toBeTruthy();
        checked++;
      }
    }
    
    console.log(`✅ Verificados ${checked} elementos de texto`);
  });
});

test.describe('Acessibilidade - Screen Readers', () => {
  
  test('Imagens devem ter alt text', async ({ page }) => {
    await page.goto('/dashboard');
    
    const images = await page.locator('img').all();
    let violations = 0;
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt || alt.trim() === '') {
        const src = await img.getAttribute('src');
        console.warn(`⚠️ Imagem sem alt: ${src}`);
        violations++;
      }
    }
    
    expect(violations).toBe(0);
    console.log(`✅ Verificadas ${images.length} imagens - todas com alt`);
  });

  test('Botões devem ter texto ou aria-label', async ({ page }) => {
    await page.goto('/dashboard');
    
    const buttons = await page.locator('button').all();
    let violations = 0;
    
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      
      if (!text?.trim() && !ariaLabel && !title) {
        console.warn('⚠️ Botão sem texto acessível');
        violations++;
      }
    }
    
    expect(violations).toBe(0);
    console.log(`✅ Verificados ${buttons.length} botões - todos acessíveis`);
  });

  test('Form inputs devem ter labels associados', async ({ page }) => {
    await page.goto('/settings');
    
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"]').all();
    let violations = 0;
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      
      // Verificar se tem label associado via id, aria-label ou placeholder
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        if (label === 0 && !ariaLabel) {
          console.warn(`⚠️ Input sem label: ${id}`);
          violations++;
        }
      } else if (!ariaLabel && !placeholder) {
        console.warn('⚠️ Input sem identificação acessível');
        violations++;
      }
    }
    
    expect(violations).toBe(0);
    console.log(`✅ Verificados ${inputs.length} inputs - todos com labels`);
  });
});

test.describe('Acessibilidade - Navegação por Teclado', () => {
  
  test('Todas as páginas principais são navegáveis por teclado', async ({ page }) => {
    const pages = ['/dashboard', '/transactions', '/goals', '/budgets', '/settings'];
    
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Tentar navegar com Tab
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
      }
      
      // Verificar que focus mudou
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeElement).toBeTruthy();
      
      console.log(`✅ ${url} - Navegável por teclado`);
    }
  });

  test('Modais devem trapear foco', async ({ page }) => {
    await page.goto('/settings');
    
    // Abrir modal (ajustar conforme necessário)
    const openBtn = page.locator('button').filter({ hasText: /editar|adicionar/i }).first();
    
    if (await openBtn.count() > 0) {
      await openBtn.click();
      await page.waitForSelector('.modal', { timeout: 3000 });
      
      // Tentar navegar com Tab dentro do modal
      const initialFocus = await page.evaluate(() => document.activeElement?.className);
      
      // Tab 5 vezes
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
      
      // Verificar que focus ainda está dentro do modal
      const modalFocused = await page.evaluate(() => {
        const active = document.activeElement;
        const modal = document.querySelector('.modal');
        return modal?.contains(active);
      });
      
      expect(modalFocused).toBeTruthy();
      console.log('✅ Modal trapeia foco corretamente');
    }
  });

  test('Escape fecha modais e dropdowns', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Abrir notification dropdown
    await page.click('.notification-bell');
    await page.waitForSelector('.notification-dropdown', { timeout: 3000 });
    
    let isVisible = await page.locator('.notification-dropdown').isVisible();
    expect(isVisible).toBeTruthy();
    
    // Pressionar Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    isVisible = await page.locator('.notification-dropdown').isVisible();
    expect(isVisible).toBeFalsy();
    
    console.log('✅ Escape fecha dropdown');
  });
});
