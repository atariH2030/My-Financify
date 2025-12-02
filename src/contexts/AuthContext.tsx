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
    // Carregar sessão inicial
    loadSession();

    // Escutar mudanças de autenticação
    const { data: authListener } = AuthService.onAuthStateChange((event, session) => {
      Logger.info(`Auth event: ${event}`, { userId: session?.user?.id }, 'AUTH_CONTEXT');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadSession = async () => {
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
