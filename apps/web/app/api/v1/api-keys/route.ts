import { NextRequest } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import connectDB from '@/lib/mongodb'
import { ApiKey } from '@/lib/models/ApiKey'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  // Never expose hashedKey to the client.
  const data = await ApiKey.find({ agencyId: ctx.agencyId })
    .select('-hashedKey').sort({ createdAt: -1 }).lean()
  return ok(data)
}

// On create we return the plaintext key exactly once. The server stores only
// the SHA-256 hash so future GETs can never recover the original.
export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()

  const raw = `rep_${randomBytes(24).toString('hex')}`
  const prefix = raw.slice(0, 12)
  const hashedKey = createHash('sha256').update(raw).digest('hex')

  const k = await ApiKey.create({
    agencyId: ctx.agencyId,
    name: body.name ?? 'Untitled key',
    scopes: Array.isArray(body.scopes) ? body.scopes : [],
    prefix, hashedKey,
    createdBy: ctx.userId,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
  })

  // Return the plaintext once — the client must store it.
  return ok({ ...k.toObject(), hashedKey: undefined, plaintextKey: raw }, 201)
}
