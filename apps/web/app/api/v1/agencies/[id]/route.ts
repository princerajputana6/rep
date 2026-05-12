import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Agency } from '@/lib/models/Agency'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  const { id } = await params
  await connectDB()
  const agency = await Agency.findById(id).lean()
  if (!agency) return err('Agency not found', 'NOT_FOUND', 404)

  return ok(agency)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  const { id } = await params
  await connectDB()
  const body = await req.json()

  const agency = await Agency.findByIdAndUpdate(id, { $set: body }, { new: true }).lean()
  if (!agency) return err('Agency not found', 'NOT_FOUND', 404)

  return ok(agency)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (ctx.role !== 'SUPER_ADMIN') return err('Forbidden', 'FORBIDDEN', 403)

  const { id } = await params
  await connectDB()
  await Agency.findByIdAndUpdate(id, { status: 'INACTIVE' })
  return new Response(null, { status: 204 })
}
