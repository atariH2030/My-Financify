/**
 * User Header
 * Componente de header com informações do usuário e logout
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common';
import './UserHeader.css';

const UserHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  const getInitials = (email: string): string => {
    return email.substring(0, 2).toUpperCase();
  };

  const getUserName = (): string => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user.email?.split('@')[0] || 'Usuário';
  };

  return (
    <div className="user-header">
      <div className="user-info-compact">
        <span className="user-status">🟢</span>
        <span className="user-name">{getUserName()}</span>
      </div>

      <div className="user-menu-container">
        <button
          className="user-avatar"
          onClick={() => setShowMenu(!showMenu)}
          title={user.email || ''}
        >
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="Avatar" />
          ) : (
            <span className="avatar-initials">{getInitials(user.email || '')}</span>
          )}
        </button>

        {showMenu && (
          <>
            <div className="user-menu-backdrop" onClick={() => setShowMenu(false)} />
            <div className="user-menu">
              <div className="menu-header">
                <div className="menu-avatar">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" />
                  ) : (
                    <span className="avatar-initials">{getInitials(user.email || '')}</span>
                  )}
                </div>
                <div className="menu-user-info">
                  <p className="menu-name">{getUserName()}</p>
                  <p className="menu-email">{user.email}</p>
                </div>
              </div>

              <div className="menu-divider" />

              <div className="menu-items">
                <button className="menu-item" onClick={() => alert('Perfil em desenvolvimento!')}>
                  <span className="menu-icon">👤</span>
                  <span>Meu Perfil</span>
                </button>
                <button className="menu-item" onClick={() => alert('Configurações em desenvolvimento!')}>
                  <span className="menu-icon">⚙️</span>
                  <span>Configurações</span>
                </button>
              </div>

              <div className="menu-divider" />

              <div className="menu-footer">
                <Button onClick={handleLogout} variant="secondary" fullWidth>
                  🚪 Sair
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserHeader;
