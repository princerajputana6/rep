import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Resource } from '@/lib/models/Resource'
import { Project } from '@/lib/models/Project'
import { BorrowRequest } from '@/lib/models/BorrowRequest'
import { ResourceApproval } from '@/lib/models/ResourceApproval'
import { AuditLog } from '@/lib/models/AuditLog'
import { User } from '@/lib/models/User'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()

  const agencyFilter = ctx.agencyId ? { agencyId: ctx.agencyId } : {}

  const [
    totalResources,
    activeProjects,
    onHoldProjects,
    pendingBorrowRequests,
    pendingApprovals,
    totalUsers,
    recentProjects,
    recentActivity,
    resourcesByRole,
  ] = await Promise.all([
    Resource.countDocuments({ ...agencyFilter, active: true }),
    Project.countDocuments({ ...agencyFilter, status: 'ACTIVE' }),
    Project.countDocuments({ ...agencyFilter, status: 'ON_HOLD' }),
    BorrowRequest.countDocuments({ ...agencyFilter, status: 'PENDING' }),
    ResourceApproval.countDocuments({ ...agencyFilter, status: 'PENDING' }),
    User.countDocuments(agencyFilter),
    Project.find(agencyFilter)
      .populate('clientId', 'name')
      .populate('ownerId', 'name')
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean(),
    AuditLog.find(agencyFilter)
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Resource.aggregate([
      { $match: { ...agencyFilter, active: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
  ])

  const avgUtilization = totalResources > 0
    ? Math.min(Math.round((activeProjects / Math.max(totalResources, 1)) * 100 * 2.5), 100)
    : 0

  const atRiskProjects = (recentProjects as Array<{ riskLevel?: string }>).filter(
    (p) => p.riskLevel === 'high'
  ).length

  return ok({
    kpis: {
      totalResources,
      activeProjects,
      onHoldProjects,
      pendingBorrowRequests,
      pendingApprovals,
      totalUsers,
      avgUtilization,
      atRiskProjects,
    },
    recentProjects,
    recentActivity,
    resourcesByRole,
  })
}
