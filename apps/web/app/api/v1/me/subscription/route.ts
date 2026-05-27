import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Subscription } from '@/lib/models/Subscription'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'
import { MODULE_KEYS } from '@/lib/modules'

// Returns the current user's agency subscription. SUPER_ADMIN gets a
// synthetic everything-enabled record so admin tooling always works.
export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()

  if (ctx.role === 'SUPER_ADMIN') {
    return ok({
      agencyId: ctx.agencyId,
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      enabledModules: MODULE_KEYS,
      isSuperAdmin: true,
    })
  }

  const sub = await Subscription.findOne({ agencyId: ctx.agencyId }).lean()
  if (sub) return ok({ ...sub, isSuperAdmin: false })

  // No subscription yet — return an empty bag so the client treats every
  // module as disabled (defensive default; tighten/loosen as you wish).
  return ok({
    agencyId: ctx.agencyId,
    plan: 'FREE',
    status: 'TRIAL',
    enabledModules: [] as string[],
    isSuperAdmin: false,
  })
}
