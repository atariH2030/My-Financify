/**
 * Export Modal - Modal para exportação de dados
 * v3.10.0 - Sistema de Exportação
 */

import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ExportService from '../../services/export.service';
import type { 
  ExportFormat, 
  ExportDataType, 
  ExportOptions 
} from '../../types/financial.types';
import './ExportModal.css';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [dataType, setDataType] = useState<ExportDataType>('transactions');
  const [useFilter, setUseFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setResult(null);

      const options: ExportOptions = {
        format,
        dataType,
        includeMetadata,
        dateRange: useFilter && startDate && endDate 
          ? { start: startDate, end: endDate }
          : undefined,
      };

      const exportResult = await ExportService.export(options);

      if (exportResult.success) {
        setResult(`✅ Exportado com sucesso! ${exportResult.recordCount} registros em ${exportResult.fileName}`);
        
        // Fecha modal após 2 segundos
        setTimeout(() => {
          onClose();
          setResult(null);
        }, 2000);
      } else {
        setResult(`❌ Erro: ${exportResult.error}`);
      }
    } catch (error) {
      setResult(`❌ Erro ao exportar: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const formatLabels: Record<ExportFormat, string> = {
    csv: 'CSV (Excel compatível)',
    excel: 'Excel (.xlsx)',
    json: 'JSON (Desenvolvedores)',
    pdf: 'PDF (Impressão)',
  };

  const dataTypeLabels: Record<ExportDataType, string> = {
    transactions: 'Transações',
    accounts: 'Contas',
    budgets: 'Orçamentos',
    recurring: 'Recorrentes',
    all: 'Todos os Dados',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exportar Dados">
      <div className="export-modal">
        {/* Formato */}
        <div className="export-section">
          <label className="export-label">Formato de Exportação</label>
          <div className="export-options">
            {ExportService.getAvailableFormats().map((fmt) => (
              <button
                key={fmt}
                className={`export-option ${format === fmt ? 'active' : ''}`}
                onClick={() => setFormat(fmt)}
                disabled={isExporting}
              >
                <span className="option-icon">
                  {fmt === 'csv' && '📊'}
                  {fmt === 'excel' && '📈'}
                  {fmt === 'json' && '💾'}
                  {fmt === 'pdf' && '📄'}
                </span>
                <span className="option-label">{formatLabels[fmt]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tipo de dados */}
        <div className="export-section">
          <label className="export-label">Tipo de Dados</label>
          <select
            className="export-select"
            value={dataType}
            onChange={(e) => setDataType(e.target.value as ExportDataType)}
            disabled={isExporting}
          >
            {ExportService.getAvailableDataTypes().map((type) => (
              <option key={type} value={type}>
                {dataTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de data */}
        {dataType === 'transactions' && (
          <div className="export-section">
            <label className="export-checkbox">
              <input
                type="checkbox"
                checked={useFilter}
                onChange={(e) => setUseFilter(e.target.checked)}
                disabled={isExporting}
              />
              <span>Filtrar por período</span>
            </label>

            {useFilter && (
              <div className="date-range">
                <div className="date-input">
                  <label>Data Inicial</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isExporting}
                  />
                </div>
                <div className="date-input">
                  <label>Data Final</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isExporting}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadados */}
        {format === 'json' && (
          <div className="export-section">
            <label className="export-checkbox">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                disabled={isExporting}
              />
              <span>Incluir metadados (data de exportação, filtros, etc.)</span>
            </label>
          </div>
        )}

        {/* Resultado */}
        {result && (
          <div className={`export-result ${result.startsWith('✅') ? 'success' : 'error'}`}>
            {result}
          </div>
        )}

        {/* Ações */}
        <div className="export-actions">
          <Button variant="secondary" onClick={onClose} disabled={isExporting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting || (useFilter && (!startDate || !endDate))}
          >
            {isExporting ? 'Exportando...' : '📥 Exportar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;
