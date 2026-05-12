import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Skill } from '@/lib/models/Skill'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '100')
  const filter: Record<string, unknown> = { agencyId: ctx.agencyId }
  const search = searchParams.get('search')
  if (search) filter.name = { $regex: search, $options: 'i' }
  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    Skill.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Skill.countDocuments(filter),
  ])
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const skill = await Skill.create({ ...body, agencyId: ctx.agencyId })
  return ok(skill, 201)
}
