/**
 * Login Page
 * Página de autenticação com múltiplas opções
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../common';
import './Login.css';

interface LoginProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { signIn, signInWithOAuth, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn({ email, password });

      if (error) {
        setError(getErrorMessage(error.message));
        return;
      }

      onSuccess?.();
    } catch (err) {
      setError('Erro inesperado ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'azure') => {
    setError('');
    setLoading(true);

    try {
      const { error } = await signInWithOAuth(provider);

      if (error) {
        setError(getErrorMessage(error.message));
        setLoading(false);
      }
      // Não desabilita loading porque vai redirecionar
    } catch (err) {
      setError('Erro ao fazer login com ' + provider);
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signInWithMagicLink(email);

      if (error) {
        setError(getErrorMessage(error.message));
        return;
      }

      setMagicLinkSent(true);
    } catch (err) {
      setError('Erro ao enviar Magic Link');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (message: string): string => {
    const errors: Record<string, string> = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada',
      'User not found': 'Usuário não encontrado',
      'Invalid email': 'Email inválido',
    };

    return errors[message] || message;
  };

  if (magicLinkSent) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-success">
            <h2>📧 Email Enviado!</h2>
            <p>
              Enviamos um link de login para <strong>{email}</strong>
            </p>
            <p className="text-muted">
              Clique no link do email para fazer login automaticamente
            </p>
            <Button onClick={() => setMagicLinkSent(false)} variant="secondary">
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>💰 My-Financify</h1>
          <p>Faça login para continuar</p>
        </div>

        {error && (
          <div className="login-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {!showMagicLink ? (
          <>
            <form onSubmit={handleEmailLogin} className="login-form">
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={loading}
              />

              <Input
                type="password"
                label="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />

              <Button type="submit" fullWidth loading={loading}>
                Entrar
              </Button>
            </form>

            <div className="login-divider">
              <span>ou</span>
            </div>

            <div className="login-oauth">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
              >
                <span className="oauth-icon">🔍</span>
                Continuar com Google
              </Button>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
              >
                <span className="oauth-icon">💻</span>
                Continuar com GitHub
              </Button>
            </div>

            <div className="login-footer">
              <button
                type="button"
                className="link-button"
                onClick={() => setShowMagicLink(true)}
                disabled={loading}
              >
                ✨ Login sem senha (Magic Link)
              </button>

              <button
                type="button"
                className="link-button"
                onClick={onSwitchToRegister}
                disabled={loading}
              >
                Não tem conta? <strong>Criar conta</strong>
              </button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleMagicLink} className="login-form">
              <div className="magic-link-info">
                <h3>✨ Login sem senha</h3>
                <p>Enviaremos um link de login para seu email</p>
              </div>

              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={loading}
              />

              <Button type="submit" fullWidth loading={loading}>
                Enviar Magic Link
              </Button>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowMagicLink(false)}
                disabled={loading}
              >
                Voltar ao login normal
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
