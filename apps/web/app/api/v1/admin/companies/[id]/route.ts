import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Agency } from '@/lib/models/Agency'
import { Company } from '@/lib/models/Company'
import { Environment } from '@/lib/models/Environment'
import { License } from '@/lib/models/License'
import { User } from '@/lib/models/User'
import { generateTempPassword, hashPassword, isNextResponse, requireRole } from '@/lib/auth/session'
import { MODULE_KEYS, PLAN_DEFAULTS, PLAN_TIERS, SANDBOX_ALLOWANCE, type PlanTier } from '@/lib/modules'
import { sendCompanyAdminWelcome } from '@/lib/email/mailer'

const COMPANY_STATUSES = ['ACTIVE', 'SUSPENDED'] as const
const LICENSE_STATUSES = ['TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED'] as const

async function loadCompanyBundle(id: string) {
  const [company, license, admin, agencies, users, environments] = await Promise.all([
    Company.findById(id).lean(),
    License.findOne({ companyId: id }).lean(),
    User.findOne({ companyId: id, role: 'COMPANY_ADMIN' }).select('-passwordHash').lean(),
    Agency.find({ companyId: id }).sort({ createdAt: -1 }).lean(),
    User.find({ companyId: id }).select('-passwordHash').sort({ createdAt: -1 }).lean(),
    Environment.find({ companyId: id }).sort({ type: 1, createdAt: -1 }).lean(),
  ])

  if (!company) return null

  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length
  const invitedUsers = users.filter((u) => u.status === 'INVITED').length
  const sandboxCount = environments.filter((e) => e.type === 'SANDBOX').length

  return {
    company,
    license,
    admin,
    agencies,
    users,
    environments,
    stats: {
      users: users.length,
      activeUsers,
      invitedUsers,
      agencies: agencies.length,
      environments: environments.length,
      sandboxes: sandboxCount,
      modules: license?.enabledModules?.length ?? 0,
    },
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireRole('SUPER_ADMIN')
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()

  const bundle = await loadCompanyBundle(id)
  if (!bundle) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: bundle })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireRole('SUPER_ADMIN')
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json().catch(() => ({}))

  const companyPatch: Record<string, unknown> = {}
  const licensePatch: Record<string, unknown> = {}
  const adminPatch: Record<string, unknown> = {}

  if (typeof body.company?.name === 'string' && body.company.name.trim()) companyPatch.name = body.company.name.trim()
  if (COMPANY_STATUSES.includes(body.company?.status)) companyPatch.status = body.company.status
  if (PLAN_TIERS.includes(body.company?.tier)) companyPatch.tier = body.company.tier
  if (typeof body.company?.adminName === 'string' && body.company.adminName.trim()) {
    companyPatch.adminName = body.company.adminName.trim()
    adminPatch.name = body.company.adminName.trim()
  }
  if (typeof body.company?.adminEmail === 'string') {
    const email = body.company.adminEmail.toLowerCase().trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'A valid admin email is required' } }, { status: 400 })
    }
    const conflict = await User.findOne({ email, companyId: { $ne: id } }).lean()
    const companyConflict = await Company.findOne({ adminEmail: email, _id: { $ne: id } }).lean()
    if (conflict || companyConflict) {
      return NextResponse.json({ success: false, error: { code: 'CONFLICT', message: 'This admin email is already in use' } }, { status: 409 })
    }
    companyPatch.adminEmail = email
    adminPatch.email = email
  }

  const tier: PlanTier | undefined = PLAN_TIERS.includes(body.license?.tier) ? body.license.tier : undefined
  if (tier) {
    licensePatch.tier = tier
    companyPatch.tier = tier
    if (!Array.isArray(body.license?.enabledModules)) licensePatch.enabledModules = PLAN_DEFAULTS[tier]
    if (body.license?.sandboxLimit === undefined) licensePatch.sandboxLimit = SANDBOX_ALLOWANCE[tier]
  }
  if (LICENSE_STATUSES.includes(body.license?.status)) licensePatch.status = body.license.status
  if (Array.isArray(body.license?.enabledModules)) {
    licensePatch.enabledModules = body.license.enabledModules.filter((m: string) => MODULE_KEYS.includes(m as never))
  }
  for (const key of ['maxUsers', 'maxAgencies', 'seats', 'sandboxLimit'] as const) {
    if (body.license?.[key] !== undefined) {
      const value = body.license[key]
      licensePatch[key] = value === '' || value === null ? null : Number(value)
    }
  }
  if (body.license?.validTo !== undefined) licensePatch.validTo = body.license.validTo ? new Date(body.license.validTo) : null
  if (body.license?.notes !== undefined) licensePatch.notes = String(body.license.notes ?? '')

  const existing = await Company.findById(id).lean()
  if (!existing) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } }, { status: 404 })
  }

  await Promise.all([
    Object.keys(companyPatch).length ? Company.findByIdAndUpdate(id, { $set: companyPatch }) : Promise.resolve(),
    Object.keys(adminPatch).length ? User.findOneAndUpdate({ companyId: id, role: 'COMPANY_ADMIN' }, { $set: adminPatch }) : Promise.resolve(),
    Object.keys(licensePatch).length
      ? License.findOneAndUpdate(
        { companyId: id },
        { $set: { ...licensePatch, issuedBy: ctx.userId }, $setOnInsert: { companyId: id } },
        { upsert: true }
      )
      : Promise.resolve(),
  ])

  const bundle = await loadCompanyBundle(id)
  return NextResponse.json({ success: true, data: bundle })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireRole('SUPER_ADMIN')
  if (isNextResponse(ctx)) return ctx
  const { id } = await params
  await connectDB()
  const body = await req.json().catch(() => ({}))

  if (body.action !== 'RESET_ADMIN_PASSWORD') {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Unsupported action' } }, { status: 400 })
  }

  const [company, admin] = await Promise.all([
    Company.findById(id).lean(),
    User.findOne({ companyId: id, role: 'COMPANY_ADMIN' }),
  ])
  if (!company || !admin) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Company admin not found' } }, { status: 404 })
  }

  const tempPassword = generateTempPassword()
  admin.passwordHash = await hashPassword(tempPassword)
  admin.mustResetPassword = true
  admin.status = 'ACTIVE'
  await admin.save()

  let emailResult: unknown
  try {
    emailResult = await sendCompanyAdminWelcome({
      to: admin.email,
      companyName: company.name,
      adminName: admin.name,
      username: admin.username,
      tempPassword,
    })
  } catch (e) {
    emailResult = { delivered: false, transport: 'error', error: (e as Error).message }
  }

  return NextResponse.json({
    success: true,
    data: {
      credentials: { username: admin.username, tempPassword },
      email: emailResult,
    },
  })
}
