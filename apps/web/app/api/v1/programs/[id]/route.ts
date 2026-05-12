import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Program } from '@/lib/models/Program'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const program = await Program.findOne({ _id: id, agencyId: ctx.agencyId }).lean()
  if (!program) return err('Program not found', 'NOT_FOUND', 404)
  return ok(program)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const program = await Program.findOneAndUpdate({ _id: id, agencyId: ctx.agencyId }, { $set: body }, { new: true }).lean()
  if (!program) return err('Program not found', 'NOT_FOUND', 404)
  return ok(program)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await Program.findOneAndDelete({ _id: id, agencyId: ctx.agencyId })
  return new Response(null, { status: 204 })
}
