/**
 * Audit Logging Service
 * 
 * This module provides audit trail functionality for Campaign Mapper
 * and integrates with the Audit Logs module.
 * 
 * Features:
 * - Immutable log entries
 * - Automatic timestamp and user tracking
 * - Action categorization
 * - Change tracking (before/after values)
 * - IP address logging
 * - Metadata support
 * 
 * Integration Points:
 * 1. Campaign Mapper calls audit functions
 * 2. Audit entries are stored (currently console, future: database)
 * 3. Audit Logs module displays entries
 */

export type AuditAction =
  | 'CAMPAIGN_CREATED'
  | 'CAMPAIGN_UPDATED'
  | 'CAMPAIGN_ARCHIVED'
  | 'CAMPAIGN_RESTORED'
  | 'CAMPAIGN_DELETED'
  | 'CAMPAIGN_STATUS_CHANGED'
  | 'CAMPAIGN_BUDGET_UPDATED'
  | 'CAMPAIGN_TEAM_ADDED'
  | 'CAMPAIGN_TEAM_REMOVED'
  | 'CAMPAIGN_PROJECT_MAPPED'
  | 'CAMPAIGN_PROJECT_UNMAPPED'
  | 'CAMPAIGN_DUPLICATED'
  | 'TEMPLATE_CREATED'
  | 'TEMPLATE_UPDATED'
  | 'TEMPLATE_DELETED'
  | 'BULK_ARCHIVE'
  | 'BULK_DELETE';

export interface AuditEntry {
  id: string;
  timestamp: string;
  module: 'Campaign Mapper' | 'Template Manager' | 'Recycle Bin';
  action: AuditAction;
  userId: string;
  userEmail: string;
  userName: string;
  ipAddress: string;
  resourceType: 'campaign' | 'template' | 'bulk';
  resourceId?: string;
  resourceName?: string;
  changeDetails?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

class AuditService {
  private readonly MODULE_NAME = 'Campaign Mapper';

  /**
   * Log an audit entry
   */
  log(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'ipAddress'>) {
    const auditEntry: AuditEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIP(),
    };

    // Log to console (development)
    console.log('[AuditLog]', auditEntry);

    // TODO: Send to backend
    // this.sendToBackend(auditEntry);

    // TODO: Store in local storage for offline capability
    // this.storeLocally(auditEntry);

    return auditEntry;
  }

  /**
   * Get client IP address (stub - would come from backend)
   */
  private getClientIP(): string {
    // TODO: Get from backend or context
    return '127.0.0.1';
  }

  /**
   * Send audit entry to backend (stub)
   */
  private async sendToBackend(entry: AuditEntry) {
    console.log('[AuditService] Would send to backend:', entry);
    
    /*
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send audit log:', error);
      // Fallback to local storage if backend fails
      this.storeLocally(entry);
    }
    */
  }

  /**
   * Store audit entry locally (stub)
   */
  private storeLocally(entry: AuditEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      logs.push(entry);
      // Keep only last 1000 entries
      if (logs.length > 1000) {
        logs.shift();
      }
      localStorage.setItem('audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store audit log locally:', error);
    }
  }

  /**
   * Get current user info (stub - should come from auth context)
   */
  private getCurrentUser() {
    // TODO: Get from auth context
    return {
      id: 'user-123',
      email: 'user@example.com',
      name: 'John Doe',
    };
  }
}

// Singleton instance
export const auditService = new AuditService();

/**
 * Helper functions for common audit scenarios
 */
export const AuditHelpers = {
  campaignCreated: (campaignId: string, campaignName: string, campaignData: any) => {
    const user = { id: 'user-123', email: 'user@example.com', name: 'John Doe' };
    return auditService.log({
      module: 'Campaign Mapper',
      action: 'CAMPAIGN_CREATED',
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      resourceType: 'campaign',
      resourceId: campaignId,
      resourceName: campaignName,
      metadata: {
        client: campaignData.client,
        manager: campaignData.manager,
        budget: campaignData.budget,
        startDate: campaignData.startDate,
      },
      success: true,
    });
  },

  campaignUpdated: (
    campaignId: string,
    campaignName: string,
    changes: Array<{ field: string; oldValue: any; newValue: any }>
  ) => {
    const user = { id: 'user-123', email: 'user@example.com', name: 'John Doe' };
    return auditService.log({
      module: 'Campaign Mapper',
      action: 'CAMPAIGN_UPDATED',
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      resourceType: 'campaign',
      resourceId: campaignId,
      resourceName: campaignName,
      changeDetails: changes,
      success: true,
    });
  },

  campaignArchived: (campaignId: string, campaignName: string) => {
    const user = { id: 'user-123', email: 'user@example.com', name: 'John Doe' };
    return auditService.log({
      module: 'Campaign Mapper',
      action: 'CAMPAIGN_ARCHIVED',
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      resourceType: 'campaign',
      resourceId: campaignId,
      resourceName: campaignName,
      success: true,
    });
  },

  campaignRestored: (campaignId: string, campaignName: string) => {
    const user = { id: 'user-123', email: 'user@example.com', name: 'John Doe' };
    return auditService.log({
      module: 'Recycle Bin',
      action: 'CAMPAIGN_RESTORED',
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      resourceType: 'campaign',
      resourceId: campaignId,
      resourceName: campaignName,
      success: true,
    });
  },

  campaignDeleted: (campaignId: string, campaignName: string) => {
    const user = { id: 'user-123', email: 'user@example.com', name: 'John Doe' };
    return auditService.log({
      module: 'Campaign Mapper',
      action: 'CAMPAIGN_DELETED',
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      resourceType: 'campaign',
      resourceId: campaignId,
      resourceName: campaignName,
      success: true,
    });
  },

  campaignStatusChanged: (
    campaignId: string,
    campaignName: string,
    oldStatus: string,
    newStatus: string
  ) => {
    const user = { id: 'user-123', email: 'user@example.com', name: 'John Doe' };
    return auditService.log({
      module: 'Campaign Mapper',
      action: 'CAMPAIGN_STATUS_CHANGED',
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      resourceType: 'campaign',
      resourceId: campaignId,
      resourceName: campaignName,
      changeDetails: [
        {
          field: 'status',
          oldValue: oldStatus,
          newValue: newStatus,
        },
      ],
      success: true,
    });
  },

  campaignProjectMapped: (
    campaignId: string,
    campaignName: string,
    projectId: string,
    projectName: string,
    taskCount: number
  ) => {
    const user = { id: 'user-123', email: 'user@example.com', name: 'John Doe' };
    return auditService.log({
      module: 'Campaign Mapper',
      action: 'CAMPAIGN_PROJECT_MAPPED',
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      resourceType: 'campaign',
      resourceId: campaignId,
      resourceName: campaignName,
      metadata: {
        projectId,
        projectName,
        taskCount,
      },
      success: true,
    });
  },

  campaignDuplicated: (originalId: string, originalName: string, newId: string, newName: string) => {
    const user = { id: 'user-123', email: 'user@example.com', name: 'John Doe' };
    return auditService.log({
      module: 'Campaign Mapper',
      action: 'CAMPAIGN_DUPLICATED',
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      resourceType: 'campaign',
      resourceId: newId,
      resourceName: newName,
      metadata: {
        originalCampaignId: originalId,
        originalCampaignName: originalName,
      },
      success: true,
    });
  },

  bulkArchive: (campaignIds: string[], count: number) => {
    const user = { id: 'user-123', email: 'user@example.com', name: 'John Doe' };
    return auditService.log({
      module: 'Campaign Mapper',
      action: 'BULK_ARCHIVE',
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      resourceType: 'bulk',
      metadata: {
        campaignIds,
        count,
      },
      success: true,
    });
  },

  bulkDelete: (campaignIds: string[], count: number) => {
    const user = { id: 'user-123', email: 'user@example.com', name: 'John Doe' };
    return auditService.log({
      module: 'Campaign Mapper',
      action: 'BULK_DELETE',
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      resourceType: 'bulk',
      metadata: {
        campaignIds,
        count,
        warning: 'PERMANENT_DELETE',
      },
      success: true,
    });
  },
};

/**
 * Usage Example:
 * 
 * // In Campaign Mapper component:
 * import { AuditHelpers } from '@/app/services/AuditService';
 * 
 * const handleCreateCampaign = () => {
 *   // ... create campaign logic
 *   AuditHelpers.campaignCreated(newCampaign.id, newCampaign.name, newCampaign);
 * };
 * 
 * const handleUpdateCampaign = () => {
 *   // ... update campaign logic
 *   AuditHelpers.campaignUpdated(campaign.id, campaign.name, [
 *     { field: 'budget', oldValue: 10000, newValue: 15000 },
 *     { field: 'status', oldValue: 'planning', newValue: 'active' }
 *   ]);
 * };
 */
