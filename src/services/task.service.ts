import { supabase } from '@/lib/supabase';
import { BaseService, ServiceResponse } from './base.service';
import { Task, TaskPriority } from '@/types/database.types';

export class TaskService extends BaseService<'tasks'> {
  constructor() {
    super('tasks');
  }

  /**
   * Search tasks by various criteria
   */
  async search(params: {
    priority?: TaskPriority;
    completed?: boolean;
    dealId?: string;
    contactId?: string;
    propertyId?: string;
    dueBefore?: Date;
    dueAfter?: Date;
  }): Promise<ServiceResponse<Task[]>> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id);

    // Apply filters based on params
    if (params.priority) {
      query = query.eq('priority', params.priority);
    }
    if (typeof params.completed === 'boolean') {
      query = query.is('completed_at', params.completed ? 'not.null' : 'null');
    }
    if (params.dealId) {
      query = query.eq('deal_id', params.dealId);
    }
    if (params.contactId) {
      query = query.eq('contact_id', params.contactId);
    }
    if (params.propertyId) {
      query = query.eq('property_id', params.propertyId);
    }
    if (params.dueBefore) {
      query = query.lte('due_date', params.dueBefore.toISOString());
    }
    if (params.dueAfter) {
      query = query.gte('due_date', params.dueAfter.toISOString());
    }

    const { data, error } = await query.order('due_date', { ascending: true });
    return { data, error };
  }

  /**
   * Get tasks by priority
   */
  async getByPriority(priority: TaskPriority): Promise<ServiceResponse<Task[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .eq('priority', priority)
      .order('due_date', { ascending: true });

    return { data, error };
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(): Promise<ServiceResponse<Task[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .is('completed_at', 'null')
      .lt('due_date', new Date().toISOString())
      .order('due_date', { ascending: true });

    return { data, error };
  }

  /**
   * Get tasks due today
   */
  async getTasksDueToday(): Promise<ServiceResponse<Task[]>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .gte('due_date', today.toISOString())
      .lt('due_date', tomorrow.toISOString())
      .order('due_date', { ascending: true });

    return { data, error };
  }

  /**
   * Mark task as complete
   */
  async markAsComplete(id: string): Promise<ServiceResponse<Task>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ completed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Mark task as incomplete
   */
  async markAsIncomplete(id: string): Promise<ServiceResponse<Task>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ completed_at: null })
      .eq('id', id)
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .select()
      .single();

    return { data, error };
  }
} 