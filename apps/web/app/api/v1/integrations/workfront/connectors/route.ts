import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'
import { WorkfrontConnector } from '@/lib/models/WorkfrontConnector'
import { encryptSecret } from '@/lib/integrations/crypto'
import { serializeConnector } from '@/lib/integrations/workfrontSerialize'

// All Workfront object types the connector can sync, with their defaults.
const WF_OBJECT_CODES = [
  'PROJ', 'TASK', 'OPTASK', 'ASSGN', 'USER', 'HOUR', 'PORTFOLIO',
  'PROGRAM', 'TEAM', 'GROUP', 'DOCUMENT', 'NOTE', 'EXPENSE', 'RISK',
]
const WF_DEFAULT_ENABLED = ['PROJ', 'TASK', 'USER']

export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const connectors = await WorkfrontConnector.find({ agencyId: ctx.agencyId }).sort({ createdAt: -1 })
  return ok(connectors.map(serializeConnector))
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()

  if (!body.baseUrl?.trim() || !body.domain?.trim()) {
    return err('Base URL and Domain are required', 'VALIDATION', 400)
  }

  const authType = body.authType === 'OAUTH2' ? 'OAUTH2' : 'API_KEY'
  const enabled: string[] = Array.isArray(body.enabledObjects) && body.enabledObjects.length
    ? body.enabledObjects
    : WF_DEFAULT_ENABLED

  const hasApiKey = authType === 'API_KEY' && !!body.apiKey
  const hasOAuth = authType === 'OAUTH2' && !!body.oauthClientId && !!body.oauthClientSecret

  const connector = await WorkfrontConnector.create({
    agencyId: ctx.agencyId,
    name: body.name?.trim() || 'Adobe Workfront',
    baseUrl: body.baseUrl.trim().replace(/\/+$/, ''),
    domain: body.domain.trim(),
    apiVersion: body.apiVersion?.trim() || 'v14.0',
    authType,
    apiKeyEnc: hasApiKey ? encryptSecret(body.apiKey) : null,
    oauthClientIdEnc: hasOAuth ? encryptSecret(body.oauthClientId) : null,
    oauthClientSecretEnc: hasOAuth ? encryptSecret(body.oauthClientSecret) : null,
    status: hasApiKey || hasOAuth ? 'ACTIVE' : 'DRAFT',
    syncFrequencyMinutes: Number(body.syncFrequencyMinutes) || 15,
    createdBy: ctx.userId,
    objectConfigs: WF_OBJECT_CODES.map((code) => ({
      objectCode: code,
      enabled: enabled.includes(code),
      lastSyncCount: 0,
    })),
  })

  return ok(serializeConnector(connector), 201)
}
