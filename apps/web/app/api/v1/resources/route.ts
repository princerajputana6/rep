import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Resource } from '@/lib/models/Resource'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  await connectDB()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const search = searchParams.get('search')
  const active = searchParams.get('active')

  const filter: Record<string, unknown> = { agencyId: ctx.agencyId }
  if (active !== null) filter.active = active !== 'false'
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { role: { $regex: search, $options: 'i' } },
  ]

  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    Resource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Resource.countDocuments(filter),
  ])

  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  await connectDB()
  const body = await req.json()

  const existing = await Resource.findOne({ email: body.email })
  if (existing) return err('Resource with this email already exists', 'CONFLICT', 409)

  const resource = await Resource.create({ ...body, agencyId: ctx.agencyId })
  return ok(resource, 201)
}
