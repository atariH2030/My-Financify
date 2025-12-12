import React, { useEffect, useState } from 'react';
import { healthCheck, type SystemHealth } from '../services/health-check.service';
import '../styles/health-indicator.css';

export const HealthIndicator: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check inicial
    healthCheck.checkSystemHealth().then(setHealth);

    // Monitoramento contínuo
    healthCheck.startMonitoring();

    // Atualizar UI a cada 30s
    const interval = setInterval(async () => {
      const newHealth = await healthCheck.checkSystemHealth();
      setHealth(newHealth);
    }, 30000);

    return () => {
      clearInterval(interval);
      healthCheck.stopMonitoring();
    };
  }, []);

  if (!health) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'var(--success-color)';
      case 'degraded':
        return 'var(--warning-color)';
      case 'critical':
      case 'down':
        return 'var(--error-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'critical':
      case 'down':
        return '✕';
      default:
        return '?';
    }
  };

  return (
    <div className="health-indicator">
      <button
        className={`health-indicator__toggle health-indicator__toggle--${health.overall}`}
        onClick={() => setIsExpanded(!isExpanded)}
        title="System Health Status"
        aria-label="Toggle health status details"
      >
        <span className="health-indicator__icon">
          {getStatusIcon(health.overall)}
        </span>
        <span className="health-indicator__label">
          {health.overall === 'healthy' ? 'Online' : 
           health.overall === 'degraded' ? 'Degraded' : 'Offline'}
        </span>
      </button>

      {isExpanded && (
        <div className="health-indicator__panel">
          <div className="health-indicator__header">
            <h3>System Status</h3>
            <button
              onClick={() => setIsExpanded(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="health-indicator__services">
            {health.services.map((service) => (
              <div
                key={service.service}
                className="health-indicator__service"
              >
                <div className="health-indicator__service-header">
                  <span
                    className="health-indicator__service-icon"
                    style={{ color: getStatusColor(service.status) }}
                  >
                    {getStatusIcon(service.status)}
                  </span>
                  <span className="health-indicator__service-name">
                    {service.service.charAt(0).toUpperCase() + service.service.slice(1)}
                  </span>
                </div>

                <div className="health-indicator__service-details">
                  <span className="health-indicator__service-status">
                    {service.status}
                  </span>
                  {service.latency && (
                    <span className="health-indicator__service-latency">
                      {service.latency}ms
                    </span>
                  )}
                </div>

                {service.error && (
                  <div className="health-indicator__service-error">
                    {service.error}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="health-indicator__footer">
            <small>
              Last check: {new Date(health.lastCheck).toLocaleTimeString()}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};
