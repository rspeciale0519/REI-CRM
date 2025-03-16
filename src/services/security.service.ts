import { supabase } from '@/lib/supabase';

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
}

export class SecurityService {
  /**
   * Change the user's password
   */
  static async changePassword(data: PasswordChangeData): Promise<{ error: any }> {
    try {
      // First verify the current password
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error changing password:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to change password'
      };
    }
  }

  /**
   * Enable two-factor authentication
   */
  static async setupTwoFactor(): Promise<{ data: TwoFactorSetupResponse | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      // Call Supabase function to generate 2FA secret and QR code
      const { data, error } = await supabase.functions.invoke('setup-2fa', {
        body: { user_id: user.id }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      return { 
        data: null,
        error: error instanceof Error ? error.message : 'Failed to setup 2FA'
      };
    }
  }

  /**
   * Verify and enable two-factor authentication
   */
  static async verifyAndEnableTwoFactor(token: string, secret: string): Promise<{ error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      // Call Supabase function to verify token and enable 2FA
      const { error } = await supabase.functions.invoke('verify-2fa', {
        body: { 
          user_id: user.id,
          token,
          secret
        }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to verify 2FA'
      };
    }
  }
} 