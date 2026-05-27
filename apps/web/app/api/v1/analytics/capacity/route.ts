import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Resource } from '@/lib/models/Resource'
import { Allocation } from '@/lib/models/Allocation'
import { Project } from '@/lib/models/Project'
import { ok, requireAuth, isNextResponse } from '@/lib/api-helpers'

// Capacity analytics: how loaded each resource / role / project is.
// Utilization % is allocated-hours-per-week ÷ 40, capped at 100.
export async function GET(_req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  await connectDB()

  const agencyFilter = { agencyId: ctx.agencyId }

  const [totalResources, activeResources, totalAllocations, allocsByRole, allocsByProject] = await Promise.all([
    Resource.countDocuments(agencyFilter),
    Resource.countDocuments({ ...agencyFilter, active: true }),
    Allocation.countDocuments({ ...agencyFilter, status: 'ACTIVE' }),
    Allocation.aggregate([
      { $match: { ...agencyFilter, status: 'ACTIVE' } },
      { $lookup: { from: 'resources', localField: 'resourceId', foreignField: '_id', as: 'r' } },
      { $unwind: { path: '$r', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$r.role', allocatedHours: { $sum: '$allocatedHours' }, count: { $sum: 1 } } },
      { $sort: { allocatedHours: -1 } },
      { $limit: 12 },
    ]),
    Allocation.aggregate([
      { $match: { ...agencyFilter, status: 'ACTIVE' } },
      { $group: { _id: '$projectId', allocatedHours: { $sum: '$allocatedHours' }, resources: { $sum: 1 } } },
      { $sort: { allocatedHours: -1 } },
      { $limit: 10 },
    ]),
  ])

  // Resolve project names for the by-project breakdown.
  const projectIds = allocsByProject.map((p: { _id: unknown }) => p._id).filter(Boolean)
  const projects = await Project.find({ _id: { $in: projectIds } }).select('name').lean()
  const projectName = new Map(projects.map((p) => [String(p._id), p.name]))

  const totalAllocatedHours = allocsByRole.reduce((s: number, r: { allocatedHours: number }) => s + r.allocatedHours, 0)
  const benchPct = activeResources > 0
    ? Math.max(0, Math.round((1 - totalAllocations / Math.max(activeResources, 1)) * 100))
    : 0
  const avgUtilization = activeResources > 0
    ? Math.min(100, Math.round((totalAllocatedHours / Math.max(activeResources * 40, 1)) * 100))
    : 0

  return ok({
    summary: { totalResources, activeResources, totalAllocations, totalAllocatedHours, avgUtilization, benchPct },
    byRole: allocsByRole.map((r: { _id: string | null; allocatedHours: number; count: number }) => ({
      role: r._id ?? '—', allocatedHours: r.allocatedHours, resourceCount: r.count,
    })),
    byProject: allocsByProject.map((p: { _id: unknown; allocatedHours: number; resources: number }) => ({
      projectId: String(p._id ?? ''),
      projectName: projectName.get(String(p._id)) ?? '—',
      allocatedHours: p.allocatedHours, resourceCount: p.resources,
    })),
  })
}
