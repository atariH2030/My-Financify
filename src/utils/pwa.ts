/**
 * @file pwa.ts
 * @description Service Worker registration e controle de PWA
 * @version 2.4.0
 * @author DEV - Rickson (TQM)
 */

import { registerSW } from 'virtual:pwa-register';
import { Logger } from '@services/logger.service';

/**
 * Interface para status do PWA
 */
export interface PWAStatus {
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  isOffline: boolean;
}

/**
 * Classe para gerenciar PWA
 */
class PWAManager {
  private updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;
  private listeners: Set<(status: PWAStatus) => void> = new Set();
  private status: PWAStatus = {
    isInstalled: false,
    isUpdateAvailable: false,
    isOffline: !navigator.onLine,
  };

  constructor() {
    this.init();
    this.setupOnlineListener();
  }

  /**
   * Inicializa o Service Worker
   */
  private init(): void {
    try {
      this.updateSW = registerSW({
        immediate: true,
        onNeedRefresh: () => {
          Logger.info('Nova versão disponível');
          this.status.isUpdateAvailable = true;
          this.notifyListeners();
        },
        onOfflineReady: () => {
          Logger.info('App pronto para funcionar offline');
          this.status.isInstalled = true;
          this.notifyListeners();
        },
        onRegistered: (registration) => {
          Logger.info('Service Worker registrado com sucesso', registration);
          this.status.isInstalled = true;
          this.notifyListeners();

          // Verifica atualizações a cada 1 hora
          setInterval(
            () => {
              registration?.update();
            },
            60 * 60 * 1000
          );
        },
        onRegisterError: (error) => {
          Logger.error('Erro ao registrar Service Worker', error);
        },
      });
    } catch (error) {
      Logger.error('Erro ao inicializar PWA', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Configura listeners para status online/offline
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      Logger.info('App online');
      this.status.isOffline = false;
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      Logger.warn('App offline');
      this.status.isOffline = true;
      this.notifyListeners();
    });
  }

  /**
   * Notifica todos os listeners sobre mudanças no status
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.status));
  }

  /**
   * Adiciona um listener para mudanças no status do PWA
   */
  public addStatusListener(listener: (status: PWAStatus) => void): () => void {
    this.listeners.add(listener);
    // Notifica imediatamente com o status atual
    listener(this.status);

    // Retorna função para remover o listener
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Atualiza o app para a nova versão
   */
  public async update(): Promise<void> {
    if (this.updateSW) {
      try {
        Logger.info('Atualizando app...');
        await this.updateSW(true);
      } catch (error) {
        Logger.error('Erro ao atualizar app', error instanceof Error ? error : undefined);
        throw error;
      }
    }
  }

  /**
   * Retorna o status atual do PWA
   */
  public getStatus(): PWAStatus {
    return { ...this.status };
  }

  /**
   * Verifica se o app pode ser instalado
   */
  public canInstall(): boolean {
    return 'BeforeInstallPromptEvent' in window;
  }

  /**
   * Verifica se o app está rodando como PWA standalone
   */
  public isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  /**
   * Limpa o cache do Service Worker
   */
  public async clearCache(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        Logger.info('Cache limpo com sucesso');
      }
    } catch (error) {
      Logger.error('Erro ao limpar cache', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  /**
   * Obtém informações sobre o cache
   */
  public async getCacheInfo(): Promise<{
    size: number;
    cacheNames: string[];
  }> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        let totalSize = 0;

        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          }
        }

        return {
          size: totalSize,
          cacheNames,
        };
      }

      return { size: 0, cacheNames: [] };
    } catch (error) {
      Logger.error('Erro ao obter informações do cache', error instanceof Error ? error : undefined);
      return { size: 0, cacheNames: [] };
    }
  }
}

// Singleton instance
export const pwaManager = new PWAManager();

/**
 * Hook React para usar o PWA manager
 */
export function usePWA() {
  const [status, setStatus] = React.useState<PWAStatus>(pwaManager.getStatus());

  React.useEffect(() => {
    const unsubscribe = pwaManager.addStatusListener(setStatus);
    return unsubscribe;
  }, []);

  return {
    status,
    update: () => pwaManager.update(),
    clearCache: () => pwaManager.clearCache(),
    getCacheInfo: () => pwaManager.getCacheInfo(),
    isStandalone: pwaManager.isStandalone(),
    canInstall: pwaManager.canInstall(),
  };
}

// Importação do React para o hook
import * as React from 'react';
