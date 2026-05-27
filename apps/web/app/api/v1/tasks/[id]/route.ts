import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Task } from '@/lib/models/Task'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const task = await Task.findById(id).lean()
  if (!task) return err('Task not found', 'NOT_FOUND', 404)
  return ok(task)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json()
  const task = await Task.findByIdAndUpdate(id, { $set: body }, { new: true }).lean()
  if (!task) return err('Task not found', 'NOT_FOUND', 404)
  return ok(task)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  await Task.findByIdAndDelete(id)
  return new Response(null, { status: 204 })
}
