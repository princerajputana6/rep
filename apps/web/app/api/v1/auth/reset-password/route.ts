import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { getSession, verifyPassword, hashPassword, setSessionCookie } from '@/lib/auth/session'

// Change the signed-in user's password. Used for the forced first-login reset
// (where the current password isn't re-asked) and for voluntary changes.
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Sign-in required' } },
      { status: 401 }
    )
  }
  await connectDB()
  const { currentPassword, newPassword } = await req.json().catch(() => ({}))

  if (!newPassword || String(newPassword).length < 8) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: 'New password must be at least 8 characters' } },
      { status: 400 }
    )
  }

  const user = await User.findById(session.userId)
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Account not found' } },
      { status: 401 }
    )
  }

  if (!user.mustResetPassword) {
    if (!(await verifyPassword(String(currentPassword ?? ''), user.passwordHash))) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect' } },
        { status: 400 }
      )
    }
  }

  user.passwordHash = await hashPassword(String(newPassword))
  user.mustResetPassword = false
  if (user.status === 'INVITED') user.status = 'ACTIVE'
  await user.save()

  // Re-issue the session so the reset flag is cleared.
  await setSessionCookie({
    userId: String(user._id),
    username: user.username,
    role: user.role,
    companyId: user.companyId ?? null,
    agencyId: user.agencyId ?? null,
    mustResetPassword: false,
  })

  return NextResponse.json({
    success: true,
    data: { redirectTo: user.role === 'SUPER_ADMIN' ? '/superadmin' : '/dashboard' },
  })
}
