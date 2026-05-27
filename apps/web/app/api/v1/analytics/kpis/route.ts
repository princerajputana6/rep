import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Project } from '@/lib/models/Project'
import { Resource } from '@/lib/models/Resource'
import { Allocation } from '@/lib/models/Allocation'
import { BorrowRequest } from '@/lib/models/BorrowRequest'
import { ResourceApproval } from '@/lib/models/ResourceApproval'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

// Flat KPI list for the KPIDetails + TimePhasedKPI pages.
// Each KPI has a current value, a target, and a recent trend (last 8 weeks).
export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const agencyFilter = { agencyId: ctx.agencyId }

  const [
    activeProjects, completedProjects, totalResources, activeAllocations,
    pendingBorrows, pendingApprovals, budgetAgg,
  ] = await Promise.all([
    Project.countDocuments({ ...agencyFilter, status: 'ACTIVE' }),
    Project.countDocuments({ ...agencyFilter, status: 'COMPLETED' }),
    Resource.countDocuments({ ...agencyFilter, active: true }),
    Allocation.countDocuments({ ...agencyFilter, status: 'ACTIVE' }),
    BorrowRequest.countDocuments({ ...agencyFilter, status: 'PENDING' }),
    ResourceApproval.countDocuments({ ...agencyFilter, status: 'PENDING' }),
    Project.aggregate([
      { $match: agencyFilter },
      { $group: { _id: null, budget: { $sum: '$budget' }, allocated: { $sum: '$allocated' } } },
    ]),
  ])

  const totalBudget = budgetAgg[0]?.budget ?? 0
  const totalAllocated = budgetAgg[0]?.allocated ?? 0
  const burnPct = totalBudget > 0 ? Math.round((totalAllocated / totalBudget) * 100) : 0

  // 8-week trend buckets — empty until per-week aggregation is wired.
  const emptyTrend = Array.from({ length: 8 }, (_, i) => ({
    weekOffset: i - 7, value: 0,
  }))

  const kpis = [
    { id: 'active-projects', label: 'Active Projects', value: activeProjects, target: null, trend: emptyTrend, format: 'number' },
    { id: 'completed-projects', label: 'Completed Projects', value: completedProjects, target: null, trend: emptyTrend, format: 'number' },
    { id: 'resource-count', label: 'Active Resources', value: totalResources, target: null, trend: emptyTrend, format: 'number' },
    { id: 'active-allocations', label: 'Active Allocations', value: activeAllocations, target: null, trend: emptyTrend, format: 'number' },
    { id: 'pending-borrows', label: 'Pending Borrow Requests', value: pendingBorrows, target: 5, trend: emptyTrend, format: 'number' },
    { id: 'pending-approvals', label: 'Pending Approvals', value: pendingApprovals, target: 3, trend: emptyTrend, format: 'number' },
    { id: 'total-budget', label: 'Total Budget', value: totalBudget, target: null, trend: emptyTrend, format: 'currency' },
    { id: 'budget-burn', label: 'Budget Burn', value: burnPct, target: 80, trend: emptyTrend, format: 'percent' },
  ]

  return ok({ kpis })
}
