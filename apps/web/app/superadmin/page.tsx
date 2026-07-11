'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, Container, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, InputAdornment, MenuItem,
  Paper, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField,
  Tooltip, Typography,
} from '@mui/material'
import {
  Add, Apartment, Block, Business, CheckCircle, Cloud, Groups, Key, Logout, Refresh,
  Save, Search, Tune, Widgets,
} from '@mui/icons-material'
import { MODULE_GROUPS, MODULE_KEYS, MODULES, PLAN_DEFAULTS, type PlanTier } from '@/lib/modules'

const GREEN = '#00A76F'
const DARK = '#1C252E'
const MUTED = '#637381'

const TIERS: Array<{ value: PlanTier; label: string }> = [
  { value: 'PRIME', label: 'Prime' },
  { value: 'ULTIMATE', label: 'Ultimate' },
  { value: 'ENTERPRISE', label: 'Enterprise' },
]

const LICENSE_STATUSES = ['TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED']
const COMPANY_STATUSES = ['ACTIVE', 'SUSPENDED']

type Me = {
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN'
  name: string
  companyId: string | null
  company: { name: string } | null
  license: { tier: string; enabledModules: string[]; sandboxLimit: number; maxUsers: number | null; maxAgencies: number | null } | null
}

type CompanyRow = {
  _id: string
  name: string
  adminName: string
  adminEmail: string
  tier: PlanTier
  status: 'ACTIVE' | 'SUSPENDED'
  createdAt: string
  userCount: number
  agencyCount: number
  environmentCount: number
  sandboxCount: number
  license: License | null
  admin: UserRow | null
}

type License = {
  _id: string
  tier: PlanTier
  status: string
  enabledModules: string[]
  maxUsers: number | null
  maxAgencies: number | null
  sandboxLimit: number | null
  seats: number | null
  validTo: string | null
  notes: string
}

type UserRow = {
  _id: string
  username: string
  name: string
  email: string
  role: string
  status: string
  agencyId?: string | null
  lastLogin?: string | null
  createdAt?: string
}

type AgencyRow = {
  _id: string
  name: string
  owner: string
  ownerEmail?: string
  status: string
  totalResources?: number
  environmentId?: string | null
  createdAt: string
}

type EnvironmentRow = {
  _id: string
  name: string
  type: 'PRODUCTION' | 'SANDBOX'
  status: string
  isDefault: boolean
  createdAt: string
}

type CompanyDetail = {
  company: CompanyRow
  license: License | null
  admin: UserRow | null
  users: UserRow[]
  agencies: AgencyRow[]
  environments: EnvironmentRow[]
  stats: { users: number; activeUsers: number; invitedUsers: number; agencies: number; environments: number; sandboxes: number; modules: number }
}

async function api(path: string, opts?: RequestInit) {
  const res = await fetch(`/api/v1/admin${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok && json.success, data: json.data, error: json?.error?.message ?? `HTTP ${res.status}` }
}

function tierChip(tier?: string) {
  const map: Record<string, string> = { PRIME: GREEN, ULTIMATE: '#8E33FF', ENTERPRISE: '#B76E00' }
  return <Chip label={tier ?? '—'} size="small" sx={{ fontWeight: 800, color: '#fff', bgcolor: map[tier ?? ''] ?? MUTED }} />
}

function statusChip(status?: string) {
  const active = status === 'ACTIVE'
  const danger = ['SUSPENDED', 'EXPIRED', 'CANCELLED'].includes(status ?? '')
  return (
    <Chip
      label={status ?? '—'}
      size="small"
      sx={{
        fontWeight: 800,
        color: active ? '#118D57' : danger ? '#B71D18' : '#B76E00',
        bgcolor: active ? '#D3FCD2' : danger ? '#FFE4DE' : '#FFF5CC',
      }}
    />
  )
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(145,158,171,.2)', minWidth: 150, flex: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="caption" sx={{ color: MUTED, fontWeight: 700 }}>{label}</Typography>
          <Typography variant="h5" sx={{ color: DARK, fontWeight: 900 }}>{value}</Typography>
        </Box>
        <Box sx={{ color: GREEN, display: 'grid', placeItems: 'center' }}>{icon}</Box>
      </Stack>
    </Paper>
  )
}

export default function AdminConsole() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((r) => r.json())
      .then((json) => {
        if (!json?.data?.authenticated) { router.replace('/login'); return }
        const { user, company, license } = json.data
        setMe({ ...user, company, license })
        setLoading(false)
      })
      .catch(() => router.replace('/login'))
  }, [router])

  async function logout() {
    await fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {})
    router.replace('/login')
  }

  if (loading || !me) {
    return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><CircularProgress sx={{ color: GREEN }} /></Box>
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4F6F8', fontFamily: 'Public Sans, sans-serif' }}>
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(145,158,171,.2)', position: 'sticky', top: 0, zIndex: 5 }}>
        <Container maxWidth="xl" sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: GREEN, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900 }}>R</Box>
            <Typography sx={{ fontWeight: 900, color: DARK }}>REP Admin Console</Typography>
            <Chip label={me.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Company Admin'} size="small" sx={{ fontWeight: 800, color: GREEN, bgcolor: 'rgba(0,167,111,.12)' }} />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="body2" sx={{ color: MUTED }}>{me.name}</Typography>
            <Button onClick={logout} startIcon={<Logout />} size="small" sx={{ textTransform: 'none', color: DARK }}>Logout</Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {me.role === 'SUPER_ADMIN' ? <SuperAdminView /> : <CompanyAdminView me={me} />}
      </Container>
    </Box>
  )
}

function SuperAdminView() {
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [detail, setDetail] = useState<CompanyDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [tierFilter, setTierFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [notice, setNotice] = useState<{ severity: 'success' | 'error' | 'warning'; message: string } | null>(null)

  const loadCompanies = useCallback(async () => {
    setLoading(true)
    const r = await api('/companies')
    if (r.ok) {
      setCompanies(r.data ?? [])
      if (!selectedId && r.data?.[0]?._id) setSelectedId(r.data[0]._id)
    } else {
      setNotice({ severity: 'error', message: r.error })
    }
    setLoading(false)
  }, [selectedId])

  const loadDetail = useCallback(async (id: string) => {
    if (!id) return
    setDetailLoading(true)
    const r = await api(`/companies/${id}`)
    if (r.ok) setDetail(r.data)
    else setNotice({ severity: 'error', message: r.error })
    setDetailLoading(false)
  }, [])

  useEffect(() => { void loadCompanies() }, [loadCompanies])
  useEffect(() => { void loadDetail(selectedId) }, [selectedId, loadDetail])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return companies.filter((c) => {
      const matchesSearch = !q || [c.name, c.adminEmail, c.adminName].some((v) => v?.toLowerCase().includes(q))
      const matchesTier = tierFilter === 'ALL' || c.license?.tier === tierFilter || c.tier === tierFilter
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter || c.license?.status === statusFilter
      return matchesSearch && matchesTier && matchesStatus
    })
  }, [companies, query, tierFilter, statusFilter])

  const totals = useMemo(() => ({
    companies: companies.length,
    active: companies.filter((c) => c.status === 'ACTIVE').length,
    users: companies.reduce((sum, c) => sum + (c.userCount ?? 0), 0),
    agencies: companies.reduce((sum, c) => sum + (c.agencyCount ?? 0), 0),
    sandboxes: companies.reduce((sum, c) => sum + (c.sandboxCount ?? 0), 0),
  }), [companies])

  async function afterMutation(message: string) {
    setNotice({ severity: 'success', message })
    await loadCompanies()
    await loadDetail(selectedId)
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: DARK }}>Super Admin</Typography>
          <Typography variant="body2" sx={{ color: MUTED }}>Companies, licenses, access, modules, and operational status</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => { void loadCompanies(); if (selectedId) void loadDetail(selectedId) }} sx={{ border: '1px solid rgba(145,158,171,.3)' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button onClick={() => setOpen(true)} variant="contained" startIcon={<Add />} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, bgcolor: DARK, '&:hover': { bgcolor: '#000' } }}>
            Onboard Company
          </Button>
        </Stack>
      </Stack>

      {notice && <Alert severity={notice.severity} onClose={() => setNotice(null)} sx={{ borderRadius: 2 }}>{notice.message}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <StatCard label="Companies" value={totals.companies} icon={<Business />} />
        <StatCard label="Active" value={totals.active} icon={<CheckCircle />} />
        <StatCard label="Users" value={totals.users} icon={<Groups />} />
        <StatCard label="Agencies" value={totals.agencies} icon={<Apartment />} />
        <StatCard label="Sandboxes" value={totals.sandboxes} icon={<Cloud />} />
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="stretch">
        <Paper elevation={0} sx={{ width: { xs: '100%', lg: 620 }, borderRadius: 2, border: '1px solid rgba(145,158,171,.2)', overflow: 'hidden' }}>
          <Box sx={{ p: 2, bgcolor: '#fff' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
              <TextField
                size="small"
                placeholder="Search companies"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ flex: 1 }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
              />
              <TextField size="small" select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} sx={{ minWidth: 130 }}>
                <MenuItem value="ALL">All tiers</MenuItem>
                {TIERS.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
              <TextField size="small" select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 145 }}>
                <MenuItem value="ALL">All statuses</MenuItem>
                {[...COMPANY_STATUSES, 'TRIAL', 'EXPIRED', 'CANCELLED'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Stack>
          </Box>
          <Divider />
          {loading ? (
            <Box sx={{ py: 8, display: 'grid', placeItems: 'center' }}><CircularProgress sx={{ color: GREEN }} /></Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#F4F6F8' }}>
                  {['Company', 'Tier', 'Users', 'Ops'].map((h) => <TableCell key={h} sx={{ fontWeight: 800, color: MUTED }}>{h}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 && <TableRow><TableCell colSpan={4} sx={{ py: 8, textAlign: 'center', color: '#919EAB' }}>No matching companies</TableCell></TableRow>}
                {filtered.map((c) => {
                  const selected = c._id === selectedId
                  return (
                    <TableRow
                      key={c._id}
                      hover
                      onClick={() => setSelectedId(c._id)}
                      sx={{ cursor: 'pointer', bgcolor: selected ? 'rgba(0,167,111,.08)' : undefined }}
                    >
                      <TableCell>
                        <Typography sx={{ fontWeight: 900, color: DARK }}>{c.name}</Typography>
                        <Typography variant="caption" sx={{ color: MUTED }}>{c.adminEmail}</Typography>
                      </TableCell>
                      <TableCell>{tierChip(c.license?.tier ?? c.tier)}</TableCell>
                      <TableCell sx={{ color: MUTED }}>{c.userCount ?? 0}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {statusChip(c.license?.status ?? c.status)}
                          <Typography variant="caption" sx={{ color: MUTED }}>{c.agencyCount ?? 0} agencies</Typography>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Paper elevation={0} sx={{ flex: 1, minWidth: 0, borderRadius: 2, border: '1px solid rgba(145,158,171,.2)', overflow: 'hidden' }}>
          {detailLoading ? (
            <Box sx={{ minHeight: 520, display: 'grid', placeItems: 'center' }}><CircularProgress sx={{ color: GREEN }} /></Box>
          ) : detail ? (
            <CompanyWorkspace detail={detail} onSaved={afterMutation} />
          ) : (
            <Box sx={{ minHeight: 520, display: 'grid', placeItems: 'center', color: MUTED }}>Select a company</Box>
          )}
        </Paper>
      </Stack>

      <OnboardDialog open={open} onClose={() => setOpen(false)} onDone={async (d) => {
        setOpen(false)
        const creds = d?.credentials ? ` Admin username ${d.credentials.username}, temp password ${d.credentials.tempPassword}.` : ''
        setNotice({ severity: 'success', message: `Company onboarded.${creds}` })
        await loadCompanies()
      }} />
    </Stack>
  )
}

function CompanyWorkspace({ detail, onSaved }: { detail: CompanyDetail; onSaved: (message: string) => Promise<void> }) {
  const [tab, setTab] = useState(0)
  const [companyForm, setCompanyForm] = useState({
    name: detail.company.name,
    adminName: detail.company.adminName,
    adminEmail: detail.company.adminEmail,
    status: detail.company.status,
  })
  const [licenseForm, setLicenseForm] = useState({
    tier: detail.license?.tier ?? detail.company.tier ?? 'PRIME',
    status: detail.license?.status ?? 'ACTIVE',
    maxUsers: detail.license?.maxUsers != null ? String(detail.license.maxUsers) : '',
    maxAgencies: detail.license?.maxAgencies != null ? String(detail.license.maxAgencies) : '',
    sandboxLimit: detail.license?.sandboxLimit != null ? String(detail.license.sandboxLimit) : '',
    seats: detail.license?.seats != null ? String(detail.license.seats) : '',
    validTo: detail.license?.validTo ? detail.license.validTo.slice(0, 10) : '',
    notes: detail.license?.notes ?? '',
    enabledModules: new Set<string>(detail.license?.enabledModules ?? PLAN_DEFAULTS[detail.company.tier ?? 'PRIME']),
  })
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [localNotice, setLocalNotice] = useState('')

  useEffect(() => {
    setCompanyForm({
      name: detail.company.name,
      adminName: detail.company.adminName,
      adminEmail: detail.company.adminEmail,
      status: detail.company.status,
    })
    setLicenseForm({
      tier: detail.license?.tier ?? detail.company.tier ?? 'PRIME',
      status: detail.license?.status ?? 'ACTIVE',
      maxUsers: detail.license?.maxUsers != null ? String(detail.license.maxUsers) : '',
      maxAgencies: detail.license?.maxAgencies != null ? String(detail.license.maxAgencies) : '',
      sandboxLimit: detail.license?.sandboxLimit != null ? String(detail.license.sandboxLimit) : '',
      seats: detail.license?.seats != null ? String(detail.license.seats) : '',
      validTo: detail.license?.validTo ? detail.license.validTo.slice(0, 10) : '',
      notes: detail.license?.notes ?? '',
      enabledModules: new Set<string>(detail.license?.enabledModules ?? PLAN_DEFAULTS[detail.company.tier ?? 'PRIME']),
    })
    setLocalNotice('')
  }, [detail])

  async function saveCompany() {
    setSaving(true)
    const r = await api(`/companies/${detail.company._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ company: companyForm }),
    })
    setSaving(false)
    if (!r.ok) { setLocalNotice(r.error); return }
    await onSaved('Company settings saved')
  }

  async function saveLicense() {
    setSaving(true)
    const r = await api(`/companies/${detail.company._id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        license: {
          ...licenseForm,
          enabledModules: Array.from(licenseForm.enabledModules),
        },
      }),
    })
    setSaving(false)
    if (!r.ok) { setLocalNotice(r.error); return }
    await onSaved('License updated')
  }

  async function toggleCompanyStatus() {
    const next = detail.company.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    setSaving(true)
    const r = await api(`/companies/${detail.company._id}`, {
      method: 'PATCH',
      body: JSON.stringify({ company: { status: next }, license: { status: next === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED' } }),
    })
    setSaving(false)
    if (!r.ok) { setLocalNotice(r.error); return }
    await onSaved(next === 'ACTIVE' ? 'Company reactivated' : 'Company suspended')
  }

  async function resetAdminPassword() {
    setResetting(true)
    const r = await api(`/companies/${detail.company._id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'RESET_ADMIN_PASSWORD' }),
    })
    setResetting(false)
    if (!r.ok) { setLocalNotice(r.error); return }
    const c = r.data.credentials
    setLocalNotice(`Admin reset: username ${c.username}, temp password ${c.tempPassword}`)
  }

  function setTier(tier: PlanTier) {
    setLicenseForm((prev) => ({ ...prev, tier, sandboxLimit: String({ PRIME: 1, ULTIMATE: 3, ENTERPRISE: 10 }[tier]), enabledModules: new Set(PLAN_DEFAULTS[tier]) }))
  }

  function toggleModule(key: string) {
    setLicenseForm((prev) => {
      const enabledModules = new Set(prev.enabledModules)
      if (enabledModules.has(key)) enabledModules.delete(key)
      else enabledModules.add(key)
      return { ...prev, enabledModules }
    })
  }

  const sandboxLimit = Number(licenseForm.sandboxLimit || detail.license?.sandboxLimit || 0)
  const userLimit = licenseForm.maxUsers ? Number(licenseForm.maxUsers) : null
  const agencyLimit = licenseForm.maxAgencies ? Number(licenseForm.maxAgencies) : null

  return (
    <Box>
      <Box sx={{ p: 2.5, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="h5" sx={{ fontWeight: 900, color: DARK }}>{detail.company.name}</Typography>
              {tierChip(detail.license?.tier ?? detail.company.tier)}
              {statusChip(detail.license?.status ?? detail.company.status)}
            </Stack>
            <Typography variant="body2" sx={{ mt: 0.5, color: MUTED }}>{detail.company.adminEmail}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button onClick={resetAdminPassword} disabled={resetting} startIcon={<Key />} variant="outlined" sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}>
              {resetting ? 'Resetting' : 'Reset Admin'}
            </Button>
            <Button onClick={toggleCompanyStatus} disabled={saving} startIcon={detail.company.status === 'ACTIVE' ? <Block /> : <CheckCircle />} variant="contained"
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, bgcolor: detail.company.status === 'ACTIVE' ? '#B71D18' : GREEN, '&:hover': { bgcolor: detail.company.status === 'ACTIVE' ? '#7A0916' : '#007867' } }}>
              {detail.company.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
            </Button>
          </Stack>
        </Stack>
      </Box>
      <Divider />

      <Box sx={{ p: 2 }}>
        {localNotice && <Alert severity={localNotice.startsWith('Admin reset') ? 'success' : 'warning'} onClose={() => setLocalNotice('')} sx={{ mb: 2, borderRadius: 2 }}>{localNotice}</Alert>}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
          <StatCard label="Users" value={`${detail.stats.users}${userLimit ? ` / ${userLimit}` : ''}`} icon={<Groups />} />
          <StatCard label="Agencies" value={`${detail.stats.agencies}${agencyLimit ? ` / ${agencyLimit}` : ''}`} icon={<Apartment />} />
          <StatCard label="Sandboxes" value={`${detail.stats.sandboxes} / ${sandboxLimit || 0}`} icon={<Cloud />} />
          <StatCard label="Modules" value={`${licenseForm.enabledModules.size} / ${MODULE_KEYS.length}`} icon={<Widgets />} />
        </Stack>

        <Paper elevation={0} sx={{ border: '1px solid rgba(145,158,171,.2)', borderRadius: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" sx={{ px: 1, '& .MuiTab-root': { textTransform: 'none', fontWeight: 800 }, '& .Mui-selected': { color: GREEN + ' !important' }, '& .MuiTabs-indicator': { bgcolor: GREEN } }}>
            <Tab label="Company" icon={<Business fontSize="small" />} iconPosition="start" />
            <Tab label="License & Modules" icon={<Tune fontSize="small" />} iconPosition="start" />
            <Tab label="Users" icon={<Groups fontSize="small" />} iconPosition="start" />
            <Tab label="Agencies" icon={<Apartment fontSize="small" />} iconPosition="start" />
            <Tab label="Environments" icon={<Cloud fontSize="small" />} iconPosition="start" />
          </Tabs>
          <Divider />
          <Box sx={{ p: 2 }}>
            {tab === 0 && (
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField label="Company name" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} fullWidth />
                  <TextField label="Status" select value={companyForm.status} onChange={(e) => setCompanyForm({ ...companyForm, status: e.target.value as 'ACTIVE' | 'SUSPENDED' })} sx={{ minWidth: 180 }}>
                    {COMPANY_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField label="Admin name" value={companyForm.adminName} onChange={(e) => setCompanyForm({ ...companyForm, adminName: e.target.value })} fullWidth />
                  <TextField label="Admin email" value={companyForm.adminEmail} onChange={(e) => setCompanyForm({ ...companyForm, adminEmail: e.target.value })} fullWidth />
                </Stack>
                <InfoTable rows={[
                  ['Admin username', detail.admin?.username ?? '—'],
                  ['Last admin login', detail.admin?.lastLogin ? new Date(detail.admin.lastLogin).toLocaleString() : 'Never'],
                  ['Created', new Date(detail.company.createdAt).toLocaleString()],
                ]} />
                <Box><Button onClick={saveCompany} disabled={saving} startIcon={<Save />} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, bgcolor: DARK }}>Save Company</Button></Box>
              </Stack>
            )}

            {tab === 1 && (
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField label="Tier" select value={licenseForm.tier} onChange={(e) => setTier(e.target.value as PlanTier)} sx={{ minWidth: 180 }}>
                    {TIERS.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
                  </TextField>
                  <TextField label="License status" select value={licenseForm.status} onChange={(e) => setLicenseForm({ ...licenseForm, status: e.target.value })} sx={{ minWidth: 190 }}>
                    {LICENSE_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                  <TextField label="Valid to" type="date" value={licenseForm.validTo} onChange={(e) => setLicenseForm({ ...licenseForm, validTo: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ minWidth: 180 }} />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField label="Max users" value={licenseForm.maxUsers} onChange={(e) => setLicenseForm({ ...licenseForm, maxUsers: e.target.value })} placeholder="Unlimited" />
                  <TextField label="Max agencies" value={licenseForm.maxAgencies} onChange={(e) => setLicenseForm({ ...licenseForm, maxAgencies: e.target.value })} placeholder="Unlimited" />
                  <TextField label="Sandbox limit" value={licenseForm.sandboxLimit} onChange={(e) => setLicenseForm({ ...licenseForm, sandboxLimit: e.target.value })} />
                  <TextField label="Seats" value={licenseForm.seats} onChange={(e) => setLicenseForm({ ...licenseForm, seats: e.target.value })} placeholder="Optional" />
                </Stack>
                <TextField label="Internal notes" multiline minRows={2} value={licenseForm.notes} onChange={(e) => setLicenseForm({ ...licenseForm, notes: e.target.value })} fullWidth />
                <Box sx={{ border: '1px solid rgba(145,158,171,.2)', borderRadius: 2, p: 2, maxHeight: 360, overflow: 'auto' }}>
                  {MODULE_GROUPS.map((group) => (
                    <Box key={group} sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: MUTED, fontWeight: 900, textTransform: 'uppercase' }}>{group}</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: '1fr 1fr 1fr' }, gap: 0.5 }}>
                        {MODULE_KEYS.filter((k) => MODULES[k].group === group).map((key) => (
                          <FormControlLabel
                            key={key}
                            control={<Checkbox checked={licenseForm.enabledModules.has(key)} onChange={() => toggleModule(key)} size="small" sx={{ color: GREEN, '&.Mui-checked': { color: GREEN } }} />}
                            label={<Typography variant="body2" sx={{ fontWeight: 700 }}>{MODULES[key].label}</Typography>}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box><Button onClick={saveLicense} disabled={saving} startIcon={<Save />} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, bgcolor: DARK }}>Save License</Button></Box>
              </Stack>
            )}

            {tab === 2 && <DataTable headers={['Name', 'Email', 'Role', 'Status', 'Last login']} rows={detail.users.map((u) => [u.name, u.email, u.role, u.status, u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'])} />}
            {tab === 3 && <DataTable headers={['Agency', 'Owner', 'Resources', 'Status', 'Created']} rows={detail.agencies.map((a) => [a.name, a.ownerEmail || a.owner, String(a.totalResources ?? 0), a.status, new Date(a.createdAt).toLocaleDateString()])} />}
            {tab === 4 && <DataTable headers={['Environment', 'Type', 'Status', 'Default', 'Created']} rows={detail.environments.map((e) => [e.name, e.type, e.status, e.isDefault ? 'Yes' : 'No', new Date(e.createdAt).toLocaleDateString()])} />}
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

function InfoTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <Table size="small">
      <TableBody>{rows.map(([k, v]) => <TableRow key={k}><TableCell sx={{ color: MUTED, fontWeight: 800, width: 180 }}>{k}</TableCell><TableCell sx={{ color: DARK }}>{v}</TableCell></TableRow>)}</TableBody>
    </Table>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <Table size="small">
      <TableHead><TableRow>{headers.map((h) => <TableCell key={h} sx={{ fontWeight: 900, color: MUTED }}>{h}</TableCell>)}</TableRow></TableHead>
      <TableBody>
        {rows.length === 0 && <TableRow><TableCell colSpan={headers.length} sx={{ textAlign: 'center', py: 5, color: '#919EAB' }}>No records</TableCell></TableRow>}
        {rows.map((row, idx) => <TableRow key={idx} hover>{row.map((cell, i) => <TableCell key={`${idx}-${i}`} sx={{ color: i === 0 ? DARK : MUTED, fontWeight: i === 0 ? 800 : 500 }}>{cell}</TableCell>)}</TableRow>)}
      </TableBody>
    </Table>
  )
}

function OnboardDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (d: any) => void }) {
  const [f, setF] = useState({ name: '', adminName: '', adminEmail: '', tier: 'PRIME' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setError('')
    setLoading(true)
    const r = await api('/companies', { method: 'POST', body: JSON.stringify(f) })
    setLoading(false)
    if (!r.ok) { setError(r.error); return }
    setF({ name: '', adminName: '', adminEmail: '', tier: 'PRIME' })
    onDone(r.data)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 900 }}>Onboard Company</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Company name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} fullWidth required />
          <TextField label="Company admin name" value={f.adminName} onChange={(e) => setF({ ...f, adminName: e.target.value })} fullWidth required />
          <TextField label="Company admin email" type="email" value={f.adminEmail} onChange={(e) => setF({ ...f, adminEmail: e.target.value })} fullWidth required />
          <TextField label="License tier" select value={f.tier} onChange={(e) => setF({ ...f, tier: e.target.value })} fullWidth>
            {TIERS.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: MUTED }}>Cancel</Button>
        <Button onClick={submit} disabled={loading} variant="contained" sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, bgcolor: DARK }}>
          {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function CompanyAdminView({ me }: { me: Me }) {
  const [tab, setTab] = useState(0)
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, color: DARK }}>{me.company?.name ?? 'Your company'}</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
          {tierChip(me.license?.tier)}
          <Typography variant="body2" sx={{ color: MUTED }}>
            {me.license?.enabledModules?.length ?? 0} modules · {me.license?.sandboxLimit ?? 1} sandbox allowance
          </Typography>
        </Stack>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(145,158,171,.2)' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 800 }, '& .Mui-selected': { color: GREEN + ' !important' }, '& .MuiTabs-indicator': { bgcolor: GREEN } }}>
          <Tab icon={<Business fontSize="small" />} iconPosition="start" label="Agencies" />
          <Tab icon={<Groups fontSize="small" />} iconPosition="start" label="Users" />
          <Tab icon={<Cloud fontSize="small" />} iconPosition="start" label="Environments" />
        </Tabs>
        <Divider />
        <Box sx={{ p: 3 }}>
          {tab === 0 && <AgenciesPanel />}
          {tab === 1 && <UsersPanel />}
          {tab === 2 && <EnvironmentsPanel />}
        </Box>
      </Paper>
    </>
  )
}

function AgenciesPanel() {
  const [rows, setRows] = useState<any[]>([])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const load = useCallback(() => { void api('/agencies').then((r) => r.ok && setRows(r.data)) }, [])
  useEffect(() => { load() }, [load])

  async function add() {
    setError('')
    const r = await api('/agencies', { method: 'POST', body: JSON.stringify({ name }) })
    if (!r.ok) return setError(r.error)
    setName('')
    load()
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField size="small" label="New agency name" value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1 }} />
        <Button onClick={add} variant="contained" startIcon={<Add />} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, bgcolor: GREEN }}>Add Agency</Button>
      </Stack>
      <DataTable headers={['Name', 'Status', 'Created']} rows={rows.map((a) => [a.name, a.status, new Date(a.createdAt).toLocaleDateString()])} />
    </Box>
  )
}

function UsersPanel() {
  const [rows, setRows] = useState<any[]>([])
  const [agencies, setAgencies] = useState<any[]>([])
  const [f, setF] = useState({ name: '', email: '', role: 'VIEWER', agencyId: '' })
  const [error, setError] = useState('')
  const load = useCallback(() => {
    void api('/users').then((r) => r.ok && setRows(r.data))
    void api('/agencies').then((r) => r.ok && setAgencies(r.data))
  }, [])
  useEffect(() => { load() }, [load])

  async function invite() {
    setError('')
    const r = await api('/users', { method: 'POST', body: JSON.stringify(f) })
    if (!r.ok) return setError(r.error)
    setF({ name: '', email: '', role: 'VIEWER', agencyId: '' })
    load()
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mb: 2 }}>
        <TextField size="small" label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <TextField size="small" label="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} sx={{ flex: 1 }} />
        <TextField size="small" select label="Role" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} sx={{ minWidth: 130 }}>
          {['VIEWER', 'MEMBER', 'MANAGER'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </TextField>
        <TextField size="small" select label="Agency" value={f.agencyId} onChange={(e) => setF({ ...f, agencyId: e.target.value })} sx={{ minWidth: 160 }}>
          {agencies.map((a) => <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>)}
        </TextField>
        <Button onClick={invite} variant="contained" startIcon={<Add />} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, bgcolor: GREEN }}>Invite</Button>
      </Stack>
      <DataTable headers={['Name', 'Email', 'Role', 'Status']} rows={rows.map((u) => [u.name, u.email, u.role, u.status])} />
    </Box>
  )
}

function EnvironmentsPanel() {
  const [data, setData] = useState<{ environments: any[]; sandboxCount: number; sandboxLimit: number; canCreateSandbox: boolean } | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const load = useCallback(() => { void api('/environments').then((r) => r.ok && setData(r.data)) }, [])
  useEffect(() => { load() }, [load])

  async function addSandbox() {
    setError('')
    const r = await api('/environments', { method: 'POST', body: JSON.stringify({ name }) })
    if (!r.ok) return setError(r.error)
    setName('')
    load()
  }

  return (
    <Box>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      <Typography variant="body2" sx={{ color: MUTED, mb: 2 }}>Sandboxes used: <b>{data?.sandboxCount ?? 0}</b> / {data?.sandboxLimit ?? 1}</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField size="small" label="Sandbox name" value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1 }} disabled={!data?.canCreateSandbox} />
        <Button onClick={addSandbox} disabled={!data?.canCreateSandbox} variant="contained" startIcon={<Add />} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, bgcolor: GREEN }}>Create Sandbox</Button>
      </Stack>
      <DataTable headers={['Name', 'Type', 'Status']} rows={(data?.environments ?? []).map((e) => [e.name + (e.isDefault ? ' (default)' : ''), e.type, e.status])} />
    </Box>
  )
}
