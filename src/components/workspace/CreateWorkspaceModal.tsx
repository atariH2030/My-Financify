/**
 * CreateWorkspaceModal.tsx
 * 
 * Modal para criação de novo workspace
 * Features:
 * - Formulário com validação
 * - Seleção de tipo (PERSONAL, COUPLE, FAMILY, BUSINESS)
 * - Seleção de plano com preview de preço
 * - Indicador de trial de 14 dias
 * 
 * @version 3.15.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WorkspaceService from '../../services/workspace.service';
import Logger from '../../services/logger.service';
import { 
  WorkspaceType, 
  PlanType, 
  PLAN_CONFIGS,
  type CreateWorkspaceRequest 
} from '../../types/workspace.types';
import './CreateWorkspaceModal.css';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (workspaceId: string) => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<WorkspaceType>(WorkspaceType.PERSONAL);
  const [planType, setPlanType] = useState<PlanType>(PlanType.FREE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Usuário não autenticado');
      return;
    }

    if (!name.trim()) {
      setError('Nome do workspace é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const request: CreateWorkspaceRequest = {
        name: name.trim(),
        type,
        planType,
        description: description.trim() || undefined
      };

      const response = await WorkspaceService.createWorkspace(user.id, request);

      if (response.success && response.data) {
        Logger.info('CreateWorkspaceModal', `Workspace criado: ${response.data.id}`);
        onSuccess(response.data.id);
        handleClose();
      } else {
        throw new Error(response.error || 'Erro ao criar workspace');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      Logger.error('Erro ao criar workspace', err instanceof Error ? err : undefined);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName('');
      setDescription('');
      setType(WorkspaceType.PERSONAL);
      setPlanType(PlanType.FREE);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedPlan = PLAN_CONFIGS[planType];

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content create-workspace-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><i className="fas fa-plus-circle"></i> Criar Novo Workspace</h2>
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

          {/* Nome do Workspace */}
          <div className="form-group">
            <label htmlFor="workspace-name">
              Nome do Workspace <span className="required">*</span>
            </label>
            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Família Silva"
              maxLength={50}
              required
              disabled={isLoading}
              autoFocus
            />
            <small className="form-hint">
              {name.length}/50 caracteres
            </small>
          </div>

          {/* Descrição (opcional) */}
          <div className="form-group">
            <label htmlFor="workspace-description">Descrição (opcional)</label>
            <textarea
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste workspace..."
              maxLength={200}
              rows={3}
              disabled={isLoading}
            />
            <small className="form-hint">
              {description.length}/200 caracteres
            </small>
          </div>

          {/* Tipo de Workspace */}
          <div className="form-group">
            <label>Tipo de Workspace</label>
            <div className="workspace-type-grid">
              {Object.values(WorkspaceType).map((workspaceType) => (
                <button
                  key={workspaceType}
                  type="button"
                  className={`workspace-type-card ${type === workspaceType ? 'active' : ''}`}
                  onClick={() => setType(workspaceType)}
                  disabled={isLoading}
                >
                  <i className={`fas ${getTypeIcon(workspaceType)}`}></i>
                  <span>{getTypeLabel(workspaceType)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Plano */}
          <div className="form-group">
            <label>Plano</label>
            <div className="plan-grid">
              {Object.values(PlanType).map((plan) => {
                const config = PLAN_CONFIGS[plan];
                return (
                  <button
                    key={plan}
                    type="button"
                    className={`plan-card ${planType === plan ? 'active' : ''}`}
                    onClick={() => setPlanType(plan)}
                    disabled={isLoading}
                  >
                    <div className="plan-header">
                      <span className="plan-name">{config.name}</span>
                      {config.price === 0 ? (
                        <span className="plan-price">Grátis</span>
                      ) : (
                        <span className="plan-price">
                          R$ {config.price.toFixed(2)}<small>/mês</small>
                        </span>
                      )}
                    </div>
                    <div className="plan-features">
                      <div className="plan-feature">
                        <i className="fas fa-users"></i>
                        {config.maxMembers === Infinity ? 'Ilimitado' : config.maxMembers} {config.maxMembers === 1 ? 'membro' : 'membros'}
                      </div>
                      {config.features.map((feature, idx) => (
                        <div key={idx} className="plan-feature">
                          <i className="fas fa-check"></i>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trial Notice */}
          {selectedPlan.price > 0 && (
            <div className="trial-notice">
              <i className="fas fa-gift"></i>
              <div>
                <strong>14 dias grátis!</strong>
                <p>Experimente todos os recursos sem compromisso. Cancele a qualquer momento.</p>
              </div>
            </div>
          )}
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
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Criando...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i> Criar Workspace
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getTypeIcon = (type: WorkspaceType): string => {
  const icons: Record<WorkspaceType, string> = {
    [WorkspaceType.PERSONAL]: 'fa-user',
    [WorkspaceType.COUPLE]: 'fa-heart',
    [WorkspaceType.FAMILY]: 'fa-users',
    [WorkspaceType.BUSINESS]: 'fa-briefcase'
  };
  return icons[type];
};

const getTypeLabel = (type: WorkspaceType): string => {
  const labels: Record<WorkspaceType, string> = {
    [WorkspaceType.PERSONAL]: 'Pessoal',
    [WorkspaceType.COUPLE]: 'Casal',
    [WorkspaceType.FAMILY]: 'Família',
    [WorkspaceType.BUSINESS]: 'Negócio'
  };
  return labels[type];
};

export default CreateWorkspaceModal;
