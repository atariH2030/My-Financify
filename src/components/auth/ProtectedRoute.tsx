/**
 * Protected Route
 * Componente que protege rotas, permitindo acesso apenas para usuários autenticados
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Login from '../auth/Login';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { user, loading } = useAuth();
  const [loginKey, setLoginKey] = React.useState(0);

  // Loading state
  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner"></div>
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  // Se não autenticado, mostrar login ou fallback
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Login
        key={loginKey}
        onSuccess={() => {
          // Forçar re-render via key prop - AuthContext já detectou autenticação
          setLoginKey(prev => prev + 1);
        }}
      />
    );
  }

  // Se autenticado, renderizar conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;
