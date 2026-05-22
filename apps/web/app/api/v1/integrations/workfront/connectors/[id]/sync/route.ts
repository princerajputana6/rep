import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'
import { WorkfrontConnector } from '@/lib/models/WorkfrontConnector'
import { runWorkfrontSync } from '@/lib/integrations/workfrontSync'
import { serializeSyncJob } from '@/lib/integrations/workfrontSerialize'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const connector = await WorkfrontConnector.findOne({ _id: id, agencyId: ctx.agencyId })
  if (!connector) return err('Connector not found', 'NOT_FOUND', 404)

  const body = await req.json().catch(() => ({}))
  const mode = body.mode === 'FULL' ? 'FULL' : 'INCREMENTAL'

  const job = await runWorkfrontSync(connector, mode, ctx.userId)
  return ok(serializeSyncJob(job), 201)
}
