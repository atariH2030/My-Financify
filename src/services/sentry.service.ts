/**
 * Sentry Service - Error Tracking & Performance Monitoring
 * Captura erros em produção com stack traces e contexto
 * 
 * @version 3.15.0
 * @author DEV - Rickson
 */

import * as Sentry from '@sentry/react';
import Logger from './logger.service';

class SentryService {
  private isInitialized = false;

  /**
   * Inicializar Sentry
   */
  initialize(): void {
    try {
      const dsn = import.meta.env.VITE_SENTRY_DSN;
      const environment = import.meta.env.VITE_ENV || 'production';
      const isProduction = import.meta.env.PROD;

      if (!isProduction) {
        Logger.info('Sentry disabled in development', undefined, 'SENTRY');
        return;
      }

      if (!dsn) {
        Logger.warn('Sentry DSN not configured - skipping error tracking', 'SENTRY');
        return;
      }

      // Inicializar Sentry
      Sentry.init({
        dsn,
        environment,
        
        // Performance sample rate (10% em produção)
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

        // Release tracking
        release: `my-financify@${import.meta.env.VITE_APP_VERSION || '3.15.0'}`,

        // Send default PII (IP address, user agent)
        sendDefaultPii: true,

        // beforeSend - filtrar dados sensíveis
        beforeSend(event) {
          // Remover dados sensíveis
          if (event.request?.headers) {
            delete event.request.headers['Authorization'];
            delete event.request.headers['Cookie'];
          }
          return event;
        },

        // Ignorar erros conhecidos/não críticos
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          'NetworkError',
          'Failed to fetch',
          /^chrome-extension:\/\//,
          /^moz-extension:\/\//,
        ],
      });

      this.isInitialized = true;
      Logger.info('✅ Sentry initialized', undefined, 'SENTRY');
    } catch (error) {
      Logger.error('Failed to initialize Sentry', error as Error, 'SENTRY');
    }
  }

  captureError(error: Error, context?: Record<string, unknown>): void {
    if (!this.isInitialized) {
      Logger.error('Error captured (Sentry not initialized)', error, 'SENTRY');
      return;
    }

    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (!this.isInitialized) return;
    Sentry.captureMessage(message, level);
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.isInitialized) return;
    Sentry.setUser(user);
  }

  clearUser(): void {
    if (!this.isInitialized) return;
    Sentry.setUser(null);
  }

  addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
      timestamp: Date.now() / 1000,
    });
  }

  startTransaction(name: string, op: string): unknown {
    if (!this.isInitialized) return undefined;
    
    return Sentry.startSpan({ name, op }, () => {
      // Span iniciado
    });
  }
}

// Singleton
export const sentry = new SentryService();

// Error Boundary Component Export
export const SentryErrorBoundary = Sentry.ErrorBoundary;
