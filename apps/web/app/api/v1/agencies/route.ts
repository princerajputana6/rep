import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Agency } from '@/lib/models/Agency'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  await connectDB()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '25')
  const status = searchParams.get('status')
  const search = searchParams.get('search')

  const filter: Record<string, unknown> = {}
  if (ctx.role !== 'SUPER_ADMIN') filter._id = ctx.agencyId
  if (status) filter.status = status
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { ownerEmail: { $regex: search, $options: 'i' } },
  ]

  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    Agency.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Agency.countDocuments(filter),
  ])

  return ok(data, 200)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  if (ctx.role !== 'SUPER_ADMIN') return err('Forbidden', 'FORBIDDEN', 403)

  await connectDB()
  const body = await req.json()

  const existing = await Agency.findOne({ ownerEmail: body.ownerEmail })
  if (existing) return err('Agency with this email already exists', 'CONFLICT', 409)

  const agency = await Agency.create({
    name: body.name,
    owner: body.owner,
    ownerEmail: body.ownerEmail,
    participationLevel: body.participationLevel ?? 'full',
    status: 'ACTIVE',
  })

  return ok(agency, 201)
}
