import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  const { id } = await params
  await connectDB()
  const user = await User.findOne({ _id: id, agencyId: ctx.agencyId }).lean()
  if (!user) return err('User not found', 'NOT_FOUND', 404)

  return ok(user)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  const { id } = await params
  await connectDB()
  const body = await req.json()

  const user = await User.findOneAndUpdate(
    { _id: id, agencyId: ctx.agencyId },
    { $set: body },
    { new: true }
  ).lean()
  if (!user) return err('User not found', 'NOT_FOUND', 404)

  return ok(user)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  const { id } = await params
  await connectDB()
  await User.findOneAndUpdate({ _id: id, agencyId: ctx.agencyId }, { status: 'inactive' })
  return new Response(null, { status: 204 })
}
