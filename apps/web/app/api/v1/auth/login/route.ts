import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { verifyPassword, setSessionCookie } from '@/lib/auth/session'

// Single login for everyone: super admins, company admins and team members.
// Accepts an email address OR a username, plus a password.
export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json().catch(() => ({}))
  const identifier = String(body.identifier ?? body.username ?? body.email ?? '').toLowerCase().trim()
  const password = String(body.password ?? '')

  if (!identifier || !password) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: 'Email/username and password are required' } },
      { status: 400 }
    )
  }

  const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] })

  // Uniform response so we don't leak which accounts exist.
  const invalid = NextResponse.json(
    { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } },
    { status: 401 }
  )
  if (!user) return invalid
  if (user.status === 'DISABLED') {
    return NextResponse.json(
      { success: false, error: { code: 'DISABLED', message: 'This account has been disabled' } },
      { status: 403 }
    )
  }
  if (!(await verifyPassword(password, user.passwordHash))) return invalid

  user.lastLogin = new Date()
  if (user.status === 'INVITED') user.status = 'ACTIVE'
  await user.save()

  await setSessionCookie({
    userId: String(user._id),
    username: user.username,
    role: user.role,
    companyId: user.companyId ?? null,
    agencyId: user.agencyId ?? null,
    mustResetPassword: user.mustResetPassword,
  })

  return NextResponse.json({
    success: true,
    data: {
      name: user.name,
      role: user.role,
      mustResetPassword: user.mustResetPassword,
      // Where the client should land after login.
      redirectTo: user.mustResetPassword
        ? '/reset-password'
        : user.role === 'SUPER_ADMIN'
          ? '/superadmin'
          : '/dashboard',
    },
  })
}
