import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { SubAgency } from '@/lib/models/SubAgency'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const parentAgencyId = searchParams.get('parentAgencyId')
  const filter: Record<string, unknown> = {}
  if (parentAgencyId) filter.parentAgencyId = parentAgencyId
  else if (ctx.role !== 'SUPER_ADMIN') filter.parentAgencyId = ctx.agencyId
  const data = await SubAgency.find(filter).sort({ createdAt: -1 }).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const sub = await SubAgency.create({
    ...body,
    parentAgencyId: body.parentAgencyId ?? ctx.agencyId,
  })
  return ok(sub, 201)
}
