import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Environment } from '@/lib/models/Environment'
import { License } from '@/lib/models/License'
import { requireAdmin, isNextResponse } from '@/lib/auth/adminAuth'

// COMPANY_ADMIN: environments for their company (1 production + N sandboxes).
export async function GET() {
  const ctx = await requireAdmin('COMPANY_ADMIN')
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const environments = await Environment.find({ companyId: ctx.companyId }).sort({ createdAt: 1 }).lean()
  const license = await License.findOne({ companyId: ctx.companyId }).lean()
  const sandboxCount = environments.filter((e) => e.type === 'SANDBOX').length
  return NextResponse.json({
    success: true,
    data: {
      environments,
      sandboxCount,
      sandboxLimit: license?.sandboxLimit ?? 1,
      canCreateSandbox: sandboxCount < (license?.sandboxLimit ?? 1),
    },
  })
}

// Create a sandbox. The first sandbox is included; beyond the license
// sandboxLimit the company must upgrade / purchase more.
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin('COMPANY_ADMIN')
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json().catch(() => ({}))

  const license = await License.findOne({ companyId: ctx.companyId }).lean()
  const limit = license?.sandboxLimit ?? 1
  const sandboxCount = await Environment.countDocuments({ companyId: ctx.companyId, type: 'SANDBOX' })

  if (sandboxCount >= limit) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPGRADE_REQUIRED',
          message: `Your plan includes ${limit} sandbox${limit === 1 ? '' : 'es'}. Upgrade or purchase more to add another.`,
        },
      },
      { status: 402 }
    )
  }

  const name = String(body.name ?? '').trim() || `Sandbox ${sandboxCount + 1}`
  const environment = await Environment.create({
    companyId: ctx.companyId,
    name,
    type: 'SANDBOX',
    status: 'ACTIVE',
    isDefault: false,
    createdBy: ctx.adminId,
  })

  return NextResponse.json({ success: true, data: environment }, { status: 201 })
}
