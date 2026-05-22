import { Project } from '@/lib/models/Project'
import { Resource } from '@/lib/models/Resource'
import { WorkfrontConnector, IWorkfrontConnector } from '@/lib/models/WorkfrontConnector'
import { WorkfrontSyncJob } from '@/lib/models/WorkfrontSyncJob'
import { decryptSecret } from './crypto'
import { fetchAllRecords, WorkfrontClientConfig } from './workfrontClient'

const SOURCE = 'workfront'

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

function date(v: unknown): Date | undefined {
  if (typeof v !== 'string' || !v) return undefined
  const d = new Date(v)
  return isNaN(d.getTime()) ? undefined : d
}

// Workfront project status codes -> REP status labels.
function mapProjectStatus(code: unknown): string {
  switch (code) {
    case 'CUR': return 'ACTIVE'
    case 'CPL': return 'COMPLETED'
    case 'DED': return 'ON_HOLD'
    case 'PLN': return 'PLANNING'
    case 'IDA': return 'PLANNING'
    case 'APR': return 'PLANNING'
    case 'REJ': return 'CANCELLED'
    default: return 'ACTIVE'
  }
}

async function upsertProjects(
  agencyId: string,
  records: Record<string, unknown>[]
): Promise<number> {
  let count = 0
  for (const r of records) {
    const externalId = str(r.ID)
    const name = str(r.name)
    if (!externalId || !name) continue
    await Project.updateOne(
      { agencyId, externalSource: SOURCE, externalId },
      {
        $set: {
          name,
          description: str(r.description),
          status: mapProjectStatus(r.status),
          startDate: date(r.plannedStartDate),
          endDate: date(r.plannedCompletionDate),
          budget: typeof r.budget === 'number' ? r.budget : undefined,
          agencyId,
          externalSource: SOURCE,
          externalId,
        },
      },
      { upsert: true }
    )
    count++
  }
  return count
}

async function upsertResources(
  agencyId: string,
  records: Record<string, unknown>[]
): Promise<number> {
  let count = 0
  for (const r of records) {
    const externalId = str(r.ID)
    const name = str(r.name)
    const email = str(r.emailAddr)
    if (!externalId || !name || !email) continue
    await Resource.updateOne(
      { email },
      {
        $set: {
          name,
          role: str(r.title) ?? 'Workfront User',
          active: r.isActive !== false,
          agencyId,
          externalSource: SOURCE,
          externalId,
        },
      },
      { upsert: true }
    )
    count++
  }
  return count
}

// Runs a full pull for one connector: fetches each enabled object,
// maps Projects/Users into REP, and records a sync job.
export async function runWorkfrontSync(
  connector: IWorkfrontConnector,
  mode: 'FULL' | 'INCREMENTAL',
  triggeredBy: string
) {
  const job = await WorkfrontSyncJob.create({
    agencyId: connector.agencyId,
    connectorId: String(connector._id),
    mode,
    status: 'RUNNING',
    triggeredBy,
  })

  if (connector.authType !== 'API_KEY' || !connector.apiKeyEnc) {
    job.status = 'FAILED'
    job.errorMessage = 'Connector has no API key configured'
    job.completedAt = new Date()
    await job.save()
    await WorkfrontConnector.updateOne(
      { _id: connector._id },
      { $set: { status: 'ERROR', lastSyncError: job.errorMessage } }
    )
    return job
  }

  const cfg: WorkfrontClientConfig = {
    baseUrl: connector.baseUrl,
    apiVersion: connector.apiVersion,
    apiKey: decryptSecret(connector.apiKeyEnc),
  }

  let total = 0
  let projectCount = 0
  let resourceCount = 0
  const failures: string[] = []

  for (const oc of connector.objectConfigs) {
    if (!oc.enabled) continue
    try {
      const records = await fetchAllRecords(cfg, oc.objectCode)
      oc.lastSyncCount = records.length
      total += records.length

      if (oc.objectCode === 'PROJ') {
        projectCount = await upsertProjects(connector.agencyId, records)
      } else if (oc.objectCode === 'USER') {
        resourceCount = await upsertResources(connector.agencyId, records)
      }
    } catch (e) {
      failures.push(`${oc.objectCode}: ${e instanceof Error ? e.message : 'failed'}`)
    }
  }

  const now = new Date()
  job.totalRecords = total
  job.completedAt = now
  job.status = failures.length === 0 ? 'COMPLETED' : total > 0 ? 'PARTIAL' : 'FAILED'
  job.errorMessage = failures.length ? failures.join('; ') : null
  await job.save()

  connector.lastSyncAt = now
  connector.lastSyncError = failures.length ? failures.join('; ') : null
  connector.lastSyncProjectCount = projectCount
  connector.lastSyncResourceCount = resourceCount
  connector.status = job.status === 'FAILED' ? 'ERROR' : 'ACTIVE'
  await connector.save()

  return job
}
