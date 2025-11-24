/**
 * Safe Auth Wrapper
 * Wrapper seguro para autenticação que NUNCA derruba o app
 */

import { supabase, isSupabaseConfigured } from '../config/supabase.config';
import type { User, Session } from '@supabase/supabase-js';
import Logger from './logger.service';

interface SafeAuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fallbackUsed?: boolean;
}

class SafeAuthService {
  private localSession: Session | null = null;
  private localUser: User | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadLocalSession();
    this.startSessionCheck();
  }

  /**
   * Carregar sessão do localStorage
   */
  private loadLocalSession(): void {
    try {
      const sessionData = localStorage.getItem('local_session');
      const userData = localStorage.getItem('local_user');

      if (sessionData) this.localSession = JSON.parse(sessionData);
      if (userData) this.localUser = JSON.parse(userData);
    } catch (error) {
      Logger.error('Erro ao carregar sessão local', error as Error, 'SAFE_AUTH');
    }
  }

  /**
   * Salvar sessão localmente
   */
  private saveLocalSession(session: Session | null, user: User | null): void {
    try {
      if (session) {
        localStorage.setItem('local_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('local_session');
      }

      if (user) {
        localStorage.setItem('local_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('local_user');
      }

      this.localSession = session;
      this.localUser = user;
    } catch (error) {
      Logger.error('Erro ao salvar sessão local', error as Error, 'SAFE_AUTH');
    }
  }

  /**
   * Verificar sessão periodicamente
   */
  private startSessionCheck(): void {
    // Verificar a cada 5 minutos
    this.sessionCheckInterval = setInterval(async () => {
      await this.refreshSession();
    }, 5 * 60 * 1000);
  }

  /**
   * Parar verificação de sessão
   */
  private stopSessionCheck(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  /**
   * Executar operação com tratamento de erro
   */
  private async safeExecute<T>(
    operation: () => Promise<T>,
    fallback: () => T,
    operationName: string
  ): Promise<SafeAuthResponse<T>> {
    try {
      if (!isSupabaseConfigured()) {
        Logger.warn(`Supabase não configurado, usando fallback para ${operationName}`, undefined, 'SAFE_AUTH');
        return {
          success: true,
          data: fallback(),
          fallbackUsed: true,
        };
      }

      const data = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), 10000)
        ),
      ]);

      return {
        success: true,
        data,
        fallbackUsed: false,
      };
    } catch (error) {
      Logger.error(`Erro em ${operationName}, usando fallback`, error as Error, 'SAFE_AUTH');
      
      return {
        success: true,
        data: fallback(),
        fallbackUsed: true,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Obter sessão atual (NUNCA FALHA)
   */
  async getSession(): Promise<SafeAuthResponse<Session | null>> {
    return this.safeExecute(
      async () => {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // Atualizar cache local
        this.saveLocalSession(data.session, data.session?.user ?? null);
        
        return data.session;
      },
      () => this.localSession,
      'getSession'
    );
  }

  /**
   * Obter usuário atual (NUNCA FALHA)
   */
  async getUser(): Promise<SafeAuthResponse<User | null>> {
    return this.safeExecute(
      async () => {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        // Atualizar cache local
        this.saveLocalSession(this.localSession, data.user);
        
        return data.user;
      },
      () => this.localUser,
      'getUser'
    );
  }

  /**
   * Refresh da sessão (NUNCA FALHA)
   */
  async refreshSession(): Promise<SafeAuthResponse<Session | null>> {
    return this.safeExecute(
      async () => {
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) throw error;
        
        this.saveLocalSession(data.session, data.session?.user ?? null);
        
        Logger.info('Sessão renovada', undefined, 'SAFE_AUTH');
        return data.session;
      },
      () => this.localSession,
      'refreshSession'
    );
  }

  /**
   * Verificar se está autenticado (NUNCA FALHA)
   */
  async isAuthenticated(): Promise<boolean> {
    const { data } = await this.getSession();
    return !!data;
  }

  /**
   * Login (COM TRATAMENTO DE ERRO)
   */
  async signIn(email: string, password: string): Promise<SafeAuthResponse<{ user: User; session: Session }>> {
    try {
      if (!isSupabaseConfigured()) {
        return {
          success: false,
          error: 'Supabase não está configurado',
        };
      }

      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Login timeout')), 10000)
        ),
      ]);

      if (error) {
        return {
          success: false,
          error: this.getErrorMessage(error.message),
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: 'Erro ao fazer login',
        };
      }

      // Salvar sessão localmente
      this.saveLocalSession(data.session, data.user);

      Logger.info('✅ Login realizado', { userId: data.user.id }, 'SAFE_AUTH');

      return {
        success: true,
        data: { user: data.user, session: data.session },
      };
    } catch (error) {
      Logger.error('Erro ao fazer login', error as Error, 'SAFE_AUTH');
      
      return {
        success: false,
        error: (error as Error).message || 'Erro inesperado ao fazer login',
      };
    }
  }

  /**
   * Logout (NUNCA FALHA)
   */
  async signOut(): Promise<SafeAuthResponse<void>> {
    return this.safeExecute(
      async () => {
        const { error } = await supabase.auth.signOut();
        
        if (error) throw error;
        
        // Limpar sessão local
        this.saveLocalSession(null, null);
        
        Logger.info('✅ Logout realizado', undefined, 'SAFE_AUTH');
      },
      () => {
        // Fallback: limpar apenas localmente
        this.saveLocalSession(null, null);
        Logger.warn('Logout offline (sem conexão)', undefined, 'SAFE_AUTH');
      },
      'signOut'
    );
  }

  /**
   * Traduzir mensagens de erro
   */
  private getErrorMessage(message: string): string {
    const errors: Record<string, string> = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Email não confirmado',
      'User not found': 'Usuário não encontrado',
      'Invalid email': 'Email inválido',
      'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres',
      'Operation timeout': 'Tempo de conexão esgotado. Verifique sua internet.',
    };

    return errors[message] || message;
  }

  /**
   * Limpar recursos ao destruir
   */
  destroy(): void {
    this.stopSessionCheck();
  }
}

export default new SafeAuthService();
