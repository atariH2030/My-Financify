/**
 * Auth Context
 * Gerencia o estado global de autenticação
 * VERSÃO RESILIENTE: Usa SafeAuth para garantir que nunca derruba o app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import AuthService from '../services/auth.service';
import SafeAuth from '../services/safe-auth.service';
import Logger from '../services/logger.service';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: typeof AuthService.signUp;
  signIn: typeof AuthService.signIn;
  signInWithOAuth: typeof AuthService.signInWithOAuth;
  signInWithMagicLink: typeof AuthService.signInWithMagicLink;
  signOut: typeof AuthService.signOut;
  resetPassword: typeof AuthService.resetPassword;
  updatePassword: typeof AuthService.updatePassword;
  updateProfile: typeof AuthService.updateProfile;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🧪 SUPORTE PARA TESTES E2E: Detectar mock de autenticação
    const checkAuthMock = () => {
      const mock = (window as any).__AUTH_MOCK__;
      if (mock?.isAuthenticated && mock?.user) {
        Logger.info('Mock de autenticação detectado', { mockUser: mock.user }, 'AUTH_CONTEXT');
        
        // Criar sessão mock compatível com Supabase
        const mockSession: Session = {
          access_token: mock.session?.access_token || 'mock-access-token',
          refresh_token: mock.session?.refresh_token || 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: {
            id: mock.user.id,
            email: mock.user.email,
            aud: 'authenticated',
            role: 'authenticated',
            email_confirmed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: { full_name: mock.user.full_name }
          }
        };
        
        setSession(mockSession);
        setUser(mockSession.user);
        setLoading(false);
        return true;
      }
      return false;
    };

    // Verificar mock primeiro
    const hasMock = checkAuthMock();
    
    if (!hasMock) {
      // Carregar sessão real do Supabase
      loadSession();
    }
    
    // Escutar mudanças no mock (E2E tests)
    const handleMockStateChange = (event: CustomEvent) => {
      Logger.info('Mock state changed event received', event.detail, 'AUTH_CONTEXT');
      const { authenticated, user: mockUser, session: mockSession } = event.detail;
      
      if (authenticated && mockUser && mockSession) {
        // Criar sessão compatível com Supabase
        const compatibleSession: Session = {
          access_token: mockSession.access_token || 'mock-access-token',
          refresh_token: mockSession.refresh_token || 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: {
            id: mockUser.id,
            email: mockUser.email,
            app_metadata: mockUser.app_metadata || {},
            user_metadata: mockUser.user_metadata || {},
            aud: 'authenticated',
            created_at: mockUser.created_at || new Date().toISOString(),
          },
        };
        
        setSession(compatibleSession);
        setUser(compatibleSession.user);
        setLoading(false);
        Logger.info('Mock authentication applied via event', { userId: mockUser.id }, 'AUTH_CONTEXT');
      }
    };
    
    // @ts-ignore - Custom event
    window.addEventListener('auth-mock-state-changed', handleMockStateChange);

    // Escutar mudanças de autenticação real
    const { data: authListener } = AuthService.onAuthStateChange((event, session) => {
      Logger.info(`Auth event: ${event}`, { userId: session?.user?.id }, 'AUTH_CONTEXT');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      // @ts-ignore
      window.removeEventListener('auth-mock-state-changed', handleMockStateChange);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const _loadSession = async () => {
    try {
      // Usar SafeAuth que NUNCA falha
      const { data: session } = await SafeAuth.getSession();
      setSession(session ?? null);
      setUser(session?.user ?? null);
      
      Logger.info('Sessão carregada', { userId: session?.user?.id }, 'AUTH_CONTEXT');
    } catch (error) {
      Logger.error('Erro ao carregar sessão', error as Error, 'AUTH_CONTEXT');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp: AuthService.signUp.bind(AuthService),
    signIn: AuthService.signIn.bind(AuthService),
    signInWithOAuth: AuthService.signInWithOAuth.bind(AuthService),
    signInWithMagicLink: AuthService.signInWithMagicLink.bind(AuthService),
    signOut: AuthService.signOut.bind(AuthService),
    resetPassword: AuthService.resetPassword.bind(AuthService),
    updatePassword: AuthService.updatePassword.bind(AuthService),
    updateProfile: AuthService.updateProfile.bind(AuthService),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
