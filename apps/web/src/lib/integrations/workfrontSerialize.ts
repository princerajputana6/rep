import { IWorkfrontConnector } from '@/lib/models/WorkfrontConnector'
import { IWorkfrontSyncJob } from '@/lib/models/WorkfrontSyncJob'

// Shapes the connector for the client — never exposes encrypted secrets.
export function serializeConnector(c: IWorkfrontConnector) {
  const id = String(c._id)
  return {
    id,
    agencyId: c.agencyId,
    name: c.name,
    baseUrl: c.baseUrl,
    domain: c.domain,
    apiVersion: c.apiVersion,
    authType: c.authType,
    hasApiKey: !!c.apiKeyEnc,
    hasOAuthCredentials: !!c.oauthClientIdEnc && !!c.oauthClientSecretEnc,
    status: c.status,
    lastSyncAt: c.lastSyncAt ? c.lastSyncAt.toISOString() : null,
    lastSyncError: c.lastSyncError ?? null,
    syncFrequencyMinutes: c.syncFrequencyMinutes ?? null,
    lastSyncProjectCount: c.lastSyncProjectCount ?? 0,
    lastSyncResourceCount: c.lastSyncResourceCount ?? 0,
    createdAt: c.createdAt?.toISOString?.() ?? null,
    updatedAt: c.updatedAt?.toISOString?.() ?? null,
    createdBy: c.createdBy,
    objectConfigs: c.objectConfigs.map((oc) => ({
      id: String(oc._id),
      connectorId: id,
      objectCode: oc.objectCode,
      enabled: oc.enabled,
      fieldList: oc.fieldList ?? null,
      filters: oc.filters ?? null,
      syncCursor: oc.syncCursor ?? null,
      lastSyncCount: oc.lastSyncCount ?? 0,
    })),
  }
}

export function serializeSyncJob(j: IWorkfrontSyncJob) {
  return {
    id: String(j._id),
    connectorId: j.connectorId,
    mode: j.mode,
    status: j.status,
    triggeredBy: j.triggeredBy,
    startedAt: j.startedAt?.toISOString?.() ?? null,
    completedAt: j.completedAt ? j.completedAt.toISOString() : null,
    totalRecords: j.totalRecords,
    errorMessage: j.errorMessage ?? null,
  }
}
