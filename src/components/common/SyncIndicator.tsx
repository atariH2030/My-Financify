/**
 * SyncIndicator - Indicador visual de sincronização
 * 
 * Mostra status online/offline e progresso de sync
 * 
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { syncService, SyncStatus, SyncResult } from '../../services/sync.service';
import { useToast } from '../common/Toast';
import './SyncIndicator.css';

const SyncIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncResults, setLastSyncResults] = useState<SyncResult[] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Listener de status de sync
    const handleSyncStatus = (status: SyncStatus, results?: SyncResult[]) => {
      setSyncStatus(status);
      
      if (status === 'success' && results) {
        setLastSyncResults(results);
        const totalSynced = results.reduce((sum, r) => sum + r.syncedCount, 0);
        
        if (totalSynced > 0) {
          showToast(`✅ ${totalSynced} item(s) sincronizado(s)`, 'success');
        }
      }
      
      if (status === 'error') {
        showToast('❌ Erro na sincronização', 'error');
      }
    };

    // Listener de online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    syncService.addListener(handleSyncStatus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      syncService.removeListener(handleSyncStatus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  const handleManualSync = async () => {
    if (!isOnline) {
      showToast('📡 Você está offline', 'warning');
      return;
    }

    const results = await syncService.forceSync();
    setLastSyncResults(results);
  };

  const getStatusIcon = () => {
    if (!isOnline) return '📡';
    if (syncStatus === 'syncing') return '🔄';
    if (syncStatus === 'success') return '✅';
    if (syncStatus === 'error') return '⚠️';
    return '🌐';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncStatus === 'syncing') return 'Sincronizando...';
    if (syncStatus === 'success') return 'Sincronizado';
    if (syncStatus === 'error') return 'Erro no sync';
    return 'Online';
  };

  const getStatusClass = () => {
    if (!isOnline) return 'offline';
    if (syncStatus === 'syncing') return 'syncing';
    if (syncStatus === 'success') return 'success';
    if (syncStatus === 'error') return 'error';
    return 'online';
  };

  return (
    <div className="sync-indicator">
      <button
        className={`sync-status ${getStatusClass()}`}
        onClick={() => setShowDetails(!showDetails)}
        title={getStatusText()}
      >
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{getStatusText()}</span>
        {syncStatus === 'syncing' && (
          <span className="spinner"></span>
        )}
      </button>

      {showDetails && (
        <div className="sync-details">
          <div className="sync-details-header">
            <h4>Status de Sincronização</h4>
            <button onClick={() => setShowDetails(false)}>✕</button>
          </div>

          <div className="sync-info">
            <div className="info-row">
              <span>Status da Conexão:</span>
              <span className={isOnline ? 'online' : 'offline'}>
                {isOnline ? '🌐 Online' : '📡 Offline'}
              </span>
            </div>
            <div className="info-row">
              <span>Auto-Sync:</span>
              <span className="online">✅ Ativo</span>
            </div>
          </div>

          {lastSyncResults && lastSyncResults.length > 0 && (
            <div className="sync-results">
              <h5>Último Sync:</h5>
              {lastSyncResults.map((result, index) => (
                <div key={index} className="result-row">
                  <span>{result.service}:</span>
                  <span className={result.success ? 'success' : 'error'}>
                    {result.success
                      ? `✅ ${result.syncedCount} item(s)`
                      : `❌ ${result.error}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            className="manual-sync-btn"
            onClick={handleManualSync}
            disabled={!isOnline || syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? '🔄 Sincronizando...' : '🔄 Sincronizar Agora'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SyncIndicator;
