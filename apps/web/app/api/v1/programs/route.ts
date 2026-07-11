import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Program } from '@/lib/models/Program'
import { Agency } from '@/lib/models/Agency'
import { Portfolio } from '@/lib/models/Portfolio'
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
  const portfolioId = searchParams.get('portfolioId')
  const requestedAgencyId = searchParams.get('agencyId') ?? undefined
  const portfolio = portfolioId
    ? await Portfolio.findOne({ _id: portfolioId }).select('agencyId').lean()
    : null
  const agencyId = await resolveAgencyId(requestedAgencyId ?? (portfolio?.agencyId ? String(portfolio.agencyId) : undefined), ctx)
  if (!agencyId) return err('Invalid agency', 'VALIDATION', 400)
  if (portfolio && String(portfolio.agencyId) !== agencyId) return err('Portfolio belongs to a different agency', 'VALIDATION', 400)
  const filter: Record<string, unknown> = { agencyId }
  if (portfolioId) filter.portfolioId = portfolioId
  const data = await Program.find(filter).sort({ createdAt: -1 }).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const portfolio = body.portfolioId
    ? await Portfolio.findOne({ _id: String(body.portfolioId) }).select('agencyId').lean()
    : null
  const requestedAgencyId = body.agencyId ? String(body.agencyId) : portfolio?.agencyId ? String(portfolio.agencyId) : undefined
  const agencyId = await resolveAgencyId(requestedAgencyId, ctx)
  if (!agencyId) return err('Invalid agency', 'VALIDATION', 400)
  if (portfolio && String(portfolio.agencyId) !== agencyId) return err('Portfolio belongs to a different agency', 'VALIDATION', 400)
  const program = await Program.create({ ...body, agencyId })
  return ok(program, 201)
}
