// Seed (or update) the platform SUPER_ADMIN account.
//
//   node scripts/seed-superadmin.mjs
//
// Reads MONGODB_URI from apps/web/.env.local (or the environment). Override
// credentials with SUPERADMIN_USERNAME / SUPERADMIN_PASSWORD / SUPERADMIN_EMAIL.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// --- tiny .env.local loader (no dependency) --------------------------------
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Add it to apps/web/.env.local or pass it inline.')
  process.exit(1)
}

const USERNAME = (process.env.SUPERADMIN_USERNAME || 'superadmin').toLowerCase()
const PASSWORD = process.env.SUPERADMIN_PASSWORD || 'ChangeMe!2026'
const EMAIL = (process.env.SUPERADMIN_EMAIL || 'superadmin@rep.local').toLowerCase()

const AdminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: String,
    role: { type: String, enum: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
    companyId: { type: String, default: null },
    status: { type: String, default: 'ACTIVE' },
    mustResetPassword: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
    createdBy: { type: String, default: null },
  },
  { timestamps: true }
)
const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema)

async function main() {
  await mongoose.connect(MONGODB_URI)
  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  const existing = await AdminUser.findOne({ username: USERNAME })
  if (existing) {
    existing.passwordHash = passwordHash
    existing.email = EMAIL
    existing.role = 'SUPER_ADMIN'
    existing.status = 'ACTIVE'
    existing.mustResetPassword = false
    existing.companyId = null
    await existing.save()
    console.log(`♻️  Updated existing super admin "${USERNAME}".`)
  } else {
    await AdminUser.create({
      username: USERNAME,
      email: EMAIL,
      passwordHash,
      name: 'Platform Super Admin',
      role: 'SUPER_ADMIN',
      companyId: null,
      status: 'ACTIVE',
      mustResetPassword: false,
    })
    console.log(`✅ Created super admin "${USERNAME}".`)
  }

  console.log('\n────────────────────────────────────────')
  console.log('  Super Admin login')
  console.log('  URL:      /superadmin/login')
  console.log(`  Username: ${USERNAME}`)
  console.log(`  Password: ${PASSWORD}`)
  console.log('────────────────────────────────────────')
  console.log('  Change this password after first login.\n')

  await mongoose.disconnect()
  process.exit(0)
}

main().catch((e) => {
  console.error('❌ Seed failed:', e.message)
  process.exit(1)
})
