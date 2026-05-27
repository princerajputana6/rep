import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { Allocation } from '@/lib/models/Allocation'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

// Financial overview: budget vs allocated cost, top projects by burn,
// monthly trend (last 6 months).
export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const agencyFilter = { agencyId: ctx.agencyId }

  const [budgetAgg, projects] = await Promise.all([
    Project.aggregate([
      { $match: agencyFilter },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          totalAllocated: { $sum: '$allocated' },
          projectCount: { $sum: 1 },
        },
      },
    ]),
    Project.find(agencyFilter).select('name budget allocated budgetBurnPct status startDate endDate').sort({ budget: -1 }).limit(20).lean(),
  ])

  const totalBudget = budgetAgg[0]?.totalBudget ?? 0
  const totalAllocated = budgetAgg[0]?.totalAllocated ?? 0
  const grossMargin = totalBudget > 0 ? Math.round(((totalBudget - totalAllocated) / totalBudget) * 100) : 0

  // Monthly burn trend: aggregate allocations by createdAt month over the
  // last 6 months. allocatedHours is a stand-in for cost until real $ flows in.
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const trend = await Allocation.aggregate([
    { $match: { ...agencyFilter, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
        hours: { $sum: '$allocatedHours' },
      },
    },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ])

  return ok({
    summary: {
      totalBudget, totalAllocated, totalRemaining: Math.max(totalBudget - totalAllocated, 0),
      grossMarginPct: grossMargin, projectCount: budgetAgg[0]?.projectCount ?? 0,
    },
    topProjects: projects.map((p) => ({
      id: String(p._id),
      name: p.name,
      budget: p.budget ?? 0,
      allocated: p.allocated ?? 0,
      burnPct: p.budgetBurnPct ?? 0,
      status: p.status,
      startDate: p.startDate ?? null,
      endDate: p.endDate ?? null,
    })),
    monthlyTrend: trend.map((t: { _id: { y: number; m: number }; hours: number }) => ({
      label: `${t._id.y}-${String(t._id.m).padStart(2, '0')}`,
      value: t.hours,
    })),
  })
}
