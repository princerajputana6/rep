import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { StaffingPlan } from '@/lib/models/StaffingPlan'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const plan = await StaffingPlan.findOne({ _id: id, agencyId: ctx.agencyId }).lean()
  if (!plan) return err('Staffing plan not found', 'NOT_FOUND', 404)
  return ok(plan)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const plan = await StaffingPlan.findOneAndUpdate({ _id: id, agencyId: ctx.agencyId }, { $set: body }, { new: true }).lean()
  if (!plan) return err('Staffing plan not found', 'NOT_FOUND', 404)
  return ok(plan)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await StaffingPlan.findOneAndDelete({ _id: id, agencyId: ctx.agencyId })
  return new Response(null, { status: 204 })
}
