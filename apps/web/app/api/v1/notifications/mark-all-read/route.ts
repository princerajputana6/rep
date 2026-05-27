import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Notification } from '@/lib/models/Notification'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function POST(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const r = await Notification.updateMany(
    {
      agencyId: ctx.agencyId,
      $or: [{ userId: ctx.userId }, { userId: { $exists: false } }, { userId: null }],
      read: false,
    },
    { $set: { read: true } }
  )
  return ok({ modifiedCount: r.modifiedCount })
}
