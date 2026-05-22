import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'
import { WorkfrontConnector } from '@/lib/models/WorkfrontConnector'
import { serializeConnector } from '@/lib/integrations/workfrontSerialize'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; code: string }> }
) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id, code } = await params
  await connectDB()
  const connector = await WorkfrontConnector.findOne({ _id: id, agencyId: ctx.agencyId })
  if (!connector) return err('Connector not found', 'NOT_FOUND', 404)

  const objConfig = connector.objectConfigs.find((c) => c.objectCode === code)
  if (!objConfig) return err('Object type not found on connector', 'NOT_FOUND', 404)

  const body = await req.json()
  if (typeof body.enabled === 'boolean') objConfig.enabled = body.enabled
  if (Array.isArray(body.fieldList)) objConfig.fieldList = body.fieldList

  await connector.save()
  return ok(serializeConnector(connector))
}
