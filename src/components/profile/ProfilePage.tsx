/**
 * Profile Page
 * Página de perfil do usuário com edição de avatar e informações
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common';
import AvatarUpload from './AvatarUpload';
import TwoFactorAuth from '../settings/TwoFactorAuth';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Carregar avatar do localStorage
  React.useEffect(() => {
    const savedAvatar = localStorage.getItem('user_avatar');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Integrar com Supabase para salvar profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSaved = (avatarUrl: string) => {
    setIsEditingAvatar(false);
    setAvatarUrl(avatarUrl);
    setSuccess('Avatar atualizado com sucesso!');
    window.dispatchEvent(new Event('avatarUpdated'));
  };

  const getInitials = (email: string): string => {
    return email.substring(0, 2).toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações pessoais e preferências</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="profile-message success">
          <span>✅</span>
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="profile-message error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="profile-card">
          <h2>Foto de Perfil</h2>
          
          <div className="avatar-section">
            <div className="current-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  <span>{getInitials(user.email || '')}</span>
                </div>
              )}
            </div>

            <div className="avatar-actions">
              <Button
                onClick={() => setIsEditingAvatar(true)}
                variant="secondary"
              >
                📷 {avatarUrl ? 'Alterar Foto' : 'Adicionar Foto'}
              </Button>
              
              {avatarUrl && (
                <Button
                  onClick={() => {
                    localStorage.removeItem('user_avatar');
                    setAvatarUrl('');
                    setSuccess('Avatar removido com sucesso!');
                    window.dispatchEvent(new Event('avatarUpdated'));
                  }}
                  variant="secondary"
                >
                  🗑️ Remover
                </Button>
              )}
            </div>
          </div>

          <p className="avatar-help">
            Use uma imagem quadrada de pelo menos 200x200 pixels.
            Tamanho máximo: 2MB. Formatos: JPG, PNG.
          </p>
        </div>

        {/* Personal Information */}
        <div className="profile-card">
          <h2>Informações Pessoais</h2>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="profile-input disabled"
            />
            <small>O email não pode ser alterado</small>
          </div>

          <div className="form-group">
            <label>Nome Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              className="profile-input"
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="profile-input"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            loading={loading}
            fullWidth
          >
            💾 Salvar Alterações
          </Button>
        </div>

        {/* Security Section */}
        <div className="profile-card">
          <h2>Segurança</h2>

          <div className="security-item">
            <div className="security-info">
              <strong>Alterar Senha</strong>
              <p>Mantenha sua conta segura com uma senha forte</p>
            </div>
            <Button variant="secondary">
              🔒 Alterar Senha
            </Button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <TwoFactorAuth />

        {/* Account Info */}
        <div className="profile-card">
          <h2>Informações da Conta</h2>

          <div className="account-info-grid">
            <div className="info-item">
              <span className="info-label">Criado em</span>
              <span className="info-value">
                {new Date(user.created_at || '').toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Último login</span>
              <span className="info-value">
                {user.last_sign_in_at 
                  ? new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')
                  : 'N/A'
                }
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">ID do Usuário</span>
              <span className="info-value mono">{user.id?.substring(0, 8)}...</span>
            </div>

            <div className="info-item">
              <span className="info-label">Provider</span>
              <span className="info-value">{user.app_metadata?.provider || 'Email'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {isEditingAvatar && (
        <AvatarUpload
          onClose={() => setIsEditingAvatar(false)}
          onSave={handleAvatarSaved}
          currentAvatar={avatarUrl}
        />
      )}
    </div>
  );
};

export default ProfilePage;
