import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { AdminUser } from '@/lib/models/AdminUser'
import { verifyPassword, setSessionCookie } from '@/lib/auth/adminAuth'

// Password login for SUPER_ADMIN and COMPANY_ADMIN only. No Clerk involved.
export async function POST(req: NextRequest) {
  await connectDB()
  const { username, password } = await req.json().catch(() => ({}))

  if (!username || !password) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: 'Username and password are required' } },
      { status: 400 }
    )
  }

  const admin = await AdminUser.findOne({ username: String(username).toLowerCase().trim() })
  // Uniform error to avoid leaking which usernames exist.
  const invalid = NextResponse.json(
    { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' } },
    { status: 401 }
  )
  if (!admin) return invalid
  if (admin.status !== 'ACTIVE') {
    return NextResponse.json(
      { success: false, error: { code: 'SUSPENDED', message: 'This account is suspended' } },
      { status: 403 }
    )
  }

  const okPass = await verifyPassword(password, admin.passwordHash)
  if (!okPass) return invalid

  admin.lastLogin = new Date()
  await admin.save()

  await setSessionCookie({
    adminId: String(admin._id),
    role: admin.role,
    companyId: admin.companyId ?? null,
    username: admin.username,
    mustResetPassword: admin.mustResetPassword,
  })

  return NextResponse.json({
    success: true,
    data: {
      role: admin.role,
      mustResetPassword: admin.mustResetPassword,
      name: admin.name,
    },
  })
}
