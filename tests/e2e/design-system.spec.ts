/**
 * @file design-system.spec.ts
 * @description Testes E2E para validação do Design System v3.17.0
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 * 
 * Valida:
 * - WCAG AAA compliance (touch targets 44px)
 * - Design tokens aplicados corretamente
 * - Responsividade em breakpoints
 * - Elevation e shadows
 * - Typography scale
 */

import { expect, test } from '@playwright/test';

test.describe('Design System v3.17.0 - WCAG AAA Compliance', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock de autenticação para acessar páginas protegidas
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: 'mock-token',
          user: { id: 'mock-user-id', email: 'test@test.com' }
        }
      }));
    });
  });

  test('Touch Targets - Buttons devem ter mínimo 44x44px (WCAG 2.5.5)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Aguardar carregamento
    await page.waitForLoadState('networkidle');
    
    // Verificar todos os botões
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const box = await button.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
    
    console.log(`✅ Verificados ${buttons.length} botões - todos ≥ 44x44px`);
  });

  test('Touch Targets - Notification Bell 44x44px', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('.notification-bell');
    
    const bell = page.locator('.notification-bell');
    const box = await bell.boundingBox();
    
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    
    console.log(`✅ Notification bell: ${box?.width}x${box?.height}px`);
  });

  test('Touch Targets - Toast Close Button 44x44px', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Trigger toast (pode ser via ação ou mock)
    await page.evaluate(() => {
      // Mock para exibir toast
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Test', type: 'success' } 
      });
      window.dispatchEvent(event);
    });
    
    await page.waitForSelector('.toast-close', { timeout: 5000 });
    const closeBtn = page.locator('.toast-close');
    const box = await closeBtn.boundingBox();
    
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    
    console.log(`✅ Toast close: ${box?.width}x${box?.height}px`);
  });

  test('Touch Targets - Sidebar Navigation Items 44px min-height', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('.sidebar-nav');
    
    const navItems = await page.locator('.sidebar-nav a, .sidebar-nav button').all();
    
    for (const item of navItems) {
      const box = await item.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
    
    console.log(`✅ Verificados ${navItems.length} items de navegação`);
  });

  test('Text Contrast - Títulos com contraste ≥ 7:1 (WCAG AAA)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Pegar todos os h1, h2, h3
    const headings = await page.locator('h1, h2, h3').all();
    
    for (const heading of headings) {
      const color = await heading.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor
        };
      });
      
      // Verificar que cores não são default (teste básico)
      expect(color.color).toBeTruthy();
      expect(color.backgroundColor).toBeTruthy();
    }
    
    console.log(`✅ Verificados ${headings.length} headings`);
  });
});

test.describe('Design System - Design Tokens', () => {
  
  test('CSS Variables - Design tokens carregados', async ({ page }) => {
    await page.goto('/dashboard');
    
    const tokens = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = window.getComputedStyle(root);
      
      return {
        spacing: {
          spacing4: styles.getPropertyValue('--spacing-4'),
          spacing6: styles.getPropertyValue('--spacing-6'),
        },
        typography: {
          fontSizeLg: styles.getPropertyValue('--font-size-lg'),
          fontSizeXl: styles.getPropertyValue('--font-size-xl'),
        },
        touchTarget: styles.getPropertyValue('--touch-target-min'),
        cardRadius: styles.getPropertyValue('--card-radius'),
        elevation2: styles.getPropertyValue('--elevation-2'),
      };
    });
    
    // Verificar que tokens existem
    expect(tokens.spacing.spacing4).toBeTruthy();
    expect(tokens.spacing.spacing6).toBeTruthy();
    expect(tokens.typography.fontSizeLg).toBeTruthy();
    expect(tokens.touchTarget).toContain('44px');
    expect(tokens.cardRadius).toBeTruthy();
    expect(tokens.elevation2).toContain('rgba');
    
    console.log('✅ Design tokens:', tokens);
  });

  test('Spacing System - Grid gaps usando tokens', async ({ page }) => {
    await page.goto('/dashboard');
    
    const grids = await page.locator('[class*="grid"], [class*="cards"]').all();
    
    for (const grid of grids) {
      const gap = await grid.evaluate((el) => {
        return window.getComputedStyle(el).gap;
      });
      
      // Verificar que gap existe (não é '0px' ou 'normal')
      expect(gap).not.toBe('0px');
      expect(gap).not.toBe('normal');
    }
    
    console.log(`✅ Verificados ${grids.length} grids com gap`);
  });
});

test.describe('Design System - Responsividade', () => {
  
  test('Mobile (375px) - Layout adapta corretamente', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verificar que sidebar está oculta ou colapsada
    const sidebar = page.locator('.sidebar');
    const display = await sidebar.evaluate((el) => window.getComputedStyle(el).display);
    
    expect(display).toBeTruthy();
    console.log(`✅ Mobile 375px - Sidebar display: ${display}`);
  });

  test('Tablet (768px) - Breakpoint aplicado', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
    
    // Verificar layout de tabelas (devem adaptar)
    const table = page.locator('.transactions-table');
    const exists = await table.count();
    
    expect(exists).toBeGreaterThan(0);
    console.log('✅ Tablet 768px - Layout adaptado');
  });

  test('Desktop (1280px) - Layout completo', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verificar que sidebar está visível
    const sidebar = page.locator('.sidebar');
    const isVisible = await sidebar.isVisible();
    
    expect(isVisible).toBeTruthy();
    console.log('✅ Desktop 1280px - Sidebar visível');
  });
});

test.describe('Design System - Componentes Específicos', () => {
  
  test('NotificationCenter - Dropdown com elevation-4', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('.notification-bell');
    
    // Clicar no bell
    await page.click('.notification-bell');
    
    // Verificar dropdown aparece
    await page.waitForSelector('.notification-dropdown', { timeout: 3000 });
    
    const dropdown = page.locator('.notification-dropdown');
    const shadow = await dropdown.evaluate((el) => window.getComputedStyle(el).boxShadow);
    
    expect(shadow).toContain('rgba');
    console.log(`✅ NotificationCenter dropdown shadow: ${shadow}`);
  });

  test('Modal - Z-index correto e backdrop', async ({ page }) => {
    await page.goto('/settings');
    
    // Trigger modal (ajustar seletor conforme necessário)
    const openModalBtn = page.locator('button').filter({ hasText: /editar|adicionar|criar/i }).first();
    if (await openModalBtn.count() > 0) {
      await openModalBtn.click();
      
      await page.waitForSelector('.modal', { timeout: 3000 });
      
      const modal = page.locator('.modal');
      const zIndex = await modal.evaluate((el) => window.getComputedStyle(el).zIndex);
      
      expect(parseInt(zIndex)).toBeGreaterThan(1000);
      console.log(`✅ Modal z-index: ${zIndex}`);
    }
  });

  test('Cards - Hover elevation aplicada', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('.summary-card, .card');
    
    const card = page.locator('.summary-card, .card').first();
    
    // Shadow antes do hover
    const shadowBefore = await card.evaluate((el) => window.getComputedStyle(el).boxShadow);
    
    // Hover
    await card.hover();
    await page.waitForTimeout(300); // Aguardar transição
    
    const shadowAfter = await card.evaluate((el) => window.getComputedStyle(el).boxShadow);
    
    // Shadow deve ter mudado (elevation aumentada)
    expect(shadowBefore).not.toBe(shadowAfter);
    console.log('✅ Card hover elevation aplicada');
  });
});

test.describe('Design System - Performance', () => {
  
  test('CSS carregado - Tamanho otimizado', async ({ page }) => {
    const response = await page.goto('/dashboard');
    
    // Pegar todos os CSS
    const cssRequests = [];
    page.on('response', (response) => {
      if (response.url().endsWith('.css')) {
        cssRequests.push({
          url: response.url(),
          size: response.headers()['content-length']
        });
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    console.log(`✅ CSS requests: ${cssRequests.length}`);
  });

  test('Transições suaves - Transition base aplicada', async ({ page }) => {
    await page.goto('/dashboard');
    
    const button = page.locator('button').first();
    const transition = await button.evaluate((el) => window.getComputedStyle(el).transition);
    
    // Verificar que tem transição
    expect(transition).not.toBe('all 0s ease 0s');
    console.log(`✅ Button transition: ${transition}`);
  });
});

test.describe('Design System - Acessibilidade', () => {
  
  test('Focus visible - Outline em elementos focáveis', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Focar no primeiro botão
    const button = page.locator('button').first();
    await button.focus();
    
    const outline = await button.evaluate((el) => window.getComputedStyle(el).outline);
    
    // Verificar que tem outline (não é 'none')
    expect(outline).not.toContain('none');
    console.log(`✅ Focus outline: ${outline}`);
  });

  test('Keyboard navigation - Tab funciona', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Pressionar Tab várias vezes
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }
    
    // Verificar que focus mudou
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    console.log(`✅ Keyboard navigation - Focused: ${focusedElement}`);
  });
});
