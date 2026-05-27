import { api } from '@/lib/api'

// ─── DTOs ─────────────────────────────────────────────────────────────

export interface Agency {
  _id: string
  name: string
  owner: string
  ownerEmail: string
  totalResources: number
  participationLevel: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface SubAgency {
  _id: string
  name: string
  parentAgencyId: string
  agencyType: string
  location?: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface TieUp {
  _id: string
  code: string
  fromAgencyId: string
  toAgencyId: string
  permittedRoles: string[]
  rateCardId?: string
  validFrom?: string
  validTo?: string
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'INACTIVE'
  activeAllocations: number
  totalValue: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AgencySummary {
  agency: Agency
  counts: {
    users: number
    portfolios: number
    projects: number
    tasks: number
    jobRoles: number
    rateCards: number
    clients: number
    resources: number
    subAgencies: number
    tieUps: number
  }
}

// Lightweight shapes — accordion rows only need a few fields each.
export interface UserRow { _id: string; name: string; email: string; role: string }
export interface PortfolioRow { _id: string; name: string; status?: string }
export interface ProjectRow { _id: string; name: string; status?: string; budget?: number }
export interface TaskRow { _id: string; title: string; status: string; priority: string }
export interface JobRoleRow { _id: string; name: string; category?: string; defaultHourlyRate?: number }
export interface RateCardRow { _id: string; name: string; currency: string }
export interface ClientRow { _id: string; name: string; industry?: string; status: string }

// ─── Service ──────────────────────────────────────────────────────────

const qs = (params: Record<string, string | undefined>) => {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '')
  return entries.length ? `?${entries.map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&')}` : ''
}

export const networkService = {
  // Top-level lists
  listAgencies: () => api.get<Agency[]>('/agencies'),
  getAgency: (id: string) => api.get<Agency>(`/agencies/${id}`),
  getAgencySummary: (id: string) => api.get<AgencySummary>(`/agencies/${id}/summary`),

  listSubAgencies: (parentAgencyId?: string) =>
    api.get<SubAgency[]>(`/sub-agencies${qs({ parentAgencyId })}`),
  getSubAgency: (id: string) => api.get<SubAgency>(`/sub-agencies/${id}`),

  listTieUps: (agencyId?: string, status?: string) =>
    api.get<TieUp[]>(`/tie-ups${qs({ agencyId, status })}`),
  getTieUp: (id: string) => api.get<TieUp>(`/tie-ups/${id}`),

  // Accordion section data — scoped to one agency
  agencyUsers: async (id: string): Promise<UserRow[]> => {
    const r = await api.get<{ data: UserRow[] }>(`/users?agencyId=${id}`)
    return r.data ?? []
  },
  agencyPortfolios: (id: string) => api.get<PortfolioRow[]>(`/portfolios?agencyId=${id}`),
  agencyProjects: (id: string) => api.get<ProjectRow[]>(`/projects?agencyId=${id}`),
  agencyTasks: (id: string) => api.get<TaskRow[]>(`/tasks?agencyId=${id}`),
  agencyJobRoles: (id: string) => api.get<JobRoleRow[]>(`/job-roles?agencyId=${id}`),
  agencyRateCards: (id: string) => api.get<RateCardRow[]>(`/rate-cards?agencyId=${id}`),
  agencyClients: (id: string) => api.get<ClientRow[]>(`/clients?agencyId=${id}`),
}
