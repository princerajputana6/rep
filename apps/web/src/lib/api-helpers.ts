import { NextResponse } from 'next/server'
import connectDB from './mongodb'
import { User } from './models/User'
import { Agency } from './models/Agency'
import { getAdminSession } from './auth/adminAuth'

export interface AuthContext {
  userId: string
  agencyId: string
  role: string
  clerkUserId: string
  companyId?: string | null
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function err(message: string, code = 'ERROR', status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status })
}

// Resolves the caller for data APIs. Accepts EITHER an admin password session
// (SUPER_ADMIN / COMPANY_ADMIN) or a provisioned Clerk user. Never calls Clerk
// unless it's actually configured, so admin-only deployments don't throw.
export async function getAuthContext(): Promise<AuthContext | null> {
  await connectDB()

  // 1) Admin password session — admins operate the whole portal.
  const admin = await getAdminSession()
  if (admin && !admin.mustResetPassword) {
    // Zero ObjectId: casts cleanly for ObjectId-typed agency fields and matches
    // nothing, so agency-less admins get empty results instead of a cast 500.
    let agencyId = '000000000000000000000000'
    if (admin.companyId) {
      const ag = await Agency.findOne({ companyId: admin.companyId }).select('_id').lean()
      if (ag) agencyId = String(ag._id)
    }
    return {
      userId: admin.adminId,
      agencyId,
      role: admin.role,
      clerkUserId: '',
      companyId: admin.companyId ?? null,
    }
  }

  // 2) Clerk user — only when Clerk is configured.
  if (!process.env.CLERK_SECRET_KEY) return null
  const { auth } = await import('@clerk/nextjs/server')
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) return null

  const user = await User.findOne({ clerkId: clerkUserId })
  if (!user) return null

  return {
    userId: String(user._id),
    agencyId: user.agencyId,
    role: user.role,
    clerkUserId,
    companyId: user.companyId ?? null,
  }
}

export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const ctx = await getAuthContext()
  if (!ctx) return err('Unauthorized', 'UNAUTHORIZED', 401)
  return ctx
}

export function isNextResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse
}
