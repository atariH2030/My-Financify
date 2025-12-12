/**
 * @file visual-regression.spec.ts
 * @description Testes de regressão visual (screenshot comparison)
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 * 
 * Detecta mudanças visuais indesejadas
 */

import { expect, test } from '@playwright/test';

test.describe('Visual Regression - Desktop (1280px)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Mock auth
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

  test('Dashboard - Screenshot baseline', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Aguardar animações terminarem
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('dashboard-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    console.log('✅ Dashboard screenshot capturado');
  });

  test('Transactions - Screenshot baseline', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('transactions-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    console.log('✅ Transactions screenshot capturado');
  });

  test('Goals - Screenshot baseline', async ({ page }) => {
    await page.goto('/goals');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('goals-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    console.log('✅ Goals screenshot capturado');
  });

  test('Budgets - Screenshot baseline', async ({ page }) => {
    await page.goto('/budgets');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('budgets-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    console.log('✅ Budgets screenshot capturado');
  });

  test('Settings - Screenshot baseline', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('settings-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    console.log('✅ Settings screenshot capturado');
  });
});

test.describe('Visual Regression - Mobile (375px)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
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

  test('Dashboard Mobile - Screenshot baseline', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    console.log('✅ Dashboard mobile screenshot capturado');
  });

  test('Transactions Mobile - Cards view', async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('transactions-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    console.log('✅ Transactions mobile screenshot capturado');
  });
});

test.describe('Visual Regression - Componentes', () => {
  
  test('Notification Dropdown - Screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Abrir dropdown
    await page.click('.notification-bell');
    await page.waitForSelector('.notification-dropdown', { timeout: 3000 });
    await page.waitForTimeout(500);
    
    const dropdown = page.locator('.notification-dropdown');
    await expect(dropdown).toHaveScreenshot('notification-dropdown.png', {
      animations: 'disabled',
    });
    
    console.log('✅ Notification dropdown screenshot capturado');
  });

  test('Modal - Screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    const openBtn = page.locator('button').filter({ hasText: /editar|adicionar/i }).first();
    
    if (await openBtn.count() > 0) {
      await openBtn.click();
      await page.waitForSelector('.modal', { timeout: 3000 });
      await page.waitForTimeout(500);
      
      const modal = page.locator('.modal');
      await expect(modal).toHaveScreenshot('modal.png', {
        animations: 'disabled',
      });
      
      console.log('✅ Modal screenshot capturado');
    }
  });

  test('Toast - Screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Trigger toast
    await page.evaluate(() => {
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Teste de screenshot', type: 'success' } 
      });
      window.dispatchEvent(event);
    });
    
    await page.waitForSelector('.toast', { timeout: 3000 });
    await page.waitForTimeout(500);
    
    const toast = page.locator('.toast');
    await expect(toast).toHaveScreenshot('toast.png', {
      animations: 'disabled',
    });
    
    console.log('✅ Toast screenshot capturado');
  });
});

test.describe('Visual Regression - Hover States', () => {
  
  test('Button Hover - Elevation aplicada', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const button = page.locator('button').first();
    
    // Screenshot normal
    await expect(button).toHaveScreenshot('button-normal.png', {
      animations: 'disabled',
    });
    
    // Hover
    await button.hover();
    await page.waitForTimeout(300);
    
    await expect(button).toHaveScreenshot('button-hover.png', {
      animations: 'disabled',
    });
    
    console.log('✅ Button hover states capturados');
  });

  test('Card Hover - Elevation e transform', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const card = page.locator('.summary-card, .card').first();
    
    // Screenshot normal
    await expect(card).toHaveScreenshot('card-normal.png', {
      animations: 'disabled',
    });
    
    // Hover
    await card.hover();
    await page.waitForTimeout(300);
    
    await expect(card).toHaveScreenshot('card-hover.png', {
      animations: 'disabled',
    });
    
    console.log('✅ Card hover states capturados');
  });
});

test.describe('Visual Regression - Dark Mode', () => {
  
  test('Dashboard Dark Mode - Screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Ativar dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('dashboard-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    console.log('✅ Dashboard dark mode screenshot capturado');
  });

  test('Settings Dark Mode - Screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('settings-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    console.log('✅ Settings dark mode screenshot capturado');
  });
});

test.describe('Visual Regression - Responsive Breakpoints', () => {
  
  test('Tablet (768px) - Layout adaptado', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('dashboard-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    console.log('✅ Tablet screenshot capturado');
  });

  test('Small Mobile (320px) - Layout mínimo', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('dashboard-small-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
    
    console.log('✅ Small mobile screenshot capturado');
  });
});
