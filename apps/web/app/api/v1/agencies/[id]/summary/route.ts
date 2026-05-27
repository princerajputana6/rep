import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Agency } from '@/lib/models/Agency'
import { User } from '@/lib/models/User'
import { Portfolio } from '@/lib/models/Portfolio'
import { Project } from '@/lib/models/Project'
import { Task } from '@/lib/models/Task'
import { JobRole } from '@/lib/models/JobRole'
import { RateCard } from '@/lib/models/RateCard'
import { Client } from '@/lib/models/Client'
import { Resource } from '@/lib/models/Resource'
import { SubAgency } from '@/lib/models/SubAgency'
import { TieUp } from '@/lib/models/TieUp'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

// Returns the counts shown in each accordion header, in one DB roundtrip.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const agency = await Agency.findById(id).lean()
  if (!agency) return err('Agency not found', 'NOT_FOUND', 404)

  const [users, portfolios, projects, tasks, jobRoles, rateCards, clients, resources, subAgencies, tieUps] =
    await Promise.all([
      User.countDocuments({ agencyId: id }),
      Portfolio.countDocuments({ agencyId: id }),
      Project.countDocuments({ agencyId: id }),
      Task.countDocuments({ agencyId: id }),
      JobRole.countDocuments({ agencyId: id }),
      RateCard.countDocuments({ agencyId: id }),
      Client.countDocuments({ agencyId: id }),
      Resource.countDocuments({ agencyId: id }),
      SubAgency.countDocuments({ parentAgencyId: id }),
      TieUp.countDocuments({ $or: [{ fromAgencyId: id }, { toAgencyId: id }] }),
    ])

  return ok({
    agency,
    counts: {
      users, portfolios, projects, tasks, jobRoles, rateCards,
      clients, resources, subAgencies, tieUps,
    },
  })
}
