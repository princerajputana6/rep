import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const status = searchParams.get('status')
  const filter: Record<string, unknown> = { agencyId: ctx.agencyId }
  if (status) filter.status = status
  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Project.countDocuments(filter),
  ])
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const project = await Project.create({ ...body, agencyId: ctx.agencyId })
  return ok(project, 201)
}
