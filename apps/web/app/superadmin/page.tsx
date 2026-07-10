'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Container, Typography, Button, Chip, Paper, Table, TableHead, TableBody, TableRow, TableCell,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress,
  Tabs, Tab, Stack, Divider, Tooltip,
} from '@mui/material'
import { Add, Logout, Business, Groups, Cloud } from '@mui/icons-material'

const GREEN = '#00A76F'
const DARK = '#1C252E'

const TIERS = [
  { value: 'PRIME', label: 'Prime — core features' },
  { value: 'ULTIMATE', label: 'Ultimate — + API & integrations' },
  { value: 'ENTERPRISE', label: 'Enterprise — everything + custom' },
]

type Me = {
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN'
  name: string
  companyId: string | null
  company: { name: string } | null
  license: { tier: string; enabledModules: string[]; sandboxLimit: number; maxUsers: number | null; maxAgencies: number | null } | null
}

async function api(path: string, opts?: RequestInit) {
  const res = await fetch(`/api/v1/admin${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok && json.success, data: json.data, error: json?.error?.message }
}

function tierChip(tier?: string) {
  const map: Record<string, string> = { PRIME: '#00A76F', ULTIMATE: '#8E33FF', ENTERPRISE: '#B76E00' }
  return <Chip label={tier ?? '—'} size="small" sx={{ fontWeight: 700, color: '#fff', bgcolor: map[tier ?? ''] ?? '#637381' }} />
}

export default function AdminConsole() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/auth/me').then((r) => {
      if (!r.ok) { router.replace('/superadmin/login'); return }
      setMe(r.data)
      setLoading(false)
    })
  }, [router])

  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    router.replace('/superadmin/login')
  }

  if (loading || !me) {
    return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}><CircularProgress sx={{ color: GREEN }} /></Box>
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F4F6F8', fontFamily: 'Public Sans, sans-serif' }}>
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(145,158,171,.2)' }}>
        <Container maxWidth="lg" sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: GREEN, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>R</Box>
            <Typography sx={{ fontWeight: 800, color: DARK }}>REP Admin Console</Typography>
            <Chip label={me.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Company Admin'} size="small"
              sx={{ ml: 1, fontWeight: 700, color: GREEN, bgcolor: 'rgba(0,167,111,.12)' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#637381' }}>{me.name}</Typography>
            <Button onClick={logout} startIcon={<Logout />} size="small" sx={{ textTransform: 'none', color: DARK }}>Logout</Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {me.role === 'SUPER_ADMIN' ? <SuperAdminView /> : <CompanyAdminView me={me} />}
      </Container>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// SUPER ADMIN
// ---------------------------------------------------------------------------
function SuperAdminView() {
  const [companies, setCompanies] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [creds, setCreds] = useState<{ username: string; tempPassword: string; email: any } | null>(null)

  const load = useCallback(() => { api('/companies').then((r) => r.ok && setCompanies(r.data)) }, [])
  useEffect(() => { load() }, [load])

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: DARK }}>Companies</Typography>
          <Typography variant="body2" sx={{ color: '#637381' }}>Issue licenses and onboard client companies</Typography>
        </Box>
        <Button onClick={() => setOpen(true)} variant="contained" startIcon={<Add />}
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: DARK, '&:hover': { bgcolor: '#000' } }}>
          Onboard company
        </Button>
      </Box>

      {creds && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setCreds(null)}>
          <Typography sx={{ fontWeight: 700 }}>Company onboarded.</Typography>
          <Typography variant="body2">
            Admin credentials — username <b>{creds.username}</b>, temp password <b>{creds.tempPassword}</b>.{' '}
            {creds.email?.delivered ? 'Emailed to the admin.' : 'Email not delivered (set RESEND_API_KEY) — share these manually.'}
          </Typography>
        </Alert>
      )}

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(145,158,171,.2)', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F4F6F8' }}>
              {['Company', 'Admin email', 'Tier', 'Status', 'Sandboxes'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: '#637381' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.length === 0 && (
              <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#919EAB' }}>No companies yet — onboard your first client.</TableCell></TableRow>
            )}
            {companies.map((c) => (
              <TableRow key={c._id} hover>
                <TableCell sx={{ fontWeight: 700, color: DARK }}>{c.name}</TableCell>
                <TableCell sx={{ color: '#637381' }}>{c.adminEmail}</TableCell>
                <TableCell>{tierChip(c.tier)}</TableCell>
                <TableCell><Chip label={c.status} size="small" sx={{ fontWeight: 700, color: c.status === 'ACTIVE' ? '#118D57' : '#B71D18', bgcolor: c.status === 'ACTIVE' ? '#D3FCD2' : '#FFE4DE' }} /></TableCell>
                <TableCell sx={{ color: '#637381' }}>{c.license?.sandboxLimit ?? 1}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <OnboardDialog open={open} onClose={() => setOpen(false)} onDone={(d) => { setCreds(d); load() }} />
    </>
  )
}

function OnboardDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (d: any) => void }) {
  const [f, setF] = useState({ name: '', adminName: '', adminEmail: '', tier: 'PRIME' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setError(''); setLoading(true)
    const r = await api('/companies', { method: 'POST', body: JSON.stringify(f) })
    setLoading(false)
    if (!r.ok) { setError(r.error ?? 'Failed'); return }
    onDone(r.data.credentials ? { ...r.data.credentials, email: r.data.email } : null)
    setF({ name: '', adminName: '', adminEmail: '', tier: 'PRIME' })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Onboard a company</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Company name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} fullWidth required />
          <TextField label="Company admin name" value={f.adminName} onChange={(e) => setF({ ...f, adminName: e.target.value })} fullWidth required />
          <TextField label="Company admin email" type="email" value={f.adminEmail} onChange={(e) => setF({ ...f, adminEmail: e.target.value })} fullWidth required helperText="Login credentials are emailed here" />
          <TextField label="License tier" select value={f.tier} onChange={(e) => setF({ ...f, tier: e.target.value })} fullWidth>
            {TIERS.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#637381' }}>Cancel</Button>
        <Button onClick={submit} disabled={loading} variant="contained"
          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: DARK, '&:hover': { bgcolor: '#000' } }}>
          {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Create & send invite'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// COMPANY ADMIN
// ---------------------------------------------------------------------------
function CompanyAdminView({ me }: { me: Me }) {
  const [tab, setTab] = useState(0)
  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: DARK }}>{me.company?.name ?? 'Your company'}</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
          {tierChip(me.license?.tier)}
          <Typography variant="body2" sx={{ color: '#637381' }}>
            {me.license?.enabledModules?.length ?? 0} modules · {me.license?.sandboxLimit ?? 1} sandbox allowance
          </Typography>
        </Stack>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(145,158,171,.2)' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700 }, '& .Mui-selected': { color: GREEN + ' !important' }, '& .MuiTabs-indicator': { bgcolor: GREEN } }}>
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
  const load = useCallback(() => api('/agencies').then((r) => r.ok && setRows(r.data)), [])
  useEffect(() => { load() }, [load])

  async function add() {
    setError('')
    const r = await api('/agencies', { method: 'POST', body: JSON.stringify({ name }) })
    if (!r.ok) return setError(r.error ?? 'Failed')
    setName(''); load()
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField size="small" label="New agency name" value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1 }} />
        <Button onClick={add} variant="contained" startIcon={<Add />} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: GREEN, '&:hover': { bgcolor: '#007867' } }}>Add agency</Button>
      </Stack>
      <Table size="small">
        <TableHead><TableRow>{['Name', 'Status', 'Created'].map((h) => <TableCell key={h} sx={{ fontWeight: 700, color: '#637381' }}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>
          {rows.length === 0 && <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center', py: 4, color: '#919EAB' }}>No agencies yet.</TableCell></TableRow>}
          {rows.map((a) => (
            <TableRow key={a._id} hover>
              <TableCell sx={{ fontWeight: 700, color: DARK }}>{a.name}</TableCell>
              <TableCell><Chip label={a.status} size="small" sx={{ fontWeight: 700, color: '#118D57', bgcolor: '#D3FCD2' }} /></TableCell>
              <TableCell sx={{ color: '#637381' }}>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

function UsersPanel() {
  const [rows, setRows] = useState<any[]>([])
  const [agencies, setAgencies] = useState<any[]>([])
  const [f, setF] = useState({ name: '', email: '', role: 'VIEWER', agencyId: '' })
  const [error, setError] = useState('')
  const load = useCallback(() => {
    api('/users').then((r) => r.ok && setRows(r.data))
    api('/agencies').then((r) => r.ok && setAgencies(r.data))
  }, [])
  useEffect(() => { load() }, [load])

  async function invite() {
    setError('')
    const r = await api('/users', { method: 'POST', body: JSON.stringify(f) })
    if (!r.ok) return setError(r.error ?? 'Failed')
    setF({ name: '', email: '', role: 'VIEWER', agencyId: '' }); load()
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
        <Button onClick={invite} variant="contained" startIcon={<Add />} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: GREEN, '&:hover': { bgcolor: '#007867' } }}>Invite</Button>
      </Stack>
      <Table size="small">
        <TableHead><TableRow>{['Name', 'Email', 'Role', 'Status'].map((h) => <TableCell key={h} sx={{ fontWeight: 700, color: '#637381' }}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>
          {rows.length === 0 && <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#919EAB' }}>No users yet — invite your team.</TableCell></TableRow>}
          {rows.map((u) => (
            <TableRow key={u._id} hover>
              <TableCell sx={{ fontWeight: 700, color: DARK }}>{u.name}</TableCell>
              <TableCell sx={{ color: '#637381' }}>{u.email}</TableCell>
              <TableCell sx={{ color: '#637381' }}>{u.role}</TableCell>
              <TableCell><Chip label={u.status} size="small" sx={{ fontWeight: 700, color: u.status === 'active' ? '#118D57' : '#B76E00', bgcolor: u.status === 'active' ? '#D3FCD2' : '#FFF5CC' }} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

function EnvironmentsPanel() {
  const [data, setData] = useState<{ environments: any[]; sandboxCount: number; sandboxLimit: number; canCreateSandbox: boolean } | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const load = useCallback(() => api('/environments').then((r) => r.ok && setData(r.data)), [])
  useEffect(() => { load() }, [load])

  async function addSandbox() {
    setError('')
    const r = await api('/environments', { method: 'POST', body: JSON.stringify({ name }) })
    if (!r.ok) return setError(r.error ?? 'Failed')
    setName(''); load()
  }

  return (
    <Box>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      <Typography variant="body2" sx={{ color: '#637381', mb: 2 }}>
        Sandboxes used: <b>{data?.sandboxCount ?? 0}</b> / {data?.sandboxLimit ?? 1}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField size="small" label="Sandbox name" value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1 }} disabled={!data?.canCreateSandbox} />
        <Tooltip title={data?.canCreateSandbox ? '' : 'Upgrade your plan to add more sandboxes'}>
          <span>
            <Button onClick={addSandbox} disabled={!data?.canCreateSandbox} variant="contained" startIcon={<Add />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, bgcolor: GREEN, '&:hover': { bgcolor: '#007867' } }}>
              Create sandbox
            </Button>
          </span>
        </Tooltip>
      </Stack>
      <Table size="small">
        <TableHead><TableRow>{['Name', 'Type', 'Status'].map((h) => <TableCell key={h} sx={{ fontWeight: 700, color: '#637381' }}>{h}</TableCell>)}</TableRow></TableHead>
        <TableBody>
          {data?.environments.map((e) => (
            <TableRow key={e._id} hover>
              <TableCell sx={{ fontWeight: 700, color: DARK }}>{e.name}{e.isDefault && ' (default)'}</TableCell>
              <TableCell><Chip label={e.type} size="small" sx={{ fontWeight: 700, color: e.type === 'PRODUCTION' ? '#006C9C' : '#8E33FF', bgcolor: e.type === 'PRODUCTION' ? '#CAFDF5' : '#EFD6FF' }} /></TableCell>
              <TableCell sx={{ color: '#637381' }}>{e.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
