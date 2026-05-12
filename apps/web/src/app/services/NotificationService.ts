/**
 * Notification Event System
 * 
 * This module provides event emitters for Campaign Mapper actions
 * that should trigger notifications in the Real-Time Notifications module.
 * 
 * Integration Points:
 * 1. Campaign Mapper emits events
 * 2. Real-Time Notifications module subscribes to events
 * 3. Notifications are displayed to relevant users based on RBAC
 */

export type NotificationEventType =
  | 'campaign.created'
  | 'campaign.updated'
  | 'campaign.archived'
  | 'campaign.restored'
  | 'campaign.deleted'
  | 'campaign.status_changed'
  | 'campaign.budget_warning'
  | 'campaign.budget_exceeded'
  | 'campaign.completed'
  | 'campaign.team_added'
  | 'campaign.team_removed';

export interface NotificationPayload {
  type: NotificationEventType;
  timestamp: string;
  userId: string;
  userEmail: string;
  data: {
    campaignId?: string;
    campaignName?: string;
    oldValue?: any;
    newValue?: any;
    message?: string;
    severity?: 'info' | 'warning' | 'error' | 'success';
    actionUrl?: string;
  };
  recipients?: string[]; // User IDs to notify
}

class NotificationService {
  private listeners: Map<NotificationEventType, Array<(payload: NotificationPayload) => void>> = new Map();

  /**
   * Subscribe to notification events
   */
  on(eventType: NotificationEventType, callback: (payload: NotificationPayload) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  /**
   * Unsubscribe from notification events
   */
  off(eventType: NotificationEventType, callback: (payload: NotificationPayload) => void) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit a notification event
   */
  emit(payload: NotificationPayload) {
    console.log('[NotificationService] Event emitted:', payload.type, payload);
    
    const callbacks = this.listeners.get(payload.type);
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach(callback => callback(payload));
    } else {
      console.warn('[NotificationService] No listeners for event:', payload.type);
    }

    // TODO: Send to backend API
    // this.sendToBackend(payload);
  }

  /**
   * Send notification to backend (stub for future implementation)
   */
  private async sendToBackend(payload: NotificationPayload) {
    // TODO: Implement actual API call
    console.log('[NotificationService] Would send to backend:', payload);
    
    /*
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
    */
  }
}

// Singleton instance
export const notificationService = new NotificationService();

/**
 * Helper functions for common notification scenarios
 */
export const NotificationHelpers = {
  campaignCreated: (campaignId: string, campaignName: string, createdBy: string) => {
    notificationService.emit({
      type: 'campaign.created',
      timestamp: new Date().toISOString(),
      userId: createdBy,
      userEmail: `${createdBy}@example.com`, // TODO: Get from auth context
      data: {
        campaignId,
        campaignName,
        message: `New campaign "${campaignName}" has been created`,
        severity: 'success',
        actionUrl: `/campaign-mapper?id=${campaignId}`,
      },
    });
  },

  campaignArchived: (campaignId: string, campaignName: string, archivedBy: string) => {
    notificationService.emit({
      type: 'campaign.archived',
      timestamp: new Date().toISOString(),
      userId: archivedBy,
      userEmail: `${archivedBy}@example.com`,
      data: {
        campaignId,
        campaignName,
        message: `Campaign "${campaignName}" has been archived`,
        severity: 'info',
        actionUrl: `/recycle-bin`,
      },
    });
  },

  campaignBudgetWarning: (campaignId: string, campaignName: string, percentage: number, recipients: string[]) => {
    notificationService.emit({
      type: 'campaign.budget_warning',
      timestamp: new Date().toISOString(),
      userId: 'system',
      userEmail: 'system@example.com',
      data: {
        campaignId,
        campaignName,
        message: `Campaign "${campaignName}" has used ${percentage}% of its budget`,
        severity: 'warning',
        actionUrl: `/campaign-mapper?id=${campaignId}`,
      },
      recipients,
    });
  },

  campaignBudgetExceeded: (campaignId: string, campaignName: string, recipients: string[]) => {
    notificationService.emit({
      type: 'campaign.budget_exceeded',
      timestamp: new Date().toISOString(),
      userId: 'system',
      userEmail: 'system@example.com',
      data: {
        campaignId,
        campaignName,
        message: `⚠️ Campaign "${campaignName}" has EXCEEDED its budget!`,
        severity: 'error',
        actionUrl: `/campaign-mapper?id=${campaignId}`,
      },
      recipients,
    });
  },

  campaignStatusChanged: (
    campaignId: string,
    campaignName: string,
    oldStatus: string,
    newStatus: string,
    changedBy: string
  ) => {
    notificationService.emit({
      type: 'campaign.status_changed',
      timestamp: new Date().toISOString(),
      userId: changedBy,
      userEmail: `${changedBy}@example.com`,
      data: {
        campaignId,
        campaignName,
        oldValue: oldStatus,
        newValue: newStatus,
        message: `Campaign "${campaignName}" status changed from ${oldStatus} to ${newStatus}`,
        severity: 'info',
        actionUrl: `/campaign-mapper?id=${campaignId}`,
      },
    });
  },

  campaignDeleted: (campaignName: string, deletedBy: string) => {
    notificationService.emit({
      type: 'campaign.deleted',
      timestamp: new Date().toISOString(),
      userId: deletedBy,
      userEmail: `${deletedBy}@example.com`,
      data: {
        campaignName,
        message: `Campaign "${campaignName}" has been permanently deleted`,
        severity: 'warning',
      },
    });
  },
};

/**
 * Usage Example:
 * 
 * // In Campaign Mapper component:
 * import { NotificationHelpers } from '@/app/services/NotificationService';
 * 
 * const handleCreateCampaign = () => {
 *   // ... create campaign logic
 *   NotificationHelpers.campaignCreated(newCampaign.id, newCampaign.name, currentUser.id);
 * };
 * 
 * // In Real-Time Notifications component:
 * import { notificationService } from '@/app/services/NotificationService';
 * 
 * useEffect(() => {
 *   const handler = (payload) => {
 *     // Show notification in UI
 *     toast.info(payload.data.message);
 *   };
 *   
 *   notificationService.on('campaign.created', handler);
 *   return () => notificationService.off('campaign.created', handler);
 * }, []);
 */
