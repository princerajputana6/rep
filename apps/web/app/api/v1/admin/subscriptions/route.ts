import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Company } from '@/lib/models/Company'
import { License } from '@/lib/models/License'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'
import { PLAN_DEFAULTS, PLAN_TIERS, SANDBOX_ALLOWANCE, ModuleKey, PlanTier } from '@/lib/modules'

// SUPER_ADMIN only. Compatibility route for the Super Admin UI; it now manages
// company licenses rather than legacy agency subscriptions.
export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (ctx.role !== 'SUPER_ADMIN') return err('Forbidden', 'FORBIDDEN', 403)
  await connectDB()
  const licenses = await License.find({}).lean()
  return ok(licenses)
}

// Create a fresh license for a company (or upsert one).
export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (ctx.role !== 'SUPER_ADMIN') return err('Forbidden', 'FORBIDDEN', 403)
  await connectDB()
  const body = await req.json()
  if (!body.companyId) return err('companyId required', 'VALIDATION', 400)

  const tier: PlanTier = PLAN_TIERS.includes(body.tier) ? body.tier : 'PRIME'
  const enabledModules: ModuleKey[] = Array.isArray(body.enabledModules)
    ? body.enabledModules
    : PLAN_DEFAULTS[tier]

  const company = await Company.findById(body.companyId).lean()
  if (!company) return err('Company not found', 'NOT_FOUND', 404)

  const license = await License.findOneAndUpdate(
    { companyId: body.companyId },
    {
      $set: {
        tier,
        status: body.status ?? 'TRIAL',
        enabledModules,
        maxUsers: body.maxUsers ?? null,
        maxAgencies: body.maxAgencies ?? null,
        sandboxLimit: body.sandboxLimit ?? SANDBOX_ALLOWANCE[tier],
        seats: body.seats ?? null,
        validTo: body.validTo ? new Date(body.validTo) : null,
        notes: body.notes ?? '',
        issuedBy: ctx.userId,
      },
      $setOnInsert: { companyId: body.companyId },
    },
    { upsert: true, new: true }
  ).lean()
  return ok(license, 201)
}
