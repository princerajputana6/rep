import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { AuditLog } from '@/lib/models/AuditLog'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? '200'), 500)
  const action = searchParams.get('action')
  const filter: Record<string, unknown> = { agencyId: ctx.agencyId }
  if (action) filter.action = action
  const data = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit).lean()
  return ok(data)
}
