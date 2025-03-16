import { PostgrestError } from '@supabase/supabase-js';
import { supabase, Tables, TableRow, InsertDto, UpdateDto } from '@/lib/supabase';

// Type for the response from our service methods
export type ServiceResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

export class BaseService<T extends Tables> {
  protected tableName: T;

  constructor(tableName: T) {
    this.tableName = tableName;
  }

  /**
   * Get the current user's ID safely
   * @returns The current user's ID or throws an error if not authenticated
   */
  protected getCurrentUserId(): string {
    const userId = supabase.auth.getUser()?.data.user?.id;
    if (!userId) {
      throw new Error('User must be authenticated to perform this action');
    }
    return userId;
  }

  /**
   * Fetch a record by its ID
   * @param id - The unique identifier of the record
   * @returns The record if found, null otherwise
   */
  async getById(id: string): Promise<ServiceResponse<TableRow<T>>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  }

  /**
   * Fetch all records for the current user
   * @returns An array of records
   */
  async getAll(): Promise<ServiceResponse<TableRow<T>[]>> {
    try {
      const userId = this.getCurrentUserId();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data: data as TableRow<T>[], error };
    } catch (error) {
      return { data: null, error: error as PostgrestError };
    }
  }

  /**
   * Create a new record
   * @param dto - The data to create the record with
   * @returns The created record
   */
  async create(dto: InsertDto<T>): Promise<ServiceResponse<TableRow<T>>> {
    try {
      const userId = this.getCurrentUserId();
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({ ...dto, user_id: userId })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as PostgrestError };
    }
  }

  /**
   * Update an existing record
   * @param id - The ID of the record to update
   * @param dto - The data to update the record with
   * @returns The updated record
   */
  async update(id: string, dto: UpdateDto<T>): Promise<ServiceResponse<TableRow<T>>> {
    try {
      const userId = this.getCurrentUserId();
      const { data, error } = await supabase
        .from(this.tableName)
        .update(dto)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as PostgrestError };
    }
  }

  /**
   * Delete a record
   * @param id - The ID of the record to delete
   * @returns The deleted record
   */
  async delete(id: string): Promise<ServiceResponse<TableRow<T>>> {
    try {
      const userId = this.getCurrentUserId();
      const { data, error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error: error as PostgrestError };
    }
  }
} 