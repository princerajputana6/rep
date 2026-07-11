import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { hashPassword, generateTempPassword } from '@/lib/auth/session'
import { ok, err, requireAuth, isNextResponse } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  await connectDB()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '25')

  // Scope: super admin sees all; a company admin sees everyone in their company
  // (including themselves); a regular member sees only their own agency.
  const filter: Record<string, unknown> = {}
  if (ctx.role === 'SUPER_ADMIN') {
    /* all */
  } else if (ctx.role === 'COMPANY_ADMIN' && ctx.companyId) {
    filter.companyId = ctx.companyId
  } else {
    filter.agencyId = ctx.agencyId
  }
  const search = searchParams.get('search')
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ]

  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ])

  return ok({ data, total, page, perPage: limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth()
  if (isNextResponse(ctx)) return ctx

  await connectDB()
  const body = await req.json()

  const email = String(body.email ?? '').toLowerCase().trim()
  if (!email) return err('Email is required', 'VALIDATION', 400)

  const existing = await User.findOne({ email })
  if (existing) return err('User with this email already exists', 'CONFLICT', 409)

  // Username derived from the email local-part, de-duplicated.
  const base = email.split('@')[0].replace(/[^a-z0-9._-]+/g, '') || 'user'
  let username = base
  let n = 1
  while (await User.exists({ username })) username = `${base}${++n}`

  const tempPassword = generateTempPassword()
  const user = await User.create({
    username,
    email,
    passwordHash: await hashPassword(tempPassword),
    name: body.name,
    role: body.role ?? 'VIEWER',
    companyId: ctx.companyId ?? null,
    agencyId: ctx.agencyId,
    status: 'INVITED',
    mustResetPassword: true,
    createdBy: ctx.userId,
  })

  const { passwordHash: _omit, ...safe } = user.toObject()
  return ok({ ...safe, credentials: { username, tempPassword } }, 201)
}
