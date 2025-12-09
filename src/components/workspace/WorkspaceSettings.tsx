/**
 * WorkspaceSettings.tsx
 * 
 * Página completa de configurações do workspace
 * Features:
 * - Informações gerais (nome, descrição)
 * - Lista de membros com roles
 * - Convite de novos membros
 * - Upgrade de plano
 * - Deletar workspace
 * 
 * @version 3.15.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import WorkspaceService from '../../services/workspace.service';
import Logger from '../../services/logger.service';
import InviteMemberModal from './InviteMemberModal';
import { 
  MemberRole, 
  PlanType,
  PLAN_CONFIGS,
  type WorkspaceMember,
  type UpdateWorkspaceRequest
} from '../../types/workspace.types';
import './WorkspaceSettings.css';

export const WorkspaceSettings: React.FC = () => {
  const { user } = useAuth();
  const { activeWorkspace, isWorkspaceOwner } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Carregar dados do workspace
  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
      setDescription(activeWorkspace.description || '');
      loadMembers();
    }
  }, [activeWorkspace?.id]);

  const loadMembers = async () => {
    if (!activeWorkspace?.id) return;

    try {
      setIsLoading(true);
      const response = await WorkspaceService.getWorkspace(activeWorkspace.id);
      
      if (response.success && response.data) {
        // TODO: Carregar membros via service quando método estiver disponível
        Logger.info('WorkspaceSettings', 'Membros carregados');
      }
    } catch (err) {
      Logger.error('Erro ao carregar membros', err instanceof Error ? err : undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeWorkspace?.id) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const updates: UpdateWorkspaceRequest = {
        name: name.trim(),
        description: description.trim() || undefined
      };

      const response = await WorkspaceService.updateWorkspace(activeWorkspace.id, updates);

      if (response.success) {
        setSuccess('Informações atualizadas com sucesso! ✓');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.error || 'Erro ao salvar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeWorkspace?.id || !user?.id) return;
    
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      const response = await WorkspaceService.removeMember(activeWorkspace.id, memberId, user.id);
      
      if (response.success) {
        await loadMembers();
        setSuccess('Membro removido com sucesso');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.error || 'Erro ao remover membro');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace?.id) return;

    const confirmation = prompt(
      `Digite "${activeWorkspace.name}" para confirmar a exclusão permanente:`
    );

    if (confirmation !== activeWorkspace.name) {
      alert('Nome incorreto. Exclusão cancelada.');
      return;
    }

    try {
      const response = await WorkspaceService.deleteWorkspace(activeWorkspace.id);
      
      if (response.success) {
        alert('Workspace deletado com sucesso');
        window.location.hash = '#/app';
      } else {
        throw new Error(response.error || 'Erro ao deletar workspace');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      alert(errorMessage);
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="workspace-settings-empty">
        <i className="fas fa-inbox"></i>
        <h3>Nenhum workspace selecionado</h3>
        <p>Selecione ou crie um workspace para gerenciar configurações.</p>
      </div>
    );
  }

  const currentPlan = PLAN_CONFIGS[activeWorkspace.planType];

  return (
    <div className="workspace-settings">
      <div className="settings-header">
        <div>
          <h1><i className="fas fa-cog"></i> Configurações do Workspace</h1>
          <p>Gerencie informações, membros e planos</p>
        </div>
      </div>

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

      <div className="settings-content">
        {/* Informações Básicas */}
        <section className="settings-section">
          <h2><i className="fas fa-info-circle"></i> Informações Básicas</h2>
          <form onSubmit={handleSaveBasicInfo} className="settings-form">
            <div className="form-group">
              <label htmlFor="workspace-name">Nome do Workspace</label>
              <input
                id="workspace-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                required
                disabled={!isWorkspaceOwner || isSaving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="workspace-description">Descrição</label>
              <textarea
                id="workspace-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                rows={3}
                disabled={!isWorkspaceOwner || isSaving}
              />
            </div>

            {isWorkspaceOwner && (
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? (
                  <><i className="fas fa-spinner fa-spin"></i> Salvando...</>
                ) : (
                  <><i className="fas fa-save"></i> Salvar Alterações</>
                )}
              </button>
            )}
          </form>
        </section>

        {/* Plano Atual */}
        <section className="settings-section">
          <h2><i className="fas fa-star"></i> Plano Atual</h2>
          <div className="plan-info-card">
            <div className="plan-info-header">
              <div>
                <h3>{currentPlan.name}</h3>
                <p className="plan-price">
                  {currentPlan.price === 0 ? 'Grátis' : `R$ ${currentPlan.price.toFixed(2)}/mês`}
                </p>
              </div>
              {isWorkspaceOwner && currentPlan.type !== PlanType.FAMILY_PLUS && (
                <button className="btn btn-upgrade">
                  <i className="fas fa-arrow-up"></i> Fazer Upgrade
                </button>
              )}
            </div>
            <div className="plan-info-details">
              <div className="plan-stat">
                <i className="fas fa-users"></i>
                <span>{activeWorkspace.currentMembers}/{activeWorkspace.maxMembers} membros</span>
              </div>
              {activeWorkspace.trialEndsAt && (
                <div className="plan-stat trial">
                  <i className="fas fa-gift"></i>
                  <span>Trial até {new Date(activeWorkspace.trialEndsAt).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>
            <div className="plan-features">
              {currentPlan.features.map((feature, idx) => (
                <div key={idx} className="plan-feature">
                  <i className="fas fa-check"></i>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Membros */}
        <section className="settings-section">
          <div className="section-header-with-action">
            <h2><i className="fas fa-users"></i> Membros ({members.length})</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowInviteModal(true)}
              disabled={activeWorkspace.currentMembers >= activeWorkspace.maxMembers}
            >
              <i className="fas fa-user-plus"></i> Convidar Membro
            </button>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              Carregando membros...
            </div>
          ) : members.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-user-friends"></i>
              <p>Nenhum membro ainda. Convide pessoas para colaborar!</p>
            </div>
          ) : (
            <div className="members-list">
              {members.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="member-info">
                    <div className="member-name">{member.userId}</div>
                    <div className="member-role">
                      <span className={`role-badge role-${member.role.toLowerCase()}`}>
                        {getRoleLabel(member.role)}
                      </span>
                    </div>
                  </div>
                  {isWorkspaceOwner && member.role !== MemberRole.OWNER && (
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleRemoveMember(member.id)}
                      title="Remover membro"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Zona de Perigo */}
        {isWorkspaceOwner && (
          <section className="settings-section danger-zone">
            <h2><i className="fas fa-exclamation-triangle"></i> Zona de Perigo</h2>
            <div className="danger-zone-content">
              <div>
                <h3>Deletar Workspace</h3>
                <p>Uma vez deletado, não há como recuperar. Esta ação é permanente.</p>
              </div>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteWorkspace}
              >
                <i className="fas fa-trash-alt"></i> Deletar Workspace
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Modal de Convite */}
      <InviteMemberModal 
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          setShowInviteModal(false);
          loadMembers();
        }}
      />
    </div>
  );
};

// Helper function
const getRoleLabel = (role: MemberRole): string => {
  const labels: Record<MemberRole, string> = {
    [MemberRole.OWNER]: 'Proprietário',
    [MemberRole.ADMIN]: 'Administrador',
    [MemberRole.CONTRIBUTOR]: 'Colaborador',
    [MemberRole.VIEWER]: 'Visualizador'
  };
  return labels[role];
};

export default WorkspaceSettings;
