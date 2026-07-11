import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'
import { Agency } from '@/lib/models/Agency'
import { Environment } from '@/lib/models/Environment'
import { Portfolio } from '@/lib/models/Portfolio'
import { Program } from '@/lib/models/Program'
import { Project } from '@/lib/models/Project'
import { requireRole, isNextResponse } from '@/lib/auth/session'

function cloneDoc<T extends Record<string, unknown>>(doc: T) {
  const { _id, id, createdAt, updatedAt, __v, ...rest } = doc
  void _id; void id; void createdAt; void updatedAt; void __v
  return rest
}

export async function POST(req: NextRequest) {
  const ctx = await requireRole('COMPANY_ADMIN')
  if (isNextResponse(ctx)) return ctx
  await connectDB()

  const body = await req.json().catch(() => ({}))
  const fromEnvironmentId = String(body.fromEnvironmentId ?? '').trim()
  const toEnvironmentId = String(body.toEnvironmentId ?? '').trim()

  const [fromEnv, toEnv] = await Promise.all([
    Environment.findOne({ _id: fromEnvironmentId, companyId: ctx.companyId, type: 'SANDBOX', status: 'ACTIVE' }).lean(),
    Environment.findOne({ _id: toEnvironmentId, companyId: ctx.companyId, type: 'PRODUCTION', status: 'ACTIVE' }).lean(),
  ])

  if (!fromEnv || !toEnv) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: 'Select an active sandbox and production environment.' } },
      { status: 400 }
    )
  }

  const sourceAgencies = await Agency.find({ companyId: ctx.companyId, environmentId: fromEnvironmentId }).lean()
  const agencyIdMap = new Map<string, string>()

  for (const sourceAgency of sourceAgencies) {
    const existing = await Agency.findOne({
      companyId: ctx.companyId,
      environmentId: toEnvironmentId,
      name: sourceAgency.name,
    }).lean()

    if (existing) {
      agencyIdMap.set(String(sourceAgency._id), String(existing._id))
      continue
    }

    const created = await Agency.create({
      ...cloneDoc(sourceAgency),
      companyId: ctx.companyId,
      environmentId: toEnvironmentId,
      createdBy: ctx.userId,
    })
    agencyIdMap.set(String(sourceAgency._id), String(created._id))
  }

  const sourceAgencyIds = [...agencyIdMap.keys()]
  const portfolioIdMap = new Map<string, string>()
  let portfolios = 0
  let programs = 0
  let projects = 0

  const sourcePortfolios = await Portfolio.find({ agencyId: { $in: sourceAgencyIds } }).lean()
  for (const portfolio of sourcePortfolios) {
    const targetAgencyId = agencyIdMap.get(String(portfolio.agencyId))
    if (!targetAgencyId) continue
    const created = await Portfolio.create({
      ...cloneDoc(portfolio),
      agencyId: targetAgencyId,
    })
    portfolioIdMap.set(String(portfolio._id), String(created._id))
    portfolios += 1
  }

  const sourcePrograms = await Program.find({ agencyId: { $in: sourceAgencyIds } }).lean()
  for (const program of sourcePrograms) {
    const targetAgencyId = agencyIdMap.get(String(program.agencyId))
    if (!targetAgencyId) continue
    await Program.create({
      ...cloneDoc(program),
      agencyId: targetAgencyId,
      portfolioId: program.portfolioId ? portfolioIdMap.get(String(program.portfolioId)) ?? program.portfolioId : undefined,
    })
    programs += 1
  }

  const sourceProjectAgencyIds = sourceAgencyIds
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id))
  const sourceProjects = await Project.find({ agencyId: { $in: sourceProjectAgencyIds } }).lean()
  for (const project of sourceProjects) {
    const targetAgencyId = agencyIdMap.get(String(project.agencyId))
    if (!targetAgencyId) continue
    await Project.create({
      ...cloneDoc(project),
      agencyId: new mongoose.Types.ObjectId(targetAgencyId),
    })
    projects += 1
  }

  return NextResponse.json({
    success: true,
    data: {
      agencies: agencyIdMap.size,
      portfolios,
      programs,
      projects,
    },
  })
}
