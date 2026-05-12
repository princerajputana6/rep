import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Integration } from '@/lib/models/Integration'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const integrations = await Integration.find({ agencyId: ctx.agencyId }).lean()
  return ok(integrations)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const integration = await Integration.findOneAndUpdate(
    { agencyId: ctx.agencyId, type: body.type },
    { $set: { ...body, agencyId: ctx.agencyId } },
    { upsert: true, new: true }
  ).lean()
  return ok(integration, 201)
}
