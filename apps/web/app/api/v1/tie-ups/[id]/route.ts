import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { TieUp } from '@/lib/models/TieUp'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const tu = await TieUp.findById(id).lean()
  if (!tu) return err('Tie-up not found', 'NOT_FOUND', 404)
  return ok(tu)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const tu = await TieUp.findByIdAndUpdate(id, { $set: body }, { new: true }).lean()
  if (!tu) return err('Tie-up not found', 'NOT_FOUND', 404)
  return ok(tu)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await TieUp.findByIdAndDelete(id)
  return new Response(null, { status: 204 })
}
