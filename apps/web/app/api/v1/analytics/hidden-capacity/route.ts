import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Resource } from '@/lib/models/Resource'
import { Allocation } from '@/lib/models/Allocation'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

// Hidden / unused capacity. A resource is "underutilized" if their summed
// allocatedHours is below 32h/week (i.e. <80% of a 40h baseline).
export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const agencyFilter = { agencyId: ctx.agencyId }

  const [resources, allocsByResource] = await Promise.all([
    Resource.find({ ...agencyFilter, active: true }).select('name role').lean(),
    Allocation.aggregate([
      { $match: { ...agencyFilter, status: 'ACTIVE' } },
      { $group: { _id: '$resourceId', allocatedHours: { $sum: '$allocatedHours' } } },
    ]),
  ])

  const hoursByResource = new Map<string, number>()
  for (const a of allocsByResource) {
    if (a._id) hoursByResource.set(String(a._id), a.allocatedHours)
  }

  const BASELINE = 40
  const THRESHOLD = 32
  const items = resources.map((r) => {
    const allocated = hoursByResource.get(String(r._id)) ?? 0
    const idleHours = Math.max(BASELINE - allocated, 0)
    return {
      id: String(r._id),
      name: r.name,
      role: r.role,
      allocatedHours: allocated,
      idleHours,
      utilizationPct: Math.min(100, Math.round((allocated / BASELINE) * 100)),
    }
  })

  const underutilized = items.filter((i) => i.allocatedHours < THRESHOLD)
  const totalIdleHours = items.reduce((s, i) => s + i.idleHours, 0)

  // Role-level rollup for chart consumption.
  const byRole = new Map<string, { idleHours: number; count: number }>()
  for (const i of items) {
    const k = i.role ?? '—'
    const cur = byRole.get(k) ?? { idleHours: 0, count: 0 }
    cur.idleHours += i.idleHours; cur.count += 1
    byRole.set(k, cur)
  }

  return ok({
    summary: {
      totalResources: items.length,
      underutilizedCount: underutilized.length,
      totalIdleHours,
      avgUtilizationPct: items.length
        ? Math.round(items.reduce((s, i) => s + i.utilizationPct, 0) / items.length)
        : 0,
    },
    underutilized: underutilized.sort((a, b) => b.idleHours - a.idleHours).slice(0, 50),
    byRole: Array.from(byRole.entries()).map(([role, v]) => ({ role, ...v })),
  })
}
