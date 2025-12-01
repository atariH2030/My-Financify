import React, { useState, useEffect, useRef, useCallback } from 'react';
import './NotificationCenter.css';
import NotificationService, { type Notification, type NotificationType } from '../../services/notification.service';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateUnreadCount = useCallback((notifs: Notification[]) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  }, []);

  const loadNotifications = useCallback(async () => {
    const all = await NotificationService.getAll();
    setNotifications(all);
    updateUnreadCount(all);
  }, [updateUnreadCount]);

  // Load notifications and subscribe to changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();

    const unsubscribe = NotificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
      updateUnreadCount(updatedNotifications);
    });

    return () => {
      unsubscribe();
    };
  }, [loadNotifications, updateUnreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllAsRead = async () => {
    await NotificationService.markAllAsRead();
  };

  const handleClearAll = async () => {
    if (confirm('Tem certeza que deseja remover todas as notificações?')) {
      await NotificationService.clearAll();
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await NotificationService.markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      // Navigate to action URL (would need router integration)
      setIsOpen(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await NotificationService.remove(id);
  };

  const getIconForType = (type: NotificationType): string => {
    const icons: Record<NotificationType, string> = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'budget-alert': '💰',
      'goal-reminder': '🎯',
      'transaction': '💳',
    };
    return icons[type] || 'ℹ️';
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days}d atrás`;
    
    return time.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const filteredNotifications = filterType === 'all'
    ? notifications
    : notifications.filter(n => n.type === filterType);

  return (
    <div className="notification-center" ref={dropdownRef}>
      <button
        className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={handleToggle}
        title="Notificações"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notificações</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button
                  className="notification-action-btn"
                  onClick={handleMarkAllAsRead}
                  title="Marcar todas como lidas"
                >
                  ✓ Ler Todas
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="notification-action-btn"
                  onClick={handleClearAll}
                  title="Limpar todas"
                >
                  🗑️ Limpar
                </button>
              )}
            </div>
          </div>

          <div className="notification-filters">
            <button
              className={`filter-badge ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              Todas ({notifications.length})
            </button>
            <button
              className={`filter-badge ${filterType === 'budget-alert' ? 'active' : ''}`}
              onClick={() => setFilterType('budget-alert')}
            >
              💰 Orçamentos
            </button>
            <button
              className={`filter-badge ${filterType === 'goal-reminder' ? 'active' : ''}`}
              onClick={() => setFilterType('goal-reminder')}
            >
              🎯 Metas
            </button>
            <button
              className={`filter-badge ${filterType === 'transaction' ? 'active' : ''}`}
              onClick={() => setFilterType('transaction')}
            >
              💳 Transações
            </button>
          </div>

          <div className="notification-list">
            {filteredNotifications.length === 0 ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">🔔</div>
                <div className="notification-empty-text">Nenhuma notificação</div>
                <div className="notification-empty-hint">
                  Você receberá alertas importantes aqui
                </div>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''} priority-${notification.priority}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`notification-icon ${notification.type}`}>
                    {getIconForType(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{getTimeAgo(notification.timestamp)}</div>
                    {notification.actionUrl && notification.actionLabel && (
                      <div className="notification-action">
                        <a
                          href={notification.actionUrl}
                          className="notification-action-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {notification.actionLabel} →
                        </a>
                      </div>
                    )}
                  </div>
                  <button
                    className="notification-remove"
                    onClick={(e) => handleRemove(e, notification.id)}
                    title="Remover"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: 0.5,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
