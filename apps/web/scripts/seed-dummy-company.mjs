// Seed a dummy company + Enterprise license + production environment +
// COMPANY_ADMIN login + sample content, so the whole portal is demoable.
//
//   npm run seed:dummy
//
// Sign in at /login with the printed credentials.
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
if (!process.env.MONGODB_URI) { console.error('❌ MONGODB_URI not set'); process.exit(1) }

const USERNAME = (process.env.DUMMY_USERNAME || 'acme').toLowerCase()
const PASSWORD = process.env.DUMMY_PASSWORD || 'Acme!2026'
const EMAIL = (process.env.DUMMY_EMAIL || 'admin@acme.test').toLowerCase()
const COMPANY = process.env.DUMMY_COMPANY || 'Acme Inc'

const ALL_MODULES = [
  'DASHBOARD','HOME','AGENCIES','SUB_AGENCIES','TIE_UPS','RESOURCE_POOLS','USERS','JOB_ROLES','RATE_CARDS',
  'PORTFOLIOS','PROGRAMS','PROJECTS','TASKS','ASSIGNMENTS','TIMESHEETS','STAFFING_PLANNER','BORROW_REQUESTS',
  'APPROVALS','FINANCIALS','BUDGET_ALERTS','CLIENT_PROFITABILITY','CLIENT_MASTER','CURRENCY_MAPPING','KPI_REPORTS',
  'CAPACITY','HIDDEN_CAPACITY','ANALYTICS','AI_COPILOT','AI_MATCHING','PREDICTIVE_PLANNING','GAMIFICATION',
  'CAMPAIGN_MAPPER','INTEGRATIONS_CORE','INTEGRATIONS_WORKFRONT','INTEGRATIONS_CLICKUP','WEBHOOKS','API_KEYS',
  'AUDIT_LOGS','ACCESS_RULES','RECYCLE_BIN','UI_CUSTOMIZATION','NOTIFICATIONS','CUSTOM_FORMS','SETTINGS',
]

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db
  const Companies = db.collection('companies')
  const Licenses = db.collection('licenses')
  const Environments = db.collection('environments')
  const Users = db.collection('users')
  const Agencies = db.collection('agencies')
  const Projects = db.collection('projects')
  const Resources = db.collection('resources')
  const Clients = db.collection('clients')

  let company = await Companies.findOne({ adminEmail: EMAIL })
  if (!company) {
    const r = await Companies.insertOne({ name: COMPANY, slug: USERNAME, adminEmail: EMAIL, adminName: 'Acme Admin', tier: 'ENTERPRISE', status: 'ACTIVE', createdBy: 'seed', createdAt: new Date(), updatedAt: new Date() })
    company = { _id: r.insertedId }
  }
  const companyId = String(company._id)

  await Licenses.updateOne(
    { companyId },
    { $set: { companyId, tier: 'ENTERPRISE', status: 'ACTIVE', enabledModules: ALL_MODULES, sandboxLimit: 10, issuedBy: 'seed', validFrom: new Date(), updatedAt: new Date() } },
    { upsert: true }
  )

  let env = await Environments.findOne({ companyId, type: 'PRODUCTION' })
  if (!env) {
    const r = await Environments.insertOne({ companyId, name: 'Production', type: 'PRODUCTION', status: 'ACTIVE', isDefault: true, createdBy: 'seed', createdAt: new Date(), updatedAt: new Date() })
    env = { _id: r.insertedId }
  }
  const environmentId = String(env._id)

  let agency = await Agencies.findOne({ companyId, name: 'Acme Creative' })
  if (!agency) {
    const r = await Agencies.insertOne({ name: 'Acme Creative', companyId, environmentId, owner: 'Acme Admin', totalResources: 5, participationLevel: 'full', status: 'ACTIVE', createdBy: 'seed', createdAt: new Date(), updatedAt: new Date() })
    agency = { _id: r.insertedId }
  }
  const agencyId = agency._id // ObjectId

  const passwordHash = await bcrypt.hash(PASSWORD, 10)
  await Users.updateOne(
    { username: USERNAME },
    { $set: { username: USERNAME, email: EMAIL, passwordHash, name: 'Acme Admin', role: 'COMPANY_ADMIN', companyId, agencyId: null, environmentId, status: 'ACTIVE', mustResetPassword: false, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  )

  // --- sample content -------------------------------------------------------
  if (await Projects.countDocuments({ agencyId }) === 0) {
    const client = await Clients.insertOne({ name: 'Globex Corp', industry: 'Retail', agencyId: String(agencyId), status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() })
    const now = Date.now()
    await Projects.insertMany([
      ['Brand Refresh 2026', 'ACTIVE', 120000, 68, 'low'],
      ['Q3 Campaign Launch', 'ACTIVE', 85000, 42, 'medium'],
      ['E-commerce Replatform', 'ACTIVE', 240000, 91, 'high'],
      ['Social Content Engine', 'ON_HOLD', 40000, 15, 'low'],
    ].map(([name, status, budget, burn, risk], i) => ({
      name, status, type: 'fixed', budget, allocated: Math.round(budget * (burn / 100)),
      budgetBurnPct: burn, healthScore: 90 - i * 8, deliveryConfidence: 85 - i * 6, riskLevel: risk,
      clientId: client.insertedId, agencyId, startDate: new Date(now - 60 * 864e5), endDate: new Date(now + 90 * 864e5),
      createdAt: new Date(), updatedAt: new Date(),
    })))

    const roles = ['Art Director', 'Copywriter', 'UX Designer', 'Developer', 'Account Manager']
    await Resources.insertMany(roles.map((role, i) => ({
      name: ['Jayvion Simon', 'Lucian Obrien', 'Deja Brady', 'Harrison Stein', 'Reece Chung'][i],
      email: `resource${i + 1}@acme.test`, agencyId, role, skills: [role.split(' ')[0]],
      availability: [80, 100, 60, 100, 90][i], hourlyRate: [140, 110, 120, 160, 130][i], active: true,
      createdAt: new Date(), updatedAt: new Date(),
    })))
  }

  console.log('\n────────────────────────────────────────')
  console.log(`  Dummy company:  ${COMPANY} (ENTERPRISE, all modules)`)
  console.log('  Company Admin login  →  /login')
  console.log(`  Username: ${USERNAME}   (or email: ${EMAIL})`)
  console.log(`  Password: ${PASSWORD}`)
  console.log('────────────────────────────────────────\n')

  await mongoose.disconnect()
  process.exit(0)
}
main().catch((e) => { console.error('❌ Seed failed:', e.message); process.exit(1) })
