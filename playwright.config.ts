/**
 * @file playwright.config.ts
 * @description Configuração do Playwright para Sistema Antifalhas
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout para cada teste (30s)
  timeout: 30 * 1000,
  
  // Tentativas em caso de falha (resiliência)
  retries: process.env.CI ? 2 : 1,
  
  // Testes em paralelo
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter personalizado + HTML
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  use: {
    // URL base do app
    baseURL: 'http://localhost:3000',
    
    // Trace em caso de falha
    trace: 'retain-on-failure',
    
    // Screenshot em falha
    screenshot: 'only-on-failure',
    
    // Video em falha
    video: 'retain-on-failure',
    
    // Timeout para ações (10s)
    actionTimeout: 10 * 1000,
    
    // Timeout para navegação (15s)
    navigationTimeout: 15 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Adicionar mais browsers conforme necessário
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Dev server - iniciar app automaticamente
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutos para build
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
