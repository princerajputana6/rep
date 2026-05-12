import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Program } from '@/lib/models/Program'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const portfolioId = searchParams.get('portfolioId')
  const filter: Record<string, unknown> = { agencyId: ctx.agencyId }
  if (portfolioId) filter.portfolioId = portfolioId
  const data = await Program.find(filter).sort({ createdAt: -1 }).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const program = await Program.create({ ...body, agencyId: ctx.agencyId })
  return ok(program, 201)
}
