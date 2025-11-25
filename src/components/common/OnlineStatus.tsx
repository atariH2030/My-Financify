/**
 * Online Status Indicator
 * Componente que mostra status de conexão e operações pendentes
 */

import React, { useEffect, useState } from 'react';
import './OnlineStatus.css';

interface OnlineStatusProps {
  pendingOperations?: number;
  onSync?: () => void;
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({ 
  pendingOperations = 0, 
  onSync 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!onSync || !isOnline || syncing) return;

    setSyncing(true);
    try {
      await onSync();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className={`online-status ${isOnline ? 'online' : 'offline'}`}>
      <div className="status-indicator">
        <span className="status-dot"></span>
        <span className="status-text">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {pendingOperations > 0 && (
        <div className="pending-operations">
          <span className="pending-badge">{pendingOperations}</span>
          <span className="pending-text">operações pendentes</span>
          
          {isOnline && (
            <button
              className="sync-button"
              onClick={handleSync}
              disabled={syncing}
              title="Sincronizar operações pendentes"
            >
              {syncing ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt"></i>
                  <span>Sincronizar</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OnlineStatus;
