import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ResourceApproval } from '@/lib/models/ResourceApproval'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const filter: Record<string, unknown> = { agencyId: ctx.agencyId }
  if (status) filter.status = status
  const data = await ResourceApproval.find(filter).sort({ createdAt: -1 }).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const slaDeadline = new Date()
  slaDeadline.setDate(slaDeadline.getDate() + 3)
  const approval = await ResourceApproval.create({
    ...body,
    agencyId: ctx.agencyId,
    requestedBy: ctx.userId,
    status: 'PENDING',
    slaDeadline,
  })
  return ok(approval, 201)
}
