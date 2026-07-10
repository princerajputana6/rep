import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextRequest } from 'next/server'
import type { NextFetchEvent } from 'next/server'
import { jwtVerify } from 'jose'

const ADMIN_COOKIE = 'rep_admin_session'
const clerkConfigured = Boolean(process.env.CLERK_SECRET_KEY)

// Routes Clerk should NOT guard. The admin area has its own password session.
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/v1/webhooks(.*)',
  '/superadmin(.*)',        // admin UI (own auth)
  '/api/v1/admin(.*)',      // admin API (own auth)
  '/api/v1/auth/session',   // unified principal resolver (admin or clerk)
  '/ui-preview(.*)',        // design-system preview
])

// Verify the admin session cookie (edge-safe). Admins access the whole portal.
async function hasAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  if (!token) return false
  try {
    await jwtVerify(token, adminSecret())
    return true
  } catch {
    return false
  }
}

// Admin UI pages that require a valid admin session (login page excluded).
const isAdminPage = createRouteMatcher(['/superadmin/((?!login).*)', '/superadmin'])

function adminSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.ADMIN_JWT_SECRET || 'dev-only-insecure-admin-secret-change-me'
  )
}

// Gate the admin console with the admin cookie (edge-safe JWT verify).
// Returns a redirect response, or null to continue.
async function adminGate(request: NextRequest): Promise<NextResponse | null> {
  if (!isAdminPage(request)) return null
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  let valid = false
  let mustReset = false
  if (token) {
    try {
      const { payload } = await jwtVerify(token, adminSecret())
      valid = true
      mustReset = Boolean((payload as { mustResetPassword?: boolean }).mustResetPassword)
    } catch {
      valid = false
    }
  }
  if (!valid) return NextResponse.redirect(new URL('/superadmin/login', request.url))
  if (mustReset && !request.nextUrl.pathname.startsWith('/superadmin/reset-password')) {
    return NextResponse.redirect(new URL('/superadmin/reset-password', request.url))
  }
  return NextResponse.next()
}

const clerkHandler = clerkMiddleware(async (auth, request) => {
  const gate = await adminGate(request)
  if (gate) return gate
  if (isPublicRoute(request)) return
  // Admins reach the whole portal via their password session — let them bypass Clerk.
  if (await hasAdminSession(request)) return
  await auth.protect()
})

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Admin lane works with or without Clerk configured.
  if (!clerkConfigured) {
    const gate = await adminGate(request)
    return gate ?? NextResponse.next()
  }
  return clerkHandler(request, event)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
