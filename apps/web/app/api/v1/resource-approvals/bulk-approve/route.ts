import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ResourceApproval } from '@/lib/models/ResourceApproval'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const ids: string[] = body.ids ?? []
  await ResourceApproval.updateMany(
    { _id: { $in: ids }, agencyId: ctx.agencyId, status: 'PENDING' },
    { status: 'APPROVED', approvedBy: ctx.userId, approvedAt: new Date() }
  )
  return ok({ approved: ids.length })
}
