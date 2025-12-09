/**
 * InviteMemberModal.tsx
 * 
 * Modal para convidar membros ao workspace
 * Features:
 * - Input de email com validação
 * - Seleção de role (ADMIN, CONTRIBUTOR, VIEWER)
 * - Preview de permissões por role
 * - Geração de link de convite
 * 
 * @version 3.15.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import WorkspaceService from '../../services/workspace.service';
import Logger from '../../services/logger.service';
import { 
  MemberRole, 
  Permission,
  ROLE_PERMISSIONS 
} from '../../types/workspace.types';
import './InviteMemberModal.css';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>(MemberRole.CONTRIBUTOR);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !activeWorkspace) {
      setError('Workspace não selecionado');
      return;
    }

    if (!email.trim() || !isValidEmail(email)) {
      setError('Email inválido');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await WorkspaceService.inviteMember({
        workspaceId: activeWorkspace.id,
        invitedBy: user.id,
        email: email.trim().toLowerCase(),
        role,
        customPermissions: []
      });

      if (response.success) {
        Logger.info('InviteMemberModal', `Convite enviado para: ${email}`);
        setSuccess(`Convite enviado para ${email}! 🎉`);
        setEmail('');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        throw new Error(response.error || 'Erro ao enviar convite');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      Logger.error('Erro ao convidar membro', err instanceof Error ? err : undefined);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setRole(MemberRole.CONTRIBUTOR);
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  if (!isOpen || !activeWorkspace) return null;

  const rolePermissions = ROLE_PERMISSIONS[role];
  const canAddMembers = activeWorkspace.currentMembers < activeWorkspace.maxMembers;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content invite-member-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><i className="fas fa-user-plus"></i> Convidar Membro</h2>
          <button className="modal-close" onClick={handleClose} disabled={isLoading}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}

          {!canAddMembers && (
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle"></i>
              Limite de membros atingido ({activeWorkspace.currentMembers}/{activeWorkspace.maxMembers}). 
              Faça upgrade do plano para convidar mais pessoas.
            </div>
          )}

          {/* Workspace Info */}
          <div className="workspace-info-box">
            <i className="fas fa-users"></i>
            <div>
              <strong>{activeWorkspace.name}</strong>
              <span>{activeWorkspace.currentMembers}/{activeWorkspace.maxMembers} membros</span>
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="member-email">
              Email do Membro <span className="required">*</span>
            </label>
            <input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              required
              disabled={isLoading || !canAddMembers}
              autoFocus
            />
            <small className="form-hint">
              Um convite será enviado para este email (válido por 7 dias)
            </small>
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label>Função (Role)</label>
            <div className="role-grid">
              {[MemberRole.ADMIN, MemberRole.CONTRIBUTOR, MemberRole.VIEWER].map((memberRole) => (
                <button
                  key={memberRole}
                  type="button"
                  className={`role-card ${role === memberRole ? 'active' : ''}`}
                  onClick={() => setRole(memberRole)}
                  disabled={isLoading || !canAddMembers}
                >
                  <div className="role-header">
                    <i className={`fas ${getRoleIcon(memberRole)}`}></i>
                    <span className="role-name">{getRoleLabel(memberRole)}</span>
                  </div>
                  <p className="role-description">{getRoleDescription(memberRole)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions Preview */}
          <div className="permissions-preview">
            <h4><i className="fas fa-shield-alt"></i> Permissões desta função</h4>
            <div className="permissions-list">
              {getPermissionLabels(rolePermissions).map((permission, idx) => (
                <div key={idx} className="permission-item">
                  <i className="fas fa-check"></i>
                  {permission}
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isLoading || !email.trim() || !canAddMembers}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Enviando...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Enviar Convite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const getRoleIcon = (role: MemberRole): string => {
  const icons: Record<MemberRole, string> = {
    [MemberRole.OWNER]: 'fa-crown',
    [MemberRole.ADMIN]: 'fa-user-shield',
    [MemberRole.CONTRIBUTOR]: 'fa-user-edit',
    [MemberRole.VIEWER]: 'fa-eye'
  };
  return icons[role];
};

const getRoleLabel = (role: MemberRole): string => {
  const labels: Record<MemberRole, string> = {
    [MemberRole.OWNER]: 'Proprietário',
    [MemberRole.ADMIN]: 'Administrador',
    [MemberRole.CONTRIBUTOR]: 'Colaborador',
    [MemberRole.VIEWER]: 'Visualizador'
  };
  return labels[role];
};

const getRoleDescription = (role: MemberRole): string => {
  const descriptions: Record<MemberRole, string> = {
    [MemberRole.OWNER]: 'Controle total do workspace',
    [MemberRole.ADMIN]: 'Gerenciamento completo (exceto billing)',
    [MemberRole.CONTRIBUTOR]: 'Criar e editar transações, orçamentos e metas',
    [MemberRole.VIEWER]: 'Visualizar apenas (sem edições)'
  };
  return descriptions[role];
};

const getPermissionLabels = (permissions: Permission[]): string[] => {
  const labels: Record<string, string> = {
    [Permission.TRANSACTIONS_CREATE]: 'Criar transações',
    [Permission.TRANSACTIONS_READ]: 'Ver transações',
    [Permission.TRANSACTIONS_UPDATE]: 'Editar transações',
    [Permission.TRANSACTIONS_DELETE]: 'Deletar transações',
    [Permission.BUDGETS_CREATE]: 'Criar orçamentos',
    [Permission.BUDGETS_READ]: 'Ver orçamentos',
    [Permission.BUDGETS_UPDATE]: 'Editar orçamentos',
    [Permission.BUDGETS_DELETE]: 'Deletar orçamentos',
    [Permission.GOALS_CREATE]: 'Criar metas',
    [Permission.GOALS_READ]: 'Ver metas',
    [Permission.GOALS_UPDATE]: 'Editar metas',
    [Permission.GOALS_DELETE]: 'Deletar metas',
    [Permission.ACCOUNTS_CREATE]: 'Criar contas',
    [Permission.ACCOUNTS_READ]: 'Ver contas',
    [Permission.ACCOUNTS_UPDATE]: 'Editar contas',
    [Permission.ACCOUNTS_DELETE]: 'Deletar contas',
    [Permission.MEMBERS_INVITE]: 'Convidar membros',
    [Permission.MEMBERS_REMOVE]: 'Remover membros',
    [Permission.MEMBERS_UPDATE_ROLE]: 'Alterar permissões',
    [Permission.SETTINGS_UPDATE]: 'Alterar configurações',
    [Permission.WORKSPACE_DELETE]: 'Deletar workspace',
    [Permission.BILLING_MANAGE]: 'Gerenciar pagamentos'
  };

  return permissions.map(p => labels[p] || p).slice(0, 8); // Mostrar apenas primeiras 8
};

export default InviteMemberModal;
