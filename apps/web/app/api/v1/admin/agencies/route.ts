import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Agency } from '@/lib/models/Agency'
import { Environment } from '@/lib/models/Environment'
import { License } from '@/lib/models/License'
import { requireAdmin, isNextResponse } from '@/lib/auth/adminAuth'

// COMPANY_ADMIN: agencies within their own company.
export async function GET() {
  const ctx = await requireAdmin('COMPANY_ADMIN')
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const agencies = await Agency.find({ companyId: ctx.companyId }).sort({ createdAt: -1 }).lean()
  return NextResponse.json({ success: true, data: agencies })
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdmin('COMPANY_ADMIN')
  if (isNextResponse(ctx)) return ctx
  await connectDB()
  const body = await req.json().catch(() => ({}))

  const name = String(body.name ?? '').trim()
  if (!name) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Agency name is required' } }, { status: 400 })

  // Enforce license agency cap if configured.
  const license = await License.findOne({ companyId: ctx.companyId }).lean()
  if (license?.maxAgencies != null) {
    const count = await Agency.countDocuments({ companyId: ctx.companyId })
    if (count >= license.maxAgencies) {
      return NextResponse.json({ success: false, error: { code: 'LIMIT_REACHED', message: `Your plan allows up to ${license.maxAgencies} agencies. Upgrade to add more.` } }, { status: 402 })
    }
  }

  // Default to the production environment unless a valid one is supplied.
  let environmentId = body.environmentId ? String(body.environmentId) : null
  if (environmentId) {
    const env = await Environment.findOne({ _id: environmentId, companyId: ctx.companyId }).lean()
    if (!env) return NextResponse.json({ success: false, error: { code: 'VALIDATION', message: 'Invalid environment' } }, { status: 400 })
  } else {
    const prod = await Environment.findOne({ companyId: ctx.companyId, type: 'PRODUCTION' }).lean()
    environmentId = prod ? String(prod._id) : null
  }

  const agency = await Agency.create({
    name,
    companyId: ctx.companyId,
    environmentId,
    owner: body.owner?.trim() || ctx.username,
    ownerEmail: body.ownerEmail?.toLowerCase().trim() || undefined,
    participationLevel: body.participationLevel ?? 'full',
    status: 'ACTIVE',
    createdBy: ctx.adminId,
  })

  return NextResponse.json({ success: true, data: agency }, { status: 201 })
}
