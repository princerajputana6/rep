import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'
import { WorkfrontConnector } from '@/lib/models/WorkfrontConnector'
import { decryptSecret } from '@/lib/integrations/crypto'
import { testWorkfrontConnection } from '@/lib/integrations/workfrontClient'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const connector = await WorkfrontConnector.findOne({ _id: id, agencyId: ctx.agencyId })
  if (!connector) return err('Connector not found', 'NOT_FOUND', 404)

  if (connector.authType !== 'API_KEY' || !connector.apiKeyEnc) {
    return ok({ success: false, message: 'No API key configured', latencyMs: 0 })
  }

  const result = await testWorkfrontConnection({
    baseUrl: connector.baseUrl,
    apiVersion: connector.apiVersion,
    apiKey: decryptSecret(connector.apiKeyEnc),
  })

  connector.status = result.success ? 'ACTIVE' : 'ERROR'
  connector.lastSyncError = result.success ? null : result.message
  await connector.save()

  return ok(result)
}
