/**
 * Protected Route
 * Componente que protege rotas, permitindo acesso apenas para usuários autenticados
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Login from '../auth/Login';
import Register from '../auth/Register';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { user, loading } = useAuth();
  const [loginKey, setLoginKey] = React.useState(0);
  const [showRegister, setShowRegister] = React.useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  // Se não autenticado, mostrar login/register ou fallback
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Alternar entre Login e Register
    if (showRegister) {
      return (
        <Register
          key={loginKey}
          onSuccess={() => {
            // Após registro bem-sucedido, voltar para login
            setShowRegister(false);
            setLoginKey(prev => prev + 1);
          }}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <Login
        key={loginKey}
        onSuccess={() => {
          // Forçar re-render via key prop - AuthContext já detectou autenticação
          setLoginKey(prev => prev + 1);
        }}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Se autenticado, renderizar conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;
