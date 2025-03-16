import { supabase } from '@/lib/supabase';
import { BaseService, ServiceResponse } from './base.service';
import { Event } from '@/types/database.types';

export class EventService extends BaseService<'events'> {
  constructor() {
    super('events');
  }

  /**
   * Search events by various criteria
   */
  async search(params: {
    dealId?: string;
    contactId?: string;
    propertyId?: string;
    startAfter?: Date;
    startBefore?: Date;
    query?: string;
  }): Promise<ServiceResponse<Event[]>> {
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
    if (params.startAfter) {
      query = query.gte('start_time', params.startAfter.toISOString());
    }
    if (params.startBefore) {
      query = query.lte('start_time', params.startBefore.toISOString());
    }
    if (params.query) {
      query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%`);
    }

    const { data, error } = await query.order('start_time', { ascending: true });
    return { data, error };
  }

  /**
   * Get events for a specific date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<ServiceResponse<Event[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .order('start_time', { ascending: true });

    return { data, error };
  }

  /**
   * Get events for today
   */
  async getEventsForToday(): Promise<ServiceResponse<Event[]>> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .lt('start_time', tomorrow.toISOString())
      .gte('end_time', today.toISOString())
      .order('start_time', { ascending: true });

    return { data, error };
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 5): Promise<ServiceResponse<Event[]>> {
    const now = new Date();

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .gte('start_time', now.toISOString())
      .order('start_time', { ascending: true })
      .limit(limit);

    return { data, error };
  }

  /**
   * Get events by related entity (deal, contact, or property)
   */
  async getByRelatedEntity(params: {
    dealId?: string;
    contactId?: string;
    propertyId?: string;
  }): Promise<ServiceResponse<Event[]>> {
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

    const { data, error } = await query.order('start_time', { ascending: true });
    return { data, error };
  }
} 