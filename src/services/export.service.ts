/**
 * Export Service - Sistema de Exportação de Dados
 * v3.10.0 - Suporta CSV, Excel, JSON e PDF
 */

import Logger from './logger.service';
import StorageService from './storage.service';
import type {
  Transaction,
  ExportOptions,
  ExportResult,
  ExportFormat,
  ExportDataType,
} from '../types/financial.types';

class ExportService {
  /**
   * Exporta dados no formato especificado
   */
  async export(options: ExportOptions): Promise<ExportResult> {
    try {
      Logger.info('Iniciando exportação', options, 'EXPORT');

      // Coleta dados conforme tipo solicitado
      const data = await this.collectData(options);

      if (!data || (Array.isArray(data) && data.length === 0)) {
        return {
          success: false,
          fileName: '',
          recordCount: 0,
          error: 'Nenhum dado encontrado para exportar',
        };
      }

      // Exporta no formato solicitado
      let result: ExportResult;

      switch (options.format) {
        case 'csv':
          result = this.exportToCSV(data, options);
          break;
        case 'json':
          result = this.exportToJSON(data, options);
          break;
        case 'excel':
          result = this.exportToExcel(data, options);
          break;
        case 'pdf':
          result = this.exportToPDF(data, options);
          break;
        default:
          throw new Error(`Formato não suportado: ${options.format}`);
      }

      Logger.info('Exportação concluída', result, 'EXPORT');
      return result;
    } catch (error) {
      Logger.error('Erro ao exportar dados', error as Error, 'EXPORT');
      return {
        success: false,
        fileName: '',
        recordCount: 0,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Coleta dados para exportação
   */
  private async collectData(options: ExportOptions): Promise<any[]> {
    const { dataType, dateRange } = options;

    switch (dataType) {
      case 'transactions':
        return await this.getTransactions(dateRange);
      case 'accounts':
        return await this.getAccounts();
      case 'budgets':
        return await this.getBudgets();
      case 'recurring':
        return await this.getRecurringTransactions();
      case 'all':
        return await this.getAllData(dateRange);
      default:
        return [];
    }
  }

  /**
   * Obtém transações (com filtro de data opcional)
   */
  private async getTransactions(dateRange?: { start: string; end: string }): Promise<Transaction[]> {
    const transactions = (await StorageService.load<Transaction[]>('transactions')) || [];

    if (!dateRange) {
      return transactions;
    }

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  }

  /**
   * Obtém contas
   */
  private async getAccounts(): Promise<any[]> {
    return (await StorageService.load<any[]>('accounts')) || [];
  }

  /**
   * Obtém orçamentos
   */
  private async getBudgets(): Promise<any[]> {
    return (await StorageService.load<any[]>('budgets')) || [];
  }

  /**
   * Obtém transações recorrentes
   */
  private async getRecurringTransactions(): Promise<any[]> {
    return (await StorageService.load<any[]>('recurring-transactions')) || [];
  }

  /**
   * Obtém todos os dados
   */
  private async getAllData(dateRange?: { start: string; end: string }): Promise<any> {
    return {
      transactions: await this.getTransactions(dateRange),
      accounts: await this.getAccounts(),
      budgets: await this.getBudgets(),
      recurring: await this.getRecurringTransactions(),
      exportDate: new Date().toISOString(),
    };
  }

  /**
   * Exporta para CSV
   */
  private exportToCSV(data: any[], options: ExportOptions): ExportResult {
    try {
      const fileName = options.fileName || `export-${Date.now()}.csv`;

      // Converte para CSV
      let csv = '';

      if (Array.isArray(data) && data.length > 0) {
        // Headers
        const headers = Object.keys(data[0]);
        csv += headers.join(',') + '\n';

        // Rows
        data.forEach((row) => {
          const values = headers.map((header) => {
            const value = row[header];
            // Escapa vírgulas e aspas
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
          });
          csv += values.join(',') + '\n';
        });
      }

      // Cria blob e faz download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      this.downloadBlob(blob, fileName);

      return {
        success: true,
        fileName,
        fileSize: blob.size,
        recordCount: data.length,
      };
    } catch (error) {
      throw new Error(`Erro ao exportar CSV: ${(error as Error).message}`);
    }
  }

  /**
   * Exporta para JSON
   */
  private exportToJSON(data: any, options: ExportOptions): ExportResult {
    try {
      const fileName = options.fileName || `export-${Date.now()}.json`;

      const json = JSON.stringify(
        {
          data,
          metadata: options.includeMetadata
            ? {
                exportDate: new Date().toISOString(),
                dataType: options.dataType,
                dateRange: options.dateRange,
              }
            : undefined,
        },
        null,
        2
      );

      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      this.downloadBlob(blob, fileName);

      const recordCount = Array.isArray(data) ? data.length : Object.keys(data).length;

      return {
        success: true,
        fileName,
        fileSize: blob.size,
        recordCount,
      };
    } catch (error) {
      throw new Error(`Erro ao exportar JSON: ${(error as Error).message}`);
    }
  }

  /**
   * Exporta para Excel (formato CSV compatível)
   */
  private exportToExcel(data: any[], options: ExportOptions): ExportResult {
    try {
      const fileName = options.fileName || `export-${Date.now()}.xlsx`;

      // Por enquanto, usa CSV com extensão .xlsx
      // Em produção, usar biblioteca como xlsx ou exceljs
      const csvResult = this.exportToCSV(data, { ...options, fileName });

      return {
        ...csvResult,
        fileName,
      };
    } catch (error) {
      throw new Error(`Erro ao exportar Excel: ${(error as Error).message}`);
    }
  }

  /**
   * Exporta para PDF (HTML básico)
   */
  private exportToPDF(data: any, options: ExportOptions): ExportResult {
    try {
      const fileName = options.fileName || `export-${Date.now()}.pdf`;

      // Cria HTML para impressão
      let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Financify Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Financify - Relatório Financeiro</h1>
  <p><strong>Data de Exportação:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
`;

      if (Array.isArray(data) && data.length > 0) {
        html += '<table><thead><tr>';

        // Headers
        const headers = Object.keys(data[0]);
        headers.forEach((header) => {
          html += `<th>${header}</th>`;
        });
        html += '</tr></thead><tbody>';

        // Rows
        data.forEach((row) => {
          html += '<tr>';
          headers.forEach((header) => {
            html += `<td>${row[header] ?? ''}</td>`;
          });
          html += '</tr>';
        });

        html += '</tbody></table>';
      }

      html += '</body></html>';

      // Abre em nova janela para impressão/salvar como PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }

      const recordCount = Array.isArray(data) ? data.length : 0;

      return {
        success: true,
        fileName,
        recordCount,
      };
    } catch (error) {
      throw new Error(`Erro ao exportar PDF: ${(error as Error).message}`);
    }
  }

  /**
   * Faz download de blob
   */
  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Obtém formatos disponíveis
   */
  getAvailableFormats(): ExportFormat[] {
    return ['csv', 'json', 'excel', 'pdf'];
  }

  /**
   * Obtém tipos de dados disponíveis
   */
  getAvailableDataTypes(): ExportDataType[] {
    return ['transactions', 'accounts', 'budgets', 'recurring', 'all'];
  }
}

// Singleton
export default new ExportService();
