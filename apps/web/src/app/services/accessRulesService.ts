import { api } from '@/lib/api'

export interface ObjectMeta {
  code: string
  label: string
  category: string
}

export interface AccessRule {
  id: string
  agencyId: string
  roleCode: string
  objectCode: string
  canCreate: boolean
  canView: boolean
  canUpdate: boolean
  canDelete: boolean
  canShare: boolean
  updatedBy: string | null
  updatedAt: string
}

export interface AccessRulesData {
  objects: ObjectMeta[]
  configurableRoles: string[]
  rules: AccessRule[]
  grouped: Record<string, AccessRule[]>
}

export interface BulkUpdateItem {
  roleCode: string
  objectCode: string
  canCreate: boolean
  canView: boolean
  canUpdate: boolean
  canDelete: boolean
  canShare: boolean
}

export const accessRulesService = {
  async getAll(agencyId?: string): Promise<AccessRulesData> {
    const params = agencyId ? `?agencyId=${agencyId}` : ''
    return api.get<AccessRulesData>(`/admin/access-rules${params}`)
  },

  async updateOne(
    roleCode: string,
    objectCode: string,
    permissions: Partial<Pick<AccessRule, 'canCreate' | 'canView' | 'canUpdate' | 'canDelete' | 'canShare'>>,
    agencyId?: string,
  ): Promise<AccessRule> {
    const params = agencyId ? `?agencyId=${agencyId}` : ''
    return api.put<AccessRule>(`/admin/access-rules/${roleCode}/${objectCode}${params}`, permissions)
  },

  async bulkUpdate(rules: BulkUpdateItem[], agencyId?: string): Promise<void> {
    const params = agencyId ? `?agencyId=${agencyId}` : ''
    await api.put<void>(`/admin/access-rules/bulk${params}`, { rules })
  },

  async reset(agencyId?: string): Promise<void> {
    const params = agencyId ? `?agencyId=${agencyId}` : ''
    await api.post<void>(`/admin/access-rules/reset${params}`, {})
  },

  async getObjects(): Promise<ObjectMeta[]> {
    return api.get<ObjectMeta[]>('/admin/access-rules/objects')
  },
}
