import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { UserPreference } from '@/lib/models/UserPreference'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

// One preference doc per user.
export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const doc = await UserPreference.findOne({ userId: ctx.userId }).lean()
  return ok(doc ?? { branding: {}, layout: {}, widgets: {}, custom: {} })
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()

  // Whitelist top-level keys and merge in.
  const ALLOWED = ['branding', 'layout', 'widgets', 'custom'] as const
  const set: Record<string, unknown> = {}
  for (const k of ALLOWED) {
    if (body[k] && typeof body[k] === 'object') set[k] = body[k]
  }

  const doc = await UserPreference.findOneAndUpdate(
    { userId: ctx.userId },
    { $set: set, $setOnInsert: { userId: ctx.userId, agencyId: ctx.agencyId } },
    { upsert: true, new: true }
  ).lean()

  return ok(doc)
}
