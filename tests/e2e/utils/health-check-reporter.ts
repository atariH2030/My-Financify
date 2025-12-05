/**
 * @file health-check-reporter.ts
 * @description Reporter customizado para Sistema Antifalhas
 * @version 1.0.0
 * @author DEV - Rickson (TQM)
 */

import * as fs from 'fs';
import * as path from 'path';

export interface Checkpoint {
  name: string;
  logs: Array<{ level: 'info' | 'pass' | 'fail' | 'warn'; message: string; timestamp: Date; data?: any }>;
  status: 'pending' | 'passed' | 'failed';
  startTime: Date;
  endTime?: Date;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  checkpoints: Checkpoint[];
  screenshots: string[];
  errors: string[];
}

export class HealthCheckReporter {
  private results: Map<string, TestResult> = new Map();
  private currentTest: string | null = null;
  private metrics: Record<string, any> = {};
  private outputDir = 'test-results/health-check';

  constructor() {
    // Criar diretório de saída
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async startTest(testName: string): Promise<void> {
    this.currentTest = testName;
    this.results.set(testName, {
      name: testName,
      status: 'skipped',
      duration: 0,
      checkpoints: [],
      screenshots: [],
      errors: [],
    });
  }

  async endTest(testName: string, status: 'passed' | 'failed' | 'skipped'): Promise<void> {
    const result = this.results.get(testName);
    if (result) {
      result.status = status;
      
      // Calcular duração total
      const totalDuration = result.checkpoints.reduce((sum, cp) => {
        if (cp.endTime) {
          return sum + (cp.endTime.getTime() - cp.startTime.getTime());
        }
        return sum;
      }, 0);
      result.duration = totalDuration;
    }
    this.currentTest = null;
  }

  createCheckpoint(name: string): CheckpointLogger {
    if (!this.currentTest) {
      throw new Error('No active test');
    }

    const checkpoint: Checkpoint = {
      name,
      logs: [],
      status: 'pending',
      startTime: new Date(),
    };

    const result = this.results.get(this.currentTest);
    if (result) {
      result.checkpoints.push(checkpoint);
    }

    return new CheckpointLogger(checkpoint);
  }

  async addScreenshot(testName: string, screenshot: Buffer): Promise<void> {
    const filename = `${testName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    
    fs.writeFileSync(filepath, screenshot);
    
    const result = this.results.get(testName);
    if (result) {
      result.screenshots.push(filepath);
    }
  }

  async addMetrics(metrics: Record<string, any>): Promise<void> {
    this.metrics = { ...this.metrics, ...metrics };
  }

  async generateReport(): Promise<string> {
    const totalTests = this.results.size;
    const passed = Array.from(this.results.values()).filter(r => r.status === 'passed').length;
    const failed = Array.from(this.results.values()).filter(r => r.status === 'failed').length;
    const skipped = Array.from(this.results.values()).filter(r => r.status === 'skipped').length;

    let report = '\n';
    report += `📊 RESUMO GERAL\n`;
    report += `   Total: ${totalTests} testes\n`;
    report += `   ✅ Passou: ${passed}\n`;
    report += `   ❌ Falhou: ${failed}\n`;
    report += `   ⏭️  Pulado: ${skipped}\n\n`;

    if (Object.keys(this.metrics).length > 0) {
      report += `⚡ MÉTRICAS DE PERFORMANCE\n`;
      for (const [key, value] of Object.entries(this.metrics)) {
        report += `   ${key}: ${value}ms\n`;
      }
      report += '\n';
    }

    report += `📋 DETALHES POR TESTE\n\n`;

    for (const [testName, result] of this.results.entries()) {
      const icon = result.status === 'passed' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
      report += `${icon} ${testName}\n`;
      report += `   Status: ${result.status.toUpperCase()}\n`;
      report += `   Duração: ${result.duration}ms\n`;

      if (result.checkpoints.length > 0) {
        report += `   Checkpoints:\n`;
        for (const checkpoint of result.checkpoints) {
          const cpIcon = checkpoint.status === 'passed' ? '✅' : checkpoint.status === 'failed' ? '❌' : '⏸️';
          report += `      ${cpIcon} ${checkpoint.name}\n`;
          
          for (const log of checkpoint.logs) {
            const logIcon = log.level === 'pass' ? '✓' : log.level === 'fail' ? '✗' : log.level === 'warn' ? '⚠' : 'ℹ';
            report += `         ${logIcon} ${log.message}\n`;
            
            if (log.data) {
              report += `            Dados: ${JSON.stringify(log.data, null, 2).replace(/\n/g, '\n            ')}\n`;
            }
          }
        }
      }

      if (result.screenshots.length > 0) {
        report += `   Screenshots: ${result.screenshots.length}\n`;
        result.screenshots.forEach(path => {
          report += `      📸 ${path}\n`;
        });
      }

      report += '\n';
    }

    // Gerar relatório HTML
    await this.generateHTMLReport();

    // Gerar relatório JSON
    await this.generateJSONReport();

    return report;
  }

  private async generateHTMLReport(): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistema Antifalhas - Relatório de Testes</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      padding: 2rem;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #67e8f9; margin-bottom: 2rem; font-size: 2.5rem; }
    .summary { 
      background: #1e293b;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .summary-item {
      background: #334155;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }
    .summary-item h3 { color: #94a3b8; font-size: 0.875rem; margin-bottom: 0.5rem; }
    .summary-item p { font-size: 2rem; font-weight: bold; }
    .passed { color: #10b981; }
    .failed { color: #ef4444; }
    .skipped { color: #f59e0b; }
    .test-card {
      background: #1e293b;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1rem;
      border-left: 4px solid #475569;
    }
    .test-card.passed { border-left-color: #10b981; }
    .test-card.failed { border-left-color: #ef4444; }
    .test-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .test-title { font-size: 1.25rem; font-weight: 600; }
    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .badge.passed { background: #10b981; color: white; }
    .badge.failed { background: #ef4444; color: white; }
    .checkpoint {
      background: #334155;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }
    .checkpoint-name { font-weight: 600; margin-bottom: 0.5rem; color: #67e8f9; }
    .log-entry {
      padding: 0.5rem;
      margin: 0.25rem 0;
      border-radius: 4px;
      font-size: 0.875rem;
      background: #1e293b;
    }
    .log-entry.pass { border-left: 3px solid #10b981; }
    .log-entry.fail { border-left: 3px solid #ef4444; }
    .log-entry.warn { border-left: 3px solid #f59e0b; }
    .log-entry.info { border-left: 3px solid #3b82f6; }
    .screenshots { margin-top: 1rem; }
    .screenshots img { max-width: 200px; margin: 0.5rem; border-radius: 8px; }
    .metrics { 
      background: #1e293b;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }
    .metrics h2 { color: #67e8f9; margin-bottom: 1rem; }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }
    .metric-item {
      background: #334155;
      padding: 1rem;
      border-radius: 8px;
    }
    .metric-label { color: #94a3b8; font-size: 0.875rem; }
    .metric-value { font-size: 1.5rem; font-weight: bold; color: #67e8f9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏥 Sistema Antifalhas - Relatório de Testes</h1>
    
    <div class="summary">
      <div class="summary-item">
        <h3>Total de Testes</h3>
        <p>${this.results.size}</p>
      </div>
      <div class="summary-item">
        <h3>Passou</h3>
        <p class="passed">${Array.from(this.results.values()).filter(r => r.status === 'passed').length}</p>
      </div>
      <div class="summary-item">
        <h3>Falhou</h3>
        <p class="failed">${Array.from(this.results.values()).filter(r => r.status === 'failed').length}</p>
      </div>
      <div class="summary-item">
        <h3>Pulado</h3>
        <p class="skipped">${Array.from(this.results.values()).filter(r => r.status === 'skipped').length}</p>
      </div>
    </div>

    ${Object.keys(this.metrics).length > 0 ? `
    <div class="metrics">
      <h2>⚡ Métricas de Performance</h2>
      <div class="metric-grid">
        ${Object.entries(this.metrics).map(([key, value]) => `
          <div class="metric-item">
            <div class="metric-label">${key}</div>
            <div class="metric-value">${value}ms</div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <h2 style="color: #67e8f9; margin-bottom: 1rem;">📋 Detalhes dos Testes</h2>
    
    ${Array.from(this.results.entries()).map(([name, result]) => `
      <div class="test-card ${result.status}">
        <div class="test-header">
          <div class="test-title">${name}</div>
          <span class="badge ${result.status}">${result.status.toUpperCase()}</span>
        </div>
        <div style="color: #94a3b8; margin-bottom: 1rem;">Duração: ${result.duration}ms</div>
        
        ${result.checkpoints.map(cp => `
          <div class="checkpoint">
            <div class="checkpoint-name">${cp.name}</div>
            ${cp.logs.map(log => `
              <div class="log-entry ${log.level}">
                ${log.level === 'pass' ? '✓' : log.level === 'fail' ? '✗' : log.level === 'warn' ? '⚠' : 'ℹ'} 
                ${log.message}
                ${log.data ? `<pre style="margin-top: 0.5rem; color: #64748b;">${JSON.stringify(log.data, null, 2)}</pre>` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
        
        ${result.screenshots.length > 0 ? `
          <div class="screenshots">
            <strong>Screenshots:</strong><br>
            ${result.screenshots.map(path => `
              <img src="${path}" alt="Screenshot" />
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('')}
    
    <div style="text-align: center; margin-top: 3rem; color: #64748b;">
      <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      <p>Financy Life v3.12.0 - Sistema Antifalhas TQM</p>
    </div>
  </div>
</body>
</html>
    `;

    fs.writeFileSync(path.join(this.outputDir, 'report.html'), html);
    console.log(`\n📄 Relatório HTML gerado: ${path.join(this.outputDir, 'report.html')}`);
  }

  private async generateJSONReport(): Promise<void> {
    const json = {
      summary: {
        total: this.results.size,
        passed: Array.from(this.results.values()).filter(r => r.status === 'passed').length,
        failed: Array.from(this.results.values()).filter(r => r.status === 'failed').length,
        skipped: Array.from(this.results.values()).filter(r => r.status === 'skipped').length,
      },
      metrics: this.metrics,
      tests: Array.from(this.results.entries()).map(([name, result]) => ({
        name,
        status: result.status,
        duration: result.duration,
        checkpoints: result.checkpoints.map(cp => ({
          name: cp.name,
          status: cp.status,
          logs: cp.logs,
          duration: cp.endTime ? cp.endTime.getTime() - cp.startTime.getTime() : 0,
        })),
        screenshots: result.screenshots,
        errors: result.errors,
      })),
      generated: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(this.outputDir, 'report.json'),
      JSON.stringify(json, null, 2)
    );
    console.log(`📄 Relatório JSON gerado: ${path.join(this.outputDir, 'report.json')}`);
  }
}

export class CheckpointLogger {
  constructor(private checkpoint: Checkpoint) {}

  log(message: string, data?: any): void {
    this.checkpoint.logs.push({
      level: 'info',
      message,
      timestamp: new Date(),
      data,
    });
  }

  pass(message: string, data?: any): void {
    this.checkpoint.logs.push({
      level: 'pass',
      message,
      timestamp: new Date(),
      data,
    });
    if (this.checkpoint.status === 'pending') {
      this.checkpoint.status = 'passed';
    }
    this.checkpoint.endTime = new Date();
  }

  fail(message: string, data?: any): void {
    this.checkpoint.logs.push({
      level: 'fail',
      message,
      timestamp: new Date(),
      data,
    });
    this.checkpoint.status = 'failed';
    this.checkpoint.endTime = new Date();
  }

  warn(message: string, data?: any): void {
    this.checkpoint.logs.push({
      level: 'warn',
      message,
      timestamp: new Date(),
      data,
    });
  }
}
