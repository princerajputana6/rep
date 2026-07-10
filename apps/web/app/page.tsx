import { redirect } from 'next/navigation'
import LandingPage from '@/app/components/landing/LandingPage'

export default async function RootPage() {
  // Only consult Clerk when it's actually configured (keys present + middleware ran).
  if (process.env.CLERK_SECRET_KEY) {
    const { auth } = await import('@clerk/nextjs/server')
    const { userId } = await auth()
    if (userId) redirect('/dashboard')
  }
  return <LandingPage />
}
