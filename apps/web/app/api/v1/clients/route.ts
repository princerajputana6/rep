import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Client } from '@/lib/models/Client'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const filter: Record<string, unknown> = { agencyId: ctx.agencyId }
  const search = searchParams.get('search')
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }]
  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    Client.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Client.countDocuments(filter),
  ])
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const client = await Client.create({ ...body, agencyId: ctx.agencyId })
  return ok(client, 201)
}
