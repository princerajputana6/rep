import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { Agency } from '@/lib/models/Agency'
import { License } from '@/lib/models/License'
import { Company } from '@/lib/models/Company'
import { requireRole, isNextResponse, hashPassword, generateTempPassword } from '@/lib/auth/session'
import { sendUserInvite } from '@/lib/email/mailer'

const MEMBER_ROLES = ['MANAGER', 'MEMBER', 'VIEWER'] as const

async function uniqueUsername(base: string) {
  const clean = base.toLowerCase().replace(/[^a-z0-9._-]+/g, '') || 'user'
  let username = clean
  let n = 1
  while (await User.exists({ username })) username = `${clean}${++n}`
  return username
}

// COMPANY_ADMIN: users within their own company.
export async function GET() {
  const ctx = await requireRole('COMPANY_ADMIN')
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const users = await User.find({ companyId: ctx.companyId, role: { $ne: 'COMPANY_ADMIN' } })
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .lean()
  return NextResponse.json({ success: true, data: users })
}

// Create a team member with a temporary password, emailed to them.
export async function POST(req: NextRequest) {
  const ctx = await requireRole('COMPANY_ADMIN')
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json().catch(() => ({}))

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').toLowerCase().trim()
  const role = String(body.role ?? 'VIEWER').toUpperCase()
  const agencyId = String(body.agencyId ?? '').trim()

  if (!name) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Name is required' } }, { status: 400 })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'A valid email is required' } }, { status: 400 })
  if (!MEMBER_ROLES.includes(role as (typeof MEMBER_ROLES)[number])) {
    return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Invalid role' } }, { status: 400 })
  }
  if (!agencyId) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'An agency is required' } }, { status: 400 })

  const agency = await Agency.findOne({ _id: agencyId, companyId: ctx.companyId }).lean()
  if (!agency) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Invalid agency' } }, { status: 400 })

  if (await User.exists({ email })) {
    return NextResponse.json({ success: false, error: { code: 'CONFLICT', message: 'A user with this email already exists' } }, { status: 409 })
  }

  const license = await License.findOne({ companyId: ctx.companyId }).lean()
  if (license?.maxUsers != null) {
    const count = await User.countDocuments({ companyId: ctx.companyId })
    if (count >= license.maxUsers) {
      return NextResponse.json({ success: false, error: { code: 'LIMIT_REACHED', message: `Your plan allows up to ${license.maxUsers} users. Upgrade to add more.` } }, { status: 402 })
    }
  }

  const username = await uniqueUsername(email.split('@')[0])
  const tempPassword = generateTempPassword()
  const user = await User.create({
    username,
    email,
    passwordHash: await hashPassword(tempPassword),
    name,
    role,
    companyId: ctx.companyId,
    agencyId,
    environmentId: agency.environmentId ?? null,
    status: 'INVITED',
    mustResetPassword: true,
    createdBy: ctx.userId,
  })

  const company = await Company.findById(ctx.companyId).lean()
  let emailResult: unknown
  try {
    emailResult = await sendUserInvite({
      to: email,
      name,
      companyName: company?.name ?? 'your team',
      username,
      tempPassword,
    })
  } catch (e) {
    emailResult = { delivered: false, transport: 'error', error: (e as Error).message }
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        user: { id: String(user._id), name, email, username, role, status: user.status },
        credentials: { username, tempPassword },
        email: emailResult,
      },
    },
    { status: 201 }
  )
}
