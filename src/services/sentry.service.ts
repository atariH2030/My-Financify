/**
 * Sentry Service - Error Tracking & Performance Monitoring
 * Captura erros em produção com stack traces e contexto
 * 
 * @version 3.15.0
 * @author DEV - Rickson
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { logger } from './logger.service';

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

      // Não inicializar em desenvolvimento
      if (!isProduction) {
        logger.info('Sentry disabled in development');
        return;
      }

      if (!dsn) {
        logger.warn('Sentry DSN not found');
        return;
      }

      Sentry.init({
        dsn,
        environment,
        
        // Performance Monitoring
        integrations: [
          new BrowserTracing({
            tracePropagationTargets: ['localhost', /^https:\/\/.*\.vercel\.app/],
          }),
        ],

        // Performance sample rate (10% em produção)
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

        // Error sample rate (100% sempre)
        sampleRate: 1.0,

        // Release tracking
        release: `my-financify@${import.meta.env.VITE_APP_VERSION || '3.15.0'}`,

        // beforeSend - filtrar dados sensíveis
        beforeSend(event, hint) {
          // Remover dados sensíveis
          if (event.request?.headers) {
            delete event.request.headers['Authorization'];
            delete event.request.headers['Cookie'];
          }

          // Log local também
          logger.error('Sentry captured error', hint.originalException);

          return event;
        },

        // Ignorar erros conhecidos/não críticos
        ignoreErrors: [
          // Erros do browser
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          
          // Erros de rede (offline)
          'NetworkError',
          'Failed to fetch',
          
          // Erros de extensões do navegador
          /^chrome-extension:\/\//,
          /^moz-extension:\/\//,
        ],
      });

      this.isInitialized = true;
      logger.info('✅ Sentry initialized', { environment, release: `v${import.meta.env.VITE_APP_VERSION}` });
    } catch (error) {
      logger.error('Failed to initialize Sentry', error);
    }
  }

  /**
   * Capturar erro manualmente
   */
  captureError(error: Error, context?: Record<string, unknown>): void {
    if (!this.isInitialized) {
      logger.error('Error captured (Sentry not initialized)', error, context);
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

  /**
   * Capturar mensagem (não erro)
   */
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (!this.isInitialized) return;

    Sentry.captureMessage(message, level);
  }

  /**
   * Setar contexto do usuário
   */
  setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.isInitialized) return;

    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }

  /**
   * Limpar contexto do usuário (logout)
   */
  clearUser(): void {
    if (!this.isInitialized) return;

    Sentry.setUser(null);
  }

  /**
   * Adicionar breadcrumb (rastro de ações)
   */
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

  /**
   * Iniciar transação de performance
   */
  startTransaction(name: string, op: string): Sentry.Transaction | undefined {
    if (!this.isInitialized) return undefined;

    return Sentry.startTransaction({ name, op });
  }
}

// Singleton
export const sentry = new SentryService();

// Error Boundary Component Export
export const SentryErrorBoundary = Sentry.ErrorBoundary;
