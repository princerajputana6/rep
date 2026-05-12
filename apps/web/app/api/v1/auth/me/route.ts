import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/User'

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 })

  await connectDB()

  let dbUser = await User.findOne({ clerkId }).lean()

  if (!dbUser) {
    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? ''
    const name = `${clerkUser?.firstName ?? ''} ${clerkUser?.lastName ?? ''}`.trim()

    dbUser = await User.create({
      clerkId,
      email,
      name: name || email,
      role: (clerkUser?.publicMetadata?.role as string) ?? 'VIEWER',
      agencyId: (clerkUser?.publicMetadata?.agencyId as string) ?? '',
      status: 'active',
    })
  }

  return NextResponse.json({ success: true, data: dbUser })
}
