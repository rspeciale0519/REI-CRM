import { supabase } from '@/lib/supabase';
import { BaseService, ServiceResponse } from './base.service';
import { Document } from '@/types/database.types';

export class DocumentService extends BaseService<'documents'> {
  constructor() {
    super('documents');
  }

  /**
   * Search documents by various criteria
   */
  async search(params: {
    dealId?: string;
    contactId?: string;
    propertyId?: string;
    fileType?: string;
    query?: string;
  }): Promise<ServiceResponse<Document[]>> {
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
    if (params.fileType) {
      query = query.eq('file_type', params.fileType);
    }
    if (params.query) {
      query = query.ilike('name', `%${params.query}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  }

  /**
   * Get documents by file type
   */
  async getByFileType(fileType: string): Promise<ServiceResponse<Document[]>> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', supabase.auth.getUser()?.data.user?.id)
      .eq('file_type', fileType)
      .order('created_at', { ascending: false });

    return { data, error };
  }

  /**
   * Get documents by related entity (deal, contact, or property)
   */
  async getByRelatedEntity(params: {
    dealId?: string;
    contactId?: string;
    propertyId?: string;
  }): Promise<ServiceResponse<Document[]>> {
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
   * Upload a document to storage and create a database record
   */
  async uploadDocument(params: {
    file: File;
    dealId?: string;
    contactId?: string;
    propertyId?: string;
  }): Promise<ServiceResponse<Document>> {
    const userId = supabase.auth.getUser()?.data.user?.id;
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') as any };
    }

    // Upload file to storage
    const fileExt = params.file.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, params.file);

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Create database record
    const documentData = {
      name: params.file.name,
      file_url: publicUrl,
      file_type: params.file.type,
      file_size: params.file.size,
      deal_id: params.dealId,
      contact_id: params.contactId,
      property_id: params.propertyId,
    };

    return this.create(documentData);
  }

  /**
   * Delete document from storage and database
   */
  async deleteDocument(id: string): Promise<ServiceResponse<Document>> {
    // Get document to get file path
    const { data: document, error: getError } = await this.getById(id);
    if (getError || !document) {
      return { data: null, error: getError };
    }

    // Extract file path from URL
    const fileUrl = new URL(document.file_url);
    const filePath = fileUrl.pathname.split('/').slice(-1)[0];

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (storageError) {
      return { data: null, error: storageError };
    }

    // Delete database record
    return this.delete(id);
  }
} 