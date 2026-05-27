import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Allocation } from '@/lib/models/Allocation'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const a = await Allocation.findById(id).lean()
  if (!a) return err('Allocation not found', 'NOT_FOUND', 404)
  return ok(a)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const a = await Allocation.findByIdAndUpdate(id, { $set: body }, { new: true }).lean()
  if (!a) return err('Allocation not found', 'NOT_FOUND', 404)
  return ok(a)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await Allocation.findByIdAndDelete(id)
  return new Response(null, { status: 204 })
}
