import { NextResponse } from 'next/server'
import connectDB from './mongodb'
import { Agency } from './models/Agency'
import { getSession } from './auth/session'

export interface AuthContext {
  userId: string
  agencyId: string
  role: string
  companyId?: string | null
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function err(message: string, code = 'ERROR', status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status })
}

// Zero ObjectId: casts cleanly for ObjectId-typed agency fields and matches
// nothing, so users without an agency get empty results instead of a cast 500.
const NO_AGENCY = '000000000000000000000000'

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await getSession()
  if (!session || session.mustResetPassword) return null

  await connectDB()

  let agencyId = session.agencyId || ''
  if (!agencyId) {
    // Admins aren't bound to a single agency — fall back to their company's first.
    if (session.companyId) {
      const ag = await Agency.findOne({ companyId: session.companyId }).select('_id').lean()
      agencyId = ag ? String(ag._id) : NO_AGENCY
    } else {
      agencyId = NO_AGENCY
    }
  }

  return {
    userId: session.userId,
    agencyId,
    role: session.role,
    companyId: session.companyId ?? null,
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
