import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'
import { WorkfrontConnector } from '@/lib/models/WorkfrontConnector'
import { WorkfrontSyncJob } from '@/lib/models/WorkfrontSyncJob'
import { serializeSyncJob } from '@/lib/integrations/workfrontSerialize'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const connector = await WorkfrontConnector.findOne({ _id: id, agencyId: ctx.agencyId })
  if (!connector) return err('Connector not found', 'NOT_FOUND', 404)

  const jobs = await WorkfrontSyncJob.find({ connectorId: id }).sort({ startedAt: -1 }).limit(50)
  return ok(jobs.map(serializeSyncJob))
}
