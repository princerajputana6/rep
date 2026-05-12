import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { BorrowRequest } from '@/lib/models/BorrowRequest'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const filter: Record<string, unknown> = { agencyId: ctx.agencyId }
  if (status) filter.status = status
  const data = await BorrowRequest.find(filter).sort({ createdAt: -1 }).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const slaDeadline = new Date(body.startDate ?? Date.now())
  slaDeadline.setDate(slaDeadline.getDate() + 3)
  const br = await BorrowRequest.create({
    ...body,
    agencyId: ctx.agencyId,
    createdBy: ctx.userId,
    status: 'PENDING',
    slaDeadline,
  })
  return ok(br, 201)
}
