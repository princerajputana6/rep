import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  await connectDB()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '25')

  const filter: Record<string, unknown> = { agencyId: ctx.agencyId }
  const search = searchParams.get('search')
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ]

  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ])

  return ok({ data, total, page, perPage: limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  await connectDB()
  const body = await req.json()

  const existing = await User.findOne({ email: body.email })
  if (existing) return err('User with this email already exists', 'CONFLICT', 409)

  const user = await User.create({
    clerkId: body.clerkId ?? `manual_${Date.now()}`,
    email: body.email,
    name: body.name,
    role: body.role ?? 'VIEWER',
    agencyId: ctx.agencyId,
    status: 'active',
  })

  return ok(user, 201)
}
