import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { TieUp } from '@/lib/models/TieUp'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const agencyId = searchParams.get('agencyId')
  const status = searchParams.get('status')
  const filter: Record<string, unknown> = {}
  if (agencyId) {
    filter.$or = [{ fromAgencyId: agencyId }, { toAgencyId: agencyId }]
  } else if (ctx.role !== 'SUPER_ADMIN') {
    filter.$or = [{ fromAgencyId: ctx.agencyId }, { toAgencyId: ctx.agencyId }]
  }
  if (status) filter.status = status
  const data = await TieUp.find(filter).sort({ createdAt: -1 }).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  if (!body.code || !body.fromAgencyId || !body.toAgencyId) {
    return err('code, fromAgencyId, toAgencyId are required', 'VALIDATION', 400)
  }
  const existing = await TieUp.findOne({ code: body.code })
  if (existing) return err('Tie-up with this code already exists', 'CONFLICT', 409)
  const tu = await TieUp.create(body)
  return ok(tu, 201)
}
