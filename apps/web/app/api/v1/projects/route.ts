import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { Agency } from '@/lib/models/Agency'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

async function resolveAgencyId(requestedAgencyId: string | undefined, ctx: { role: string; companyId?: string | null; agencyId: string }) {
  const agencyId = requestedAgencyId || ctx.agencyId
  if (ctx.role === 'SUPER_ADMIN') return agencyId
  if (ctx.role === 'COMPANY_ADMIN' && ctx.companyId) {
    const agency = await Agency.findOne({ _id: agencyId, companyId: ctx.companyId }).select('_id').lean()
    return agency ? agencyId : null
  }
  return agencyId === ctx.agencyId ? agencyId : null
}

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const status = searchParams.get('status')
  const agencyId = await resolveAgencyId(searchParams.get('agencyId') ?? undefined, ctx)
  if (!agencyId) return err('Invalid agency', 'VALIDATION', 400)
  const filter: Record<string, unknown> = { agencyId }
  if (status) filter.status = status
  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Project.countDocuments(filter),
  ])
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const agencyId = await resolveAgencyId(body.agencyId ? String(body.agencyId) : undefined, ctx)
  if (!agencyId) return err('Invalid agency', 'VALIDATION', 400)
  const project = await Project.create({ ...body, agencyId })
  return ok(project, 201)
}
