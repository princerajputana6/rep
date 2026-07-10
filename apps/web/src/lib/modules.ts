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

// ---------------------------------------------------------------------------
// License tiers (customer-facing). Super Admin issues one of these per company.
//   PRIME      – core resource & delivery management (basic feature set)
//   ULTIMATE   – PRIME + finance, analytics, API access & 3rd-party integrations
//   ENTERPRISE – everything, incl. AI + custom development modules
// ---------------------------------------------------------------------------
export const PLAN_TIERS = ['PRIME', 'ULTIMATE', 'ENTERPRISE'] as const
export type PlanTier = (typeof PLAN_TIERS)[number]

export const PLAN_LABELS: Record<PlanTier, string> = {
  PRIME: 'Prime',
  ULTIMATE: 'Ultimate',
  ENTERPRISE: 'Enterprise',
}

const PRIME_MODULES: ModuleKey[] = [
  'HOME', 'DASHBOARD', 'AGENCIES', 'PROJECTS', 'TASKS', 'ASSIGNMENTS', 'TIMESHEETS',
  'USERS', 'JOB_ROLES', 'RATE_CARDS', 'PORTFOLIOS', 'PROGRAMS', 'CLIENT_MASTER',
  'BORROW_REQUESTS', 'APPROVALS', 'RESOURCE_POOLS', 'STAFFING_PLANNER',
  'NOTIFICATIONS', 'AUDIT_LOGS', 'SETTINGS',
]

const ULTIMATE_MODULES: ModuleKey[] = [
  ...PRIME_MODULES,
  'SUB_AGENCIES', 'TIE_UPS', 'CLIENT_PROFITABILITY', 'CURRENCY_MAPPING',
  'FINANCIALS', 'BUDGET_ALERTS', 'CAPACITY', 'HIDDEN_CAPACITY', 'KPI_REPORTS', 'ANALYTICS',
  // API access & integrations are the headline of the Ultimate tier
  'INTEGRATIONS_CORE', 'INTEGRATIONS_WORKFRONT', 'INTEGRATIONS_CLICKUP',
  'WEBHOOKS', 'API_KEYS', 'ACCESS_RULES', 'CUSTOM_FORMS', 'UI_CUSTOMIZATION',
]

// Default module sets per license tier. Typed as Record<string, …> and carrying
// legacy tier aliases (FREE/STARTER/PRO) so older subscription code keeps working.
export const PLAN_DEFAULTS: Record<string, ModuleKey[]> = {
  PRIME: PRIME_MODULES,
  ULTIMATE: Array.from(new Set(ULTIMATE_MODULES)) as ModuleKey[],
  ENTERPRISE: MODULE_KEYS, // everything, incl. AI + custom development
  // --- legacy aliases (pre Prime/Ultimate/Enterprise naming) ---
  FREE: PRIME_MODULES,
  STARTER: PRIME_MODULES,
  PRO: Array.from(new Set(ULTIMATE_MODULES)) as ModuleKey[],
}

// Sandbox environments included per tier before an upgrade/purchase is required.
export const SANDBOX_ALLOWANCE: Record<PlanTier, number> = {
  PRIME: 1,
  ULTIMATE: 3,
  ENTERPRISE: 10,
}
