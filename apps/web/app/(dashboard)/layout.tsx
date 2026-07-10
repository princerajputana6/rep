import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

// Portal gate: any signed-in, provisioned user. Accounts are created by an
// administrator — there is no self-service sign-up.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.mustResetPassword) redirect('/reset-password')
  return <>{children}</>
}
