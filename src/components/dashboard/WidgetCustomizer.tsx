import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetLayoutService, Widget } from '../../services/widget-layout.service';
import './WidgetCustomizer.css';

/**
 * WidgetCustomizer - Sprint 6.1
 * 
 * Modal para customizar widgets do dashboard:
 * - Habilitar/desabilitar widgets
 * - Reordenar via drag & drop
 * - Resetar para padrão
 * - Preview visual
 */

interface WidgetCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

const WidgetCustomizer: React.FC<WidgetCustomizerProps> = ({ isOpen, onClose, onApply }) => {
  const widgetService = WidgetLayoutService.getInstance();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWidgets(widgetService.getAllWidgets());
      setHasChanges(false);
    }
  }, [isOpen, widgetService]);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newWidgets = [...widgets];
    const draggedWidget = newWidgets[draggedIndex];
    
    newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(index, 0, draggedWidget);
    
    // Atualizar orders
    newWidgets.forEach((widget, idx) => {
      widget.order = idx;
    });

    setWidgets(newWidgets);
    setDraggedIndex(index);
    setHasChanges(true);
  }, [draggedIndex, widgets]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleToggle = useCallback((widgetId: Widget['id']) => {
    const newWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    setWidgets(newWidgets);
    setHasChanges(true);
  }, [widgets]);

  const handleReset = useCallback(() => {
    if (confirm('Resetar widgets para o padrão? Todas as customizações serão perdidas.')) {
      widgetService.resetToDefault();
      setWidgets(widgetService.getAllWidgets());
      setHasChanges(true);
    }
  }, [widgetService]);

  const handleApply = useCallback(() => {
    const layout = {
      widgets,
      lastUpdated: new Date(),
    };
    widgetService.saveLayout(layout);
    onApply();
    onClose();
  }, [widgets, widgetService, onApply, onClose]);

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      if (confirm('Descartar alterações?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  if (!isOpen) return null;

  const enabledCount = useMemo(() => widgets.filter((w) => w.enabled).length, [widgets]);

  return (
    <AnimatePresence>
      <div className="widget-customizer-overlay" onClick={handleCancel}>
        <motion.div
          className="widget-customizer-modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="customizer-header">
            <h2>
              <i className="fas fa-th-large"></i>
              Personalizar Widgets
            </h2>
            <button className="close-btn" onClick={handleCancel}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="customizer-info">
            <p>
              <i className="fas fa-info-circle"></i>
              Arraste os widgets para reordená-los. Clique no switch para habilitar/desabilitar.
            </p>
            <div className="widget-count">
              <span className="badge">{enabledCount}/{widgets.length}</span>
              <span>widgets ativos</span>
            </div>
          </div>

          <div className="widgets-list">
            {widgets.map((widget, index) => (
              <div
                key={widget.id}
                className={`widget-item ${!widget.enabled ? 'disabled' : ''} ${
                  draggedIndex === index ? 'dragging' : ''
                }`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="widget-drag-handle">
                  <i className="fas fa-grip-vertical"></i>
                  <span className="widget-order">#{index + 1}</span>
                </div>

                <div className="widget-info">
                  <i className={widget.icon}></i>
                  <div className="widget-details">
                    <h4>{widget.title}</h4>
                    <span className={`size-badge size-${widget.size}`}>
                      {widget.size === 'small' && 'Pequeno'}
                      {widget.size === 'medium' && 'Médio'}
                      {widget.size === 'large' && 'Grande'}
                    </span>
                  </div>
                </div>

                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={widget.enabled}
                    onChange={() => handleToggle(widget.id)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>

          <div className="customizer-footer">
            <button className="btn btn-secondary" onClick={handleReset}>
              <i className="fas fa-undo"></i>
              Resetar Padrão
            </button>
            <div className="footer-actions">
              <button className="btn btn-ghost" onClick={handleCancel}>
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleApply}
                disabled={!hasChanges}
              >
                <i className="fas fa-check"></i>
                Aplicar Mudanças
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WidgetCustomizer;
