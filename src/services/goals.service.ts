/**
 * Goals Service
 * Serviço para gerenciar metas financeiras com Supabase e fallback localStorage
 */

import { supabase } from '../config/supabase.config';
import Logger from './logger.service';

const logService = Logger;

const toError = (error: unknown): Error => {
  return error instanceof Error ? error : new Error(String(error));
};

export interface Goal {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  type: 'savings' | 'investment' | 'emergency' | 'wishlist' | 'debt-payment';
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  section?: string;
  category?: string;
  icon?: string;
  color?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  isWishlist?: boolean;
  imageUrl?: string;
  link?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

interface GoalInput {
  title: string;
  description?: string;
  type: 'savings' | 'investment' | 'emergency' | 'wishlist' | 'debt-payment';
  targetAmount: number;
  currentAmount?: number;
  deadline: string;
  section?: string;
  category?: string;
  icon?: string;
  color?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
  isWishlist?: boolean;
  imageUrl?: string;
  link?: string;
}

class GoalsService {
  private readonly STORAGE_KEY = 'financify_goals';
  private readonly SYNC_QUEUE_KEY = 'financify_goals_sync_queue';
  private isOnline: boolean = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logService.info('🟢 Conexão online - iniciando sincronização de metas');
      this.syncPendingGoals();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logService.warn('🔴 Conexão offline - usando localStorage para metas');
    });
  }

  async createGoal(data: GoalInput): Promise<Goal> {
    const userId = await this.getUserId();
    
    const goal: any = {
      user_id: userId,
      title: data.title,
      description: data.description,
      type: data.type,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount || 0,
      deadline: data.deadline,
      section: data.section,
      category: data.category,
      icon: data.icon || '🎯',
      color: data.color || '#3b82f6',
      priority: data.priority || 'medium',
      status: data.status || 'active',
      isWishlist: data.isWishlist,
      imageUrl: data.imageUrl,
      link: data.link,
      createdAt: new Date().toISOString(),
    };

    if (this.isOnline) {
      try {
        const { data: created, error } = await supabase
          .from('goals')
          .insert([goal])
          .select()
          .single();

        if (error) throw error;

        logService.info('✅ Meta criada no Supabase', { id: created.id });
        await this.saveToLocalStorage(created);
        return created;
      } catch (error) {
        logService.error('❌ Erro ao criar no Supabase, salvando offline', toError(error));
      }
    }

    const offlineGoal: Goal = {
      ...goal,
      id: `offline_goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    await this.saveToLocalStorage(offlineGoal);
    await this.addToSyncQueue('create', offlineGoal);

    logService.warn('⚠️ Meta salva offline', { id: offlineGoal.id });
    return offlineGoal;
  }

  async getGoals(): Promise<Goal[]> {
    const userId = await this.getUserId();

    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .order('deadline', { ascending: true });

        if (error) throw error;

        logService.info('✅ Metas carregadas do Supabase', { count: data.length });
        await this.updateLocalStorageCache(data);
        return data;
      } catch (error) {
        logService.error('❌ Erro ao buscar do Supabase, usando cache local', toError(error));
      }
    }

    const localGoals = await this.getFromLocalStorage();
    logService.warn('⚠️ Usando metas do cache local', { count: localGoals.length });
    return localGoals;
  }

  async updateGoal(id: string, updates: Partial<GoalInput>): Promise<Goal> {
    const userId = await this.getUserId();

    if (id.startsWith('offline_')) {
      const localGoals = await this.getFromLocalStorage();
      const index = localGoals.findIndex(g => g.id === id);
      
      if (index === -1) throw new Error('Meta não encontrada');

      const updated = { ...localGoals[index], ...updates, updatedAt: new Date().toISOString() };
      localGoals[index] = updated;
      await this.setLocalStorage(localGoals);
      await this.addToSyncQueue('update', updated);

      logService.warn('⚠️ Meta offline atualizada', { id });
      return updated;
    }

    if (this.isOnline) {
      try {
        const { data, error } = await supabase
          .from('goals')
          .update({ ...updates, updatedAt: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;

        logService.info('✅ Meta atualizada no Supabase', { id });
        await this.updateLocalGoal(data);
        return data;
      } catch (error) {
        logService.error('❌ Erro ao atualizar no Supabase', toError(error));
        throw error;
      }
    }

    throw new Error('Não foi possível atualizar - sem conexão');
  }

  async deleteGoal(id: string): Promise<void> {
    const userId = await this.getUserId();

    if (id.startsWith('offline_')) {
      const localGoals = await this.getFromLocalStorage();
      const filtered = localGoals.filter(g => g.id !== id);
      await this.setLocalStorage(filtered);
      
      logService.warn('⚠️ Meta offline removida', { id });
      return;
    }

    if (this.isOnline) {
      try {
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;

        logService.info('✅ Meta deletada do Supabase', { id });
        await this.removeFromLocalStorage(id);
        return;
      } catch (error) {
        logService.error('❌ Erro ao deletar do Supabase', toError(error));
        throw error;
      }
    }

    throw new Error('Não foi possível deletar - sem conexão');
  }

  async addContribution(id: string, amount: number): Promise<void> {
    const goals = await this.getGoals();
    const goal = goals.find(g => g.id === id);
    
    if (!goal) throw new Error('Meta não encontrada');

    const newAmount = goal.currentAmount + amount;
    const updates: Partial<GoalInput> = { currentAmount: newAmount };

    // Auto-completar se atingiu a meta
    if (newAmount >= goal.targetAmount) {
      updates.status = 'completed';
      logService.info(`🎉 Meta "${goal.title}" atingida!`);
    }

    await this.updateGoal(id, updates);
  }

  async getProgress(id: string): Promise<number> {
    const goals = await this.getGoals();
    const goal = goals.find(g => g.id === id);
    
    if (!goal) return 0;

    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  }

  /**
   * Sincronizar metas pendentes (método público)
   */
  public async syncPending(): Promise<number> {
    const queue = await this.getSyncQueue();
    if (queue.length === 0) return 0;
    
    await this.syncPendingGoals();
    return queue.length;
  }

  private async syncPendingGoals(): Promise<void> {
    const queue = await this.getSyncQueue();
    
    if (queue.length === 0) {
      logService.info('✅ Nenhuma meta para sincronizar');
      return;
    }

    logService.info(`🔄 Sincronizando ${queue.length} metas pendentes...`);

    for (const item of queue) {
      try {
        if (item.action === 'create' && item.goal.id.startsWith('offline_')) {
          const { id, user_id, ...goalData } = item.goal;
          const { data, error } = await supabase
            .from('goals')
            .insert([{ ...goalData, user_id: await this.getUserId() }])
            .select()
            .single();

          if (error) throw error;

          await this.replaceOfflineId(id, data.id);
          logService.info('✅ Meta sincronizada', { oldId: id, newId: data.id });
        } else if (item.action === 'update') {
          const { id, user_id, ...updates } = item.goal;
          await this.updateGoal(id, updates);
        }

        await this.removeFromSyncQueue(item.goal.id);
      } catch (error) {
        logService.error('❌ Erro ao sincronizar meta', toError(error));
      }
    }

    logService.info('✅ Sincronização de metas concluída');
  }

  private async getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');
    return user.id;
  }

  private async getFromLocalStorage(): Promise<Goal[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logService.error('❌ Erro ao ler localStorage', toError(error));
      return [];
    }
  }

  private async setLocalStorage(goals: Goal[]): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
      logService.error('❌ Erro ao salvar no localStorage', toError(error));
    }
  }

  private async saveToLocalStorage(goal: Goal): Promise<void> {
    const goals = await this.getFromLocalStorage();
    const index = goals.findIndex(g => g.id === goal.id);
    
    if (index >= 0) {
      goals[index] = goal;
    } else {
      goals.unshift(goal);
    }
    
    await this.setLocalStorage(goals);
  }

  private async updateLocalGoal(goal: Goal): Promise<void> {
    const goals = await this.getFromLocalStorage();
    const index = goals.findIndex(g => g.id === goal.id);
    
    if (index >= 0) {
      goals[index] = goal;
      await this.setLocalStorage(goals);
    }
  }

  private async removeFromLocalStorage(id: string): Promise<void> {
    const goals = await this.getFromLocalStorage();
    const filtered = goals.filter(g => g.id !== id);
    await this.setLocalStorage(filtered);
  }

  private async updateLocalStorageCache(goals: Goal[]): Promise<void> {
    await this.setLocalStorage(goals);
  }

  private async replaceOfflineId(oldId: string, newId: string): Promise<void> {
    const goals = await this.getFromLocalStorage();
    const index = goals.findIndex(g => g.id === oldId);
    
    if (index >= 0) {
      goals[index].id = newId;
      await this.setLocalStorage(goals);
    }
  }

  private async getSyncQueue(): Promise<Array<{ action: string; goal: Goal }>> {
    try {
      const data = localStorage.getItem(this.SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      logService.error('❌ Erro ao ler fila de sincronização', toError(error));
      return [];
    }
  }

  private async addToSyncQueue(action: string, goal: Goal): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push({ action, goal });
    
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      logService.error('❌ Erro ao adicionar à fila de sincronização', toError(error));
    }
  }

  private async removeFromSyncQueue(goalId: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filtered = queue.filter(item => item.goal.id !== goalId);
    
    try {
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      logService.error('❌ Erro ao remover da fila de sincronização', toError(error));
    }
  }
}

export const goalsService = new GoalsService();
