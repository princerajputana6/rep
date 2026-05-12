import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Portfolio } from '@/lib/models/Portfolio'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const filter: Record<string, unknown> = { agencyId: ctx.agencyId }
  if (status) filter.status = status
  const data = await Portfolio.find(filter).sort({ createdAt: -1 }).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const portfolio = await Portfolio.create({ ...body, agencyId: ctx.agencyId })
  return ok(portfolio, 201)
}
