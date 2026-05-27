import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { AppSetting } from '@/lib/models/AppSetting'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

// One settings doc per agency. GET returns the bag (empty if never saved);
// PATCH merges the partial body into `values`.
export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const doc = await AppSetting.findOne({ agencyId: ctx.agencyId }).lean()
  return ok(doc?.values ?? {})
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()

  // Build dotted-path $set so PATCH merges instead of replacing the bag.
  const set: Record<string, unknown> = { updatedBy: ctx.userId }
  for (const [k, v] of Object.entries(body ?? {})) {
    set[`values.${k}`] = v
  }

  const doc = await AppSetting.findOneAndUpdate(
    { agencyId: ctx.agencyId },
    { $set: set, $setOnInsert: { agencyId: ctx.agencyId } },
    { upsert: true, new: true }
  ).lean()

  return ok(doc?.values ?? {})
}
