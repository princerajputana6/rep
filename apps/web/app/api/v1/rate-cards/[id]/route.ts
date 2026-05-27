import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { RateCard } from '@/lib/models/RateCard'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const rc = await RateCard.findById(id).lean()
  if (!rc) return err('Rate card not found', 'NOT_FOUND', 404)
  return ok(rc)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const rc = await RateCard.findByIdAndUpdate(id, { $set: body }, { new: true }).lean()
  if (!rc) return err('Rate card not found', 'NOT_FOUND', 404)
  return ok(rc)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await RateCard.findByIdAndDelete(id)
  return new Response(null, { status: 204 })
}
