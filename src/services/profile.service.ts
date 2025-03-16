import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database.types';

export class ProfileService {
  /**
   * Get the current user's profile
   * @returns The user's profile data and any error
   */
  static async getProfile(): Promise<{ data: Profile | null; error: any }> {
    try {
      // Get current user and log the result
      const userResult = await supabase.auth.getUser();
      console.log('Auth user result:', userResult);
      
      const { data: { user }, error: authError } = userResult;
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      if (!user) {
        console.error('No user found in auth state');
        throw new Error('No user logged in');
      }

      console.log('Attempting to fetch profile for user:', user.id);
      
      // First try to get the existing profile
      let { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('id', user.id)
        .maybeSingle();
      
      // Log the initial fetch result
      console.log('Initial profile fetch result:', { data, error });

      // If no profile exists, create one
      if (!data && !error) {
        console.log('No profile found, creating one...');
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: user.id }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }

        data = newProfile;
        console.log('Created new profile:', newProfile);
      } else if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getProfile:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to load profile'
      };
    }
  }

  /**
   * Update the current user's profile
   * @param profile - The profile data to update
   * @returns The updated profile data and any error
   */
  static async updateProfile(profile: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Profile | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .match({ id: user.id })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  }

  /**
   * Upload a profile avatar image
   * @param file - The image file to upload
   * @returns The URL of the uploaded image and any error
   */
  static async uploadAvatar(file: File): Promise<{ url: string | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      // Create a unique file path that includes the user ID
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .match({ id: user.id });

      if (updateError) throw updateError;

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { 
        url: null, 
        error: error instanceof Error ? error.message : 'Failed to upload avatar'
      };
    }
  }
} 