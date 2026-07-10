import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { AdminUser } from '@/lib/models/AdminUser'
import {
  getAdminSession,
  verifyPassword,
  hashPassword,
  setSessionCookie,
} from '@/lib/auth/adminAuth'

// Change the signed-in admin's password. Used for the forced first-login reset
// and for voluntary changes. When mustResetPassword is set, the current password
// is not required (the user just authenticated with the temporary one).
export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not signed in' } },
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

  const admin = await AdminUser.findById(session.adminId)
  if (!admin) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Account not found' } },
      { status: 401 }
    )
  }

  if (!admin.mustResetPassword) {
    const okPass = await verifyPassword(String(currentPassword ?? ''), admin.passwordHash)
    if (!okPass) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Current password is incorrect' } },
        { status: 400 }
      )
    }
  }

  admin.passwordHash = await hashPassword(String(newPassword))
  admin.mustResetPassword = false
  await admin.save()

  // Re-issue the session so mustResetPassword is cleared and guards pass.
  await setSessionCookie({
    adminId: String(admin._id),
    role: admin.role,
    companyId: admin.companyId ?? null,
    username: admin.username,
    mustResetPassword: false,
  })

  return NextResponse.json({ success: true, data: { role: admin.role } })
}
