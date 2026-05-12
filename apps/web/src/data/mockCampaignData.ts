/**
 * Centralized Mock Data for Campaign Mapper
 * 
 * This file contains all mock data used across the Campaign Mapper module.
 * In production, this would be replaced with actual API calls.
 */

import type {
  Campaign,
  CampaignTemplate,
  Client,
  Manager,
  PPMProject,
  ResourcePool,
  Comment,
  CampaignDependency,
  VersionHistoryEntry,
  SimulationScenario,
} from '@/types/campaign.types';

// ============================================================================
// MOCK CAMPAIGNS
// ============================================================================

export const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'Q4 Marketing Blitz',
    client: 'Acme Corp',
    clientId: 'client-1',
    status: 'active',
    manager: 'Sarah Johnson',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    budget: 250000,
    spent: 187500,
    progress: 75,
    healthScore: 88,
    burnRate: 12500,
    type: 'Digital Marketing',
    team: [
      { id: '1', name: 'John Smith', role: 'Creative Director', email: 'john@example.com', allocation: 100, skillMatch: 95 },
      { id: '2', name: 'Emily Chen', role: 'Content Strategist', email: 'emily@example.com', allocation: 80, skillMatch: 92 },
      { id: '3', name: 'Mike Johnson', role: 'Designer', email: 'mike@example.com', allocation: 60, skillMatch: 88 },
    ],
    mappedProjectId: 'WF-001',
    mappedProjectName: 'Marketing Campaign Q4',
    mappedTasks: [
      { id: 'task-1', name: 'Design Assets', sourceId: 'WF-T-001', status: 'In Progress', progress: 70 },
      { id: 'task-2', name: 'Content Creation', sourceId: 'WF-T-002', status: 'Complete', progress: 100 },
    ],
    fromTemplate: true,
  },
  {
    id: 'campaign-2',
    name: 'Brand Refresh Initiative',
    client: 'TechStart Inc',
    clientId: 'client-2',
    status: 'planning',
    manager: 'David Lee',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    budget: 180000,
    spent: 36000,
    progress: 20,
    healthScore: 92,
    burnRate: 9000,
    type: 'Branding',
    team: [
      { id: '4', name: 'Alex Rodriguez', role: 'Brand Strategist', email: 'alex@example.com', allocation: 100, skillMatch: 96 },
      { id: '5', name: 'Lisa Wang', role: 'Visual Designer', email: 'lisa@example.com', allocation: 75, skillMatch: 91 },
    ],
    fromTemplate: false,
  },
  {
    id: 'campaign-3',
    name: 'Product Launch Campaign',
    client: 'InnovateCo',
    clientId: 'client-3',
    status: 'on-hold',
    manager: 'Robert Martinez',
    startDate: '2024-02-01',
    endDate: '2024-07-15',
    budget: 320000,
    spent: 128000,
    progress: 40,
    healthScore: 65,
    burnRate: 16000,
    type: 'Product Launch',
    team: [
      { id: '6', name: 'Tom Brown', role: 'Project Manager', email: 'tom@example.com', allocation: 100, skillMatch: 89 },
    ],
  },
];

// ============================================================================
// MOCK TEMPLATES
// ============================================================================

export const mockTemplates: CampaignTemplate[] = [
  {
    id: 'template-1',
    name: 'Social Media Campaign',
    type: 'Digital Marketing',
    description: 'Comprehensive social media campaign across multiple platforms',
    duration: '3-4 months',
    teamSize: '4-6 members',
    budgetRange: '$50K - $150K',
    requiredSkills: ['Social Media', 'Content Creation', 'Analytics'],
    optionalSkills: ['Video Production', 'Graphic Design'],
    icon: 'share',
    color: 'blue',
    isPublic: true,
    usageCount: 12,
  },
  {
    id: 'template-2',
    name: 'Product Launch',
    type: 'Product Marketing',
    description: 'End-to-end product launch campaign with pre/post launch activities',
    duration: '5-6 months',
    teamSize: '6-8 members',
    budgetRange: '$200K - $500K',
    requiredSkills: ['Product Marketing', 'PR', 'Event Management'],
    optionalSkills: ['Influencer Relations', 'Media Buying'],
    icon: 'rocket',
    color: 'purple',
    isPublic: true,
    usageCount: 8,
  },
  {
    id: 'template-3',
    name: 'Content Marketing',
    type: 'Content',
    description: 'Long-term content marketing strategy with SEO focus',
    duration: '6-12 months',
    teamSize: '3-5 members',
    budgetRange: '$30K - $100K',
    requiredSkills: ['Content Writing', 'SEO', 'Analytics'],
    optionalSkills: ['Video Production', 'Podcast Production'],
    icon: 'file-text',
    color: 'green',
    isPublic: true,
    usageCount: 15,
  },
];

// ============================================================================
// MOCK CLIENTS
// ============================================================================

export const mockClients: Client[] = [
  { id: 'client-1', name: 'Acme Corp', industry: 'Technology', tier: 'gold', activeCampaigns: 3 },
  { id: 'client-2', name: 'TechStart Inc', industry: 'Startups', tier: 'silver', activeCampaigns: 2 },
  { id: 'client-3', name: 'InnovateCo', industry: 'Innovation', tier: 'gold', activeCampaigns: 4 },
  { id: 'client-4', name: 'GlobalBrand Ltd', industry: 'Retail', tier: 'gold', activeCampaigns: 5 },
];

// ============================================================================
// MOCK MANAGERS
// ============================================================================

export const mockManagers: Manager[] = [
  { id: 'mgr-1', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Senior Campaign Manager', campaigns: 5 },
  { id: 'mgr-2', name: 'David Lee', email: 'david@example.com', role: 'Campaign Manager', campaigns: 3 },
  { id: 'mgr-3', name: 'Robert Martinez', email: 'robert@example.com', role: 'Campaign Manager', campaigns: 4 },
];

// ============================================================================
// MOCK PPM PROJECTS
// ============================================================================

export const mockPPMProjects: PPMProject[] = [
  {
    id: 'WF-001',
    name: 'Marketing Campaign Q4',
    client: 'Acme Corp',
    status: 'In Progress',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    tasks: [
      { id: 'WF-T-001', name: 'Design Creative Assets', status: 'In Progress', assignee: 'John Smith', estimatedHours: 40 },
      { id: 'WF-T-002', name: 'Write Campaign Copy', status: 'Complete', assignee: 'Emily Chen', estimatedHours: 24 },
      { id: 'WF-T-003', name: 'Social Media Strategy', status: 'Not Started', estimatedHours: 16 },
    ],
  },
  {
    id: 'JIRA-002',
    name: 'Product Launch Initiative',
    client: 'TechStart Inc',
    status: 'Planning',
    tasks: [
      { id: 'JIRA-T-001', name: 'Market Research', status: 'In Progress', estimatedHours: 60 },
      { id: 'JIRA-T-002', name: 'Product Positioning', status: 'Not Started', estimatedHours: 40 },
    ],
  },
  {
    id: 'MON-003',
    name: 'Brand Refresh Project',
    client: 'InnovateCo',
    status: 'Active',
    tasks: [
      { id: 'MON-T-001', name: 'Brand Guidelines', status: 'Complete', estimatedHours: 80 },
      { id: 'MON-T-002', name: 'Logo Design', status: 'In Progress', estimatedHours: 60 },
      { id: 'MON-T-003', name: 'Website Redesign', status: 'Not Started', estimatedHours: 120 },
    ],
  },
];

// ============================================================================
// MOCK RESOURCE POOLS
// ============================================================================

export const mockResourcePools: ResourcePool[] = [
  { id: 'pool-1', name: 'Creative Team', agency: 'Internal', memberCount: 12, availability: 65 },
  { id: 'pool-2', name: 'Digital Specialists', agency: 'Partner Agency A', memberCount: 8, availability: 80 },
  { id: 'pool-3', name: 'Content Writers', agency: 'Partner Agency B', memberCount: 15, availability: 72 },
];

// ============================================================================
// MOCK COMMENTS
// ============================================================================

export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@example.com',
    content: 'Great progress on this campaign! @John make sure we hit the deadline for creative assets.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    mentions: ['John'],
    likes: ['user-2', 'user-3'],
    replies: [
      {
        id: 'reply-1',
        userId: 'user-2',
        userName: 'John Smith',
        userEmail: 'john@example.com',
        content: 'Thanks! We\'re on track to deliver by Friday.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        likes: ['user-1'],
      },
    ],
  },
];

// ============================================================================
// MOCK DEPENDENCIES
// ============================================================================

export const mockDependencies: CampaignDependency[] = [
  {
    id: 'dep-1',
    type: 'parent',
    campaignId: 'campaign-1',
    campaignName: 'Q4 Marketing Blitz',
    status: 'active',
    createdDate: '2024-01-15',
    createdBy: 'user-1',
  },
];

// ============================================================================
// MOCK VERSION HISTORY
// ============================================================================

export const mockVersionHistory: VersionHistoryEntry[] = [
  {
    id: 'version-3',
    version: 3,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    user: { id: 'user-1', name: 'Sarah Johnson', email: 'sarah@example.com' },
    action: 'updated',
    changes: [
      { field: 'budget', oldValue: 200000, newValue: 250000 },
      { field: 'endDate', oldValue: '2024-05-31', newValue: '2024-06-30' },
    ],
  },
  {
    id: 'version-2',
    version: 2,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    user: { id: 'user-1', name: 'Sarah Johnson', email: 'sarah@example.com' },
    action: 'status_changed',
    changes: [
      { field: 'status', oldValue: 'planning', newValue: 'active' },
    ],
  },
  {
    id: 'version-1',
    version: 1,
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    user: { id: 'user-1', name: 'Sarah Johnson', email: 'sarah@example.com' },
    action: 'created',
    changes: [],
  },
];

// ============================================================================
// MOCK SIMULATION SCENARIOS
// ============================================================================

export const mockSimulationScenarios: SimulationScenario[] = [
  {
    id: 'sim-1',
    name: 'Conservative Approach',
    description: 'Lower budget, longer timeline',
    createdDate: new Date(Date.now() - 604800000).toISOString(),
    inputs: {
      budget: 150000,
      teamSize: 4,
      duration: 180,
    },
    results: {
      estimatedCost: 127500,
      timeToComplete: 198,
      riskScore: 25,
      successProbability: 92,
      resourceUtilization: 68,
    },
  },
  {
    id: 'sim-2',
    name: 'Aggressive Timeline',
    description: 'Higher budget, faster delivery',
    createdDate: new Date(Date.now() - 259200000).toISOString(),
    inputs: {
      budget: 300000,
      teamSize: 8,
      duration: 90,
    },
    results: {
      estimatedCost: 255000,
      timeToComplete: 99,
      riskScore: 65,
      successProbability: 75,
      resourceUtilization: 92,
    },
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get campaign by ID
 */
export function getCampaignById(id: string): Campaign | undefined {
  return mockCampaigns.find(c => c.id === id);
}

/**
 * Get campaigns by client
 */
export function getCampaignsByClient(clientId: string): Campaign[] {
  return mockCampaigns.filter(c => c.clientId === clientId);
}

/**
 * Get campaigns by manager
 */
export function getCampaignsByManager(managerName: string): Campaign[] {
  return mockCampaigns.filter(c => c.manager === managerName);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): CampaignTemplate | undefined {
  return mockTemplates.find(t => t.id === id);
}

/**
 * Get client by ID
 */
export function getClientById(id: string): Client | undefined {
  return mockClients.find(c => c.id === id);
}

/**
 * Get PPM project by ID
 */
export function getPPMProjectById(id: string): PPMProject | undefined {
  return mockPPMProjects.find(p => p.id === id);
}

/**
 * Calculate campaign metrics
 */
export function calculateCampaignMetrics(campaigns: Campaign[]) {
  return {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    planning: campaigns.filter(c => c.status === 'planning').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    archived: campaigns.filter(c => c.status === 'archived').length,
    atRisk: campaigns.filter(c => c.healthScore < 60 && c.status === 'active').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
    avgHealthScore: campaigns.length > 0 
      ? campaigns.reduce((sum, c) => sum + c.healthScore, 0) / campaigns.length 
      : 0,
  };
}
