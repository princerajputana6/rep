import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { RateCard } from '@/lib/models/RateCard'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const agencyId = searchParams.get('agencyId') ?? ctx.agencyId
  const data = await RateCard.find({ agencyId }).sort({ createdAt: -1 }).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const rc = await RateCard.create({ ...body, agencyId: body.agencyId ?? ctx.agencyId })
  return ok(rc, 201)
}
