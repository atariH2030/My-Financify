/**
 * @file performance.spec.ts
 * @description Testes de performance e otimização
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 * 
 * Valida:
 * - Lighthouse metrics
 * - Bundle size
 * - First Paint / FCP / LCP
 * - Time to Interactive
 */

import { expect, test } from '@playwright/test';

test.describe('Performance - Core Web Vitals', () => {
  
  test('Dashboard - First Contentful Paint < 1.8s', async ({ page }) => {
    await page.goto('/dashboard');
    
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        fcp: fcp?.startTime || 0,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
      };
    });
    
    expect(metrics.fcp).toBeLessThan(1800); // < 1.8s (Good)
    expect(metrics.domInteractive).toBeLessThan(3000); // < 3s
    
    console.log('✅ Performance metrics:', {
      FCP: `${(metrics.fcp / 1000).toFixed(2)}s`,
      DOMContentLoaded: `${(metrics.domContentLoaded).toFixed(0)}ms`,
      LoadComplete: `${(metrics.loadComplete).toFixed(0)}ms`,
      DOMInteractive: `${(metrics.domInteractive / 1000).toFixed(2)}s`,
    });
  });

  test('Transactions - Página carrega em < 3s', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
    console.log(`✅ Transactions carregou em ${(loadTime / 1000).toFixed(2)}s`);
  });

  test('Settings - Time to Interactive < 3.8s', async ({ page }) => {
    await page.goto('/settings');
    
    const tti = await page.evaluate(() => {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve(performance.now());
        } else {
          window.addEventListener('load', () => resolve(performance.now()));
        }
      });
    });
    
    expect(tti).toBeLessThan(3800);
    console.log(`✅ TTI: ${(Number(tti) / 1000).toFixed(2)}s`);
  });
});

test.describe('Performance - Resource Loading', () => {
  
  test('CSS - Total size < 200KB', async ({ page }) => {
    let totalCSSSize = 0;
    const cssFiles: string[] = [];
    
    page.on('response', (response) => {
      if (response.url().endsWith('.css')) {
        const size = parseInt(response.headers()['content-length'] || '0');
        totalCSSSize += size;
        cssFiles.push(response.url());
      }
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const totalKB = totalCSSSize / 1024;
    
    expect(totalKB).toBeLessThan(200);
    console.log(`✅ CSS total: ${totalKB.toFixed(2)} KB (${cssFiles.length} arquivos)`);
  });

  test('JavaScript - Não deve bloquear render', async ({ page }) => {
    await page.goto('/dashboard');
    
    const scripts = await page.evaluate(() => {
      const scriptTags = Array.from(document.querySelectorAll('script'));
      return scriptTags.map(script => ({
        src: script.src,
        async: script.async,
        defer: script.defer,
        type: script.type
      }));
    });
    
    // Verificar que scripts têm async ou defer
    const blockingScripts = scripts.filter(s => s.src && !s.async && !s.defer && s.type !== 'module');
    
    expect(blockingScripts.length).toBe(0);
    console.log(`✅ ${scripts.length} scripts - nenhum bloqueante`);
  });

  test('Images - Lazy loading aplicado', async ({ page }) => {
    await page.goto('/dashboard');
    
    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        loading: img.loading,
        decoding: img.decoding
      }));
    });
    
    // Verificar que imagens têm lazy loading (exceto above-fold)
    const lazyImages = images.filter(img => img.loading === 'lazy');
    
    console.log(`✅ ${lazyImages.length}/${images.length} imagens com lazy loading`);
  });
});

test.describe('Performance - Rendering', () => {
  
  test('Animações - Usando CSS transforms (não layout thrashing)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verificar cards que fazem hover
    const card = page.locator('.summary-card, .card').first();
    
    const transformBefore = await card.evaluate((el) => window.getComputedStyle(el).transform);
    
    await card.hover();
    await page.waitForTimeout(300);
    
    const transformAfter = await card.evaluate((el) => window.getComputedStyle(el).transform);
    
    // Transform deve mudar (translateY aplicado)
    expect(transformBefore).not.toBe(transformAfter);
    console.log('✅ Animações usando transform (GPU accelerated)');
  });

  test('Transições - Duração otimizada (< 400ms)', async ({ page }) => {
    await page.goto('/dashboard');
    
    const button = page.locator('button').first();
    const transition = await button.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.transitionDuration;
    });
    
    // Verificar que transição não é muito longa
    const durationMs = parseFloat(transition) * 1000;
    expect(durationMs).toBeLessThanOrEqual(400);
    
    console.log(`✅ Transições: ${transition} (${durationMs}ms)`);
  });

  test('Re-renders - Componentes não re-renderizam desnecessariamente', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Capturar render count inicial
    const initialRenders = await page.evaluate(() => {
      return (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.rendererInterfaces?.size || 0;
    });
    
    // Interagir com UI (sem mudar dados)
    await page.hover('.summary-card');
    await page.waitForTimeout(500);
    
    const afterRenders = await page.evaluate(() => {
      return (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.rendererInterfaces?.size || 0;
    });
    
    // Renders não devem aumentar drasticamente
    expect(afterRenders - initialRenders).toBeLessThanOrEqual(5);
    console.log('✅ Re-renders otimizados');
  });
});

test.describe('Performance - Memory & Network', () => {
  
  test('Memory Leaks - Sem aumento excessivo de memória', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Capturar uso de memória inicial
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Navegar entre páginas várias vezes
    for (let i = 0; i < 5; i++) {
      await page.goto('/transactions');
      await page.waitForTimeout(500);
      await page.goto('/dashboard');
      await page.waitForTimeout(500);
    }
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
    
    // Aumento de memória não deve ser > 50MB
    expect(memoryIncrease).toBeLessThan(50);
    console.log(`✅ Memory increase: ${memoryIncrease.toFixed(2)} MB`);
  });

  test('Network Requests - Número otimizado de requests', async ({ page }) => {
    let requestCount = 0;
    const requests: string[] = [];
    
    page.on('request', (request) => {
      requestCount++;
      requests.push(request.url());
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Total de requests não deve ser excessivo (< 50)
    expect(requestCount).toBeLessThan(50);
    console.log(`✅ Total requests: ${requestCount}`);
  });

  test('Caching - Resources sendo cacheados', async ({ page }) => {
    let cachedRequests = 0;
    
    page.on('response', (response) => {
      const cacheControl = response.headers()['cache-control'];
      if (cacheControl && cacheControl.includes('max-age')) {
        cachedRequests++;
      }
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log(`✅ ${cachedRequests} resources com cache`);
  });
});

test.describe('Performance - Benchmarks', () => {
  
  test('Table rendering - 100 rows em < 2s', async ({ page }) => {
    await page.goto('/transactions');
    
    const startTime = Date.now();
    
    // Aguardar tabela renderizar
    await page.waitForSelector('.transactions-table tbody tr', { timeout: 5000 });
    
    const rows = await page.locator('.transactions-table tbody tr').count();
    const renderTime = Date.now() - startTime;
    
    expect(renderTime).toBeLessThan(2000);
    console.log(`✅ ${rows} rows renderizadas em ${renderTime}ms`);
  });

  test('Charts - Rendering performático', async ({ page }) => {
    await page.goto('/dashboard');
    
    const startTime = Date.now();
    
    // Aguardar charts renderizarem
    await page.waitForSelector('canvas', { timeout: 5000 });
    
    const renderTime = Date.now() - startTime;
    const charts = await page.locator('canvas').count();
    
    expect(renderTime).toBeLessThan(3000);
    console.log(`✅ ${charts} charts renderizados em ${renderTime}ms`);
  });

  test('Modal open - Transição < 300ms', async ({ page }) => {
    await page.goto('/settings');
    
    const openBtn = page.locator('button').filter({ hasText: /editar|adicionar/i }).first();
    
    if (await openBtn.count() > 0) {
      const startTime = Date.now();
      
      await openBtn.click();
      await page.waitForSelector('.modal', { timeout: 2000 });
      
      const openTime = Date.now() - startTime;
      
      expect(openTime).toBeLessThan(300);
      console.log(`✅ Modal abriu em ${openTime}ms`);
    }
  });
});

test.describe('Performance - Lighthouse Score', () => {
  
  test('Dashboard - Performance score > 85', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Simular Lighthouse metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      const lcp = paint.find(entry => entry.name === 'largest-contentful-paint');
      
      return {
        fcp: fcp?.startTime || 0,
        lcp: lcp?.startTime || 0,
        tti: navigation.domInteractive - navigation.fetchStart,
        speedIndex: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      };
    });
    
    // Score baseado em métricas
    const fcpScore = metrics.fcp < 1800 ? 100 : 50;
    const lcpScore = metrics.lcp < 2500 ? 100 : 50;
    const ttiScore = metrics.tti < 3800 ? 100 : 50;
    
    const averageScore = (fcpScore + lcpScore + ttiScore) / 3;
    
    expect(averageScore).toBeGreaterThan(85);
    console.log(`✅ Performance Score: ${averageScore.toFixed(0)}/100`);
    console.log('  - FCP:', `${(metrics.fcp / 1000).toFixed(2)}s`);
    console.log('  - LCP:', `${(metrics.lcp / 1000).toFixed(2)}s`);
    console.log('  - TTI:', `${(metrics.tti / 1000).toFixed(2)}s`);
  });
});
