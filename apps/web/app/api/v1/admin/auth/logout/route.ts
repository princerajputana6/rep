import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/auth/adminAuth'

export async function POST() {
  await clearSessionCookie()
  return NextResponse.json({ success: true })
}
