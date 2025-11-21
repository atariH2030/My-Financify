import React from 'react';
import Card from '../common/Card';
import type { WidgetConfig } from '../../types/financial.types';
import './Widgets.css';

interface BaseWidgetProps {
  config: WidgetConfig;
  onSettings?: () => void;
  onRemove?: () => void;
  isListView?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const BaseWidget: React.FC<BaseWidgetProps & { children: React.ReactNode }> = ({
  config,
  onSettings,
  onRemove,
  isListView = false,
  isExpanded = true,
  onToggleExpand,
  children,
}) => {
  const widgetClass = `widget widget-${config.size} widget-${config.type} ${isListView ? 'widget-list-mode' : ''}`;
  
  return (
    <Card className={widgetClass}>
      <div className="widget-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          {isListView && onToggleExpand && (
            <button 
              className="widget-expand-btn" 
              onClick={onToggleExpand}
              title={isExpanded ? 'Recolher' : 'Expandir'}
            >
              <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
            </button>
          )}
          <h3 className="widget-title">
            {config.title}
          </h3>
        </div>
        <div className="widget-actions">
          {onSettings && (
            <button className="widget-btn" onClick={onSettings} title="Configurações">
              <i className="fas fa-cog"></i>
            </button>
          )}
          {onRemove && (
            <button className="widget-btn" onClick={onRemove} title="Remover">
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="widget-content">
          {children}
        </div>
      )}
    </Card>
  );
};

export default BaseWidget;
