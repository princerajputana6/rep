const API_BASE = '/api/v1'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  })

  if (res.status === 204) return undefined as T

  const json: { success: boolean; data?: T; error?: { code: string; message: string } } = await res.json()

  if (!res.ok || !json.success) {
    const msg = json.error?.message ?? `HTTP ${res.status}`
    const code = json.error?.code ?? 'ERROR'
    if (res.status === 401) {
      window.dispatchEvent(new CustomEvent('rep:force-logout'))
    }
    throw new ApiError(res.status, code, msg)
  }

  return json.data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export interface PagedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface Portfolio {
  id: string
  agencyId: string
  name: string
  description?: string
  owner: string
  strategicTheme: string
  status: string
  startDate?: string
  endDate?: string
  budget?: number
  spent: number
  createdAt: string
  updatedAt: string
}

export interface Program {
  id: string
  agencyId: string
  portfolioId?: string
  name: string
  description?: string
  owner: string
  status: string
  healthScore?: number
  startDate?: string
  endDate?: string
  budget?: number
  spent: number
  projectIds: string[]
  createdAt: string
  updatedAt: string
}

export interface BorrowRequest {
  id: string
  agencyId: string
  resourceName: string
  requestingTeam: string
  owningTeam: string
  projectName?: string
  skillsNeeded: string[]
  priority: string
  startDate: string
  endDate: string
  durationWeeks: number
  allocationPct: number
  internalCost?: number
  partnerCost?: number
  routingScore?: number
  status: string
  slaDeadline: string
  notes?: string
  createdAt: string
}

export interface ResourceApproval {
  id: string
  agencyId: string
  resourceName: string
  projectName: string
  requestedBy: string
  requestedRole: string
  duration: string
  startDate: string
  endDate?: string
  allocationPct: number
  hourlyRate?: number
  billableRate?: number
  marginPct?: number
  status: string
  slaDeadline: string
  rejectionReason?: string
  createdAt: string
}

export interface StaffingPlan {
  id: string
  agencyId: string
  name: string
  periodType: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
  year: number
  month?: number
  quarter?: number
  projectIds: string[]
  status: string
  createdAt: string
}

export const portfoliosApi = {
  list: async (filters?: Record<string, string>): Promise<PagedResponse<Portfolio>> => {
    const qs = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    const data = await request<Portfolio[]>(`/portfolios${qs}`)
    return { data: data ?? [], total: data?.length ?? 0, page: 1, perPage: data?.length ?? 0, totalPages: 1 }
  },
  get: (id: string) => request<Portfolio>(`/portfolios/${id}`),
  create: (body: Partial<Portfolio>) => request<Portfolio>('/portfolios', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Portfolio>) => request<Portfolio>(`/portfolios/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>(`/portfolios/${id}`, { method: 'DELETE' }),
}

export const programsApi = {
  list: async (filters?: Record<string, string>): Promise<PagedResponse<Program>> => {
    const qs = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    const data = await request<Program[]>(`/programs${qs}`)
    return { data: data ?? [], total: data?.length ?? 0, page: 1, perPage: data?.length ?? 0, totalPages: 1 }
  },
  get: (id: string) => request<Program>(`/programs/${id}`),
  create: (body: Partial<Program>) => request<Program>('/programs', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<Program>) => request<Program>(`/programs/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>(`/programs/${id}`, { method: 'DELETE' }),
}

export const borrowRequestsApi = {
  list: async (filters?: Record<string, string>): Promise<PagedResponse<BorrowRequest>> => {
    const qs = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    const data = await request<BorrowRequest[]>(`/borrow-requests${qs}`)
    return { data: data ?? [], total: data?.length ?? 0, page: 1, perPage: data?.length ?? 0, totalPages: 1 }
  },
  get: (id: string) => request<BorrowRequest>(`/borrow-requests/${id}`),
  create: (body: Partial<BorrowRequest>) => request<BorrowRequest>('/borrow-requests', { method: 'POST', body: JSON.stringify(body) }),
  approve: (id: string) => request<BorrowRequest>(`/borrow-requests/${id}/approve`, { method: 'POST' }),
  reject: (id: string, reason: string) => request<BorrowRequest>(`/borrow-requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
}

export const resourceApprovalsApi = {
  list: async (filters?: Record<string, string>): Promise<PagedResponse<ResourceApproval>> => {
    const qs = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    const data = await request<ResourceApproval[]>(`/resource-approvals${qs}`)
    return { data: data ?? [], total: data?.length ?? 0, page: 1, perPage: data?.length ?? 0, totalPages: 1 }
  },
  get: (id: string) => request<ResourceApproval>(`/resource-approvals/${id}`),
  create: (body: Partial<ResourceApproval>) => request<ResourceApproval>('/resource-approvals', { method: 'POST', body: JSON.stringify(body) }),
  approve: (id: string) => request<ResourceApproval>(`/resource-approvals/${id}/approve`, { method: 'POST' }),
  reject: (id: string, reason: string) => request<ResourceApproval>(`/resource-approvals/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  bulkApprove: (ids: string[]) => request<{ approved: number }>('/resource-approvals/bulk-approve', { method: 'POST', body: JSON.stringify({ ids }) }),
}

export const staffingPlansApi = {
  list: async (filters?: Record<string, string>): Promise<PagedResponse<StaffingPlan>> => {
    const qs = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    const data = await request<StaffingPlan[]>(`/staffing-plans${qs}`)
    return { data: data ?? [], total: data?.length ?? 0, page: 1, perPage: data?.length ?? 0, totalPages: 1 }
  },
  get: (id: string) => request<StaffingPlan>(`/staffing-plans/${id}`),
  create: (body: Partial<StaffingPlan>) => request<StaffingPlan>('/staffing-plans', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<StaffingPlan>) => request<StaffingPlan>(`/staffing-plans/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id: string) => request<void>(`/staffing-plans/${id}`, { method: 'DELETE' }),
}
