import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { AccessRule } from '@/lib/models/AccessRule'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const rules = await AccessRule.find({ agencyId: ctx.agencyId }).lean()
  return ok(rules)
}

export async function PUT(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (!['SUPER_ADMIN', 'ADMIN'].includes(ctx.role)) return err('Forbidden', 'FORBIDDEN', 403)
  await connectDB()
  const body = await req.json()
  const rules = Array.isArray(body) ? body : [body]
  const results = await Promise.all(
    rules.map((r) =>
      AccessRule.findOneAndUpdate(
        { agencyId: ctx.agencyId, roleCode: r.roleCode, objectCode: r.objectCode },
        { $set: { ...r, agencyId: ctx.agencyId, updatedBy: ctx.userId } },
        { upsert: true, new: true }
      ).lean()
    )
  )
  return ok(results)
}
