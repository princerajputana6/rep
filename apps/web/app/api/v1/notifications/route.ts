import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Notification } from '@/lib/models/Notification'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const unreadOnly = searchParams.get('unread') === '1'
  const filter: Record<string, unknown> = {
    agencyId: ctx.agencyId,
    $or: [{ userId: ctx.userId }, { userId: { $exists: false } }, { userId: null }],
  }
  if (unreadOnly) filter.read = false
  const data = await Notification.find(filter).sort({ createdAt: -1 }).limit(200).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const n = await Notification.create({ ...body, agencyId: ctx.agencyId })
  return ok(n, 201)
}
