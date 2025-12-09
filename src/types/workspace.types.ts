/**
 * Workspace Types
 * Tipos TypeScript para sistema de workspaces compartilhados
 * 
 * @version 1.0.0
 * @author DEV - Rickson
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum WorkspaceType {
  PERSONAL = 'personal',
  COUPLE = 'couple',
  FAMILY = 'family',
  BUSINESS = 'business'
}

export enum PlanType {
  FREE = 'free',
  PRO = 'pro',
  COUPLE = 'couple',
  FAMILY_3 = 'family_3',
  FAMILY_5 = 'family_5',
  FAMILY_PLUS = 'family_plus'
}

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  CONTRIBUTOR = 'contributor',
  VIEWER = 'viewer'
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export enum Permission {
  // Transações
  TRANSACTIONS_CREATE = 'transactions:create',
  TRANSACTIONS_READ = 'transactions:read',
  TRANSACTIONS_UPDATE = 'transactions:update',
  TRANSACTIONS_DELETE = 'transactions:delete',
  
  // Orçamentos
  BUDGETS_CREATE = 'budgets:create',
  BUDGETS_READ = 'budgets:read',
  BUDGETS_UPDATE = 'budgets:update',
  BUDGETS_DELETE = 'budgets:delete',
  
  // Metas
  GOALS_CREATE = 'goals:create',
  GOALS_READ = 'goals:read',
  GOALS_UPDATE = 'goals:update',
  GOALS_DELETE = 'goals:delete',
  
  // Contas
  ACCOUNTS_CREATE = 'accounts:create',
  ACCOUNTS_READ = 'accounts:read',
  ACCOUNTS_UPDATE = 'accounts:update',
  ACCOUNTS_DELETE = 'accounts:delete',
  
  // Membros
  MEMBERS_INVITE = 'members:invite',
  MEMBERS_REMOVE = 'members:remove',
  MEMBERS_UPDATE_ROLE = 'members:update-role',
  
  // Configurações
  SETTINGS_UPDATE = 'settings:update',
  WORKSPACE_DELETE = 'workspace:delete',
  BILLING_MANAGE = 'billing:manage'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: WorkspaceType;
  planType: PlanType;
  ownerId: string;
  maxMembers: number;
  currentMembers: number;
  settings: WorkspaceSettings;
  
  // Billing
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  billingCycleAnchor?: Date;
  trialEndsAt?: Date;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface WorkspaceSettings {
  currency: string;
  locale: string;
  timezone: string;
  
  // Features
  enableNotifications: boolean;
  enableEmailReports: boolean;
  enableRecurringTransactions: boolean;
  
  // Privacy
  allowMemberInvites: boolean; // Membros podem convidar outros
  requireApprovalForExpenses: boolean; // Despesas precisam aprovação
  
  // Family-specific
  enableAllowance?: boolean; // Mesada digital
  allowanceSettings?: AllowanceSettings;
}

export interface AllowanceSettings {
  enabled: boolean;
  defaultAmount: number;
  frequency: 'weekly' | 'monthly';
  autoApproveLimit: number; // Auto-aprovar gastos até X
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: MemberRole;
  customPermissions: Permission[]; // Override role padrão
  
  // User data (joined)
  userEmail?: string;
  userFullName?: string;
  userAvatar?: string;
  
  // Metadata
  invitedBy: string;
  joinedAt: Date;
  lastActiveAt?: Date;
  removedAt?: Date;
  removedBy?: string;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  invitedBy: string;
  email: string;
  role: MemberRole;
  token: string;
  status: InviteStatus;
  
  // Metadata
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
}

export interface WorkspaceWithMembers extends Workspace {
  members: WorkspaceMember[];
  owner: WorkspaceMember;
  currentUserRole?: MemberRole;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateWorkspaceRequest {
  name: string;
  type: WorkspaceType;
  planType: PlanType;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  settings?: Partial<WorkspaceSettings>;
}

export interface InviteMemberRequest {
  workspaceId: string;
  invitedBy: string; // ID do usuário que está convidando
  email: string;
  role: MemberRole;
  customPermissions?: Permission[];
}

export interface UpdateMemberRoleRequest {
  workspaceId: string;
  userId: string;
  role: MemberRole;
  customPermissions?: Permission[];
}

export interface AcceptInviteRequest {
  token: string;
}

// ============================================================================
// PLAN CONFIGURATIONS
// ============================================================================

export interface PlanConfig {
  type: PlanType;
  name: string;
  price: number;
  maxMembers: number;
  features: string[];
  badge?: string;
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
  [PlanType.FREE]: {
    type: PlanType.FREE,
    name: 'FREE',
    price: 0,
    maxMembers: 1,
    features: [
      'Até 50 transações/mês',
      '1 workspace',
      '3 contas bancárias',
      'Dashboard básico'
    ]
  },
  [PlanType.PRO]: {
    type: PlanType.PRO,
    name: 'PRO',
    price: 19.90,
    maxMembers: 1,
    features: [
      'Transações ilimitadas',
      '1 workspace',
      'Contas ilimitadas',
      'Dashboard avançado',
      'Relatórios PDF',
      'Suporte prioritário'
    ]
  },
  [PlanType.COUPLE]: {
    type: PlanType.COUPLE,
    name: 'CASAL',
    price: 29.90,
    maxMembers: 2,
    features: [
      'Tudo do PRO +',
      '2 usuários (casal)',
      'Dashboard compartilhado',
      'Orçamento conjunto',
      'Metas familiares'
    ],
    badge: '❤️ Mais Escolhido'
  },
  [PlanType.FAMILY_3]: {
    type: PlanType.FAMILY_3,
    name: 'FAMÍLIA 3',
    price: 39.90,
    maxMembers: 3,
    features: [
      'Tudo do CASAL +',
      'Até 3 membros',
      'Controle parental',
      'Permissões customizáveis',
      'Educação financeira infantil'
    ]
  },
  [PlanType.FAMILY_5]: {
    type: PlanType.FAMILY_5,
    name: 'FAMÍLIA 5',
    price: 49.90,
    maxMembers: 5,
    features: [
      'Tudo do FAMÍLIA 3 +',
      'Até 5 membros',
      'Mesada digital',
      'Relatórios por membro'
    ]
  },
  [PlanType.FAMILY_PLUS]: {
    type: PlanType.FAMILY_PLUS,
    name: 'FAMÍLIA+',
    price: 69.90,
    maxMembers: Infinity,
    features: [
      'Tudo do FAMÍLIA 5 +',
      'Membros ilimitados',
      'Multi-workspaces',
      'API de terceiros',
      'Suporte 24/7',
      'Consultoria mensal'
    ],
    badge: '👑 Premium'
  }
};

// ============================================================================
// PERMISSION MATRIX (RBAC)
// ============================================================================

export const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
  [MemberRole.OWNER]: [
    // OWNER tem TODAS as permissões
    ...Object.values(Permission)
  ],
  [MemberRole.ADMIN]: [
    // Transações
    Permission.TRANSACTIONS_CREATE,
    Permission.TRANSACTIONS_READ,
    Permission.TRANSACTIONS_UPDATE,
    Permission.TRANSACTIONS_DELETE,
    
    // Orçamentos
    Permission.BUDGETS_CREATE,
    Permission.BUDGETS_READ,
    Permission.BUDGETS_UPDATE,
    Permission.BUDGETS_DELETE,
    
    // Metas
    Permission.GOALS_CREATE,
    Permission.GOALS_READ,
    Permission.GOALS_UPDATE,
    Permission.GOALS_DELETE,
    
    // Contas
    Permission.ACCOUNTS_CREATE,
    Permission.ACCOUNTS_READ,
    Permission.ACCOUNTS_UPDATE,
    Permission.ACCOUNTS_DELETE,
    
    // Membros
    Permission.MEMBERS_INVITE,
    Permission.MEMBERS_REMOVE,
    Permission.MEMBERS_UPDATE_ROLE,
    
    // Configurações (mas não billing/delete)
    Permission.SETTINGS_UPDATE
  ],
  [MemberRole.CONTRIBUTOR]: [
    // Transações
    Permission.TRANSACTIONS_CREATE,
    Permission.TRANSACTIONS_READ,
    Permission.TRANSACTIONS_UPDATE,
    
    // Orçamentos
    Permission.BUDGETS_CREATE,
    Permission.BUDGETS_READ,
    Permission.BUDGETS_UPDATE,
    
    // Metas
    Permission.GOALS_CREATE,
    Permission.GOALS_READ,
    Permission.GOALS_UPDATE,
    
    // Contas (só leitura)
    Permission.ACCOUNTS_READ
  ],
  [MemberRole.VIEWER]: [
    // Apenas leitura
    Permission.TRANSACTIONS_READ,
    Permission.BUDGETS_READ,
    Permission.GOALS_READ,
    Permission.ACCOUNTS_READ
  ]
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Verifica se role tem permissão específica
 */
export const hasPermission = (
  role: MemberRole,
  permission: Permission,
  customPermissions?: Permission[]
): boolean => {
  // Verificar permissões customizadas primeiro
  if (customPermissions && customPermissions.includes(permission)) {
    return true;
  }
  
  // Verificar permissões padrão do role
  return ROLE_PERMISSIONS[role].includes(permission);
};

/**
 * Verifica se role pode executar ação
 */
export const canPerformAction = (
  role: MemberRole,
  action: string,
  customPermissions?: Permission[]
): boolean => {
  const permission = action as Permission;
  return hasPermission(role, permission, customPermissions);
};

/**
 * Retorna config do plano
 */
export const getPlanConfig = (planType: PlanType): PlanConfig => {
  return PLAN_CONFIGS[planType];
};

/**
 * Verifica se workspace pode adicionar mais membros
 */
export const canAddMember = (workspace: Workspace): boolean => {
  return workspace.currentMembers < workspace.maxMembers;
};

/**
 * Calcula se plano suporta número de membros
 */
export const isPlanSufficient = (
  planType: PlanType,
  requiredMembers: number
): boolean => {
  const config = PLAN_CONFIGS[planType];
  return config.maxMembers >= requiredMembers || config.maxMembers === Infinity;
};
