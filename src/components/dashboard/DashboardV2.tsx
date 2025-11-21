/**
 * @file DashboardV2.tsx
 * @description Dashboard moderno com widgets personalizáveis
 * @version 3.9.0 - Sistema de Widgets
 * @author DEV - Rickson (TQM)
 */

import React, { useState } from 'react';
import WidgetGrid from '../widgets/WidgetGrid';
import DashboardCustomizer from './DashboardCustomizer';
import './DashboardV2.css';

export const DashboardV2: React.FC = () => {
  const [showCustomizer, setShowCustomizer] = useState(false);

  return (
    <div className="dashboard-v2-container">
      <WidgetGrid onCustomize={() => setShowCustomizer(true)} />
      
      <DashboardCustomizer
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
      />
    </div>
  );
};

export default DashboardV2;
