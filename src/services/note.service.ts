import { supabase } from '@/lib/supabase';
import { BaseService, ServiceResponse } from './base.service';
import { Note } from '@/types/database.types';

export class NoteService extends BaseService<'notes'> {
  constructor() {
    super('notes');
  }

  /**
   * Search notes by various criteria
   */
  async search(params: {
    dealId?: string;
    contactId?: string;
    propertyId?: string;
    query?: string;
  }): Promise<ServiceResponse<Note[]>> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id);

    // Apply filters based on params
    if (params.dealId) {
      query = query.eq('deal_id', params.dealId);
    }
    if (params.contactId) {
      query = query.eq('contact_id', params.contactId);
    }
    if (params.propertyId) {
      query = query.eq('property_id', params.propertyId);
    }
    if (params.query) {
      query = query.ilike('content', `%${params.query}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }

  /**
   * Get notes by related entity (deal, contact, or property)
   */
  async getByRelatedEntity(params: {
    dealId?: string;
    contactId?: string;
    propertyId?: string;
  }): Promise<ServiceResponse<Note[]>> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id);

    if (params.dealId) {
      query = query.eq('deal_id', params.dealId);
    }
    if (params.contactId) {
      query = query.eq('contact_id', params.contactId);
    }
    if (params.propertyId) {
      query = query.eq('property_id', params.propertyId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }

  /**
   * Get recent notes
   */
  async getRecentNotes(limit: number = 5): Promise<ServiceResponse<Note[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  }

  /**
   * Search notes content
   */
  async searchContent(searchTerm: string): Promise<ServiceResponse<Note[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .ilike('content', `%${searchTerm}%`)
      .order('created_at', { ascending: false });

    return { data, error };
  }
} 