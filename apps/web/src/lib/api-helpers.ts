import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import connectDB from './mongodb'
import { User } from './models/User'

export interface AuthContext {
  userId: string
  agencyId: string
  role: string
  clerkUserId: string
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function err(message: string, code = 'ERROR', status = 400) {
  return NextResponse.json({ success: false, error: { code, message } }, { status })
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) return null

  await connectDB()
  const user = await User.findOne({ clerkId: clerkUserId })
  if (!user) return null

  return {
    userId: String(user._id),
    agencyId: user.agencyId,
    role: user.role,
    clerkUserId,
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
