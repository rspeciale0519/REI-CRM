import { BaseModel } from './base.types';

export type RoleType = 'admin' | 'manager' | 'user';

export interface CompanyRole extends BaseModel {
  id: string;
  name: string;
  type: RoleType;
  description: string | null;
  is_custom: boolean;
}

export interface CompanyPermission extends BaseModel {
  id: string;
  name: string;
  description: string | null;
  category: string;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
  created_at: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  created_at: string;
}

// Permission categories
export const PermissionCategories = {
  COMPANY_SETTINGS: 'company_settings',
  USER_MANAGEMENT: 'user_management',
  TEAM_MANAGEMENT: 'team_management',
  INTEGRATIONS: 'integrations',
} as const;

// Permission names
export const Permissions = {
  // Company Settings
  VIEW_COMPANY_SETTINGS: 'company.settings.view',
  EDIT_COMPANY_SETTINGS: 'company.settings.edit',
  MANAGE_BRANDING: 'company.branding.manage',
  MANAGE_BILLING: 'company.billing.manage',
  
  // User Management
  VIEW_USERS: 'users.view',
  INVITE_USERS: 'users.invite',
  MANAGE_USERS: 'users.manage',
  MANAGE_ROLES: 'roles.manage',
  
  // Team Management
  VIEW_TEAM: 'team.view',
  MANAGE_TEAM: 'team.manage',
  
  // Integrations
  VIEW_INTEGRATIONS: 'integrations.view',
  MANAGE_INTEGRATIONS: 'integrations.manage',
} as const;

export type PermissionName = typeof Permissions[keyof typeof Permissions];
export type PermissionCategory = typeof PermissionCategories[keyof typeof PermissionCategories]; 