/**
 * Sentry Service - Error Tracking & Performance Monitoring
 * Captura erros em produção com stack traces e contexto
 * 
 * @version 3.15.0
 * @author DEV - Rickson
 */

import Logger from './logger.service';

class SentryService {
  private isInitialized = false;

  /**
   * Inicializar Sentry (placeholder - instalar @sentry/react primeiro)
   */
  initialize(): void {
    try {
      const dsn = import.meta.env.VITE_SENTRY_DSN;
      const isProduction = import.meta.env.PROD;

      if (!isProduction) {
        Logger.info('Sentry disabled in development', undefined, 'SENTRY');
        return;
      }

      if (!dsn) {
        Logger.warn('Sentry DSN not configured - skipping', 'SENTRY');
        return;
      }

      // TODO: Instalar @sentry/react e @sentry/tracing
      // npm install @sentry/react @sentry/tracing
      Logger.warn('Sentry not installed - run: npm install @sentry/react @sentry/tracing', 'SENTRY');
    } catch (error) {
      Logger.error('Failed to initialize Sentry', error as Error, 'SENTRY');
    }
  }

  captureError(error: Error, context?: Record<string, unknown>): void {
    Logger.error('Error captured', error, 'SENTRY');
    if (context) Logger.debug('Error context', context, 'SENTRY');
  }

  captureMessage(message: string, _level: 'info' | 'warning' | 'error' = 'info'): void {
    Logger.info(message, undefined, 'SENTRY');
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    Logger.debug('User context set', user, 'SENTRY');
  }

  clearUser(): void {
    Logger.debug('User context cleared', undefined, 'SENTRY');
  }

  addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
    Logger.debug(`Breadcrumb: ${category} - ${message}`, data, 'SENTRY');
  }

  startTransaction(name: string, op: string): void {
    Logger.debug(`Transaction started: ${name} (${op})`, undefined, 'SENTRY');
  }
}

// Singleton
export const sentry = new SentryService();
