import { redirect } from 'next/navigation'
import LandingPage from '@/app/components/landing/LandingPage'
import { getSession } from '@/lib/auth/session'

export default async function RootPage() {
  const session = await getSession()
  if (session) redirect(session.role === 'SUPER_ADMIN' ? '/superadmin' : '/dashboard')
  return <LandingPage />
}
