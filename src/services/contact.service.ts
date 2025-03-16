import { supabase } from '@/lib/supabase';
import { BaseService, ServiceResponse } from './base.service';
import { Contact, ContactType } from '@/types/database.types';

export class ContactService extends BaseService<'contacts'> {
  constructor() {
    super('contacts');
  }

  /**
   * Search contacts by various criteria
   */
  async search(params: {
    type?: ContactType;
    query?: string;
    tags?: string[];
  }): Promise<ServiceResponse<Contact[]>> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id);

    // Apply filters based on params
    if (params.type) {
      query = query.eq('contact_type', params.type);
    }
    if (params.query) {
      query = query.or(`first_name.ilike.%${params.query}%,last_name.ilike.%${params.query}%,email.ilike.%${params.query}%`);
    }
    if (params.tags && params.tags.length > 0) {
      query = query.contains('tags', params.tags);
    }

    const { data, error } = await query.order('last_name', { ascending: true });
    return { data, error };
  }

  /**
   * Get contacts by type
   */
  async getByType(type: ContactType): Promise<ServiceResponse<Contact[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .eq('contact_type', type)
      .order('last_name', { ascending: true });

    return { data, error };
  }

  /**
   * Get contacts by tag
   */
  async getByTag(tag: string): Promise<ServiceResponse<Contact[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .contains('tags', [tag])
      .order('last_name', { ascending: true });

    return { data, error };
  }

  /**
   * Update contact tags
   */
  async updateTags(id: string, tags: string[]): Promise<ServiceResponse<Contact>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ tags })
      .eq('id', id)
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .select()
      .single();

    return { data, error };
  }
} 