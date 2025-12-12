/**
 * Health Check Service
 * Monitora saúde de serviços externos e internos
 * Fallback automático em caso de falha
 */

import { Logger } from './logger.service';
import { supabase } from '../config/supabase';

export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  error?: string;
  timestamp: Date;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  services: HealthStatus[];
  lastCheck: Date;
}

class HealthCheckService {
  private healthCache: Map<string, HealthStatus> = new Map();
  private checkInterval: number = 30000; // 30 segundos
  private isMonitoring: boolean = false;

  /**
   * Verifica saúde do Supabase
   */
  async checkSupabase(): Promise<HealthStatus> {
    const start = performance.now();
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single();

      const latency = performance.now() - start;

      if (error) {
        throw error;
      }

      const status: HealthStatus = {
        service: 'supabase',
        status: latency < 1000 ? 'healthy' : 'degraded',
        latency: Math.round(latency),
        timestamp: new Date(),
      };

      this.healthCache.set('supabase', status);
      return status;
    } catch (error) {
      Logger.error('Supabase health check failed', error);
      
      const status: HealthStatus = {
        service: 'supabase',
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };

      this.healthCache.set('supabase', status);
      return status;
    }
  }

  /**
   * Verifica saúde do Sentry
   */
  async checkSentry(): Promise<HealthStatus> {
    try {
      // Sentry é fire-and-forget, sempre consideramos healthy se configurado
      const isConfigured = import.meta.env.VITE_SENTRY_DSN !== undefined;

      const status: HealthStatus = {
        service: 'sentry',
        status: isConfigured ? 'healthy' : 'degraded',
        timestamp: new Date(),
      };

      this.healthCache.set('sentry', status);
      return status;
    } catch (error) {
      Logger.error('Sentry health check failed', error);
      
      const status: HealthStatus = {
        service: 'sentry',
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };

      this.healthCache.set('sentry', status);
      return status;
    }
  }

  /**
   * Verifica saúde do Google Analytics
   */
  async checkAnalytics(): Promise<HealthStatus> {
    try {
      const isConfigured = import.meta.env.VITE_GA_MEASUREMENT_ID !== undefined;

      const status: HealthStatus = {
        service: 'analytics',
        status: isConfigured ? 'healthy' : 'degraded',
        timestamp: new Date(),
      };

      this.healthCache.set('analytics', status);
      return status;
    } catch (error) {
      const status: HealthStatus = {
        service: 'analytics',
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };

      this.healthCache.set('analytics', status);
      return status;
    }
  }

  /**
   * Verifica saúde do IndexedDB (Dexie)
   */
  async checkIndexedDB(): Promise<HealthStatus> {
    const start = performance.now();

    try {
      // Testa abertura de banco
      const testDb = indexedDB.open('health-check-test', 1);
      
      await new Promise((resolve, reject) => {
        testDb.onsuccess = () => {
          testDb.result.close();
          indexedDB.deleteDatabase('health-check-test');
          resolve(true);
        };
        testDb.onerror = () => reject(testDb.error);
        testDb.onblocked = () => reject(new Error('IndexedDB blocked'));
      });

      const latency = performance.now() - start;

      const status: HealthStatus = {
        service: 'indexeddb',
        status: latency < 100 ? 'healthy' : 'degraded',
        latency: Math.round(latency),
        timestamp: new Date(),
      };

      this.healthCache.set('indexeddb', status);
      return status;
    } catch (error) {
      Logger.error('IndexedDB health check failed', error);
      
      const status: HealthStatus = {
        service: 'indexeddb',
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };

      this.healthCache.set('indexeddb', status);
      return status;
    }
  }

  /**
   * Verifica saúde geral do sistema
   */
  async checkSystemHealth(): Promise<SystemHealth> {
    try {
      const [supabase, sentry, analytics, indexeddb] = await Promise.allSettled([
        this.checkSupabase(),
        this.checkSentry(),
        this.checkAnalytics(),
        this.checkIndexedDB(),
      ]);

      const services: HealthStatus[] = [
        supabase.status === 'fulfilled' ? supabase.value : { service: 'supabase', status: 'down', timestamp: new Date() },
        sentry.status === 'fulfilled' ? sentry.value : { service: 'sentry', status: 'down', timestamp: new Date() },
        analytics.status === 'fulfilled' ? analytics.value : { service: 'analytics', status: 'down', timestamp: new Date() },
        indexeddb.status === 'fulfilled' ? indexeddb.value : { service: 'indexeddb', status: 'down', timestamp: new Date() },
      ];

      // Determinar status geral
      const criticalDown = services.filter(s => s.service === 'supabase' || s.service === 'indexeddb').some(s => s.status === 'down');
      const anyDown = services.some(s => s.status === 'down');
      const anyDegraded = services.some(s => s.status === 'degraded');

      let overall: 'healthy' | 'degraded' | 'critical';
      if (criticalDown) {
        overall = 'critical';
      } else if (anyDown || anyDegraded) {
        overall = 'degraded';
      } else {
        overall = 'healthy';
      }

      return {
        overall,
        services,
        lastCheck: new Date(),
      };
    } catch (error) {
      Logger.error('System health check failed', error);
      
      return {
        overall: 'critical',
        services: [],
        lastCheck: new Date(),
      };
    }
  }

  /**
   * Inicia monitoramento contínuo
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      Logger.warn('Health monitoring already started');
      return;
    }

    this.isMonitoring = true;
    Logger.info('Health monitoring started');

    // Check imediato
    this.checkSystemHealth();

    // Check periódico
    setInterval(() => {
      this.checkSystemHealth();
    }, this.checkInterval);
  }

  /**
   * Para monitoramento
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    Logger.info('Health monitoring stopped');
  }

  /**
   * Obtém status em cache
   */
  getCachedStatus(service: string): HealthStatus | undefined {
    return this.healthCache.get(service);
  }

  /**
   * Verifica se serviço está saudável
   */
  isServiceHealthy(service: string): boolean {
    const status = this.healthCache.get(service);
    return status?.status === 'healthy';
  }

  /**
   * Verifica se sistema está operacional (degraded ou healthy)
   */
  isSystemOperational(): boolean {
    // Sistema é operacional se IndexedDB funciona (fallback)
    const indexeddb = this.healthCache.get('indexeddb');
    return indexeddb?.status !== 'down';
  }
}

export const healthCheck = new HealthCheckService();
