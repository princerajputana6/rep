import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Timesheet } from '@/lib/models/Timesheet'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const agencyId = searchParams.get('agencyId') ?? ctx.agencyId
  const userId = searchParams.get('userId')
  const weekKey = searchParams.get('weekKey')
  const status = searchParams.get('status')

  const filter: Record<string, unknown> = { agencyId }
  if (userId) filter.userId = userId
  if (weekKey) filter.weekKey = weekKey
  if (status) filter.status = status

  const data = await Timesheet.find(filter).sort({ weekKey: -1, createdAt: -1 }).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const t = await Timesheet.create({
    ...body,
    agencyId: body.agencyId ?? ctx.agencyId,
    userId: body.userId ?? ctx.userId,
  })
  return ok(t, 201)
}
