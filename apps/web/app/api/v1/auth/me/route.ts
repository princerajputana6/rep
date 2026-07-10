import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { Company } from '@/lib/models/Company'
import { License } from '@/lib/models/License'
import { getSession } from '@/lib/auth/session'

// Current principal. Used by both the app shell and the admin console.
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json(
      { success: true, data: { authenticated: false, user: null } },
      { status: 200 }
    )
  }

  await connectDB()
  const user = await User.findById(session.userId).select('-passwordHash').lean()
  if (!user || user.status === 'DISABLED') {
    return NextResponse.json({ success: true, data: { authenticated: false, user: null } })
  }

  let company = null
  let license = null
  if (user.companyId) {
    company = await Company.findById(user.companyId).lean()
    license = await License.findOne({ companyId: user.companyId }).lean()
  }

  return NextResponse.json({
    success: true,
    data: {
      authenticated: true,
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId ?? null,
        agencyId: user.agencyId ?? '',
        mustResetPassword: user.mustResetPassword,
      },
      company,
      license,
    },
  })
}
