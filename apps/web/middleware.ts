import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'rep_session'

// Routes reachable without a session.
const PUBLIC_PATHS = ['/', '/login', '/reset-password', '/ui-preview']
const PUBLIC_API = ['/api/v1/auth/login', '/api/v1/auth/logout', '/api/v1/auth/me', '/api/v1/webhooks']

function secret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.AUTH_JWT_SECRET || process.env.ADMIN_JWT_SECRET || 'dev-only-insecure-secret-change-me'
  )
}

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (pathname.startsWith('/ui-preview')) return true
  return PUBLIC_API.some((p) => pathname.startsWith(p))
}

interface Claims {
  role?: string
  mustResetPassword?: boolean
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get(SESSION_COOKIE)?.value
  let claims: Claims | null = null
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret())
      claims = payload as Claims
    } catch {
      claims = null
    }
  }

  // Signed in but still on a temporary password → force the reset screen.
  if (claims?.mustResetPassword && pathname !== '/reset-password' && !pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL('/reset-password', request.url))
  }

  if (isPublic(pathname)) {
    // Already signed in? Skip the login page.
    if (pathname === '/login' && claims && !claims.mustResetPassword) {
      const to = claims.role === 'SUPER_ADMIN' ? '/superadmin' : '/dashboard'
      return NextResponse.redirect(new URL(to, request.url))
    }
    return NextResponse.next()
  }

  if (!claims) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Sign-in required' } },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // The admin console is for platform + company administrators only.
  if (pathname.startsWith('/superadmin') && !['SUPER_ADMIN', 'COMPANY_ADMIN'].includes(claims.role ?? '')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
