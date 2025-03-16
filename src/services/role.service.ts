import { supabase } from '@/lib/supabase';
import { CompanyRole, CompanyPermission, UserRole, PermissionName } from '@/types/roles.types';

export class RoleService {
  /**
   * Get all roles
   */
  static async getRoles(): Promise<{ data: CompanyRole[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('company_roles')
        .select('*')
        .order('type');

      return { data, error };
    } catch (error) {
      console.error('Error getting roles:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all permissions
   */
  static async getPermissions(): Promise<{ data: CompanyPermission[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('company_permissions')
        .select('*')
        .order('category, name');

      return { data, error };
    } catch (error) {
      console.error('Error getting permissions:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user's roles
   */
  static async getUserRoles(userId: string): Promise<{ data: CompanyRole[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          company_roles (*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return {
        data: data?.map(item => item.company_roles) || null,
        error: null
      };
    } catch (error) {
      console.error('Error getting user roles:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user's permissions
   */
  static async getUserPermissions(userId: string): Promise<{ data: CompanyPermission[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          company_roles!inner (
            role_permissions!inner (
              company_permissions (*)
            )
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      // Flatten and deduplicate permissions
      const permissions = data?.flatMap(role => 
        role.company_roles.role_permissions.map(rp => rp.company_permissions)
      );
      
      const uniquePermissions = permissions ? 
        Array.from(new Map(permissions.map(item => [item.id, item])).values()) :
        null;

      return { data: uniquePermissions, error: null };
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if user has a specific permission
   */
  static async hasPermission(userId: string, permissionName: PermissionName): Promise<boolean> {
    try {
      const { data: hasPermission } = await supabase
        .rpc('has_permission', {
          user_id: userId,
          permission_name: permissionName
        });

      return hasPermission || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Assign role to user
   */
  static async assignRole(userId: string, roleId: string): Promise<{ data: UserRole | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role_id: roleId })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error assigning role:', error);
      return { data: null, error };
    }
  }

  /**
   * Remove role from user
   */
  static async removeRole(userId: string, roleId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .match({ user_id: userId, role_id: roleId });

      return { error };
    } catch (error) {
      console.error('Error removing role:', error);
      return { error };
    }
  }

  /**
   * Create a custom role
   */
  static async createRole(role: Partial<CompanyRole>): Promise<{ data: CompanyRole | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('company_roles')
        .insert({ ...role, is_custom: true })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error creating role:', error);
      return { data: null, error };
    }
  }

  /**
   * Update a role
   */
  static async updateRole(roleId: string, role: Partial<CompanyRole>): Promise<{ data: CompanyRole | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('company_roles')
        .update(role)
        .eq('id', roleId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating role:', error);
      return { data: null, error };
    }
  }

  /**
   * Delete a custom role
   */
  static async deleteRole(roleId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('company_roles')
        .delete()
        .match({ id: roleId, is_custom: true });

      return { error };
    } catch (error) {
      console.error('Error deleting role:', error);
      return { error };
    }
  }
} 