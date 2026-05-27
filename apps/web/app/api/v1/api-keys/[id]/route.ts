import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ApiKey } from '@/lib/models/ApiKey'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  // Allow toggling active/name/scopes but never change the hashed key.
  const patch: Record<string, unknown> = {}
  if (typeof body.name === 'string') patch.name = body.name
  if (typeof body.active === 'boolean') patch.active = body.active
  if (Array.isArray(body.scopes)) patch.scopes = body.scopes
  const k = await ApiKey.findOneAndUpdate({ _id: id, agencyId: ctx.agencyId }, { $set: patch }, { new: true }).select('-hashedKey').lean()
  if (!k) return err('API key not found', 'NOT_FOUND', 404)
  return ok(k)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await ApiKey.findOneAndDelete({ _id: id, agencyId: ctx.agencyId })
  return new Response(null, { status: 204 })
}
