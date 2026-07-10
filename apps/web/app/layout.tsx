import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'REP Platform',
  description: 'Resource & Engagement Platform',
}

// Clerk powers the regular-user lane only. Until Clerk keys are configured we
// skip the provider so the (Clerk-free) admin console at /superadmin still runs.
const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const body = (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
  return clerkEnabled ? <ClerkProvider>{body}</ClerkProvider> : body
}
