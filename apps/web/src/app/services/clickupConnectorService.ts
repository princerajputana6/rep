import { api } from '@/lib/api'

export interface ClickUpObjectMeta {
  code: string
  label: string
  description: string
  defaultEnabled: boolean
}

export interface ClickUpConnector {
  id: string
  agencyId: string
  name: string
  teamId: string
  authType: 'PERSONAL_TOKEN' | 'OAUTH2'
  hasAccessToken: boolean
  hasOAuthCredentials: boolean
  status: 'DRAFT' | 'ACTIVE' | 'ERROR' | 'DISABLED'
  lastSyncAt: string | null
  lastSyncError: string | null
  syncFrequencyMinutes: number | null
  createdAt: string
  updatedAt: string
  createdBy: string
  objectConfigs: ClickUpObjectConfig[]
}

export interface ClickUpObjectConfig {
  id: string
  connectorId: string
  objectCode: string
  enabled: boolean
  fieldList: string[] | null
  filters: Record<string, string> | null
  syncCursor: string | null
  lastSyncCount: number
}

export interface CreateClickUpConnectorDTO {
  name: string
  teamId: string
  authType: 'PERSONAL_TOKEN' | 'OAUTH2'
  accessToken?: string
  oauthClientId?: string
  oauthClientSecret?: string
  syncFrequencyMinutes?: number
  enabledObjects?: string[]
}

export interface UpdateClickUpConnectorDTO {
  name?: string
  teamId?: string
  authType?: 'PERSONAL_TOKEN' | 'OAUTH2'
  accessToken?: string
  oauthClientId?: string
  oauthClientSecret?: string
  syncFrequencyMinutes?: number
}

export interface TestConnectionResult {
  success: boolean
  message: string
  latencyMs: number
}

export interface ClickUpSyncJob {
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

export const clickupConnectorService = {
  async getObjectTypes(): Promise<ClickUpObjectMeta[]> {
    return api.get<ClickUpObjectMeta[]>('/integrations/clickup/objects')
  },

  async listConnectors(): Promise<ClickUpConnector[]> {
    return api.get<ClickUpConnector[]>('/integrations/clickup/connectors')
  },

  async createConnector(dto: CreateClickUpConnectorDTO): Promise<ClickUpConnector> {
    return api.post<ClickUpConnector>('/integrations/clickup/connectors', dto)
  },

  async updateConnector(id: string, dto: UpdateClickUpConnectorDTO): Promise<ClickUpConnector> {
    return api.patch<ClickUpConnector>(`/integrations/clickup/connectors/${id}`, dto)
  },

  async deleteConnector(id: string): Promise<void> {
    return api.delete<void>(`/integrations/clickup/connectors/${id}`)
  },

  async testConnection(id: string): Promise<TestConnectionResult> {
    return api.post<TestConnectionResult>(`/integrations/clickup/connectors/${id}/test`, {})
  },

  async triggerSync(id: string, mode: 'FULL' | 'INCREMENTAL' = 'INCREMENTAL'): Promise<ClickUpSyncJob> {
    return api.post<ClickUpSyncJob>(`/integrations/clickup/connectors/${id}/sync`, { mode })
  },

  async getSyncJobs(id: string): Promise<ClickUpSyncJob[]> {
    return api.get<ClickUpSyncJob[]>(`/integrations/clickup/connectors/${id}/sync-jobs`)
  },

  async updateObjectConfig(id: string, code: string, dto: { enabled?: boolean }): Promise<void> {
    return api.patch<void>(`/integrations/clickup/connectors/${id}/objects/${code}`, dto)
  },
}
