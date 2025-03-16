import { supabase } from '@/lib/supabase';
import { BaseService, ServiceResponse } from './base.service';
import { Deal, DealStatus } from '@/types/database.types';

export class DealService extends BaseService<'deals'> {
  constructor() {
    super('deals');
  }

  /**
   * Search deals by various criteria
   */
  async search(params: {
    status?: DealStatus;
    propertyId?: string;
    buyerId?: string;
    sellerId?: string;
    minValue?: number;
    maxValue?: number;
  }): Promise<ServiceResponse<Deal[]>> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id);

    // Apply filters based on params
    if (params.status) {
      query = query.eq('status', params.status);
    }
    if (params.propertyId) {
      query = query.eq('property_id', params.propertyId);
    }
    if (params.buyerId) {
      query = query.eq('buyer_id', params.buyerId);
    }
    if (params.sellerId) {
      query = query.eq('seller_id', params.sellerId);
    }
    if (params.minValue) {
      query = query.gte('value', params.minValue);
    }
    if (params.maxValue) {
      query = query.lte('value', params.maxValue);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }

  /**
   * Get deals by status
   */
  async getByStatus(status: DealStatus): Promise<ServiceResponse<Deal[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Get deals by contact (either buyer or seller)
   */
  async getByContact(contactId: string): Promise<ServiceResponse<Deal[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .or(`buyer_id.eq.${contactId},seller_id.eq.${contactId}`)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Get deals by property
   */
  async getByProperty(propertyId: string): Promise<ServiceResponse<Deal[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Update deal status
   */
  async updateStatus(id: string, status: DealStatus): Promise<ServiceResponse<Deal>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ status })
      .eq('id', id)
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .select()
      .single();

    return { data, error };
  }
} 