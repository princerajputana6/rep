import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { BudgetAlert } from '@/lib/models/BudgetAlert'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const data = await BudgetAlert.find({ agencyId: ctx.agencyId }).sort({ createdAt: -1 }).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const a = await BudgetAlert.create({ ...body, agencyId: ctx.agencyId, createdBy: ctx.userId })
  return ok(a, 201)
}
