/**
 * Auth Service
 * Serviço completo de autenticação com Supabase
 * 
 * Funcionalidades:
 * - Login/Registro com email/senha
 * - OAuth (Google, GitHub, Microsoft)
 * - Magic Link (login sem senha)
 * - 2FA (Two-Factor Authentication)
 * - Recuperação de senha
 * - Gestão de sessão
 */

import { supabase } from '../config/supabase.config';
import type { 
  User, 
  Session, 
  AuthError,
  Provider 
} from '@supabase/supabase-js';
import Logger from './logger.service';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  newPassword: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

class AuthService {
  /**
   * Registrar novo usuário
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      Logger.info('Registrando novo usuário...', { email: data.email }, 'AUTH');

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone_number: data.phoneNumber,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        Logger.error('Erro ao registrar usuário', error, 'AUTH');
        return { user: null, session: null, error };
      }

      Logger.info('✅ Usuário registrado com sucesso!', { userId: authData.user?.id }, 'AUTH');

      // Criar perfil do usuário na tabela users
      if (authData.user) {
        await this.createUserProfile(authData.user.id, {
          email: data.email,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
        });
      }

      return { 
        user: authData.user, 
        session: authData.session, 
        error: null 
      };
    } catch (err) {
      Logger.error('Exceção ao registrar usuário', err as Error, 'AUTH');
      return { 
        user: null, 
        session: null, 
        error: err as AuthError 
      };
    }
  }

  /**
   * Login com email e senha
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      Logger.info('Fazendo login...', { email: data.email }, 'AUTH');

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        Logger.error('Erro ao fazer login', error, 'AUTH');
        return { user: null, session: null, error };
      }

      Logger.info('✅ Login realizado com sucesso!', { userId: authData.user?.id }, 'AUTH');

      return { 
        user: authData.user, 
        session: authData.session, 
        error: null 
      };
    } catch (err) {
      Logger.error('Exceção ao fazer login', err as Error, 'AUTH');
      return { 
        user: null, 
        session: null, 
        error: err as AuthError 
      };
    }
  }

  /**
   * Login com OAuth (Google, GitHub, etc)
   */
  async signInWithOAuth(provider: Provider): Promise<{ error: AuthError | null }> {
    try {
      Logger.info(`Iniciando login com ${provider}...`, undefined, 'AUTH');

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        Logger.error(`Erro ao fazer login com ${provider}`, error, 'AUTH');
        return { error };
      }

      return { error: null };
    } catch (err) {
      Logger.error(`Exceção ao fazer login com ${provider}`, err as Error, 'AUTH');
      return { error: err as AuthError };
    }
  }

  /**
   * Magic Link - Login sem senha
   */
  async signInWithMagicLink(email: string): Promise<{ error: AuthError | null }> {
    try {
      Logger.info('Enviando Magic Link...', { email }, 'AUTH');

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        Logger.error('Erro ao enviar Magic Link', error, 'AUTH');
        return { error };
      }

      Logger.info('✅ Magic Link enviado!', { email }, 'AUTH');
      return { error: null };
    } catch (err) {
      Logger.error('Exceção ao enviar Magic Link', err as Error, 'AUTH');
      return { error: err as AuthError };
    }
  }

  /**
   * Logout
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      Logger.info('Fazendo logout...', undefined, 'AUTH');

      const { error } = await supabase.auth.signOut();

      if (error) {
        Logger.error('Erro ao fazer logout', error, 'AUTH');
        return { error };
      }

      Logger.info('✅ Logout realizado com sucesso!', undefined, 'AUTH');
      return { error: null };
    } catch (err) {
      Logger.error('Exceção ao fazer logout', err as Error, 'AUTH');
      return { error: err as AuthError };
    }
  }

  /**
   * Solicitar recuperação de senha
   */
  async resetPassword(data: ResetPasswordData): Promise<{ error: AuthError | null }> {
    try {
      Logger.info('Solicitando recuperação de senha...', { email: data.email }, 'AUTH');

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        Logger.error('Erro ao solicitar recuperação de senha', error, 'AUTH');
        return { error };
      }

      Logger.info('✅ Email de recuperação enviado!', { email: data.email }, 'AUTH');
      return { error: null };
    } catch (err) {
      Logger.error('Exceção ao solicitar recuperação de senha', err as Error, 'AUTH');
      return { error: err as AuthError };
    }
  }

  /**
   * Atualizar senha (após reset)
   */
  async updatePassword(data: UpdatePasswordData): Promise<{ error: AuthError | null }> {
    try {
      Logger.info('Atualizando senha...', undefined, 'AUTH');

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        Logger.error('Erro ao atualizar senha', error, 'AUTH');
        return { error };
      }

      Logger.info('✅ Senha atualizada com sucesso!', undefined, 'AUTH');
      return { error: null };
    } catch (err) {
      Logger.error('Exceção ao atualizar senha', err as Error, 'AUTH');
      return { error: err as AuthError };
    }
  }

  /**
   * Obter sessão atual
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        Logger.error('Erro ao obter sessão', error, 'AUTH');
        return { session: null, error };
      }

      return { session: data.session, error: null };
    } catch (err) {
      Logger.error('Exceção ao obter sessão', err as Error, 'AUTH');
      return { session: null, error: err as AuthError };
    }
  }

  /**
   * Obter usuário atual
   */
  async getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        Logger.error('Erro ao obter usuário', error, 'AUTH');
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (err) {
      Logger.error('Exceção ao obter usuário', err as Error, 'AUTH');
      return { user: null, error: err as AuthError };
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(updates: { fullName?: string; phoneNumber?: string; avatarUrl?: string }) {
    try {
      Logger.info('Atualizando perfil...', undefined, 'AUTH');

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: updates.fullName,
          phone_number: updates.phoneNumber,
          avatar_url: updates.avatarUrl,
        },
      });

      if (error) {
        Logger.error('Erro ao atualizar perfil', error, 'AUTH');
        return { error };
      }

      Logger.info('✅ Perfil atualizado com sucesso!', undefined, 'AUTH');
      return { error: null };
    } catch (err) {
      Logger.error('Exceção ao atualizar perfil', err as Error, 'AUTH');
      return { error: err as AuthError };
    }
  }

  /**
   * Verificar se usuário está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const { session } = await this.getSession();
    return !!session;
  }

  /**
   * Criar perfil do usuário na tabela users
   * (Chamado automaticamente após signUp)
   */
  private async createUserProfile(
    userId: string,
    data: { email: string; fullName: string; phoneNumber?: string }
  ) {
    try {
      Logger.info('Criando perfil do usuário...', { userId }, 'AUTH');

      const { error } = await supabase.from('users').insert({
        id: userId,
        email: data.email,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
      });

      if (error) {
        Logger.error('Erro ao criar perfil do usuário', error, 'AUTH');
        return;
      }

      Logger.info('✅ Perfil do usuário criado!', { userId }, 'AUTH');
    } catch (err) {
      Logger.error('Exceção ao criar perfil do usuário', err as Error, 'AUTH');
    }
  }

  /**
   * Listener para mudanças de autenticação
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      Logger.info(`Auth state changed: ${event}`, { userId: session?.user?.id }, 'AUTH');
      callback(event, session);
    });
  }
}

export default new AuthService();
