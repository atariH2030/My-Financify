/**
 * WorkspaceContext.tsx - MVP Simplificado
 * 
 * Context React para gerenciamento básico de workspaces
 * Versão inicial focada em funcionalidade core
 * 
 * @version 3.15.0
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  ReactNode 
} from 'react';
import { useAuth } from './AuthContext';
import type { 
  Workspace, 
  MemberRole,
  Permission,
  PlanType
} from '../types/workspace.types';

// ===========================
// INTERFACES
// ===========================

interface WorkspaceContextValue {
  // Estado básico
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  
  // Helpers
  isWorkspaceOwner: boolean;
  currentMemberRole: MemberRole | null;
}

interface WorkspaceProviderProps {
  children: ReactNode;
}

// ===========================
// CONTEXT CREATION
// ===========================

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

// ===========================
// PROVIDER COMPONENT (MVP)
// ===========================

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  // Computed values
  const isWorkspaceOwner = activeWorkspace?.ownerId === user?.id;
  const currentMemberRole = null; // TODO: Buscar role do membro após migration

  const value: WorkspaceContextValue = {
    activeWorkspace,
    setActiveWorkspace,
    workspaces,
    setWorkspaces,
    isWorkspaceOwner,
    currentMemberRole
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
 */
export const useWorkspace = (): WorkspaceContextValue => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace deve ser usado dentro de WorkspaceProvider');
  }
  return context;
};
