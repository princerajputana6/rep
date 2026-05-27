// Central registry of feature modules. Subscriptions toggle these on/off per
// company. Keep keys stable — they're persisted in DB.

export const MODULES = {
  // Core
  DASHBOARD: { key: 'DASHBOARD', label: 'Dashboard', group: 'core' },
  HOME: { key: 'HOME', label: 'Home', group: 'core' },

  // Network
  AGENCIES: { key: 'AGENCIES', label: 'Agencies', group: 'network' },
  SUB_AGENCIES: { key: 'SUB_AGENCIES', label: 'Sub-Agencies', group: 'network' },
  TIE_UPS: { key: 'TIE_UPS', label: 'Tie-Ups', group: 'network' },

  // Resources
  RESOURCE_POOLS: { key: 'RESOURCE_POOLS', label: 'Resource Pools', group: 'resources' },
  USERS: { key: 'USERS', label: 'User Management', group: 'resources' },
  JOB_ROLES: { key: 'JOB_ROLES', label: 'Job Roles', group: 'resources' },
  RATE_CARDS: { key: 'RATE_CARDS', label: 'Rate Cards', group: 'resources' },

  // Delivery
  PORTFOLIOS: { key: 'PORTFOLIOS', label: 'Portfolios', group: 'delivery' },
  PROGRAMS: { key: 'PROGRAMS', label: 'Programs', group: 'delivery' },
  PROJECTS: { key: 'PROJECTS', label: 'Projects', group: 'delivery' },
  TASKS: { key: 'TASKS', label: 'Tasks', group: 'delivery' },
  ASSIGNMENTS: { key: 'ASSIGNMENTS', label: 'Assignments', group: 'delivery' },
  TIMESHEETS: { key: 'TIMESHEETS', label: 'Timesheets', group: 'delivery' },
  STAFFING_PLANNER: { key: 'STAFFING_PLANNER', label: 'Staffing Planner', group: 'delivery' },

  // Workflow
  BORROW_REQUESTS: { key: 'BORROW_REQUESTS', label: 'Borrow Requests', group: 'workflow' },
  APPROVALS: { key: 'APPROVALS', label: 'Approvals', group: 'workflow' },

  // Finance & Reports
  FINANCIALS: { key: 'FINANCIALS', label: 'Financial Dashboard', group: 'finance' },
  BUDGET_ALERTS: { key: 'BUDGET_ALERTS', label: 'Budget Alerts', group: 'finance' },
  CLIENT_PROFITABILITY: { key: 'CLIENT_PROFITABILITY', label: 'Client Profitability', group: 'finance' },
  CLIENT_MASTER: { key: 'CLIENT_MASTER', label: 'Client Master', group: 'finance' },
  CURRENCY_MAPPING: { key: 'CURRENCY_MAPPING', label: 'Currency Mapping', group: 'finance' },
  KPI_REPORTS: { key: 'KPI_REPORTS', label: 'KPI Reports', group: 'finance' },

  // Intelligence
  CAPACITY: { key: 'CAPACITY', label: 'Capacity & Utilization', group: 'intelligence' },
  HIDDEN_CAPACITY: { key: 'HIDDEN_CAPACITY', label: 'Hidden Capacity', group: 'intelligence' },
  ANALYTICS: { key: 'ANALYTICS', label: 'Advanced Analytics', group: 'intelligence' },

  // AI
  AI_COPILOT: { key: 'AI_COPILOT', label: 'AI Co-Pilot', group: 'ai' },
  AI_MATCHING: { key: 'AI_MATCHING', label: 'AI Resource Matching', group: 'ai' },
  PREDICTIVE_PLANNING: { key: 'PREDICTIVE_PLANNING', label: 'Predictive Planning', group: 'ai' },
  GAMIFICATION: { key: 'GAMIFICATION', label: 'Gamification', group: 'ai' },
  CAMPAIGN_MAPPER: { key: 'CAMPAIGN_MAPPER', label: 'Campaign Mapper', group: 'ai' },

  // Integrations
  INTEGRATIONS_CORE: { key: 'INTEGRATIONS_CORE', label: 'Integrations', group: 'integrations' },
  INTEGRATIONS_WORKFRONT: { key: 'INTEGRATIONS_WORKFRONT', label: 'Workfront Connector', group: 'integrations' },
  INTEGRATIONS_CLICKUP: { key: 'INTEGRATIONS_CLICKUP', label: 'ClickUp Connector', group: 'integrations' },
  WEBHOOKS: { key: 'WEBHOOKS', label: 'Webhooks', group: 'integrations' },
  API_KEYS: { key: 'API_KEYS', label: 'API Keys', group: 'integrations' },

  // Admin
  AUDIT_LOGS: { key: 'AUDIT_LOGS', label: 'Audit Logs', group: 'admin' },
  ACCESS_RULES: { key: 'ACCESS_RULES', label: 'Access Rules', group: 'admin' },
  RECYCLE_BIN: { key: 'RECYCLE_BIN', label: 'Recycle Bin', group: 'admin' },
  UI_CUSTOMIZATION: { key: 'UI_CUSTOMIZATION', label: 'UI Customization', group: 'admin' },
  NOTIFICATIONS: { key: 'NOTIFICATIONS', label: 'Real-Time Notifications', group: 'admin' },
  CUSTOM_FORMS: { key: 'CUSTOM_FORMS', label: 'Custom Form Builder', group: 'admin' },
  SETTINGS: { key: 'SETTINGS', label: 'Settings', group: 'admin' },
} as const

export type ModuleKey = keyof typeof MODULES

export const MODULE_KEYS = Object.keys(MODULES) as ModuleKey[]

export const MODULE_GROUPS = [
  'core', 'network', 'resources', 'delivery', 'workflow',
  'finance', 'intelligence', 'ai', 'integrations', 'admin',
] as const

// Default module sets per plan tier.
export const PLAN_DEFAULTS: Record<string, ModuleKey[]> = {
  FREE: ['HOME', 'DASHBOARD', 'PROJECTS', 'TASKS', 'USERS', 'NOTIFICATIONS', 'SETTINGS'],
  STARTER: [
    'HOME', 'DASHBOARD', 'AGENCIES', 'PROJECTS', 'TASKS', 'ASSIGNMENTS', 'TIMESHEETS',
    'USERS', 'JOB_ROLES', 'RATE_CARDS', 'PORTFOLIOS', 'PROGRAMS', 'CLIENT_MASTER',
    'BORROW_REQUESTS', 'APPROVALS', 'NOTIFICATIONS', 'AUDIT_LOGS', 'SETTINGS',
  ],
  PRO: [
    ...['HOME', 'DASHBOARD', 'AGENCIES', 'SUB_AGENCIES', 'TIE_UPS', 'RESOURCE_POOLS',
    'PROJECTS', 'TASKS', 'ASSIGNMENTS', 'TIMESHEETS', 'STAFFING_PLANNER',
    'USERS', 'JOB_ROLES', 'RATE_CARDS', 'PORTFOLIOS', 'PROGRAMS',
    'CLIENT_MASTER', 'CLIENT_PROFITABILITY', 'CURRENCY_MAPPING',
    'BORROW_REQUESTS', 'APPROVALS', 'FINANCIALS', 'BUDGET_ALERTS',
    'CAPACITY', 'HIDDEN_CAPACITY', 'KPI_REPORTS',
    'INTEGRATIONS_CORE', 'INTEGRATIONS_WORKFRONT', 'INTEGRATIONS_CLICKUP',
    'WEBHOOKS', 'API_KEYS', 'NOTIFICATIONS', 'AUDIT_LOGS', 'ACCESS_RULES',
    'CUSTOM_FORMS', 'UI_CUSTOMIZATION', 'SETTINGS',
    ] as ModuleKey[],
  ],
  ENTERPRISE: MODULE_KEYS, // everything
}
