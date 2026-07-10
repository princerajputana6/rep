import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { UserRole } from '../models/User'

export const SESSION_COOKIE = 'rep_session'
const SESSION_TTL = '12h'

export function sessionSecret(): Uint8Array {
  const s = process.env.AUTH_JWT_SECRET || process.env.ADMIN_JWT_SECRET || 'dev-only-insecure-secret-change-me'
  return new TextEncoder().encode(s)
}

export interface Session extends JWTPayload {
  userId: string
  username: string
  role: UserRole
  companyId: string | null
  agencyId: string | null
  mustResetPassword: boolean
}

// ---- passwords -----------------------------------------------------------
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// Human-typable temporary password, e.g. "Rep-7Fk2-Qz9M".
export function generateTempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const chunk = (n: number) =>
    Array.from({ length: n }, () => alphabet[crypto.randomInt(alphabet.length)]).join('')
  return `Rep-${chunk(4)}-${chunk(4)}`
}

// ---- session -------------------------------------------------------------
export async function signSession(payload: Session): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(sessionSecret())
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, sessionSecret())
    return payload as Session
  } catch {
    return null
  }
}

export async function setSessionCookie(payload: Session): Promise<void> {
  const token = await signSession(payload)
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

// ---- guards --------------------------------------------------------------
function unauthorized() {
  return NextResponse.json(
    { success: false, error: { code: 'UNAUTHORIZED', message: 'Sign-in required' } },
    { status: 401 }
  )
}

// Any signed-in, fully-provisioned user.
export async function requireSession(): Promise<Session | NextResponse> {
  const session = await getSession()
  if (!session) return unauthorized()
  if (session.mustResetPassword) {
    return NextResponse.json(
      { success: false, error: { code: 'PASSWORD_RESET_REQUIRED', message: 'Password reset required' } },
      { status: 403 }
    )
  }
  return session
}

// Restrict to one or more roles.
export async function requireRole(...roles: UserRole[]): Promise<Session | NextResponse> {
  const session = await requireSession()
  if (session instanceof NextResponse) return session
  if (!roles.includes(session.role)) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Insufficient privileges' } },
      { status: 403 }
    )
  }
  return session
}

export function isNextResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse
}
