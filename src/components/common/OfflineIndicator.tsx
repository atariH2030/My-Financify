/**
 * @file OfflineIndicator.tsx
 * @description Indicador visual de status de conexão com queue stats
 * @version 3.13.0
 * @author DEV - Rickson (TQM)
 */

import React, { useEffect, useState } from 'react';
import OfflineQueueService from '../../services/offline-queue.service';
import './OfflineIndicator.css';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueStats, setQueueStats] = useState({ pending: 0, failed: 0 });

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      updateQueueStats();
    };

    const updateQueueStats = async () => {
      const stats = await OfflineQueueService.getQueueStats();
      setQueueStats({ pending: stats.pending, failed: stats.failed });
    };

    // Update on online/offline events
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Update queue stats periodically
    const interval = setInterval(updateQueueStats, 5000);

    // Initial update
    updateQueueStats();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && queueStats.pending === 0 && queueStats.failed === 0) {
    return null; // Não mostra nada quando tudo está ok
  }

  return (
    <div className={`offline-indicator ${!isOnline ? 'offline' : 'syncing'}`}>
      <div className="offline-indicator-content">
        <i className={`fas ${!isOnline ? 'fa-wifi-slash' : 'fa-sync-alt fa-spin'}`} />
        <span className="offline-indicator-text">
          {!isOnline ? (
            'Sem conexão - Operações serão sincronizadas'
          ) : queueStats.pending > 0 ? (
            `Sincronizando ${queueStats.pending} operação${queueStats.pending > 1 ? 'ões' : ''}...`
          ) : queueStats.failed > 0 ? (
            `${queueStats.failed} operação${queueStats.failed > 1 ? 'ões' : ''} falharam`
          ) : null}
        </span>
        {queueStats.failed > 0 && (
          <button
            className="retry-button"
            onClick={async () => {
              const operations = await OfflineQueueService.getPendingOperations();
              operations.forEach(async (op) => {
                if (op.status === 'failed') {
                  await OfflineQueueService.retryOperation(op.id);
                }
              });
            }}
          >
            <i className="fas fa-redo" /> Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
