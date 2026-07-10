import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { Agency } from '@/lib/models/Agency'
import { License } from '@/lib/models/License'
import { Company } from '@/lib/models/Company'
import { requireAdmin, isNextResponse } from '@/lib/auth/adminAuth'
import { sendUserInvite } from '@/lib/email/mailer'

// COMPANY_ADMIN: users within their own company.
export async function GET() {
  const ctx = await requireAdmin('COMPANY_ADMIN')
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const users = await User.find({ companyId: ctx.companyId }).sort({ createdAt: -1 }).lean()
  return NextResponse.json({ success: true, data: users })
}

// Invite (pre-create) a regular user. They can only activate via Clerk using
// this exact email; anyone not pre-created here is blocked from signing up.
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin('COMPANY_ADMIN')
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json().catch(() => ({}))

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').toLowerCase().trim()
  const role = String(body.role ?? 'VIEWER').trim().toUpperCase()
  const agencyId = String(body.agencyId ?? '').trim()

  if (!name) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Name is required' } }, { status: 400 })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'A valid email is required' } }, { status: 400 })
  if (!agencyId) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'An agency is required' } }, { status: 400 })

  const agency = await Agency.findOne({ _id: agencyId, companyId: ctx.companyId }).lean()
  if (!agency) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Invalid agency' } }, { status: 400 })

  if (await User.exists({ email })) {
    return NextResponse.json({ success: false, error: { code: 'CONFLICT', message: 'A user with this email already exists' } }, { status: 409 })
  }

  // Enforce license seat cap if configured.
  const license = await License.findOne({ companyId: ctx.companyId }).lean()
  if (license?.maxUsers != null) {
    const count = await User.countDocuments({ companyId: ctx.companyId })
    if (count >= license.maxUsers) {
      return NextResponse.json({ success: false, error: { code: 'LIMIT_REACHED', message: `Your plan allows up to ${license.maxUsers} users. Upgrade to add more.` } }, { status: 402 })
    }
  }

  const user = await User.create({
    name,
    email,
    role,
    companyId: ctx.companyId,
    agencyId,
    environmentId: agency.environmentId ?? null,
    clerkId: null,
    status: 'invited',
    invitedBy: ctx.adminId,
    invitedAt: new Date(),
  })

  const company = await Company.findById(ctx.companyId).lean()
  let emailResult: unknown
  try {
    emailResult = await sendUserInvite({ to: email, name, companyName: company?.name ?? 'your team' })
  } catch (e) {
    emailResult = { delivered: false, transport: 'error', error: (e as Error).message }
  }

  return NextResponse.json({ success: true, data: { user, email: emailResult } }, { status: 201 })
}
