import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { License } from '@/lib/models/License'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'
import { PLAN_DEFAULTS, PLAN_TIERS, SANDBOX_ALLOWANCE } from '@/lib/modules'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (ctx.role !== 'SUPER_ADMIN') return err('Forbidden', 'FORBIDDEN', 403)
  const { id } = await params
  await connectDB()
  const body = await req.json()

  const patch: Record<string, unknown> = { updatedBy: ctx.userId }
  if (body.tier && PLAN_TIERS.includes(body.tier)) {
    patch.tier = body.tier
    // If caller didn't pass an explicit module list with the plan change,
    // reset enabledModules to that plan's defaults.
    if (!Array.isArray(body.enabledModules)) patch.enabledModules = PLAN_DEFAULTS[body.tier]
    if (body.sandboxLimit === undefined) patch.sandboxLimit = SANDBOX_ALLOWANCE[body.tier as keyof typeof SANDBOX_ALLOWANCE]
  }
  if (Array.isArray(body.enabledModules)) patch.enabledModules = body.enabledModules
  if (body.status) patch.status = body.status
  if (body.maxUsers !== undefined) patch.maxUsers = body.maxUsers
  if (body.maxAgencies !== undefined) patch.maxAgencies = body.maxAgencies
  if (body.sandboxLimit !== undefined) patch.sandboxLimit = body.sandboxLimit
  if (body.seats !== undefined) patch.seats = body.seats
  if (body.validTo !== undefined) patch.validTo = body.validTo ? new Date(body.validTo) : null
  if (body.notes !== undefined) patch.notes = body.notes

  const license = await License.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean()
  if (!license) return err('License not found', 'NOT_FOUND', 404)
  return ok(license)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (ctx.role !== 'SUPER_ADMIN') return err('Forbidden', 'FORBIDDEN', 403)
  const { id } = await params
  await connectDB()
  await License.findByIdAndDelete(id)
  return new Response(null, { status: 204 })
}
