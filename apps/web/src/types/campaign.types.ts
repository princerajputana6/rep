/**
 * Central Type Definitions for Campaign Mapper
 * 
 * This file contains all shared types and interfaces used across
 * the Campaign Mapper module and related components.
 */

// ============================================================================
// CAMPAIGN TYPES
// ============================================================================

export interface Campaign {
  id: string;
  name: string;
  client: string;
  clientId: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';
  manager: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  healthScore: number;
  burnRate: number;
  team: TeamMember[];
  type: string;
  description?: string;
  mappedProjectId?: string;
  mappedProjectName?: string;
  mappedTasks?: MappedTask[];
  fromTemplate?: boolean;
  templateId?: string;
  createdBy?: string;
  createdDate?: string;
  lastModified?: string;
  documents?: Document[];
  phases?: CampaignPhase[];
  milestones?: Milestone[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  allocation: number; // percentage
  skillMatch?: number; // AI match score
}

export interface MappedTask {
  id: string;
  name: string;
  sourceId: string; // From PPM tool
  status: string;
  assignee?: string;
  dueDate?: string;
  progress?: number;
}

export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedDate: string;
  url?: string;
}

export interface CampaignPhase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'completed' | 'active' | 'upcoming';
  dependencies?: string[];
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  achieved: boolean;
  description?: string;
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export interface CampaignTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  duration: string;
  teamSize: string;
  budgetRange: string;
  requiredSkills: string[];
  optionalSkills: string[];
  icon: string;
  color: string;
  createdBy?: string;
  createdDate?: string;
  isPublic?: boolean;
  usageCount?: number;
}

// ============================================================================
// PPM INTEGRATION TYPES
// ============================================================================

export interface PPMProject {
  id: string;
  name: string;
  client: string;
  status: string;
  startDate?: string;
  endDate?: string;
  tasks: PPMTask[];
}

export interface PPMTask {
  id: string;
  name: string;
  status: string;
  assignee?: string;
  dueDate?: string;
  estimatedHours?: number;
}

export interface TaskSyncStatus {
  projectId: string;
  projectName: string;
  taskCount: number;
  lastSynced?: string;
  syncStatus: 'synced' | 'pending' | 'error' | 'never';
  errorMessage?: string;
}

// ============================================================================
// COLLABORATION TYPES
// ============================================================================

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  timestamp: string;
  mentions?: string[];
  likes: string[];
  replies?: Comment[];
  edited?: boolean;
  editedAt?: string;
}

export interface Mention {
  userId: string;
  userName: string;
  userEmail: string;
}

// ============================================================================
// DEPENDENCY TYPES
// ============================================================================

export interface CampaignDependency {
  id: string;
  type: 'parent' | 'child' | 'blocker' | 'blocked-by';
  campaignId: string;
  campaignName: string;
  status: string;
  createdDate: string;
  createdBy: string;
}

// ============================================================================
// VERSION HISTORY TYPES
// ============================================================================

export interface VersionHistoryEntry {
  id: string;
  version: number;
  timestamp: string;
  user: {
    name: string;
    email: string;
    id: string;
  };
  action: 'created' | 'updated' | 'status_changed' | 'archived' | 'restored';
  changes: FieldChange[];
  snapshot?: Partial<Campaign>;
}

export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
}

// ============================================================================
// SIMULATION TYPES
// ============================================================================

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  createdBy?: string;
  inputs: SimulationInputs;
  results: SimulationResults;
}

export interface SimulationInputs {
  budget: number;
  teamSize: number;
  duration: number;
}

export interface SimulationResults {
  estimatedCost: number;
  timeToComplete: number;
  riskScore: number;
  successProbability: number;
  resourceUtilization: number;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface CampaignFilters {
  status: string;
  client: string;
  manager: string;
  hasMapping: string;
  fromTemplate: string;
}

// ============================================================================
// CLIENT & MANAGER TYPES
// ============================================================================

export interface Client {
  id: string;
  name: string;
  industry?: string;
  tier?: 'gold' | 'silver' | 'bronze';
  activeCampaigns?: number;
  totalSpent?: number;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
  campaigns?: number;
  capacity?: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface CampaignAnalytics {
  campaignId: string;
  metrics: {
    healthScore: number;
    progress: number;
    budget: number;
    spent: number;
    burnRate: number;
  };
  trends: {
    progressTrend: number[];
    spendingTrend: number[];
    healthTrend: number[];
  };
  kpis: {
    roi: number;
    teamVelocity: number;
    clientSatisfaction: number;
  };
}

// ============================================================================
// RESOURCE POOL TYPES
// ============================================================================

export interface ResourcePool {
  id: string;
  name: string;
  agency?: string;
  memberCount: number;
  availability: number;
}

// ============================================================================
// DASHBOARD WIDGET TYPES
// ============================================================================

export interface DashboardMetrics {
  activeCampaigns: number;
  atRiskCampaigns: number;
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
  avgHealthScore: number;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';

export interface NotificationPayload {
  type: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  data: {
    campaignId?: string;
    campaignName?: string;
    oldValue?: any;
    newValue?: any;
    message?: string;
    severity?: NotificationSeverity;
    actionUrl?: string;
  };
  recipients?: string[];
}

// ============================================================================
// AUDIT TYPES
// ============================================================================

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
  module: string;
  action: AuditAction;
  userId: string;
  userEmail: string;
  userName: string;
  ipAddress: string;
  resourceType: 'campaign' | 'template' | 'bulk';
  resourceId?: string;
  resourceName?: string;
  changeDetails?: FieldChange[];
  metadata?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

// ============================================================================
// RBAC TYPES
// ============================================================================

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  CAMPAIGN_MANAGER = 'campaign_manager',
  RESOURCE_MANAGER = 'resource_manager',
  VIEWER = 'viewer',
  GUEST = 'guest',
}

export enum Permission {
  CAMPAIGN_VIEW = 'campaign.view',
  CAMPAIGN_CREATE = 'campaign.create',
  CAMPAIGN_EDIT = 'campaign.edit',
  CAMPAIGN_DELETE = 'campaign.delete',
  CAMPAIGN_ARCHIVE = 'campaign.archive',
  CAMPAIGN_RESTORE = 'campaign.restore',
  CAMPAIGN_EXPORT = 'campaign.export',
  CAMPAIGN_DUPLICATE = 'campaign.duplicate',
  CAMPAIGN_STATUS_CHANGE = 'campaign.status.change',
  CAMPAIGN_APPROVE = 'campaign.approve',
  CAMPAIGN_TEAM_MANAGE = 'campaign.team.manage',
  CAMPAIGN_ASSIGN_RESOURCES = 'campaign.assign.resources',
  CAMPAIGN_BUDGET_VIEW = 'campaign.budget.view',
  CAMPAIGN_BUDGET_EDIT = 'campaign.budget.edit',
  CAMPAIGN_PROJECT_MAP = 'campaign.project.map',
  CAMPAIGN_PROJECT_UNMAP = 'campaign.project.unmap',
  TEMPLATE_VIEW = 'template.view',
  TEMPLATE_CREATE = 'template.create',
  TEMPLATE_EDIT = 'template.edit',
  TEMPLATE_DELETE = 'template.delete',
  CAMPAIGN_BULK_ARCHIVE = 'campaign.bulk.archive',
  CAMPAIGN_BULK_DELETE = 'campaign.bulk.delete',
  ANALYTICS_VIEW = 'analytics.view',
  ANALYTICS_EXPORT = 'analytics.export',
  RECYCLE_BIN_ACCESS = 'recyclebin.access',
  AUDIT_LOGS_VIEW = 'audit.view',
  SETTINGS_MANAGE = 'settings.manage',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions?: Permission[];
  ownedCampaigns?: string[];
  teamCampaigns?: string[];
  avatar?: string;
}

// ============================================================================
// SEARCH TYPES
// ============================================================================

export interface SearchResult {
  id: string;
  type: 'campaign' | 'template' | 'client' | 'user' | 'project';
  title: string;
  subtitle?: string;
  metadata?: string;
  icon: JSX.Element;
}

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

export interface HiddenCapacityResource {
  id: string;
  name: string;
  skills: string[];
  availability: number;
  utilizationRate: number;
  costPerHour: number;
  location: string;
}

export interface FinancialData {
  campaignId: string;
  revenue: number;
  cost: number;
  margin: number;
  marginPercentage: number;
  profitability: 'high' | 'medium' | 'low';
}

export interface StaffingRequirement {
  role: string;
  skills: string[];
  startDate: string;
  endDate: string;
  hoursPerWeek: number;
  priority: 'high' | 'medium' | 'low';
}

export interface CampaignKPI {
  campaignId: string;
  kpiName: string;
  target: number;
  actual: number;
  unit: string;
  status: 'on-track' | 'at-risk' | 'off-track';
}
