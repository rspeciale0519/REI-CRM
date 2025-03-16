import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { RoleService } from '@/services/role.service';
import { CompanyRole, CompanyPermission, PermissionName } from '@/types/roles.types';

interface PermissionContextType {
  roles: CompanyRole[] | null;
  permissions: CompanyPermission[] | null;
  loading: boolean;
  hasPermission: (permission: PermissionName) => boolean;
  isAdmin: boolean;
  isManager: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<CompanyRole[] | null>(null);
  const [permissions, setPermissions] = useState<CompanyPermission[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!user) {
        setRoles(null);
        setPermissions(null);
        setLoading(false);
        return;
      }

      try {
        const [rolesResult, permissionsResult] = await Promise.all([
          RoleService.getUserRoles(user.id),
          RoleService.getUserPermissions(user.id)
        ]);

        setRoles(rolesResult.data);
        setPermissions(permissionsResult.data);
      } catch (error) {
        console.error('Error loading user permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserPermissions();
  }, [user]);

  const hasPermission = (permissionName: PermissionName): boolean => {
    if (!permissions) return false;
    return permissions.some(p => p.name === permissionName);
  };

  const isAdmin = roles?.some(role => role.type === 'admin') ?? false;
  const isManager = roles?.some(role => role.type === 'manager') ?? false;

  const value = {
    roles,
    permissions,
    loading,
    hasPermission,
    isAdmin,
    isManager,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}; 