import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { CurrencyMapping } from '@/lib/models/CurrencyMapping'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const data = await CurrencyMapping.find({ agencyId: ctx.agencyId }).sort({ createdAt: -1 }).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const c = await CurrencyMapping.create({ ...body, agencyId: ctx.agencyId })
  return ok(c, 201)
}
