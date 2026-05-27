import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Notification } from '@/lib/models/Notification'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

// PATCH is mainly used to toggle the `read` flag.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const n = await Notification.findOneAndUpdate(
    { _id: id, agencyId: ctx.agencyId }, { $set: body }, { new: true }
  ).lean()
  if (!n) return err('Notification not found', 'NOT_FOUND', 404)
  return ok(n)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await Notification.findOneAndDelete({ _id: id, agencyId: ctx.agencyId })
  return new Response(null, { status: 204 })
}
