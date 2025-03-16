import { supabase } from '@/lib/supabase';
import { RoleService } from './role.service';

export interface TeamMember {
  id: string;
  company_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'member';
  avatar_url: string | null;
  status: 'active' | 'invited' | 'inactive';
  created_at: string;
}

export interface InviteData {
  email: string;
  role: string;
  company_id: string;
}

export class TeamService {
  /**
   * Get all team members for a specific company
   */
  static async getTeamMembers(companyId: string): Promise<{ data: TeamMember[] | null; error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting team members:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to get team members'
      };
    }
  }

  /**
   * Invite a new team member
   */
  static async inviteMember(inviteData: InviteData): Promise<{ error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      // Send invitation email through Supabase function
      const { error } = await supabase.functions.invoke('invite-team-member', {
        body: { 
          email: inviteData.email,
          role: inviteData.role,
          company_id: inviteData.company_id,
          inviter_id: user.id
        }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error inviting team member:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to invite team member'
      };
    }
  }

  /**
   * Update a team member's role
   */
  static async updateMemberRole(memberId: string, role: string, companyId: string): Promise<{ error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      // Update role in team_members table
      const { error: updateError } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId)
        .eq('company_id', companyId);

      if (updateError) throw updateError;

      // Update role in user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: memberId,
          company_id: companyId,
          role
        });

      if (roleError) throw roleError;

      return { error: null };
    } catch (error) {
      console.error('Error updating team member role:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to update team member role'
      };
    }
  }

  /**
   * Remove a team member
   */
  static async removeMember(memberId: string, companyId: string): Promise<{ error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      // Remove from team_members table
      const { error: memberError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('company_id', companyId);

      if (memberError) throw memberError;

      // Remove from user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', memberId)
        .eq('company_id', companyId);

      if (roleError) throw roleError;

      return { error: null };
    } catch (error) {
      console.error('Error removing team member:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to remove team member'
      };
    }
  }

  /**
   * Resend invitation to a team member
   */
  static async resendInvitation(email: string, companyId: string): Promise<{ error: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No user logged in');

      // Resend invitation through Supabase function
      const { error } = await supabase.functions.invoke('resend-team-invitation', {
        body: { 
          email,
          company_id: companyId,
          inviter_id: user.id
        }
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error resending invitation:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to resend invitation'
      };
    }
  }
} 