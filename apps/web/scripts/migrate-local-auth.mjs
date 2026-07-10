// One-time migration to the unified, Clerk-free auth model.
//
//   npm run migrate:auth
//
//  • Copies every `adminusers` document into `users` (keeping its password hash)
//  • Normalises legacy `users` docs (clerkId / lowercase status) to the new shape
//  • Drops the now-invalid unique `clerkId` index on `users`
//
// Non-destructive: `adminusers` is left in place as a backup. Once you've
// confirmed login works you can drop it yourself.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
if (!process.env.MONGODB_URI) { console.error('❌ MONGODB_URI not set'); process.exit(1) }

const ROLE_MAP = { AGENCY_OWNER: 'COMPANY_ADMIN', RESOURCE_MANAGER: 'MANAGER', ADMIN: 'COMPANY_ADMIN' }

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db
  const users = db.collection('users')
  const collections = (await db.listCollections().toArray()).map((c) => c.name)

  // 1) Normalise legacy user docs (Clerk era).
  let normalised = 0
  for (const u of await users.find({}).toArray()) {
    const set = {}
    const unset = {}
    if ('clerkId' in u) unset.clerkId = ''
    if (!u.username) set.username = String(u.email ?? `user${u._id}`).split('@')[0].toLowerCase()
    if (u.status && ['active', 'invited', 'disabled'].includes(u.status)) set.status = u.status.toUpperCase()
    if (u.role && ROLE_MAP[u.role]) set.role = ROLE_MAP[u.role]
    if (u.mustResetPassword === undefined) set.mustResetPassword = false
    // Legacy Clerk users have no password — mark them as needing a reset.
    if (!u.passwordHash) { set.passwordHash = '!'; set.mustResetPassword = true; set.status = 'INVITED' }
    if (Object.keys(set).length || Object.keys(unset).length) {
      const update = {}
      if (Object.keys(set).length) update.$set = set
      if (Object.keys(unset).length) update.$unset = unset
      await users.updateOne({ _id: u._id }, update)
      normalised++
    }
  }

  // 2) Move adminusers -> users.
  let moved = 0
  if (collections.includes('adminusers')) {
    for (const a of await db.collection('adminusers').find({}).toArray()) {
      const exists = await users.findOne({ $or: [{ username: a.username }, { email: a.email }] })
      const doc = {
        username: a.username,
        email: a.email,
        passwordHash: a.passwordHash,
        name: a.name ?? a.username,
        role: a.role,
        companyId: a.companyId ?? null,
        agencyId: null,
        environmentId: null,
        status: a.status ?? 'ACTIVE',
        mustResetPassword: Boolean(a.mustResetPassword),
        lastLogin: a.lastLogin ?? null,
        updatedAt: new Date(),
      }
      if (exists) await users.updateOne({ _id: exists._id }, { $set: doc })
      else await users.insertOne({ ...doc, createdAt: a.createdAt ?? new Date() })
      moved++
    }
    // `adminusers` is intentionally left in place as a backup.
  }

  // 3) Drop the stale clerkId index if present.
  try {
    const idx = await users.indexes()
    for (const i of idx) if (i.key && 'clerkId' in i.key) await users.dropIndex(i.name)
  } catch { /* no-op */ }

  console.log(`✅ Migration complete — ${moved} admin account(s) copied, ${normalised} user(s) normalised.`)
  console.log('   `adminusers` left in place as a backup; clerkId field + index removed from `users`.')
  await mongoose.disconnect()
  process.exit(0)
}
main().catch((e) => { console.error('❌ Migration failed:', e.message); process.exit(1) })
