import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { CustomForm } from '@/lib/models/CustomForm'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const f = await CustomForm.findOneAndUpdate({ _id: id, agencyId: ctx.agencyId }, { $set: body }, { new: true }).lean()
  if (!f) return err('Form not found', 'NOT_FOUND', 404)
  return ok(f)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await CustomForm.findOneAndDelete({ _id: id, agencyId: ctx.agencyId })
  return new Response(null, { status: 204 })
}
