import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Portfolio } from '@/lib/models/Portfolio'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const portfolio = await Portfolio.findOne({ _id: id, agencyId: ctx.agencyId }).lean()
  if (!portfolio) return err('Portfolio not found', 'NOT_FOUND', 404)
  return ok(portfolio)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const portfolio = await Portfolio.findOneAndUpdate({ _id: id, agencyId: ctx.agencyId }, { $set: body }, { new: true }).lean()
  if (!portfolio) return err('Portfolio not found', 'NOT_FOUND', 404)
  return ok(portfolio)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await Portfolio.findOneAndDelete({ _id: id, agencyId: ctx.agencyId })
  return new Response(null, { status: 204 })
}
