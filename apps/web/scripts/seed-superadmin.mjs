// Seed (or reset) the platform SUPER_ADMIN account.
//
// The current auth flow uses the unified `users` collection. Some deployed
// environments may still be running an older admin console build that checks
// `adminusers`, so this script keeps both records in sync.
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
const DB_NAME = process.env.SUPERADMIN_DB || process.argv.find((arg) => arg.startsWith('--db='))?.slice(5)

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, DB_NAME ? { dbName: DB_NAME } : undefined)
  const users = mongoose.connection.db.collection('users')
  const adminUsers = mongoose.connection.db.collection('adminusers')
  const passwordHash = await bcrypt.hash(PASSWORD, 10)

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

  async function upsertSuperAdmin(collection, label, statusValue) {
    const existing = await collection.findOne({
      $or: [{ username: USERNAME }, { email: EMAIL }],
    })
    const record = { ...doc, status: statusValue }
    if (existing) {
      await collection.updateOne({ _id: existing._id }, { $set: record })
      console.log(`♻️  Reset existing ${label} super admin "${USERNAME}".`)
      return
    }
    await collection.insertOne({ ...record, createdAt: new Date() })
    console.log(`✅ Created ${label} super admin "${USERNAME}".`)
  }

  await upsertSuperAdmin(users, 'users', 'ACTIVE')
  await upsertSuperAdmin(adminUsers, 'adminusers', 'ACTIVE')

  console.log('\n────────────────────────────────────────')
  console.log(`  Database: ${mongoose.connection.db.databaseName}`)
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
