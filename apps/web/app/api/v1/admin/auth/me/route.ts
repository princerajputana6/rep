import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { AdminUser } from '@/lib/models/AdminUser'
import { Company } from '@/lib/models/Company'
import { License } from '@/lib/models/License'
import { getAdminSession } from '@/lib/auth/adminAuth'

// Returns the currently signed-in admin (and their company/license for company admins).
export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not signed in' } },
      { status: 401 }
    )
  }
  await connectDB()
  const admin = await AdminUser.findById(session.adminId).lean()
  if (!admin) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Account not found' } },
      { status: 401 }
    )
  }

  let company = null
  let license = null
  if (admin.companyId) {
    company = await Company.findById(admin.companyId).lean()
    license = await License.findOne({ companyId: admin.companyId }).lean()
  }

  return NextResponse.json({
    success: true,
    data: {
      id: String(admin._id),
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      companyId: admin.companyId ?? null,
      mustResetPassword: admin.mustResetPassword,
      company,
      license,
    },
  })
}
