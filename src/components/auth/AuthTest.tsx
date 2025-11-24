/**
 * Auth Test Page
 * Página de teste de autenticação com troca entre Login/Register
 */

import React, { useState } from 'react';
import { AuthProvider } from '../../contexts/AuthContext';
import Login from './Login';
import Register from './Register';

const AuthTest: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <AuthProvider>
      {showLogin ? (
        <Login
          onSuccess={() => {
            alert('Login realizado com sucesso!');
            window.location.href = '/';
          }}
          onSwitchToRegister={() => setShowLogin(false)}
        />
      ) : (
        <Register
          onSuccess={() => {
            alert('Conta criada com sucesso! Verifique seu email.');
          }}
          onSwitchToLogin={() => setShowLogin(true)}
        />
      )}
    </AuthProvider>
  );
};

export default AuthTest;
