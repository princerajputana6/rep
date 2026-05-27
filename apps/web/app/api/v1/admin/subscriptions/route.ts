import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Subscription } from '@/lib/models/Subscription'
import { Agency } from '@/lib/models/Agency'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'
import { PLAN_DEFAULTS, ModuleKey } from '@/lib/modules'

// SUPER_ADMIN only. Returns every agency joined with its subscription.
export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (ctx.role !== 'SUPER_ADMIN') return err('Forbidden', 'FORBIDDEN', 403)
  await connectDB()
  const subs = await Subscription.find({}).lean()
  return ok(subs)
}

// Create a fresh subscription for an agency (or upsert one).
export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (ctx.role !== 'SUPER_ADMIN') return err('Forbidden', 'FORBIDDEN', 403)
  await connectDB()
  const body = await req.json()
  if (!body.agencyId) return err('agencyId required', 'VALIDATION', 400)

  const plan = body.plan && PLAN_DEFAULTS[body.plan as string] ? body.plan : 'FREE'
  const enabledModules: ModuleKey[] = Array.isArray(body.enabledModules)
    ? body.enabledModules
    : PLAN_DEFAULTS[plan]

  // Refuse to create a subscription for an agency that doesn't exist.
  const agency = await Agency.findById(body.agencyId).lean()
  if (!agency) return err('Agency not found', 'NOT_FOUND', 404)

  const sub = await Subscription.findOneAndUpdate(
    { agencyId: body.agencyId },
    {
      $set: {
        plan,
        status: body.status ?? 'TRIAL',
        enabledModules,
        maxUsers: body.maxUsers ?? null,
        maxProjects: body.maxProjects ?? null,
        trialEndsAt: body.trialEndsAt ? new Date(body.trialEndsAt) : null,
        currentPeriodEnd: body.currentPeriodEnd ? new Date(body.currentPeriodEnd) : null,
        notes: body.notes ?? '',
        updatedBy: ctx.userId,
      },
      $setOnInsert: { agencyId: body.agencyId },
    },
    { upsert: true, new: true }
  ).lean()
  return ok(sub, 201)
}
