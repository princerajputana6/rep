import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { AdminRole } from '../models/AdminUser'

export const ADMIN_COOKIE = 'rep_admin_session'
const SESSION_TTL = '12h'

// Secret used to sign admin session JWTs. Set ADMIN_JWT_SECRET in production.
function secret(): Uint8Array {
  const s = process.env.ADMIN_JWT_SECRET || 'dev-only-insecure-admin-secret-change-me'
  return new TextEncoder().encode(s)
}

export interface AdminSession extends JWTPayload {
  adminId: string
  role: AdminRole
  companyId: string | null
  username: string
  mustResetPassword: boolean
}

// ---- password helpers ----------------------------------------------------
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// Human-typable temp password, e.g. "Rep-7Fk2-Qz9M". Emailed on onboarding.
export function generateTempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const chunk = (n: number) =>
    Array.from({ length: n }, () => alphabet[crypto.randomInt(alphabet.length)]).join('')
  return `Rep-${chunk(4)}-${chunk(4)}`
}

// ---- session helpers -----------------------------------------------------
export async function signSession(payload: AdminSession): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secret())
}

export async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload as AdminSession
  } catch {
    return null
  }
}

export async function setSessionCookie(payload: AdminSession): Promise<void> {
  const token = await signSession(payload)
  const jar = await cookies()
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies()
  jar.delete(ADMIN_COOKIE)
}

// Read + verify the current admin session from the cookie. Server-only.
export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies()
  const token = jar.get(ADMIN_COOKIE)?.value
  if (!token) return null
  return verifySession(token)
}

// Guard for admin API routes. Returns the session, or a NextResponse error.
export async function requireAdmin(role?: AdminRole): Promise<AdminSession | NextResponse> {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Admin sign-in required' } },
      { status: 401 }
    )
  }
  if (session.mustResetPassword) {
    return NextResponse.json(
      { success: false, error: { code: 'PASSWORD_RESET_REQUIRED', message: 'Password reset required' } },
      { status: 403 }
    )
  }
  if (role && session.role !== role) {
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
