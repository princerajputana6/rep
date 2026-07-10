import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models/User'

// Regular (Clerk) users only. A Clerk identity is NOT enough on its own:
// the user must have been pre-created (invited) by a company admin. We never
// auto-provision here — un-invited Clerk accounts are rejected.
export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  await connectDB()

  // Already linked and active — normal path.
  const linked = await User.findOne({ clerkId }).lean()
  if (linked) {
    if (linked.status === 'disabled') {
      return NextResponse.json({ success: false, error: { code: 'DISABLED', message: 'Your access has been disabled' } }, { status: 403 })
    }
    return NextResponse.json({ success: true, data: linked })
  }

  // First Clerk sign-in: try to claim a pending invite for this exact email.
  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim() ?? ''

  const invite = email ? await User.findOne({ email, clerkId: null, status: 'invited' }) : null
  if (!invite) {
    // Not invited → block. The client signs them out of Clerk.
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_INVITED',
          message: 'No invitation found for this account. Ask your administrator to add you first.',
        },
      },
      { status: 403 }
    )
  }

  invite.clerkId = clerkId
  invite.status = 'active'
  invite.lastLogin = new Date()
  if (!invite.name && clerkUser) {
    invite.name = `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || email
  }
  await invite.save()

  return NextResponse.json({ success: true, data: invite.toObject() })
}
