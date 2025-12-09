/**
 * Loading Spinner Component
 * Spinner de carregamento genérico
 * 
 * @version 3.15.0
 * @author DEV - Rickson
 */

import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <p className="loading-text">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
