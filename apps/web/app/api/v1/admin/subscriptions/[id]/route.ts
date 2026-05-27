import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Subscription } from '@/lib/models/Subscription'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'
import { PLAN_DEFAULTS } from '@/lib/modules'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (ctx.role !== 'SUPER_ADMIN') return err('Forbidden', 'FORBIDDEN', 403)
  const { id } = await params
  await connectDB()
  const body = await req.json()

  const patch: Record<string, unknown> = { updatedBy: ctx.userId }
  if (body.plan && PLAN_DEFAULTS[body.plan as string]) {
    patch.plan = body.plan
    // If caller didn't pass an explicit module list with the plan change,
    // reset enabledModules to that plan's defaults.
    if (!Array.isArray(body.enabledModules)) patch.enabledModules = PLAN_DEFAULTS[body.plan]
  }
  if (Array.isArray(body.enabledModules)) patch.enabledModules = body.enabledModules
  if (body.status) patch.status = body.status
  if (body.maxUsers !== undefined) patch.maxUsers = body.maxUsers
  if (body.maxProjects !== undefined) patch.maxProjects = body.maxProjects
  if (body.trialEndsAt !== undefined) patch.trialEndsAt = body.trialEndsAt ? new Date(body.trialEndsAt) : null
  if (body.currentPeriodEnd !== undefined) patch.currentPeriodEnd = body.currentPeriodEnd ? new Date(body.currentPeriodEnd) : null
  if (body.notes !== undefined) patch.notes = body.notes

  const sub = await Subscription.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean()
  if (!sub) return err('Subscription not found', 'NOT_FOUND', 404)
  return ok(sub)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (ctx.role !== 'SUPER_ADMIN') return err('Forbidden', 'FORBIDDEN', 403)
  const { id } = await params
  await connectDB()
  await Subscription.findByIdAndDelete(id)
  return new Response(null, { status: 204 })
}
