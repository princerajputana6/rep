import { redirect } from 'next/navigation'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { getAdminSession } from '@/lib/auth/adminAuth'

// Portal gate. Access is granted to:
//   • an admin password session (SUPER_ADMIN / COMPANY_ADMIN) — full portal, no Clerk
//   • a provisioned (invited) Clerk user
// Non-invited Clerk accounts go to /not-invited.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await connectDB()

  // 1) Admins reach the whole portal via their password session.
  const admin = await getAdminSession()
  if (admin) {
    if (admin.mustResetPassword) redirect('/superadmin/reset-password')
    return <>{children}</>
  }

  // 2) Otherwise require Clerk. If Clerk isn't configured, only admins can enter.
  if (!process.env.CLERK_SECRET_KEY) redirect('/superadmin/login')

  const { auth, currentUser } = await import('@clerk/nextjs/server')
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect('/sign-in')

  const linked = await User.findOne({ clerkId })
  if (linked) {
    if (linked.status === 'disabled') redirect('/not-invited')
    return <>{children}</>
  }

  // First sign-in: claim a pending invite for this exact email, else block.
  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim() ?? ''
  const invite = email ? await User.findOne({ email, clerkId: null, status: 'invited' }) : null
  if (!invite) redirect('/not-invited')

  invite.clerkId = clerkId
  invite.status = 'active'
  invite.lastLogin = new Date()
  if (!invite.name) invite.name = `${clerkUser?.firstName ?? ''} ${clerkUser?.lastName ?? ''}`.trim() || email
  await invite.save()

  return <>{children}</>
}
