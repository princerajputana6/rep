import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { JobRole } from '@/lib/models/JobRole'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const agencyId = searchParams.get('agencyId') ?? ctx.agencyId
  const data = await JobRole.find({ agencyId }).sort({ createdAt: -1 }).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const role = await JobRole.create({ ...body, agencyId: body.agencyId ?? ctx.agencyId })
  return ok(role, 201)
}
