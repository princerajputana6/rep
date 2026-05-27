import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Client } from '@/lib/models/Client'
import { Project } from '@/lib/models/Project'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

// Per-client revenue / cost / margin breakdown.
export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()

  const clients = await Client.find({ agencyId: ctx.agencyId }).select('name industry revenue status').lean()

  const breakdowns = await Promise.all(
    clients.map(async (c) => {
      const projAgg = await Project.aggregate([
        { $match: { agencyId: ctx.agencyId, clientId: c._id } },
        {
          $group: {
            _id: null,
            budget: { $sum: '$budget' },
            allocated: { $sum: '$allocated' },
            count: { $sum: 1 },
          },
        },
      ])
      const stat = projAgg[0] ?? { budget: 0, allocated: 0, count: 0 }
      const revenue = c.revenue ?? stat.budget
      const cost = stat.allocated
      const margin = revenue > 0 ? Math.round(((revenue - cost) / revenue) * 100) : 0
      return {
        id: String(c._id),
        name: c.name,
        industry: c.industry ?? '—',
        status: c.status,
        revenue, cost,
        marginPct: margin,
        projectCount: stat.count,
      }
    })
  )

  return ok({
    clients: breakdowns.sort((a, b) => b.revenue - a.revenue),
    summary: {
      totalRevenue: breakdowns.reduce((s, c) => s + c.revenue, 0),
      totalCost: breakdowns.reduce((s, c) => s + c.cost, 0),
      avgMarginPct: breakdowns.length
        ? Math.round(breakdowns.reduce((s, c) => s + c.marginPct, 0) / breakdowns.length)
        : 0,
      clientCount: breakdowns.length,
    },
  })
}
