/**
 * PDF Export Service
 * 
 * Service para geração de relatórios em PDF
 * Suporta múltiplos templates e customização
 * 
 * @author DEV
 * @version 1.0.0
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Logger } from './logger.service';

// Extend jsPDF type para suportar autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

/**
 * Tipos de relatórios disponíveis
 */
export type ReportType = 
  | 'transactions' 
  | 'budget-analysis' 
  | 'goals-progress' 
  | 'spending-by-category'
  | 'income-vs-expense'
  | 'custom';

/**
 * Configuração de exportação
 */
export interface PDFExportConfig {
  type: ReportType;
  title: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  data: any[];
  summary?: Record<string, string | number>;
  includeChart?: boolean;
  orientation?: 'portrait' | 'landscape';
  logo?: string;
}

/**
 * Dados para tabela
 */
export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

/**
 * Resultado da exportação
 */
export interface ExportResult {
  success: boolean;
  filename: string;
  size?: number;
  error?: string;
}

/**
 * PDF Export Service
 * Gera PDFs formatados com logo, cabeçalho e rodapé
 */
export class PDFExportService {
  private static instance: PDFExportService;
  private readonly logger = Logger;

  // Cores do tema (ISO 25010 - Usabilidade)
  private readonly colors = {
    primary: [103, 232, 249] as [number, number, number], // #67E8F9 (cyan-300)
    secondary: [34, 211, 238] as [number, number, number], // #22D3EE (cyan-400)
    text: [17, 24, 39] as [number, number, number], // #111827 (gray-900)
    textLight: [107, 114, 128] as [number, number, number], // #6B7280 (gray-500)
    background: [249, 250, 251] as [number, number, number], // #F9FAFB (gray-50)
    border: [229, 231, 235] as [number, number, number], // #E5E7EB (gray-200)
  };

  private constructor() {
    this.logger.info('PDFExportService', 'Initialized');
  }

  /**
   * Singleton instance
   */
  public static getInstance(): PDFExportService {
    if (!PDFExportService.instance) {
      PDFExportService.instance = new PDFExportService();
    }
    return PDFExportService.instance;
  }

  /**
   * Método estático público para exportar relatório de transações
   */
  public static async exportTransactionsReport(config: PDFExportConfig): Promise<ExportResult> {
    return PDFExportService.getInstance().exportReport(config);
  }

  /**
   * Método estático público para exportar análise de orçamento
   */
  public static async exportBudgetAnalysis(config: PDFExportConfig): Promise<ExportResult> {
    return PDFExportService.getInstance().exportReport(config);
  }

  /**
   * Método estático público para exportar progresso de metas
   */
  public static async exportGoalsProgress(config: PDFExportConfig): Promise<ExportResult> {
    return PDFExportService.getInstance().exportReport(config);
  }

  /**
   * Método estático público para exportar relatório customizado
   */
  public static async exportCustomReport(config: PDFExportConfig): Promise<ExportResult> {
    return PDFExportService.getInstance().exportReport(config);
  }

  /**
   * Exporta relatório para PDF
   */
  public async exportReport(config: PDFExportConfig): Promise<ExportResult> {
    try {
      this.logger.info('PDFExportService', `Exporting report: ${config.type}`);

      // Criar documento
      const doc = new jsPDF({
        orientation: config.orientation || 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Adicionar conteúdo baseado no tipo
      switch (config.type) {
        case 'transactions':
          this.generateTransactionsReport(doc, config);
          break;
        case 'budget-analysis':
          this.generateBudgetAnalysisReport(doc, config);
          break;
        case 'goals-progress':
          this.generateGoalsProgressReport(doc, config);
          break;
        case 'spending-by-category':
          this.generateSpendingByCategoryReport(doc, config);
          break;
        case 'income-vs-expense':
          this.generateIncomeVsExpenseReport(doc, config);
          break;
        case 'custom':
          this.generateCustomReport(doc, config);
          break;
      }

      // Gerar filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${config.type}_${timestamp}.pdf`;

      // Salvar arquivo
      doc.save(filename);

      this.logger.info('PDFExportService', `Report exported: ${filename}`);

      return {
        success: true,
        filename,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('PDFExportService', error instanceof Error ? error : new Error(errorMessage));
      return {
        success: false,
        filename: '',
        error: errorMessage,
      };
    }
  }

  /**
   * Adiciona cabeçalho padrão
   */
  private addHeader(
    doc: jsPDF,
    title: string,
    dateRange?: { start: Date; end: Date }
  ): void {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Logo/Marca (opcional)
    doc.setFontSize(20);
    doc.setTextColor(...this.colors.primary);
    doc.text('Financy Life', 15, 15);

    // Título do relatório
    doc.setFontSize(16);
    doc.setTextColor(...this.colors.text);
    doc.text(title, 15, 25);

    // Data/Período
    if (dateRange) {
      doc.setFontSize(10);
      doc.setTextColor(...this.colors.textLight);
      const dateStr = `${this.formatDate(dateRange.start)} - ${this.formatDate(dateRange.end)}`;
      doc.text(dateStr, 15, 32);
    }

    // Data de geração
    doc.setFontSize(8);
    doc.setTextColor(...this.colors.textLight);
    const generatedAt = `Gerado em: ${this.formatDate(new Date())}`;
    doc.text(generatedAt, pageWidth - 15, 15, { align: 'right' });

    // Linha separadora
    doc.setDrawColor(...this.colors.border);
    doc.line(15, 35, pageWidth - 15, 35);
  }

  /**
   * Adiciona rodapé com número de página
   */
  private addFooter(doc: jsPDF, pageNumber: number): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(8);
    doc.setTextColor(...this.colors.textLight);
    doc.text(
      `Página ${pageNumber}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Marca d'água
    doc.text('Financy Life', 15, pageHeight - 10);
  }

  /**
   * Relatório de Transações
   */
  private generateTransactionsReport(doc: jsPDF, config: PDFExportConfig): void {
    this.addHeader(doc, config.title, config.dateRange);

    // Resumo
    if (config.summary) {
      let yPos = 40;
      doc.setFontSize(10);
      Object.entries(config.summary).forEach(([key, value]) => {
        doc.setTextColor(...this.colors.text);
        doc.text(`${key}:`, 15, yPos);
        doc.setTextColor(...this.colors.primary);
        doc.text(String(value), 80, yPos);
        yPos += 6;
      });
    }

    // Tabela de transações
    const tableData = this.prepareTransactionsTable(config.data);
    autoTable(doc, {
      head: [tableData.headers],
      body: tableData.rows,
      startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 65,
      theme: 'striped',
      headStyles: {
        fillColor: this.colors.primary,
        textColor: this.colors.text,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: this.colors.background,
      },
    });

    this.addFooter(doc, 1);
  }

  /**
   * Relatório de Análise de Orçamento
   */
  private generateBudgetAnalysisReport(doc: jsPDF, config: PDFExportConfig): void {
    this.addHeader(doc, config.title, config.dateRange);

    // Resumo do orçamento
    let yPos = 45;
    doc.setFontSize(12);
    doc.setTextColor(...this.colors.text);
    doc.text('Resumo do Orçamento', 15, yPos);
    yPos += 10;

    if (config.summary) {
      doc.setFontSize(10);
      Object.entries(config.summary).forEach(([key, value]) => {
        doc.setTextColor(...this.colors.text);
        doc.text(`${key}:`, 15, yPos);
        doc.setTextColor(...this.colors.primary);
        doc.text(String(value), 80, yPos);
        yPos += 6;
      });
    }

    // Tabela de categorias
    const tableData = this.prepareBudgetTable(config.data);
    autoTable(doc, {
      head: [tableData.headers],
      body: tableData.rows,
      startY: yPos + 5,
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.primary,
        textColor: this.colors.text,
      },
      styles: {
        fontSize: 9,
      },
    });

    this.addFooter(doc, 1);
  }

  /**
   * Relatório de Progresso de Metas
   */
  private generateGoalsProgressReport(doc: jsPDF, config: PDFExportConfig): void {
    this.addHeader(doc, config.title, config.dateRange);

    const tableData = this.prepareGoalsTable(config.data);
    autoTable(doc, {
      head: [tableData.headers],
      body: tableData.rows,
      startY: 45,
      theme: 'striped',
      headStyles: {
        fillColor: this.colors.primary,
        textColor: this.colors.text,
      },
      styles: {
        fontSize: 9,
      },
      columnStyles: {
        3: { cellWidth: 30 }, // Progresso
      },
    });

    this.addFooter(doc, 1);
  }

  /**
   * Relatório de Gastos por Categoria
   */
  private generateSpendingByCategoryReport(doc: jsPDF, config: PDFExportConfig): void {
    this.addHeader(doc, config.title, config.dateRange);

    const tableData = this.prepareSpendingTable(config.data);
    autoTable(doc, {
      head: [tableData.headers],
      body: tableData.rows,
      startY: 45,
      theme: 'grid',
      headStyles: {
        fillColor: this.colors.primary,
        textColor: this.colors.text,
      },
      styles: {
        fontSize: 10,
      },
    });

    this.addFooter(doc, 1);
  }

  /**
   * Relatório de Receitas vs Despesas
   */
  private generateIncomeVsExpenseReport(doc: jsPDF, config: PDFExportConfig): void {
    this.addHeader(doc, config.title, config.dateRange);

    // Resumo
    if (config.summary) {
      let yPos = 45;
      doc.setFontSize(12);
      doc.setTextColor(...this.colors.text);
      doc.text('Resumo Financeiro', 15, yPos);
      yPos += 10;

      doc.setFontSize(10);
      Object.entries(config.summary).forEach(([key, value]) => {
        doc.setTextColor(...this.colors.text);
        doc.text(`${key}:`, 15, yPos);
        doc.setTextColor(...this.colors.primary);
        doc.text(String(value), 80, yPos);
        yPos += 6;
      });
    }

    // Tabela mensal
    const tableData = this.prepareIncomeExpenseTable(config.data);
    autoTable(doc, {
      head: [tableData.headers],
      body: tableData.rows,
      startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : 85,
      theme: 'striped',
      headStyles: {
        fillColor: this.colors.primary,
        textColor: this.colors.text,
      },
      styles: {
        fontSize: 9,
      },
    });

    this.addFooter(doc, 1);
  }

  /**
   * Relatório customizado
   */
  private generateCustomReport(doc: jsPDF, config: PDFExportConfig): void {
    this.addHeader(doc, config.title, config.dateRange);

    // Tabela genérica
    if (config.data && config.data.length > 0) {
      const headers = Object.keys(config.data[0]);
      const rows = config.data.map(item => 
        headers.map(key => String(item[key]))
      );

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 45,
        theme: 'grid',
        headStyles: {
          fillColor: this.colors.primary,
          textColor: this.colors.text,
        },
      });
    }

    this.addFooter(doc, 1);
  }

  /**
   * Prepara dados de transações para tabela
   */
  private prepareTransactionsTable(data: any[]): TableData {
    return {
      headers: ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'],
      rows: data.map(t => [
        this.formatDate(new Date(t.date)),
        t.description,
        t.category,
        t.type === 'income' ? 'Receita' : 'Despesa',
        this.formatCurrency(t.amount),
      ]),
    };
  }

  /**
   * Prepara dados de orçamento para tabela
   */
  private prepareBudgetTable(data: any[]): TableData {
    return {
      headers: ['Categoria', 'Orçado', 'Gasto', 'Restante', '% Usado'],
      rows: data.map(b => [
        b.category,
        this.formatCurrency(b.budgeted),
        this.formatCurrency(b.spent),
        this.formatCurrency(b.remaining),
        `${b.percentage}%`,
      ]),
    };
  }

  /**
   * Prepara dados de metas para tabela
   */
  private prepareGoalsTable(data: any[]): TableData {
    return {
      headers: ['Meta', 'Valor Alvo', 'Economizado', 'Progresso', 'Prazo'],
      rows: data.map(g => [
        g.name,
        this.formatCurrency(g.target),
        this.formatCurrency(g.saved),
        `${Math.round((g.saved / g.target) * 100)}%`,
        this.formatDate(new Date(g.deadline)),
      ]),
    };
  }

  /**
   * Prepara dados de gastos para tabela
   */
  private prepareSpendingTable(data: any[]): TableData {
    return {
      headers: ['Categoria', 'Total Gasto', '% do Total'],
      rows: data.map(s => [
        s.category,
        this.formatCurrency(s.amount),
        `${s.percentage}%`,
      ]),
    };
  }

  /**
   * Prepara dados de receita/despesa para tabela
   */
  private prepareIncomeExpenseTable(data: any[]): TableData {
    return {
      headers: ['Mês', 'Receitas', 'Despesas', 'Saldo'],
      rows: data.map(m => [
        m.month,
        this.formatCurrency(m.income),
        this.formatCurrency(m.expense),
        this.formatCurrency(m.balance),
      ]),
    };
  }

  /**
   * Formata data no padrão local
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  /**
   * Formata moeda no padrão BRL
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}

// Export singleton
export default PDFExportService.getInstance();
