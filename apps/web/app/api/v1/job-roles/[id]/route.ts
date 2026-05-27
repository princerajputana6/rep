import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { JobRole } from '@/lib/models/JobRole'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const role = await JobRole.findById(id).lean()
  if (!role) return err('Job role not found', 'NOT_FOUND', 404)
  return ok(role)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const role = await JobRole.findByIdAndUpdate(id, { $set: body }, { new: true }).lean()
  if (!role) return err('Job role not found', 'NOT_FOUND', 404)
  return ok(role)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await JobRole.findByIdAndDelete(id)
  return new Response(null, { status: 204 })
}
