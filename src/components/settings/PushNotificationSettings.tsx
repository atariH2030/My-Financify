import React, { useState, useEffect } from 'react';
import { PushNotificationService, NotificationPermission } from '../../services/push-notification.service';
import './PushNotificationSettings.css';

/**
 * PushNotificationSettings - Sprint 5.3
 * 
 * Componente para gerenciar configurações de Push Notifications
 * - Solicitar/verificar permissões
 * - Testar notificações
 * - Visualizar status
 */

const PushNotificationSettings: React.FC = () => {
  const pushService = PushNotificationService.getInstance();
  const [permission, setPermission] = useState<NotificationPermission>(pushService.getPermission());
  const [isSupported, setIsSupported] = useState(pushService.isSupported());
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setPermission(pushService.getPermission());
    setIsSupported(pushService.isSupported());
  }, [pushService]);

  const handleRequestPermission = async () => {
    const newPermission = await pushService.requestPermission();
    setPermission(newPermission);
  };

  const handleTestNotification = async () => {
    setTesting(true);
    try {
      await pushService.testNotification();
      setTimeout(() => setTesting(false), 2000);
    } catch (error) {
      console.error('[PushNotificationSettings] Erro ao testar:', error);
      setTesting(false);
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { icon: '✅', text: 'Ativadas', color: '#10b981' };
      case 'denied':
        return { icon: '❌', text: 'Bloqueadas', color: '#ef4444' };
      default:
        return { icon: '⚠️', text: 'Não Configuradas', color: '#f59e0b' };
    }
  };

  const status = getPermissionStatus();

  return (
    <div className="push-notification-settings">
      <div className="settings-header">
        <h3>🔔 Notificações Push</h3>
        <span className="status-badge" style={{ backgroundColor: status.color }}>
          {status.icon} {status.text}
        </span>
      </div>

      {!isSupported && (
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Seu navegador não suporta notificações push.</p>
        </div>
      )}

      {isSupported && (
        <>
          <p className="description">
            Receba alertas importantes sobre orçamentos, metas, transações recorrentes e insights da IA.
          </p>

          <div className="notification-types">
            <h4>Tipos de Notificações:</h4>
            <ul>
              <li>
                <i className="fas fa-wallet"></i>
                <strong>Alertas de Orçamento</strong> - Quando você ultrapassar 80% do limite
              </li>
              <li>
                <i className="fas fa-bullseye"></i>
                <strong>Metas Alcançadas</strong> - Celebre suas conquistas financeiras
              </li>
              <li>
                <i className="fas fa-calendar-check"></i>
                <strong>Transações Recorrentes</strong> - Lembretes de pagamentos
              </li>
              <li>
                <i className="fas fa-brain"></i>
                <strong>Insights de IA</strong> - Recomendações personalizadas
              </li>
              <li>
                <i className="fas fa-sync"></i>
                <strong>Sincronização</strong> - Confirmações de backup
              </li>
            </ul>
          </div>

          <div className="actions">
            {permission !== 'granted' && (
              <button
                className="btn btn-primary"
                onClick={handleRequestPermission}
                disabled={permission === 'denied'}
              >
                <i className="fas fa-bell"></i>
                {permission === 'denied' ? 'Bloqueadas pelo Navegador' : 'Ativar Notificações'}
              </button>
            )}

            {permission === 'granted' && (
              <button
                className="btn btn-success"
                onClick={handleTestNotification}
                disabled={testing}
              >
                <i className={testing ? 'fas fa-spinner fa-spin' : 'fas fa-vial'}></i>
                {testing ? 'Enviando...' : 'Testar Notificação'}
              </button>
            )}
          </div>

          {permission === 'denied' && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle"></i>
              <div>
                <strong>Como desbloquear:</strong>
                <ol>
                  <li>Clique no ícone de cadeado/informações na barra de endereço</li>
                  <li>Encontre &quot;Notificações&quot; nas configurações do site</li>
                  <li>Altere para &quot;Permitir&quot;</li>
                  <li>Recarregue a página</li>
                </ol>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PushNotificationSettings;
