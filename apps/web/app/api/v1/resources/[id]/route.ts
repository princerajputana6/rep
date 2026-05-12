import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Resource } from '@/lib/models/Resource'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const resource = await Resource.findOne({ _id: id, agencyId: ctx.agencyId }).lean()
  if (!resource) return err('Resource not found', 'NOT_FOUND', 404)
  return ok(resource)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const resource = await Resource.findOneAndUpdate(
    { _id: id, agencyId: ctx.agencyId }, { $set: body }, { new: true }
  ).lean()
  if (!resource) return err('Resource not found', 'NOT_FOUND', 404)
  return ok(resource)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await Resource.findOneAndUpdate({ _id: id, agencyId: ctx.agencyId }, { active: false })
  return new Response(null, { status: 204 })
}
