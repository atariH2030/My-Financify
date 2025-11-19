import React from 'react';
import Card from '../common/Card';
import type { WidgetConfig } from '../../types/financial.types';
import './Widgets.css';

interface BaseWidgetProps {
  config: WidgetConfig;
  onSettings?: () => void;
  onRemove?: () => void;
}

export const BaseWidget: React.FC<BaseWidgetProps & { children: React.ReactNode }> = ({
  config,
  onSettings,
  onRemove,
  children,
}) => {
  return (
    <Card className={`widget widget-${config.size} widget-${config.type}`}>
      <div className="widget-header">
        <h3 className="widget-title">
          {config.title}
        </h3>
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
      <div className="widget-content">
        {children}
      </div>
    </Card>
  );
};

export default BaseWidget;
