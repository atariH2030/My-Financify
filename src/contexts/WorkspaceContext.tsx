/**
 * WorkspaceContext.tsx - Context Completo
 * 
 * Context React para gerenciamento de workspaces com CRUD completo
 * Integração com Supabase e cache local
 * 
 * @version 3.16.0
 * @author DEV - Rickson
 */

import React, { 
  createContext, 
  useContext, 
  useState,
  useEffect,
  useCallback,
  ReactNode 
} from 'react';
import { useAuth } from './AuthContext';
import WorkspaceService from '../services/workspace.service';
import LoggerService from '../services/logger.service';
import type { 
  Workspace, 
  WorkspaceMember,
  WorkspaceInvite,
  MemberRole,
  CreateWorkspaceRequest,
  InviteMemberRequest,
  UpdateWorkspaceRequest
} from '../types/workspace.types';

// ===========================
// INTERFACES
// ===========================

interface WorkspaceContextValue {
  // Estado
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  members: WorkspaceMember[];
  invites: WorkspaceInvite[];
  isLoading: boolean;
  error: string | null;
  
  // Setters
  setActiveWorkspace: (workspace: Workspace | null) => void;
  
  // CRUD - Workspaces
  createWorkspace: (request: CreateWorkspaceRequest) => Promise<Workspace>;
  updateWorkspace: (workspaceId: string, updates: UpdateWorkspaceRequest) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  loadWorkspaces: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  
  // CRUD - Members
  inviteMember: (request: InviteMemberRequest) => Promise<void>;
  removeMember: (workspaceId: string, userId: string) => Promise<void>;
  updateMemberRole: (workspaceId: string, userId: string, role: MemberRole) => Promise<void>;
  loadMembers: (workspaceId: string) => Promise<void>;
  
  // CRUD - Invites
  acceptInvite: (token: string) => Promise<void>;
  declineInvite: (token: string) => Promise<void>;
  cancelInvite: (inviteId: string) => Promise<void>;
  loadInvites: (workspaceId: string) => Promise<void>;
  
  // Helpers
  isWorkspaceOwner: boolean;
  currentMemberRole: MemberRole | null;
  canManageMembers: boolean;
  canEditWorkspace: boolean;
}

interface WorkspaceProviderProps {
  children: ReactNode;
}

// ===========================
// CONTEXT CREATION
// ===========================

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

const logger = LoggerService;

// ===========================
// PROVIDER COMPONENT
// ===========================

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===========================
  // COMPUTED VALUES
  // ===========================

  const isWorkspaceOwner = activeWorkspace?.ownerId === user?.id;
  
  const currentMemberRole: MemberRole | null = React.useMemo(() => {
    if (!activeWorkspace || !user) return null;
    const member = members.find(m => m.userId === user.id);
    return member?.role || null;
  }, [activeWorkspace, user, members]);

  const canManageMembers = currentMemberRole === 'owner' || currentMemberRole === 'admin';
  const canEditWorkspace = currentMemberRole === 'owner';

  // ===========================
  // WORKSPACE CRUD
  // ===========================

  const createWorkspace = useCallback(async (request: CreateWorkspaceRequest): Promise<Workspace> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('WORKSPACE_CONTEXT', `Criando workspace: ${request.name}`);
      const response = await WorkspaceService.createWorkspace(user.id, request);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erro ao criar workspace');
      }

      const workspace = response.data;
      
      // Adicionar aos workspaces locais
      setWorkspaces(prev => [...prev, workspace]);
      
      // Definir como ativo se for o primeiro
      if (workspaces.length === 0) {
        setActiveWorkspaceState(workspace);
        localStorage.setItem('activeWorkspaceId', workspace.id);
      }
      
      logger.info('WORKSPACE_CONTEXT', `Workspace criado: ${workspace.id}`);
      return workspace;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar workspace';
      logger.error('WORKSPACE_CONTEXT', err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, workspaces.length]);

  const updateWorkspace = useCallback(async (
    workspaceId: string, 
    updates: UpdateWorkspaceRequest
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('WORKSPACE_CONTEXT', `Atualizando workspace: ${workspaceId}`);
      const response = await WorkspaceService.updateWorkspace(workspaceId, updates);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao atualizar workspace');
      }
      
      // Atualizar localmente
      setWorkspaces(prev => 
        prev.map(w => w.id === workspaceId ? { ...w, ...updates } as Workspace : w)
      );
      
      if (activeWorkspace?.id === workspaceId) {
        setActiveWorkspaceState(prev => prev ? { ...prev, ...updates } as Workspace : null);
      }
      
      logger.info('WORKSPACE_CONTEXT', 'Workspace atualizado com sucesso');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar workspace';
      logger.error('WORKSPACE_CONTEXT', err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id]);

  const deleteWorkspace = useCallback(async (workspaceId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('WORKSPACE_CONTEXT', `Deletando workspace: ${workspaceId}`);
      const response = await WorkspaceService.deleteWorkspace(workspaceId);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao deletar workspace');
      }
      
      // Remover localmente
      setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
      
      // Se era o ativo, limpar
      if (activeWorkspace?.id === workspaceId) {
        setActiveWorkspaceState(null);
        localStorage.removeItem('activeWorkspaceId');
      }
      
      logger.info('WORKSPACE_CONTEXT', 'Workspace deletado com sucesso');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar workspace';
      logger.error('WORKSPACE_CONTEXT', err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id]);

  const loadWorkspaces = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('WORKSPACE_CONTEXT', 'Carregando workspaces do usuário');
      const userWorkspaces = await WorkspaceService.getUserWorkspaces(user.id);
      setWorkspaces(userWorkspaces);
      
      // Restaurar workspace ativo do localStorage
      const savedWorkspaceId = localStorage.getItem('activeWorkspaceId');
      if (savedWorkspaceId) {
        const saved = userWorkspaces.find(w => w.id === savedWorkspaceId);
        if (saved) {
          setActiveWorkspaceState(saved);
        }
      } else if (userWorkspaces.length > 0) {
        // Definir primeiro workspace como ativo
        setActiveWorkspaceState(userWorkspaces[0]);
        localStorage.setItem('activeWorkspaceId', userWorkspaces[0].id);
      }
      
      logger.info('WORKSPACE_CONTEXT', `Workspaces carregados: ${userWorkspaces.length}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar workspaces';
      logger.error('WORKSPACE_CONTEXT', err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const switchWorkspace = useCallback(async (workspaceId: string): Promise<void> => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) {
      throw new Error('Workspace não encontrado');
    }
    
    setActiveWorkspaceState(workspace);
    localStorage.setItem('activeWorkspaceId', workspaceId);
    logger.info('WORKSPACE_CONTEXT', `Workspace alternado: ${workspaceId}`);
  }, [workspaces]);

  // ===========================
  // MEMBERS CRUD
  // ===========================

  const inviteMember = useCallback(async (request: InviteMemberRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('WORKSPACE_CONTEXT', `Convidando membro: ${request.email}`);
      const response = await WorkspaceService.inviteMember(request);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao convidar membro');
      }
      
      logger.info('WORKSPACE_CONTEXT', 'Membro convidado com sucesso');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao convidar membro';
      logger.error('WORKSPACE_CONTEXT', err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []); // loadInvites será chamado manualmente

  const removeMember = useCallback(async (workspaceId: string, userId: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('WORKSPACE_CONTEXT', `Removendo membro: ${userId}`);
      const response = await WorkspaceService.removeMember(workspaceId, userId, user.id);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao remover membro');
      }
      
      // Atualizar localmente
      setMembers(prev => prev.filter(m => !(m.workspaceId === workspaceId && m.userId === userId)));
      
      logger.info('WORKSPACE_CONTEXT', 'Membro removido com sucesso');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao remover membro';
      logger.error('WORKSPACE_CONTEXT', err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateMemberRole = useCallback(async (
    workspaceId: string, 
    userId: string, 
    role: MemberRole
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('WORKSPACE_CONTEXT', `Atualizando role: ${userId} -> ${role}`);
      const response = await WorkspaceService.updateMemberRole({ workspaceId, userId, role });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Erro ao atualizar role');
      }
      
      // Atualizar localmente
      setMembers(prev => 
        prev.map(m => 
          m.workspaceId === workspaceId && m.userId === userId 
            ? { ...m, role } 
            : m
        )
      );
      
      logger.info('WORKSPACE_CONTEXT', 'Role atualizada com sucesso');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar role';
      logger.error('WORKSPACE_CONTEXT', err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMembers = useCallback(async (workspaceId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('WORKSPACE_CONTEXT', `Carregando membros: ${workspaceId}`);
      const workspaceMembers = await WorkspaceService.getWorkspaceMembers(workspaceId);
      setMembers(workspaceMembers);
      logger.info('WORKSPACE_CONTEXT', `Membros carregados: ${workspaceMembers.length}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar membros';
      logger.error('WORKSPACE_CONTEXT', err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ===========================
  // INVITES CRUD
  // ===========================

  const acceptInvite = useCallback(async (token: string): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('WORKSPACE_CONTEXT', `Aceitando convite: ${token}`);
      const response = await WorkspaceService.acceptInvite(user.id, { token });
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao aceitar convite');
      }
      
      // Recarregar workspaces
      await loadWorkspaces();
      
      logger.info('WORKSPACE_CONTEXT', 'Convite aceito com sucesso');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao aceitar convite';
      logger.error('WORKSPACE_CONTEXT', err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, loadWorkspaces]);

  const declineInvite = useCallback(async (token: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('WORKSPACE_CONTEXT', `Recusando convite: ${token}`);
      const response = await WorkspaceService.declineInvite(token);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao recusar convite');
      }
      
      logger.info('WORKSPACE_CONTEXT', 'Convite recusado com sucesso');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao recusar convite';
      logger.error('WORKSPACE_CONTEXT', err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelInvite = useCallback(async (inviteId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('WORKSPACE_CONTEXT', `Cancelando convite: ${inviteId}`);
      const response = await WorkspaceService.cancelInvite(inviteId);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao cancelar convite');
      }
      
      // Remover localmente
      setInvites(prev => prev.filter(inv => inv.id !== inviteId));
      
      logger.info('WORKSPACE_CONTEXT', 'Convite cancelado com sucesso');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao cancelar convite';
      logger.error('WORKSPACE_CONTEXT', err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadInvites = useCallback(async (workspaceId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      logger.info('WORKSPACE_CONTEXT', `Carregando convites: ${workspaceId}`);
      const workspaceInvites = await WorkspaceService.getWorkspaceInvites(workspaceId);
      setInvites(workspaceInvites);
      logger.info('WORKSPACE_CONTEXT', `Convites carregados: ${workspaceInvites.length}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar convites';
      logger.error('WORKSPACE_CONTEXT', err instanceof Error ? err : new Error(errorMsg));
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ===========================
  // EFFECTS
  // ===========================

  // Carregar workspaces ao montar (se usuário autenticado)
  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user, loadWorkspaces]);

  // Carregar membros quando workspace ativo mudar
  useEffect(() => {
    if (activeWorkspace) {
      loadMembers(activeWorkspace.id);
      loadInvites(activeWorkspace.id);
    }
  }, [activeWorkspace, loadMembers, loadInvites]);

  // ===========================
  // PROVIDER VALUE
  // ===========================

  const value: WorkspaceContextValue = {
    // Estado
    activeWorkspace,
    workspaces,
    members,
    invites,
    isLoading,
    error,
    
    // Setters
    setActiveWorkspace: setActiveWorkspaceState,
    
    // CRUD - Workspaces
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    loadWorkspaces,
    switchWorkspace,
    
    // CRUD - Members
    inviteMember,
    removeMember,
    updateMemberRole,
    loadMembers,
    
    // CRUD - Invites
    acceptInvite,
    declineInvite,
    cancelInvite,
    loadInvites,
    
    // Helpers
    isWorkspaceOwner,
    currentMemberRole,
    canManageMembers,
    canEditWorkspace
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

// ===========================
// CUSTOM HOOK
// ===========================

/**
 * Hook para acessar workspace context
 * @throws {Error} Se usado fora do WorkspaceProvider
 */
export const useWorkspace = (): WorkspaceContextValue => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace deve ser usado dentro de WorkspaceProvider');
  }
  return context;
};
