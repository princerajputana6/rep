/**
 * Role-Based Access Control (RBAC) System
 * 
 * This module provides comprehensive RBAC for Campaign Mapper
 * and can be extended to the entire REP platform.
 * 
 * Features:
 * - Hierarchical roles
 * - Granular permissions
 * - Resource-level access control
 * - UI-based permission checks
 * - Action authorization
 */

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  CAMPAIGN_MANAGER = 'campaign_manager',
  RESOURCE_MANAGER = 'resource_manager',
  VIEWER = 'viewer',
  GUEST = 'guest',
}

export enum Permission {
  // Campaign Permissions
  CAMPAIGN_VIEW = 'campaign.view',
  CAMPAIGN_CREATE = 'campaign.create',
  CAMPAIGN_EDIT = 'campaign.edit',
  CAMPAIGN_DELETE = 'campaign.delete',
  CAMPAIGN_ARCHIVE = 'campaign.archive',
  CAMPAIGN_RESTORE = 'campaign.restore',
  CAMPAIGN_EXPORT = 'campaign.export',
  CAMPAIGN_DUPLICATE = 'campaign.duplicate',
  
  // Status Permissions
  CAMPAIGN_STATUS_CHANGE = 'campaign.status.change',
  CAMPAIGN_APPROVE = 'campaign.approve',
  
  // Team Permissions
  CAMPAIGN_TEAM_MANAGE = 'campaign.team.manage',
  CAMPAIGN_ASSIGN_RESOURCES = 'campaign.assign.resources',
  
  // Budget Permissions
  CAMPAIGN_BUDGET_VIEW = 'campaign.budget.view',
  CAMPAIGN_BUDGET_EDIT = 'campaign.budget.edit',
  
  // Project Mapping Permissions
  CAMPAIGN_PROJECT_MAP = 'campaign.project.map',
  CAMPAIGN_PROJECT_UNMAP = 'campaign.project.unmap',
  
  // Template Permissions
  TEMPLATE_VIEW = 'template.view',
  TEMPLATE_CREATE = 'template.create',
  TEMPLATE_EDIT = 'template.edit',
  TEMPLATE_DELETE = 'template.delete',
  
  // Bulk Operations
  CAMPAIGN_BULK_ARCHIVE = 'campaign.bulk.archive',
  CAMPAIGN_BULK_DELETE = 'campaign.bulk.delete',
  
  // Analytics Permissions
  ANALYTICS_VIEW = 'analytics.view',
  ANALYTICS_EXPORT = 'analytics.export',
  
  // Admin Permissions
  RECYCLE_BIN_ACCESS = 'recyclebin.access',
  AUDIT_LOGS_VIEW = 'audit.view',
  SETTINGS_MANAGE = 'settings.manage',
}

// Role to Permissions Mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // All permissions
  
  [Role.ADMIN]: [
    Permission.CAMPAIGN_VIEW,
    Permission.CAMPAIGN_CREATE,
    Permission.CAMPAIGN_EDIT,
    Permission.CAMPAIGN_DELETE,
    Permission.CAMPAIGN_ARCHIVE,
    Permission.CAMPAIGN_RESTORE,
    Permission.CAMPAIGN_EXPORT,
    Permission.CAMPAIGN_DUPLICATE,
    Permission.CAMPAIGN_STATUS_CHANGE,
    Permission.CAMPAIGN_APPROVE,
    Permission.CAMPAIGN_TEAM_MANAGE,
    Permission.CAMPAIGN_ASSIGN_RESOURCES,
    Permission.CAMPAIGN_BUDGET_VIEW,
    Permission.CAMPAIGN_BUDGET_EDIT,
    Permission.CAMPAIGN_PROJECT_MAP,
    Permission.CAMPAIGN_PROJECT_UNMAP,
    Permission.TEMPLATE_VIEW,
    Permission.TEMPLATE_CREATE,
    Permission.TEMPLATE_EDIT,
    Permission.TEMPLATE_DELETE,
    Permission.CAMPAIGN_BULK_ARCHIVE,
    Permission.CAMPAIGN_BULK_DELETE,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.RECYCLE_BIN_ACCESS,
    Permission.AUDIT_LOGS_VIEW,
  ],
  
  [Role.CAMPAIGN_MANAGER]: [
    Permission.CAMPAIGN_VIEW,
    Permission.CAMPAIGN_CREATE,
    Permission.CAMPAIGN_EDIT,
    Permission.CAMPAIGN_ARCHIVE,
    Permission.CAMPAIGN_EXPORT,
    Permission.CAMPAIGN_DUPLICATE,
    Permission.CAMPAIGN_STATUS_CHANGE,
    Permission.CAMPAIGN_TEAM_MANAGE,
    Permission.CAMPAIGN_ASSIGN_RESOURCES,
    Permission.CAMPAIGN_BUDGET_VIEW,
    Permission.CAMPAIGN_BUDGET_EDIT,
    Permission.CAMPAIGN_PROJECT_MAP,
    Permission.CAMPAIGN_PROJECT_UNMAP,
    Permission.TEMPLATE_VIEW,
    Permission.TEMPLATE_CREATE,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
  ],
  
  [Role.RESOURCE_MANAGER]: [
    Permission.CAMPAIGN_VIEW,
    Permission.CAMPAIGN_EDIT,
    Permission.CAMPAIGN_TEAM_MANAGE,
    Permission.CAMPAIGN_ASSIGN_RESOURCES,
    Permission.CAMPAIGN_BUDGET_VIEW,
    Permission.TEMPLATE_VIEW,
    Permission.ANALYTICS_VIEW,
  ],
  
  [Role.VIEWER]: [
    Permission.CAMPAIGN_VIEW,
    Permission.CAMPAIGN_BUDGET_VIEW,
    Permission.TEMPLATE_VIEW,
    Permission.ANALYTICS_VIEW,
  ],
  
  [Role.GUEST]: [
    Permission.CAMPAIGN_VIEW,
  ],
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions?: Permission[]; // Custom permissions override
  ownedCampaigns?: string[]; // Campaign IDs user owns
  teamCampaigns?: string[]; // Campaign IDs user is team member
}

class RBACService {
  private currentUser: User | null = null;

  /**
   * Set the current user (call after authentication)
   */
  setCurrentUser(user: User) {
    this.currentUser = user;
    console.log('[RBAC] Current user set:', user.email, user.role);
  }

  /**
   * Get the current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: Permission, resourceId?: string): boolean {
    if (!this.currentUser) {
      console.warn('[RBAC] No user set, denying permission:', permission);
      return false;
    }

    // Super admin has all permissions
    if (this.currentUser.role === Role.SUPER_ADMIN) {
      return true;
    }

    // Check custom permissions first
    if (this.currentUser.permissions?.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[this.currentUser.role] || [];
    if (!rolePermissions.includes(permission)) {
      return false;
    }

    // Resource-level checks
    if (resourceId) {
      // Owner always has access
      if (this.currentUser.ownedCampaigns?.includes(resourceId)) {
        return true;
      }

      // Team members have limited access
      if (this.currentUser.teamCampaigns?.includes(resourceId)) {
        // Team members can't delete campaigns
        if (permission === Permission.CAMPAIGN_DELETE) {
          return false;
        }
        return true;
      }

      // Not owner or team member - deny write operations
      const writePermissions = [
        Permission.CAMPAIGN_EDIT,
        Permission.CAMPAIGN_DELETE,
        Permission.CAMPAIGN_ARCHIVE,
        Permission.CAMPAIGN_STATUS_CHANGE,
      ];
      if (writePermissions.includes(permission)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: Permission[], resourceId?: string): boolean {
    return permissions.some(permission => this.hasPermission(permission, resourceId));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: Permission[], resourceId?: string): boolean {
    return permissions.every(permission => this.hasPermission(permission, resourceId));
  }

  /**
   * Get all permissions for current user
   */
  getUserPermissions(): Permission[] {
    if (!this.currentUser) return [];
    
    if (this.currentUser.role === Role.SUPER_ADMIN) {
      return Object.values(Permission);
    }

    const rolePermissions = ROLE_PERMISSIONS[this.currentUser.role] || [];
    const customPermissions = this.currentUser.permissions || [];
    
    return [...new Set([...rolePermissions, ...customPermissions])];
  }

  /**
   * Check if user can access a specific campaign
   */
  canAccessCampaign(campaignId: string, permission: Permission = Permission.CAMPAIGN_VIEW): boolean {
    return this.hasPermission(permission, campaignId);
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role: Role): string {
    const displayNames: Record<Role, string> = {
      [Role.SUPER_ADMIN]: 'Super Administrator',
      [Role.ADMIN]: 'Administrator',
      [Role.CAMPAIGN_MANAGER]: 'Campaign Manager',
      [Role.RESOURCE_MANAGER]: 'Resource Manager',
      [Role.VIEWER]: 'Viewer',
      [Role.GUEST]: 'Guest',
    };
    return displayNames[role] || role;
  }

  /**
   * Get role color for badges
   */
  getRoleColor(role: Role): string {
    const colors: Record<Role, string> = {
      [Role.SUPER_ADMIN]: 'bg-purple-500',
      [Role.ADMIN]: 'bg-red-500',
      [Role.CAMPAIGN_MANAGER]: 'bg-blue-500',
      [Role.RESOURCE_MANAGER]: 'bg-green-500',
      [Role.VIEWER]: 'bg-gray-500',
      [Role.GUEST]: 'bg-gray-400',
    };
    return colors[role] || 'bg-gray-500';
  }
}

// Singleton instance
export const rbacService = new RBACService();

// Mock users for development
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: Role.ADMIN,
    ownedCampaigns: ['campaign-1', 'campaign-2'],
  },
  {
    id: 'user-2',
    email: 'manager@example.com',
    name: 'Campaign Manager',
    role: Role.CAMPAIGN_MANAGER,
    ownedCampaigns: ['campaign-3'],
    teamCampaigns: ['campaign-1'],
  },
  {
    id: 'user-3',
    email: 'viewer@example.com',
    name: 'Viewer User',
    role: Role.VIEWER,
  },
];

// Initialize with mock user for development
rbacService.setCurrentUser(mockUsers[0]);

/**
 * React Hook for RBAC
 */
export function useRBAC() {
  const hasPermission = (permission: Permission, resourceId?: string) => {
    return rbacService.hasPermission(permission, resourceId);
  };

  const hasAnyPermission = (permissions: Permission[], resourceId?: string) => {
    return rbacService.hasAnyPermission(permissions, resourceId);
  };

  const hasAllPermissions = (permissions: Permission[], resourceId?: string) => {
    return rbacService.hasAllPermissions(permissions, resourceId);
  };

  const canAccessCampaign = (campaignId: string, permission?: Permission) => {
    return rbacService.canAccessCampaign(campaignId, permission);
  };

  const currentUser = rbacService.getCurrentUser();

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessCampaign,
    currentUser,
    isAdmin: currentUser?.role === Role.ADMIN || currentUser?.role === Role.SUPER_ADMIN,
    isCampaignManager: currentUser?.role === Role.CAMPAIGN_MANAGER,
    isViewer: currentUser?.role === Role.VIEWER,
  };
}
