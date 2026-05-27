import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Insight } from '@/lib/models/Insight'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const filter: Record<string, unknown> = { agencyId: ctx.agencyId }
  if (type) filter.type = type
  if (status) filter.status = status
  const data = await Insight.find(filter).sort({ createdAt: -1 }).limit(500).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const i = await Insight.create({ ...body, agencyId: ctx.agencyId, createdBy: ctx.userId })
  return ok(i, 201)
}
