/**
 * WorkspaceSwitcher.tsx
 * 
 * Dropdown para troca de workspace na sidebar
 * Features:
 * - Lista de workspaces do usuário
 * - Indicador visual do workspace ativo
 * - Ícones por tipo (PERSONAL, COUPLE, FAMILY)
 * - Badge de plano (FREE, PRO, etc)
 * - Botão "Criar novo workspace"
 * 
 * @version 3.15.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { WorkspaceType, PlanType } from '../../types/workspace.types';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import './WorkspaceSwitcher.css';

// ===========================
// INTERFACES
// ===========================

interface WorkspaceSwitcherProps {
  onCreateNew?: () => void;
}

// ===========================
// HELPER FUNCTIONS
// ===========================

const getWorkspaceIcon = (type: WorkspaceType): string => {
  const icons: Record<WorkspaceType, string> = {
    [WorkspaceType.PERSONAL]: 'fa-user',
    [WorkspaceType.COUPLE]: 'fa-heart',
    [WorkspaceType.FAMILY]: 'fa-users',
    [WorkspaceType.BUSINESS]: 'fa-briefcase'
  };
  return icons[type];
};

const getPlanBadgeColor = (plan: PlanType): string => {
  const colors: Record<PlanType, string> = {
    [PlanType.FREE]: 'badge-free',
    [PlanType.PRO]: 'badge-pro',
    [PlanType.COUPLE]: 'badge-couple',
    [PlanType.FAMILY_3]: 'badge-family',
    [PlanType.FAMILY_5]: 'badge-family',
    [PlanType.FAMILY_PLUS]: 'badge-family-plus'
  };
  return colors[plan];
};

const getPlanLabel = (plan: PlanType): string => {
  const labels: Record<PlanType, string> = {
    [PlanType.FREE]: 'Free',
    [PlanType.PRO]: 'Pro',
    [PlanType.COUPLE]: 'Casal',
    [PlanType.FAMILY_3]: 'Família 3',
    [PlanType.FAMILY_5]: 'Família 5',
    [PlanType.FAMILY_PLUS]: 'Família+'
  };
  return labels[plan];
};

// ===========================
// COMPONENT
// ===========================

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ onCreateNew }) => {
  const { activeWorkspace, workspaces, setActiveWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleWorkspaceChange = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setActiveWorkspace(workspace);
      localStorage.setItem('activeWorkspaceId', workspaceId);
      setIsOpen(false);
    }
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    setShowCreateModal(true);
  };

  // Se não houver workspace ativo, mostrar placeholder
  if (!activeWorkspace) {
    return (
      <div className="workspace-switcher-empty">
        <button 
          className="workspace-create-button"
          onClick={handleCreateNew}
          title="Criar workspace"
        >
          <i className="fas fa-plus-circle"></i>
          <span>Criar Workspace</span>
        </button>
      </div>
    );
  }

  return (
    <div className="workspace-switcher" ref={dropdownRef}>
      {/* Botão do workspace ativo */}
      <button 
        className={`workspace-switcher-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="workspace-info">
          <div className="workspace-icon">
            <i className={`fas ${getWorkspaceIcon(activeWorkspace.type)}`}></i>
          </div>
          <div className="workspace-details">
            <div className="workspace-name">{activeWorkspace.name}</div>
            <div className="workspace-meta">
              <span className={`workspace-badge ${getPlanBadgeColor(activeWorkspace.planType)}`}>
                {getPlanLabel(activeWorkspace.planType)}
              </span>
              <span className="workspace-members">
                <i className="fas fa-user-friends"></i>
                {activeWorkspace.currentMembers}/{activeWorkspace.maxMembers}
              </span>
            </div>
          </div>
        </div>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} workspace-chevron`}></i>
      </button>

      {/* Dropdown de workspaces */}
      {isOpen && (
        <div className="workspace-dropdown">
          <div className="workspace-dropdown-header">
            <span>Seus Workspaces</span>
          </div>
          
          <div className="workspace-list">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                className={`workspace-item ${workspace.id === activeWorkspace.id ? 'active' : ''}`}
                onClick={() => handleWorkspaceChange(workspace.id)}
              >
                <div className="workspace-item-icon">
                  <i className={`fas ${getWorkspaceIcon(workspace.type)}`}></i>
                </div>
                <div className="workspace-item-info">
                  <div className="workspace-item-name">{workspace.name}</div>
                  <div className="workspace-item-meta">
                    <span className={`workspace-badge ${getPlanBadgeColor(workspace.planType)}`}>
                      {getPlanLabel(workspace.planType)}
                    </span>
                    {workspace.currentMembers > 1 && (
                      <span className="workspace-members-count">
                        {workspace.currentMembers} membros
                      </span>
                    )}
                  </div>
                </div>
                {workspace.id === activeWorkspace.id && (
                  <i className="fas fa-check workspace-check"></i>
                )}
              </button>
            ))}
          </div>

          <div className="workspace-dropdown-footer">
            <button 
              className="workspace-create-button"
              onClick={handleCreateNew}
            >
              <i className="fas fa-plus-circle"></i>
              <span>Novo Workspace</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      <CreateWorkspaceModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(workspaceId) => {
          setShowCreateModal(false);
          // Workspace será adicionado via Context/Service
          console.log('Workspace criado:', workspaceId);
        }}
      />
    </div>
  );
};

export default WorkspaceSwitcher;
