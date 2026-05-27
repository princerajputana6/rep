import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ResourcePool } from '@/lib/models/ResourcePool'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const p = await ResourcePool.findOneAndUpdate(
    { _id: id, agencyId: ctx.agencyId }, { $set: body }, { new: true }
  ).lean()
  if (!p) return err('Pool not found', 'NOT_FOUND', 404)
  return ok(p)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await ResourcePool.findOneAndDelete({ _id: id, agencyId: ctx.agencyId })
  return new Response(null, { status: 204 })
}
