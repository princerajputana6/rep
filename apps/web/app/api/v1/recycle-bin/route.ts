import { NextRequest } from 'next/server'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

// Placeholder. No model has soft-delete yet, so this returns an empty list.
// When `deletedAt` fields are added to Project / Resource / Task / etc.,
// this route will start returning real trashed records.
export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  return ok([])
}
