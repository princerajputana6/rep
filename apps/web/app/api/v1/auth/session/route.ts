import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { AdminUser } from '@/lib/models/AdminUser'
import { User } from '@/lib/models/User'
import { getAdminSession } from '@/lib/auth/adminAuth'

// Unified principal resolver for the main portal. Accepts EITHER:
//   • an admin password session (SUPER_ADMIN / COMPANY_ADMIN)  → full portal access
//   • a provisioned Clerk user (regular team member)
// so the app's AuthContext no longer depends directly on Clerk.
export async function GET() {
  await connectDB()

  // 1) Admin (password) session — admins log into the whole portal.
  const adminSession = await getAdminSession()
  if (adminSession && !adminSession.mustResetPassword) {
    const admin = await AdminUser.findById(adminSession.adminId).lean()
    if (admin && admin.status === 'ACTIVE') {
      return NextResponse.json({
        success: true,
        data: {
          authenticated: true,
          kind: 'admin',
          user: {
            id: String(admin._id),
            email: admin.email,
            name: admin.name,
            // Map admin roles onto the app's role vocabulary.
            role: admin.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'AGENCY_OWNER',
            agencyId: '',
            companyId: admin.companyId ?? null,
          },
        },
      })
    }
  }

  // 2) Clerk user — only when Clerk is configured (keys present + middleware ran).
  if (process.env.CLERK_SECRET_KEY) {
    try {
      const { auth, currentUser } = await import('@clerk/nextjs/server')
      const { userId: clerkId } = await auth()
      if (clerkId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let dbUser: any = await User.findOne({ clerkId }).lean()
        if (!dbUser) {
          const cu = await currentUser()
          const email = cu?.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim() ?? ''
          const invite = email ? await User.findOne({ email, clerkId: null, status: 'invited' }) : null
          if (invite) {
            invite.clerkId = clerkId
            invite.status = 'active'
            invite.lastLogin = new Date()
            await invite.save()
            dbUser = invite.toObject()
          }
        }
        if (dbUser && dbUser.status !== 'disabled') {
          return NextResponse.json({
            success: true,
            data: {
              authenticated: true,
              kind: 'clerk',
              user: {
                id: String(dbUser._id),
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role,
                agencyId: dbUser.agencyId,
                companyId: dbUser.companyId ?? null,
              },
            },
          })
        }
      }
    } catch {
      // Clerk not runnable in this context — fall through to unauthenticated.
    }
  }

  return NextResponse.json({ success: true, data: { authenticated: false, kind: null, user: null } })
}
