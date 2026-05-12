import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ResourceApproval } from '@/lib/models/ResourceApproval'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const approval = await ResourceApproval.findOneAndUpdate(
    { _id: id, agencyId: ctx.agencyId, status: 'PENDING' },
    { status: 'REJECTED', rejectionReason: body.reason },
    { new: true }
  ).lean()
  if (!approval) return err('Approval not found or not pending', 'NOT_FOUND', 404)
  return ok(approval)
}
