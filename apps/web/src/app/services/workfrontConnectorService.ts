import { api } from '@/lib/api'

export interface WorkfrontConnector {
  id: string
  agencyId: string
  name: string
  baseUrl: string
  domain: string
  apiVersion: string
  authType: 'API_KEY' | 'OAUTH2'
  hasApiKey: boolean
  hasOAuthCredentials: boolean
  status: 'DRAFT' | 'ACTIVE' | 'ERROR' | 'DISABLED'
  lastSyncAt: string | null
  lastSyncError: string | null
  syncFrequencyMinutes: number | null
  createdAt: string
  updatedAt: string
  createdBy: string
  objectConfigs: WorkfrontObjectConfig[]
}

export interface WorkfrontObjectConfig {
  id: string
  connectorId: string
  objectCode: string
  enabled: boolean
  fieldList: string[] | null
  filters: Record<string, string> | null
  syncCursor: string | null
  lastSyncCount: number
}

export interface CreateWorkfrontConnectorDTO {
  agencyId?: string
  name: string
  baseUrl: string
  domain: string
  apiVersion?: string
  authType: 'API_KEY' | 'OAUTH2'
  apiKey?: string
  oauthClientId?: string
  oauthClientSecret?: string
  syncFrequencyMinutes?: number
}

export interface UpdateWorkfrontConnectorDTO {
  name?: string
  baseUrl?: string
  domain?: string
  apiVersion?: string
  authType?: 'API_KEY' | 'OAUTH2'
  apiKey?: string
  oauthClientId?: string
  oauthClientSecret?: string
  syncFrequencyMinutes?: number
}

export interface TestConnectionResult {
  success: boolean
  message: string
  latencyMs: number
}

export interface WorkfrontSyncJob {
  id: string
  connectorId: string
  mode: 'FULL' | 'INCREMENTAL'
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL'
  triggeredBy: string
  startedAt: string
  completedAt: string | null
  totalRecords: number
  errorMessage: string | null
}

export const workfrontConnectorService = {
  async listConnectors(agencyId?: string): Promise<WorkfrontConnector[]> {
    const query = agencyId ? `?agencyId=${agencyId}` : ''
    return api.get<WorkfrontConnector[]>(`/integrations/workfront/connectors${query}`)
  },

  async createConnector(dto: CreateWorkfrontConnectorDTO): Promise<WorkfrontConnector> {
    return api.post<WorkfrontConnector>('/integrations/workfront/connectors', dto)
  },

  async updateConnector(id: string, dto: UpdateWorkfrontConnectorDTO): Promise<WorkfrontConnector> {
    return api.patch<WorkfrontConnector>(`/integrations/workfront/connectors/${id}`, dto)
  },

  async deleteConnector(id: string): Promise<void> {
    return api.delete<void>(`/integrations/workfront/connectors/${id}`)
  },

  async testConnection(id: string): Promise<TestConnectionResult> {
    return api.post<TestConnectionResult>(`/integrations/workfront/connectors/${id}/test`, {})
  },

  async triggerSync(id: string, mode: 'FULL' | 'INCREMENTAL' = 'INCREMENTAL'): Promise<WorkfrontSyncJob> {
    return api.post<WorkfrontSyncJob>(`/integrations/workfront/connectors/${id}/sync`, { mode })
  },

  async getSyncJobs(id: string): Promise<WorkfrontSyncJob[]> {
    return api.get<WorkfrontSyncJob[]>(`/integrations/workfront/connectors/${id}/sync-jobs`)
  },

  async updateObjectConfig(id: string, code: string, dto: { enabled?: boolean; fieldList?: string[] }): Promise<void> {
    return api.patch<void>(`/integrations/workfront/connectors/${id}/objects/${code}`, dto)
  },
}
