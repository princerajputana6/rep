// Seed (or reset) the platform SUPER_ADMIN account in the unified `users` collection.
//
//   npm run seed:superadmin
//
// Reads MONGODB_URI from apps/web/.env.local. Override credentials with
// SUPERADMIN_USERNAME / SUPERADMIN_PASSWORD / SUPERADMIN_EMAIL.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Add it to apps/web/.env.local.')
  process.exit(1)
}

const USERNAME = (process.env.SUPERADMIN_USERNAME || 'superadmin').toLowerCase()
const PASSWORD = process.env.SUPERADMIN_PASSWORD || 'ChangeMe!2026'
const EMAIL = (process.env.SUPERADMIN_EMAIL || 'superadmin@rep.local').toLowerCase()

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  const users = mongoose.connection.db.collection('users')
  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  const existing = await users.findOne({ username: USERNAME })
  const doc = {
    username: USERNAME,
    email: EMAIL,
    passwordHash,
    name: 'Platform Super Admin',
    role: 'SUPER_ADMIN',
    companyId: null,
    agencyId: null,
    environmentId: null,
    status: 'ACTIVE',
    mustResetPassword: false,
    updatedAt: new Date(),
  }
  if (existing) {
    await users.updateOne({ _id: existing._id }, { $set: doc })
    console.log(`♻️  Reset existing super admin "${USERNAME}".`)
  } else {
    await users.insertOne({ ...doc, createdAt: new Date() })
    console.log(`✅ Created super admin "${USERNAME}".`)
  }

  console.log('\n────────────────────────────────────────')
  console.log('  Super Admin login  →  /login')
  console.log(`  Username: ${USERNAME}   (or email: ${EMAIL})`)
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
