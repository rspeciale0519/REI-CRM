import { supabase } from '@/lib/supabase';
import { BaseService, ServiceResponse } from './base.service';
import { Property, PropertyStatus, PropertyType } from '@/types/database.types';

export class PropertyService extends BaseService<'properties'> {
  constructor() {
    super('properties');
  }

  /**
   * Search properties by various criteria
   */
  async search(params: {
    status?: PropertyStatus;
    type?: PropertyType;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    minBathrooms?: number;
    city?: string;
    state?: string;
  }): Promise<ServiceResponse<Property[]>> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id);

    // Apply filters based on params
    if (params.status) {
      query = query.eq('status', params.status);
    }
    if (params.type) {
      query = query.eq('property_type', params.type);
    }
    if (params.minPrice) {
      query = query.gte('price', params.minPrice);
    }
    if (params.maxPrice) {
      query = query.lte('price', params.maxPrice);
    }
    if (params.minBedrooms) {
      query = query.gte('bedrooms', params.minBedrooms);
    }
    if (params.minBathrooms) {
      query = query.gte('bathrooms', params.minBathrooms);
    }
    if (params.city) {
      query = query.ilike('city', `%${params.city}%`);
    }
    if (params.state) {
      query = query.ilike('state', `%${params.state}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }

  /**
   * Get properties by status
   */
  async getByStatus(status: PropertyStatus): Promise<ServiceResponse<Property[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Update property images
   */
  async updateImages(id: string, images: string[]): Promise<ServiceResponse<Property>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({ images })
      .eq('id', id)
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .select()
      .single();

    return { data, error };
  }

  /**
   * Get properties within a price range
   */
  async getByPriceRange(minPrice: number, maxPrice: number): Promise<ServiceResponse<Property[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .gte('price', minPrice)
      .lte('price', maxPrice)
      .order('price', { ascending: true });

    return { data, error };
  }
} 