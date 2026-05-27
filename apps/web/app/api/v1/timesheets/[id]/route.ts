import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Timesheet } from '@/lib/models/Timesheet'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const t = await Timesheet.findById(id).lean()
  if (!t) return err('Timesheet not found', 'NOT_FOUND', 404)
  return ok(t)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const t = await Timesheet.findByIdAndUpdate(id, { $set: body }, { new: true }).lean()
  if (!t) return err('Timesheet not found', 'NOT_FOUND', 404)
  return ok(t)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await Timesheet.findByIdAndDelete(id)
  return new Response(null, { status: 204 })
}
