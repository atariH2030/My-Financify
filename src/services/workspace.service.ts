/**
 * Workspace Service
 * Gerenciamento completo de workspaces compartilhados
 * 
 * @version 1.0.0
 * @author DEV - Rickson
 */

import { supabase } from '../config/supabase.config';
import { Logger } from './logger.service';
import {
  hasPermission,
  type Workspace,
  type WorkspaceMember,
  type WorkspaceInvite,
  type WorkspaceWithMembers,
  type CreateWorkspaceRequest,
  type UpdateWorkspaceRequest,
  type InviteMemberRequest,
  type UpdateMemberRoleRequest,
  type AcceptInviteRequest,
  type MemberRole,
  type Permission,
  type WorkspaceSettings
} from '../types/workspace.types';

// ============================================================================
// INTERFACES DE RESPOSTA
// ============================================================================

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// WORKSPACE SERVICE
// ============================================================================

class WorkspaceService {
  private readonly logger = Logger;
  private currentWorkspaceId: string | null = null;

  // ==========================================================================
  // WORKSPACE CRUD
  // ==========================================================================

  /**
   * Cria novo workspace
   */
  async createWorkspace(
    userId: string,
    request: CreateWorkspaceRequest
  ): Promise<ServiceResponse<Workspace>> {
    try {
      this.logger.info('WORKSPACE', `Creating workspace: ${request.name}`);

      // Gerar slug único
      const slug = this.generateSlug(request.name);

      // Configurações padrão
      const defaultSettings: WorkspaceSettings = {
        currency: 'BRL',
        locale: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        enableNotifications: true,
        enableEmailReports: true,
        enableRecurringTransactions: true,
        allowMemberInvites: true,
        requireApprovalForExpenses: false
      };

      // Determinar max_members baseado no plano
      const maxMembers = this.getMaxMembersByPlan(request.planType);

      // Criar workspace
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .insert({
          name: request.name,
          slug: slug,
          description: request.description,
          type: request.type,
          plan_type: request.planType,
          owner_id: userId,
          max_members: maxMembers,
          current_members: 1, // Owner conta como membro
          settings: defaultSettings,
          subscription_status: 'trialing', // 14 dias grátis
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Adicionar owner como membro
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: userId,
          role: 'owner',
          invited_by: userId,
          joined_at: new Date().toISOString()
        });

      this.logger.info('WORKSPACE', `Workspace created: ${workspace.id}`);

      return {
        success: true,
        data: this.mapWorkspace(workspace)
      };
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar workspace'
      };
    }
  }

  /**
   * Lista workspaces do usuário
   */
  async listWorkspaces(userId: string): Promise<ServiceResponse<Workspace[]>> {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          workspace_members!inner(user_id)
        `)
        .eq('workspace_members.user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const workspaces = (data || []).map(w => this.mapWorkspace(w));

      return {
        success: true,
        data: workspaces
      };
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return {
        success: false,
        error: 'Erro ao listar workspaces'
      };
    }
  }

  /**
   * Busca workspace por ID com membros
   */
  async getWorkspace(workspaceId: string): Promise<ServiceResponse<WorkspaceWithMembers>> {
    try {
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .is('deleted_at', null)
        .single();

      if (workspaceError || !workspace) {
        throw new Error('Workspace não encontrado');
      }

      // Buscar membros
      const { data: members, error: membersError } = await supabase
        .from('workspace_members')
        .select(`
          *,
          user:user_id (
            email,
            user_profiles (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('workspace_id', workspaceId)
        .is('removed_at', null);

      if (membersError) {
        throw membersError;
      }

      const mappedMembers = (members || []).map(m => this.mapMember(m));
      const owner = mappedMembers.find(m => m.role === 'owner');

      if (!owner) {
        throw new Error('Workspace owner not found');
      }

      return {
        success: true,
        data: {
          ...this.mapWorkspace(workspace),
          members: mappedMembers,
          owner
        }
      };
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return {
        success: false,
        error: 'Erro ao buscar workspace'
      };
    }
  }

  /**
   * Atualiza workspace
   */
  async updateWorkspace(
    workspaceId: string,
    request: UpdateWorkspaceRequest
  ): Promise<ServiceResponse<Workspace>> {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .update({
          name: request.name,
          description: request.description,
          settings: request.settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', workspaceId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: this.mapWorkspace(data)
      };
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return {
        success: false,
        error: 'Erro ao atualizar workspace'
      };
    }
  }

  /**
   * Deleta workspace (soft delete)
   */
  async deleteWorkspace(workspaceId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', workspaceId);

      if (error) {
        throw error;
      }

      this.logger.info('WORKSPACE', `Workspace deleted: ${workspaceId}`);

      return { success: true };
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return {
        success: false,
        error: 'Erro ao deletar workspace'
      };
    }
  }

  // ==========================================================================
  // MEMBERS MANAGEMENT
  // ==========================================================================

  /**
   * Convida membro para workspace
   */
  async inviteMember(request: InviteMemberRequest): Promise<ServiceResponse<WorkspaceInvite>> {
    try {
      // Verificar se workspace tem vagas
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('current_members, max_members')
        .eq('id', request.workspaceId)
        .single();

      if (!workspace) {
        throw new Error('Workspace não encontrado');
      }

      if (workspace.current_members >= workspace.max_members) {
        throw new Error('Limite de membros atingido. Faça upgrade do plano.');
      }

      // Verificar se já existe convite pendente
      const { data: existingInvite } = await supabase
        .from('workspace_invites')
        .select('id')
        .eq('workspace_id', request.workspaceId)
        .eq('email', request.email)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        throw new Error('Convite já enviado para este email');
      }

      // Gerar token único
      const token = this.generateInviteToken();

      // Criar convite
      const { data: invite, error } = await supabase
        .from('workspace_invites')
        .insert({
          workspace_id: request.workspaceId,
          invited_by: request.invitedBy,
          email: request.email,
          role: request.role,
          token: token,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // TODO: Enviar email com link de convite
      // await this.sendInviteEmail(invite);

      this.logger.info('WORKSPACE', `Member invited: ${request.email} to workspace ${request.workspaceId}`);

      return {
        success: true,
        data: this.mapInvite(invite)
      };
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao convidar membro'
      };
    }
  }

  /**
   * Aceita convite para workspace
   */
  async acceptInvite(
    userId: string,
    request: AcceptInviteRequest
  ): Promise<ServiceResponse<WorkspaceMember>> {
    try {
      // Buscar convite
      const { data: invite, error: inviteError } = await supabase
        .from('workspace_invites')
        .select('*')
        .eq('token', request.token)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invite) {
        throw new Error('Convite inválido ou expirado');
      }

      // Verificar expiração
      if (new Date(invite.expires_at) < new Date()) {
        await supabase
          .from('workspace_invites')
          .update({ status: 'expired' })
          .eq('id', invite.id);

        throw new Error('Convite expirado');
      }

      // Adicionar como membro
      const { data: member, error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: invite.workspace_id,
          user_id: userId,
          role: invite.role,
          invited_by: invite.invited_by,
          joined_at: new Date().toISOString()
        })
        .select()
        .single();

      if (memberError) {
        throw memberError;
      }

      // Atualizar status do convite
      await supabase
        .from('workspace_invites')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invite.id);

      // Incrementar contador de membros
      await supabase.rpc('increment_workspace_members', {
        workspace_id: invite.workspace_id
      });

      this.logger.info('WORKSPACE', `Invite accepted by user ${userId}`);

      return {
        success: true,
        data: this.mapMember(member)
      };
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao aceitar convite'
      };
    }
  }

  /**
   * Atualiza role de membro
   */
  async updateMemberRole(request: UpdateMemberRoleRequest): Promise<ServiceResponse<WorkspaceMember>> {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .update({
          role: request.role,
          custom_permissions: request.customPermissions || []
        })
        .eq('workspace_id', request.workspaceId)
        .eq('user_id', request.userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      this.logger.info('WORKSPACE', `Member role updated: ${request.userId} to ${request.role}`);

      return {
        success: true,
        data: this.mapMember(data)
      };
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return {
        success: false,
        error: 'Erro ao atualizar role do membro'
      };
    }
  }

  /**
   * Remove membro do workspace
   */
  async removeMember(
    workspaceId: string,
    userId: string,
    removedBy: string
  ): Promise<ServiceResponse<void>> {
    try {
      // Não pode remover owner
      const { data: member } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .single();

      if (member?.role === 'owner') {
        throw new Error('Não é possível remover o owner do workspace');
      }

      // Soft delete
      const { error } = await supabase
        .from('workspace_members')
        .update({
          removed_at: new Date().toISOString(),
          removed_by: removedBy
        })
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // Decrementar contador
      await supabase.rpc('decrement_workspace_members', {
        workspace_id: workspaceId
      });

      this.logger.info('WORKSPACE', `Member removed: ${userId} from workspace ${workspaceId}`);

      return { success: true };
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao remover membro'
      };
    }
  }

  // ==========================================================================
  // PERMISSIONS
  // ==========================================================================

  /**
   * Verifica se usuário tem permissão no workspace
   */
  async checkPermission(
    userId: string,
    workspaceId: string,
    permission: Permission
  ): Promise<boolean> {
    try {
      const { data: member } = await supabase
        .from('workspace_members')
        .select('role, custom_permissions')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .is('removed_at', null)
        .single();

      if (!member) {
        return false;
      }

      return hasPermission(
        member.role as MemberRole,
        permission,
        member.custom_permissions || []
      );
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return false;
    }
  }

  /**
   * Requer permissão (middleware)
   */
  async requirePermission(
    userId: string,
    workspaceId: string,
    permission: Permission
  ): Promise<void> {
    const hasAccess = await this.checkPermission(userId, workspaceId, permission);

    if (!hasAccess) {
      throw new Error(`Permissão negada: ${permission}`);
    }
  }

  // ==========================================================================
  // WORKSPACE CONTEXT
  // ==========================================================================

  /**
   * Define workspace atual
   */
  setCurrentWorkspace(workspaceId: string): void {
    this.currentWorkspaceId = workspaceId;
    localStorage.setItem('current_workspace_id', workspaceId);
  }

  /**
   * Retorna workspace atual
   */
  getCurrentWorkspaceId(): string | null {
    if (!this.currentWorkspaceId) {
      this.currentWorkspaceId = localStorage.getItem('current_workspace_id');
    }
    return this.currentWorkspaceId;
  }

  /**
   * Limpa workspace atual
   */
  clearCurrentWorkspace(): void {
    this.currentWorkspaceId = null;
    localStorage.removeItem('current_workspace_id');
  }

  /**
   * Busca todos os workspaces de um usuário
   */
  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .or(`owner_id.eq.${userId},id.in.(select workspace_id from workspace_members where user_id='${userId}' and removed_at is null)`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(w => this.mapWorkspace(w));
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return [];
    }
  }

  /**
   * Busca membros de um workspace
   */
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          user:users!inner(
            id,
            email,
            user_profiles(full_name, avatar_url)
          )
        `)
        .eq('workspace_id', workspaceId)
        .is('removed_at', null)
        .order('joined_at', { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map(m => this.mapMember(m));
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return [];
    }
  }

  /**
   * Busca convites pendentes de um workspace
   */
  async getWorkspaceInvites(workspaceId: string): Promise<WorkspaceInvite[]> {
    try {
      const { data, error } = await supabase
        .from('workspace_invites')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(inv => this.mapInvite(inv));
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return [];
    }
  }

  /**
   * Recusa convite
   */
  async declineInvite(token: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('workspace_invites')
        .update({
          status: 'declined',
          declined_at: new Date().toISOString()
        })
        .eq('token', token);

      if (error) {
        throw error;
      }

      this.logger.info('WORKSPACE', `Invite declined: ${token}`);

      return { success: true };
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return {
        success: false,
        error: 'Erro ao recusar convite'
      };
    }
  }

  /**
   * Cancela convite pendente
   */
  async cancelInvite(inviteId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase
        .from('workspace_invites')
        .delete()
        .eq('id', inviteId);

      if (error) {
        throw error;
      }

      this.logger.info('WORKSPACE', `Invite cancelled: ${inviteId}`);

      return { success: true };
    } catch (error) {
      this.logger.error('WORKSPACE', error as Error);
      return {
        success: false,
        error: 'Erro ao cancelar convite'
      };
    }
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Math.random().toString(36).substring(2, 9);
  }

  private generateInviteToken(): string {
    return `inv_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }

  private getMaxMembersByPlan(planType: string): number {
    const limits: Record<string, number> = {
      free: 1,
      pro: 1,
      couple: 2,
      family_3: 3,
      family_5: 5,
      family_plus: 999
    };
    return limits[planType] || 1;
  }

  private mapWorkspace(data: any): Workspace {
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      type: data.type,
      planType: data.plan_type,
      ownerId: data.owner_id,
      maxMembers: data.max_members,
      currentMembers: data.current_members,
      settings: data.settings,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      billingCycleAnchor: data.billing_cycle_anchor ? new Date(data.billing_cycle_anchor) : undefined,
      trialEndsAt: data.trial_ends_at ? new Date(data.trial_ends_at) : undefined,
      subscriptionStatus: data.subscription_status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      deletedAt: data.deleted_at ? new Date(data.deleted_at) : undefined
    };
  }

  private mapMember(data: any): WorkspaceMember {
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      userId: data.user_id,
      role: data.role,
      customPermissions: data.custom_permissions || [],
      userEmail: data.user?.email,
      userFullName: data.user?.user_profiles?.[0]?.full_name,
      userAvatar: data.user?.user_profiles?.[0]?.avatar_url,
      invitedBy: data.invited_by,
      joinedAt: new Date(data.joined_at),
      lastActiveAt: data.last_active_at ? new Date(data.last_active_at) : undefined,
      removedAt: data.removed_at ? new Date(data.removed_at) : undefined,
      removedBy: data.removed_by
    };
  }

  private mapInvite(data: any): WorkspaceInvite {
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      invitedBy: data.invited_by,
      email: data.email,
      role: data.role,
      token: data.token,
      status: data.status,
      createdAt: new Date(data.created_at),
      expiresAt: new Date(data.expires_at),
      acceptedAt: data.accepted_at ? new Date(data.accepted_at) : undefined,
      declinedAt: data.declined_at ? new Date(data.declined_at) : undefined
    };
  }
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export default new WorkspaceService();
