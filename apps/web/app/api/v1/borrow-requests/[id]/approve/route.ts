import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { BorrowRequest } from '@/lib/models/BorrowRequest'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const br = await BorrowRequest.findOneAndUpdate(
    { _id: id, agencyId: ctx.agencyId, status: 'PENDING' },
    { status: 'APPROVED' },
    { new: true }
  ).lean()
  if (!br) return err('Borrow request not found or not pending', 'NOT_FOUND', 404)
  return ok(br)
}
