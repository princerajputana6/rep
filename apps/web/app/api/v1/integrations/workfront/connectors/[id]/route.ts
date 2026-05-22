import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'
import { WorkfrontConnector } from '@/lib/models/WorkfrontConnector'
import { WorkfrontSyncJob } from '@/lib/models/WorkfrontSyncJob'
import { encryptSecret } from '@/lib/integrations/crypto'
import { serializeConnector } from '@/lib/integrations/workfrontSerialize'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const connector = await WorkfrontConnector.findOne({ _id: id, agencyId: ctx.agencyId })
  if (!connector) return err('Connector not found', 'NOT_FOUND', 404)
  return ok(serializeConnector(connector))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const connector = await WorkfrontConnector.findOne({ _id: id, agencyId: ctx.agencyId })
  if (!connector) return err('Connector not found', 'NOT_FOUND', 404)

  const body = await req.json()
  if (typeof body.name === 'string') connector.name = body.name.trim()
  if (typeof body.baseUrl === 'string') connector.baseUrl = body.baseUrl.trim().replace(/\/+$/, '')
  if (typeof body.domain === 'string') connector.domain = body.domain.trim()
  if (typeof body.apiVersion === 'string') connector.apiVersion = body.apiVersion.trim()
  if (body.authType === 'API_KEY' || body.authType === 'OAUTH2') connector.authType = body.authType
  if (body.syncFrequencyMinutes != null) {
    connector.syncFrequencyMinutes = Number(body.syncFrequencyMinutes) || 15
  }
  if (body.apiKey) {
    connector.apiKeyEnc = encryptSecret(body.apiKey)
    if (connector.status === 'DRAFT') connector.status = 'ACTIVE'
  }
  if (body.oauthClientId) connector.oauthClientIdEnc = encryptSecret(body.oauthClientId)
  if (body.oauthClientSecret) connector.oauthClientSecretEnc = encryptSecret(body.oauthClientSecret)

  await connector.save()
  return ok(serializeConnector(connector))
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const connector = await WorkfrontConnector.findOneAndDelete({ _id: id, agencyId: ctx.agencyId })
  if (!connector) return err('Connector not found', 'NOT_FOUND', 404)
  await WorkfrontSyncJob.deleteMany({ connectorId: id })
  return new Response(null, { status: 204 })
}
