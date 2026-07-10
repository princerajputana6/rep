import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Company } from '@/lib/models/Company'
import { License } from '@/lib/models/License'
import { Environment } from '@/lib/models/Environment'
import { AdminUser } from '@/lib/models/AdminUser'
import { requireAdmin, isNextResponse, hashPassword, generateTempPassword } from '@/lib/auth/adminAuth'
import { PLAN_DEFAULTS, SANDBOX_ALLOWANCE, PLAN_TIERS, PlanTier } from '@/lib/modules'
import { sendCompanyAdminWelcome } from '@/lib/email/mailer'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40) || 'company'
}

async function uniqueSlug(base: string) {
  let slug = base
  let n = 1
  while (await Company.exists({ slug })) slug = `${base}-${++n}`
  return slug
}

async function uniqueUsername(base: string) {
  const clean = base.toLowerCase().replace(/[^a-z0-9._-]+/g, '') || 'admin'
  let username = clean
  let n = 1
  while (await AdminUser.exists({ username })) username = `${clean}${++n}`
  return username
}

// SUPER_ADMIN: list all licensed companies with their license + admin.
export async function GET() {
  const ctx = await requireAdmin('SUPER_ADMIN')
  if (isNextResponse(ctx)) return ctx
  await connectDB()

  const companies = await Company.find({}).sort({ createdAt: -1 }).lean()
  const [licenses, admins] = await Promise.all([
    License.find({}).lean(),
    AdminUser.find({ role: 'COMPANY_ADMIN' }).select('-passwordHash').lean(),
  ])
  const licByCompany = new Map(licenses.map((l) => [String(l.companyId), l]))
  const adminByCompany = new Map(admins.map((a) => [String(a.companyId), a]))

  return NextResponse.json({
    success: true,
    data: companies.map((c) => ({
      ...c,
      license: licByCompany.get(String(c._id)) ?? null,
      admin: adminByCompany.get(String(c._id)) ?? null,
    })),
  })
}

// SUPER_ADMIN: onboard a new company end-to-end.
//   Company + License(tier) + production Environment + COMPANY_ADMIN account.
//   Emails the admin a username + temporary password (forced reset on first login).
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin('SUPER_ADMIN')
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json().catch(() => ({}))

  const name = String(body.name ?? '').trim()
  const adminName = String(body.adminName ?? '').trim()
  const adminEmail = String(body.adminEmail ?? '').toLowerCase().trim()
  const tier: PlanTier = PLAN_TIERS.includes(body.tier) ? body.tier : 'PRIME'

  if (!name) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Company name is required' } }, { status: 400 })
  if (!adminName) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Admin name is required' } }, { status: 400 })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adminEmail)) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'A valid admin email is required' } }, { status: 400 })

  if (await Company.exists({ adminEmail })) {
    return NextResponse.json({ success: false, error: { code: 'CONFLICT', message: 'A company with this admin email already exists' } }, { status: 409 })
  }
  if (await AdminUser.exists({ email: adminEmail })) {
    return NextResponse.json({ success: false, error: { code: 'CONFLICT', message: 'An admin account with this email already exists' } }, { status: 409 })
  }

  const company = await Company.create({
    name,
    slug: await uniqueSlug(slugify(name)),
    adminEmail,
    adminName,
    tier,
    status: 'ACTIVE',
    createdBy: ctx.adminId,
  })

  const license = await License.create({
    companyId: String(company._id),
    tier,
    status: body.status && ['TRIAL', 'ACTIVE'].includes(body.status) ? body.status : 'ACTIVE',
    enabledModules: Array.isArray(body.enabledModules) && body.enabledModules.length ? body.enabledModules : PLAN_DEFAULTS[tier],
    maxUsers: body.maxUsers ?? null,
    maxAgencies: body.maxAgencies ?? null,
    sandboxLimit: SANDBOX_ALLOWANCE[tier],
    seats: body.seats ?? null,
    validTo: body.validTo ? new Date(body.validTo) : null,
    issuedBy: ctx.adminId,
    notes: body.notes ?? '',
  })

  const environment = await Environment.create({
    companyId: String(company._id),
    name: 'Production',
    type: 'PRODUCTION',
    status: 'ACTIVE',
    isDefault: true,
    createdBy: ctx.adminId,
  })

  const username = await uniqueUsername(adminEmail.split('@')[0])
  const tempPassword = generateTempPassword()
  const admin = await AdminUser.create({
    username,
    email: adminEmail,
    passwordHash: await hashPassword(tempPassword),
    name: adminName,
    role: 'COMPANY_ADMIN',
    companyId: String(company._id),
    status: 'ACTIVE',
    mustResetPassword: true,
    createdBy: ctx.adminId,
  })

  let emailResult: unknown
  try {
    emailResult = await sendCompanyAdminWelcome({ to: adminEmail, companyName: name, adminName, username, tempPassword })
  } catch (e) {
    emailResult = { delivered: false, transport: 'error', error: (e as Error).message }
  }

  return NextResponse.json({
    success: true,
    data: {
      company,
      license,
      environment,
      admin: { id: String(admin._id), username, email: adminEmail, name: adminName, role: admin.role },
      // Shown to the super admin so they can relay credentials if email delivery is not yet configured.
      credentials: { username, tempPassword },
      email: emailResult,
    },
  }, { status: 201 })
}
