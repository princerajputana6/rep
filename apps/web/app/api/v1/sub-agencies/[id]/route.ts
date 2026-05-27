import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { SubAgency } from '@/lib/models/SubAgency'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const sub = await SubAgency.findById(id).lean()
  if (!sub) return err('Sub-agency not found', 'NOT_FOUND', 404)
  return ok(sub)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const sub = await SubAgency.findByIdAndUpdate(id, { $set: body }, { new: true }).lean()
  if (!sub) return err('Sub-agency not found', 'NOT_FOUND', 404)
  return ok(sub)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await SubAgency.findByIdAndDelete(id)
  return new Response(null, { status: 204 })
}
