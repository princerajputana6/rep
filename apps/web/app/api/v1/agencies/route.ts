import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Agency } from '@/lib/models/Agency'
import { Environment } from '@/lib/models/Environment'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

const ADMIN_ROLES = ['SUPER_ADMIN', 'COMPANY_ADMIN']

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  await connectDB()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '25')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  // Scope: super admin sees all; a company admin sees their whole company;
  // a regular member sees only their own agency.
  const filter: Record<string, unknown> = {}
  if (ctx.role === 'SUPER_ADMIN') {
    /* all */
  } else if (ctx.role === 'COMPANY_ADMIN' && ctx.companyId) {
    filter.companyId = ctx.companyId
  } else {
    filter._id = ctx.agencyId
  }
  if (status) filter.status = status
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { ownerEmail: { $regex: search, $options: 'i' } },
  ]

  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    Agency.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Agency.countDocuments(filter),
  ])

  return ok(data, 200)
}

// Create an agency. Super admins and company admins only. A company admin's
// agency is stamped with their companyId + production environment.
export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (!ADMIN_ROLES.includes(ctx.role)) return err('Forbidden', 'FORBIDDEN', 403)

  await connectDB()
  const body = await req.json()

  const name = String(body.name ?? '').trim()
  if (!name) return err('Agency name is required', 'VALIDATION', 400)

  const ownerEmail = body.ownerEmail ? String(body.ownerEmail).toLowerCase().trim() : undefined
  if (ownerEmail && (await Agency.findOne({ ownerEmail }))) {
    return err('Agency with this email already exists', 'CONFLICT', 409)
  }

  // Default new agencies into the company's production environment.
  let environmentId: string | null = null
  if (ctx.companyId) {
    const prod = await Environment.findOne({ companyId: ctx.companyId, type: 'PRODUCTION' }).select('_id').lean()
    environmentId = prod ? String(prod._id) : null
  }

  const agency = await Agency.create({
    name,
    companyId: ctx.companyId ?? undefined,
    environmentId,
    owner: String(body.owner ?? '').trim() || 'Unassigned',
    ownerEmail,
    totalResources: Number(body.totalResources) || 0,
    participationLevel: body.participationLevel ?? 'full',
    status: 'ACTIVE',
    createdBy: ctx.userId,
  })

  return ok(agency, 201)
}
