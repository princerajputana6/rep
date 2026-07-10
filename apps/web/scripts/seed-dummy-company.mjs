// Seed a dummy company + Enterprise license + production environment +
// COMPANY_ADMIN login, so the whole portal is reachable via password auth.
//
//   node scripts/seed-dummy-company.mjs
//
// Login afterwards at /superadmin/login with the printed credentials.
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

const S = mongoose.Schema
const Company = mongoose.models.Company || mongoose.model('Company', new S({ name: String, slug: { type: String, unique: true }, adminEmail: String, adminName: String, tier: String, status: String, createdBy: String }, { timestamps: true }))
const License = mongoose.models.License || mongoose.model('License', new S({ companyId: { type: String, unique: true }, tier: String, status: String, enabledModules: [String], maxUsers: Number, maxAgencies: Number, sandboxLimit: Number, seats: Number, validFrom: Date, validTo: Date, issuedBy: String, notes: String }, { timestamps: true }))
const Environment = mongoose.models.Environment || mongoose.model('Environment', new S({ companyId: String, name: String, type: String, status: String, isDefault: Boolean, createdBy: String }, { timestamps: true }))
const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', new S({ username: { type: String, unique: true }, email: { type: String, unique: true }, passwordHash: String, name: String, role: String, companyId: { type: String, default: null }, status: String, mustResetPassword: Boolean, lastLogin: Date, createdBy: String }, { timestamps: true }))

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)

  let company = await Company.findOne({ adminEmail: EMAIL })
  if (!company) {
    company = await Company.create({ name: COMPANY, slug: USERNAME, adminEmail: EMAIL, adminName: 'Acme Admin', tier: 'ENTERPRISE', status: 'ACTIVE', createdBy: 'seed' })
  }
  const companyId = String(company._id)

  await License.findOneAndUpdate(
    { companyId },
    { companyId, tier: 'ENTERPRISE', status: 'ACTIVE', enabledModules: ALL_MODULES, sandboxLimit: 10, issuedBy: 'seed', validFrom: new Date() },
    { upsert: true }
  )

  const hasProd = await Environment.findOne({ companyId, type: 'PRODUCTION' })
  if (!hasProd) {
    await Environment.create({ companyId, name: 'Production', type: 'PRODUCTION', status: 'ACTIVE', isDefault: true, createdBy: 'seed' })
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10)
  await AdminUser.findOneAndUpdate(
    { username: USERNAME },
    { username: USERNAME, email: EMAIL, passwordHash, name: 'Acme Admin', role: 'COMPANY_ADMIN', companyId, status: 'ACTIVE', mustResetPassword: false, createdBy: 'seed' },
    { upsert: true }
  )

  // --- sample content so the portal isn't empty -----------------------------
  const db = mongoose.connection.db
  const env = await Environment.findOne({ companyId, type: 'PRODUCTION' })
  const environmentId = String(env._id)
  const Agencies = db.collection('agencies')
  const Projects = db.collection('projects')
  const Resources = db.collection('resources')
  const Clients = db.collection('clients')

  let agency = await Agencies.findOne({ companyId, name: 'Acme Creative' })
  if (!agency) {
    const r = await Agencies.insertOne({ name: 'Acme Creative', companyId, environmentId, owner: 'Acme Admin', totalResources: 5, participationLevel: 'full', status: 'ACTIVE', createdBy: 'seed', createdAt: new Date(), updatedAt: new Date() })
    agency = { _id: r.insertedId }
  }
  const agencyId = agency._id // ObjectId

  if (await Projects.countDocuments({ agencyId }) === 0) {
    const client = await Clients.insertOne({ name: 'Globex Corp', industry: 'Retail', agencyId: String(agencyId), status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() })
    const now = Date.now()
    const projects = [
      ['Brand Refresh 2026', 'ACTIVE', 120000, 68, 'low'],
      ['Q3 Campaign Launch', 'ACTIVE', 85000, 42, 'medium'],
      ['E-commerce Replatform', 'ACTIVE', 240000, 91, 'high'],
      ['Social Content Engine', 'ON_HOLD', 40000, 15, 'low'],
    ].map(([name, status, budget, burn, risk], i) => ({
      name, status, type: 'fixed', budget, allocated: Math.round(budget * (burn / 100)),
      budgetBurnPct: burn, healthScore: 90 - i * 8, deliveryConfidence: 85 - i * 6, riskLevel: risk,
      clientId: client.insertedId, agencyId, startDate: new Date(now - 60 * 864e5), endDate: new Date(now + 90 * 864e5),
      createdAt: new Date(), updatedAt: new Date(),
    }))
    await Projects.insertMany(projects)

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
  console.log('  Company Admin login')
  console.log('  URL:      /superadmin/login')
  console.log(`  Username: ${USERNAME}`)
  console.log(`  Password: ${PASSWORD}`)
  console.log('  → admin console at /superadmin, full portal at /dashboard')
  console.log('────────────────────────────────────────\n')

  await mongoose.disconnect()
  process.exit(0)
}
main().catch((e) => { console.error('❌ Seed failed:', e.message); process.exit(1) })
