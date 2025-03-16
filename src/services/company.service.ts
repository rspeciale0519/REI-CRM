import { supabase } from '@/lib/supabase';

export interface CompanySettings {
  id: string;
  name: string;
  logo_url: string | null;
  business_hours?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export class CompanyService {
  /**
   * Get the company settings
   * @returns The company settings data and any error
   */
  static async getSettings(): Promise<{ data: CompanySettings | null; error: any }> {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      // Get company settings
      const { data, error } = await supabase
        .from('company_settings')
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting company settings:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to load company settings'
      };
    }
  }

  /**
   * Update company settings
   * @param settings - The settings to update
   * @returns The updated settings and any error
   */
  static async updateSettings(
    settings: Partial<Omit<CompanySettings, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<{ data: CompanySettings | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('company_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating company settings:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update company settings'
      };
    }
  }

  /**
   * Upload a company logo
   * @param file - The image file to upload
   * @returns The URL of the uploaded image and any error
   */
  static async uploadLogo(file: File): Promise<{ url: string | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `company_logo_${Date.now()}.${fileExt}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('company_assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company_assets')
        .getPublicUrl(fileName);

      // Update the company settings with the new logo URL
      const { error: updateError } = await supabase
        .from('company_settings')
        .update({
          logo_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .single();

      if (updateError) throw updateError;

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading company logo:', error);
      return { 
        url: null, 
        error: error instanceof Error ? error.message : 'Failed to upload company logo'
      };
    }
  }
} 