import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Agency } from '@/lib/models/Agency'
import { User } from '@/lib/models/User'
import { Subscription } from '@/lib/models/Subscription'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'
import { PLAN_DEFAULTS, ModuleKey } from '@/lib/modules'

// SUPER_ADMIN only. Returns every agency joined with its subscription
// (subscription may be null until the admin creates one).
export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (ctx.role !== 'SUPER_ADMIN') return err('Forbidden', 'FORBIDDEN', 403)
  await connectDB()

  const [agencies, subs, userCounts] = await Promise.all([
    Agency.find({}).sort({ createdAt: -1 }).lean(),
    Subscription.find({}).lean(),
    User.aggregate([{ $group: { _id: '$agencyId', count: { $sum: 1 } } }]),
  ])
  const subByAgency = new Map(subs.map((s) => [String(s.agencyId), s]))
  const userCountByAgency = new Map(userCounts.map((u: { _id: string; count: number }) => [String(u._id), u.count]))

  return ok(agencies.map((a) => ({
    ...a,
    subscription: subByAgency.get(String(a._id)) ?? null,
    userCount: userCountByAgency.get(String(a._id)) ?? 0,
  })))
}

// Onboard a brand-new company in one call: creates the Agency, an initial
// AGENCY_OWNER user, and a Subscription seeded from the chosen plan.
export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (ctx.role !== 'SUPER_ADMIN') return err('Forbidden', 'FORBIDDEN', 403)
  await connectDB()
  const body = await req.json()

  if (!body.name?.trim()) return err('Agency name required', 'VALIDATION', 400)
  if (!body.ownerEmail?.trim()) return err('Owner email required', 'VALIDATION', 400)
  if (!body.owner?.trim()) return err('Owner name required', 'VALIDATION', 400)

  const existingAgency = await Agency.findOne({ ownerEmail: body.ownerEmail.trim() })
  if (existingAgency) return err('Agency with this owner email already exists', 'CONFLICT', 409)

  const agency = await Agency.create({
    name: body.name.trim(),
    owner: body.owner.trim(),
    ownerEmail: body.ownerEmail.trim(),
    participationLevel: body.participationLevel ?? 'full',
    status: 'ACTIVE',
  })

  // Seed an owner user if one doesn't already exist for this email.
  const existingUser = await User.findOne({ email: body.ownerEmail.trim() })
  let user = existingUser
  if (!user) {
    user = await User.create({
      name: body.owner.trim(),
      email: body.ownerEmail.trim(),
      agencyId: String(agency._id),
      role: 'AGENCY_OWNER',
      clerkId: body.clerkId ?? `pending_${Date.now()}`,
    })
  }

  const plan = body.plan && PLAN_DEFAULTS[body.plan as string] ? body.plan : 'FREE'
  const enabledModules: ModuleKey[] = Array.isArray(body.enabledModules)
    ? body.enabledModules
    : PLAN_DEFAULTS[plan]

  const subscription = await Subscription.create({
    agencyId: String(agency._id),
    plan,
    status: body.status ?? 'TRIAL',
    enabledModules,
    maxUsers: body.maxUsers ?? null,
    maxProjects: body.maxProjects ?? null,
    trialEndsAt: body.trialEndsAt ? new Date(body.trialEndsAt) : null,
    notes: body.notes ?? '',
    updatedBy: ctx.userId,
  })

  return ok({ agency, user, subscription }, 201)
}
