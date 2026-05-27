import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Task } from '@/lib/models/Task'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const { searchParams } = new URL(req.url)
  const agencyId = searchParams.get('agencyId') ?? ctx.agencyId
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')

  const filter: Record<string, unknown> = { agencyId }
  if (projectId) filter.projectId = projectId
  if (status) filter.status = status

  const data = await Task.find(filter).sort({ createdAt: -1 }).limit(500).lean()
  return ok(data)
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json()
  const task = await Task.create({ ...body, agencyId: body.agencyId ?? ctx.agencyId })
  return ok(task, 201)
}
