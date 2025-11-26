/**
 * Auth Demo Page
 * Demonstração completa do sistema de autenticação
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import AuthErrorBoundary from './AuthErrorBoundary';
import Login from './Login';
import Register from './Register';
import { Button, Card } from '../common';
import './AuthDemo.css';

const AuthDemoContent: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [view, setView] = useState<'login' | 'register' | 'demo'>('demo');

  if (loading) {
    return (
      <div className="auth-demo-container">
        <div className="auth-demo-loading">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Se autenticado, mostrar dashboard simples
  if (user) {
    return (
      <div className="auth-demo-container">
        <div className="auth-demo-success">
          <Card>
            <div className="success-header">
              <h1>🎉 Autenticação Funcionando!</h1>
              <p>Você está logado com sucesso!</p>
            </div>

            <div className="user-info">
              <h3>Informações do Usuário:</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">ID:</span>
                  <span className="value">{user.id}</span>
                </div>
                <div className="info-item">
                  <span className="label">Criado em:</span>
                  <span className="value">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {user.user_metadata?.full_name && (
                  <div className="info-item">
                    <span className="label">Nome:</span>
                    <span className="value">{user.user_metadata.full_name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="success-actions">
              <Button onClick={() => signOut()} variant="secondary">
                🚪 Fazer Logout
              </Button>
              <Button onClick={() => alert('Dashboard em desenvolvimento!')}>
                📊 Ir para Dashboard
              </Button>
            </div>

            <div className="success-note">
              <p>✅ Sistema de autenticação funcionando perfeitamente!</p>
              <p>Agora você pode integrar com o resto da aplicação.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Se não autenticado, mostrar opções
  if (view === 'demo') {
    return (
      <div className="auth-demo-container">
        <div className="auth-demo-welcome">
          <Card>
            <div className="welcome-header">
              <h1>💰 My-Financify</h1>
              <h2>Sistema de Autenticação</h2>
              <p>Teste o sistema de login e registro</p>
            </div>

            <div className="demo-features">
              <h3>✨ Recursos Implementados:</h3>
              <ul>
                <li>✅ Login com email/senha</li>
                <li>✅ Registro de novos usuários</li>
                <li>✅ OAuth (Google, GitHub, Microsoft)*</li>
                <li>✅ Magic Link (login sem senha)</li>
                <li>✅ Recuperação de senha</li>
                <li>✅ Validação robusta</li>
                <li>✅ Sessão persistente</li>
                <li>✅ Error boundaries</li>
                <li>✅ Retry automático</li>
                <li>✅ Modo offline</li>
              </ul>
              <p className="note">* OAuth requer configuração no Supabase</p>
            </div>

            <div className="demo-actions">
              <Button onClick={() => setView('login')} fullWidth>
                🔐 Fazer Login
              </Button>
              <Button onClick={() => setView('register')} variant="secondary" fullWidth>
                ✨ Criar Conta Nova
              </Button>
            </div>

            <div className="demo-credentials">
              <h4>Credenciais de Teste:</h4>
              <p>Você pode criar uma conta nova ou usar:</p>
              <code>Email: teste@exemplo.com</code>
              <code>Senha: Teste123</code>
              <p className="small">
                (Crie esta conta primeiro via "Criar Conta Nova")
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Mostrar Login ou Register
  return view === 'login' ? (
    <Login
      onSuccess={() => {
        // Recarregar para mostrar tela de sucesso
        window.location.reload();
      }}
      onSwitchToRegister={() => setView('register')}
    />
  ) : (
    <Register
      onSuccess={() => {
        alert('✅ Conta criada! Agora faça login.');
        setView('login');
      }}
      onSwitchToLogin={() => setView('login')}
    />
  );
};

const AuthDemo: React.FC = () => {
  return (
    <AuthErrorBoundary>
      <AuthProvider>
        <AuthDemoContent />
      </AuthProvider>
    </AuthErrorBoundary>
  );
};

export default AuthDemo;
