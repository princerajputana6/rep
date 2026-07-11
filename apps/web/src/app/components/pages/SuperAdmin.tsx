'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/app/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/components/ui/select'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Plus, Settings, Loader2, Building2, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { MODULES, MODULE_GROUPS, MODULE_KEYS, PLAN_DEFAULTS, PLAN_LABELS, type ModuleKey, type PlanTier } from '@/lib/modules'
import { useSubscription } from '@/app/context/SubscriptionContext'

type LicenseStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED'

interface CompanyRow {
  _id: string
  name: string
  adminName: string
  adminEmail: string
  status: string
  tier: PlanTier
  createdAt: string
  userCount: number
  license: {
    _id: string
    tier: PlanTier
    status: LicenseStatus
    enabledModules: string[]
    maxUsers?: number | null
    maxAgencies?: number | null
    sandboxLimit?: number | null
    seats?: number | null
    validTo?: string | null
    notes?: string
  } | null
  admin: {
    _id: string
    username: string
    email: string
    name: string
  } | null
}

const TIER_COLOR: Record<PlanTier, string> = {
  PRIME: 'bg-blue-100 text-blue-700',
  ULTIMATE: 'bg-purple-100 text-purple-700',
  ENTERPRISE: 'bg-amber-100 text-amber-700',
}

const STATUS_COLOR: Record<LicenseStatus, string> = {
  TRIAL: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-amber-100 text-amber-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
  EXPIRED: 'bg-red-100 text-red-700',
}

export function SuperAdmin() {
  const { isSuperAdmin, loading: subLoading } = useSubscription()
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Onboard dialog state
  const [onboardOpen, setOnboardOpen] = useState(false)
  const [onName, setOnName] = useState('')
  const [onOwner, setOnOwner] = useState('')
  const [onEmail, setOnEmail] = useState('')
  const [onTier, setOnTier] = useState<PlanTier>('PRIME')
  const [onSaving, setOnSaving] = useState(false)

  // Subscription editor dialog state
  const [editTarget, setEditTarget] = useState<CompanyRow | null>(null)
  const [editTier, setEditTier] = useState<PlanTier>('PRIME')
  const [editStatus, setEditStatus] = useState<LicenseStatus>('TRIAL')
  const [editModules, setEditModules] = useState<Set<string>>(new Set())
  const [editMaxUsers, setEditMaxUsers] = useState('')
  const [editMaxAgencies, setEditMaxAgencies] = useState('')
  const [editSandboxLimit, setEditSandboxLimit] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get<CompanyRow[]>('/admin/companies')
      .then((rows) => setCompanies(Array.isArray(rows) ? rows : []))
      .catch((e: Error) => toast.error(e.message ?? 'Failed to load companies'))
      .finally(() => setLoading(false))
  }
  useEffect(() => {
    if (isSuperAdmin) load()
  }, [isSuperAdmin])

  const filtered = useMemo(() => {
    const s = search.toLowerCase()
    return companies.filter((c) =>
      !s || c.name.toLowerCase().includes(s) || c.adminEmail?.toLowerCase().includes(s)
    )
  }, [companies, search])

  const totals = useMemo(() => ({
    companies: companies.length,
    activeSubs: companies.filter((c) => c.license?.status === 'ACTIVE').length,
    trialSubs: companies.filter((c) => c.license?.status === 'TRIAL').length,
    users: companies.reduce((s, c) => s + c.userCount, 0),
  }), [companies])

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleOnboard = async () => {
    if (!onName.trim() || !onOwner.trim() || !onEmail.trim()) {
      toast.error('Name, owner, and email are required'); return
    }
    setOnSaving(true)
    try {
      await api.post('/admin/companies', {
        name: onName.trim(),
        adminName: onOwner.trim(),
        adminEmail: onEmail.trim(),
        tier: onTier,
      })
      toast.success(`Company "${onName}" onboarded.`)
      setOnName(''); setOnOwner(''); setOnEmail(''); setOnTier('PRIME')
      setOnboardOpen(false); load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to onboard')
    } finally { setOnSaving(false) }
  }

  const openEdit = (c: CompanyRow) => {
    setEditTarget(c)
    setEditTier(c.license?.tier ?? c.tier ?? 'PRIME')
    setEditStatus(c.license?.status ?? 'TRIAL')
    setEditModules(new Set(c.license?.enabledModules ?? PLAN_DEFAULTS[c.license?.tier ?? c.tier ?? 'PRIME']))
    setEditMaxUsers(c.license?.maxUsers != null ? String(c.license.maxUsers) : '')
    setEditMaxAgencies(c.license?.maxAgencies != null ? String(c.license.maxAgencies) : '')
    setEditSandboxLimit(c.license?.sandboxLimit != null ? String(c.license.sandboxLimit) : '')
    setEditNotes(c.license?.notes ?? '')
  }

  // When the admin changes the plan dropdown, snap module set to that plan's
  // defaults so they don't have to tick 30 boxes manually.
  const handleTierChange = (tier: PlanTier) => {
    setEditTier(tier)
    setEditModules(new Set(PLAN_DEFAULTS[tier]))
  }

  const toggleModule = (key: string) => {
    setEditModules((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  const handleEditSave = async () => {
    if (!editTarget) return
    setEditSaving(true)
    try {
      const payload = {
        tier: editTier,
        status: editStatus,
        enabledModules: Array.from(editModules),
        maxUsers: editMaxUsers ? Number(editMaxUsers) : null,
        maxAgencies: editMaxAgencies ? Number(editMaxAgencies) : null,
        sandboxLimit: editSandboxLimit ? Number(editSandboxLimit) : undefined,
        notes: editNotes,
      }
      if (editTarget.license) {
        await api.patch(`/admin/subscriptions/${editTarget.license._id}`, payload)
      } else {
        await api.post('/admin/subscriptions', { companyId: editTarget._id, ...payload })
      }
      toast.success(`License updated for ${editTarget.name}.`)
      setEditTarget(null); load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save subscription')
    } finally { setEditSaving(false) }
  }

  // ── Guards ───────────────────────────────────────────────────────────
  if (subLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  }
  if (!isSuperAdmin) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-12 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 mx-auto text-red-500" />
          <div className="text-lg font-semibold">Super Admin Only</div>
          <p className="text-gray-600">This area is restricted to platform super admins.</p>
        </CardContent>
      </Card>
    )
  }

  const modulesByGroup = MODULE_GROUPS.map((g) => ({
    group: g,
    items: MODULE_KEYS.filter((k) => MODULES[k].group === g),
  }))

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Super Admin</h1>
          <p className="text-gray-600 mt-1">Onboard companies and manage license / module access</p>
        </div>
        <Button onClick={() => setOnboardOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Onboard Company</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Companies" value={totals.companies} />
        <Stat label="Active Subs" value={totals.activeSubs} valueClass="text-green-600" />
        <Stat label="Trials" value={totals.trialSubs} valueClass="text-blue-600" />
        <Stat label="Total Users" value={totals.users} />
      </div>

      <Card>
        <CardContent className="p-4">
          <Input placeholder="Search by company name or owner email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Companies ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 space-y-2">
              <Building2 className="w-10 h-10 mx-auto text-gray-300" />
              <div>No companies yet. Click <strong>Onboard Company</strong> to add the first one.</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Sub Status</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">{c.admin?.name ?? c.adminName}</div>
                      <div className="text-xs text-gray-500">{c.admin?.email ?? c.adminEmail}</div>
                    </TableCell>
                    <TableCell>{c.userCount}</TableCell>
                    <TableCell>
                      {c.license
                        ? <Badge className={TIER_COLOR[c.license.tier]}>{PLAN_LABELS[c.license.tier]}</Badge>
                        : <Badge variant="outline">No license</Badge>}
                    </TableCell>
                    <TableCell>
                      {c.license
                        ? <Badge className={STATUS_COLOR[c.license.status]}>{c.license.status}</Badge>
                        : '—'}
                    </TableCell>
                    <TableCell>{c.license?.enabledModules?.length ?? 0}</TableCell>
                    <TableCell className="text-sm">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(c)}>
                        <Settings className="w-3 h-3" /> Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Onboard Dialog */}
      <Dialog open={onboardOpen} onOpenChange={setOnboardOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Onboard New Company</DialogTitle>
            <DialogDescription>Creates the company, an initial admin user, and a license seeded from the chosen tier.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Company Name *</Label><Input value={onName} onChange={(e) => setOnName(e.target.value)} placeholder="Acme Digital" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Owner Full Name *</Label><Input value={onOwner} onChange={(e) => setOnOwner(e.target.value)} placeholder="Jane Smith" /></div>
              <div className="space-y-2"><Label>Owner Email *</Label><Input type="email" value={onEmail} onChange={(e) => setOnEmail(e.target.value)} placeholder="jane@acme.com" /></div>
            </div>
            <div className="space-y-2">
              <Label>Initial Plan</Label>
              <Select value={onTier} onValueChange={(v: PlanTier) => setOnTier(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIME">Prime</SelectItem>
                  <SelectItem value="ULTIMATE">Ultimate</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {PLAN_DEFAULTS[onTier].length} modules will be enabled by default. You can fine-tune them after onboarding.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOnboardOpen(false)} disabled={onSaving}>Cancel</Button>
            <Button onClick={handleOnboard} disabled={onSaving}>{onSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Onboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Editor Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage License — {editTarget?.name}</DialogTitle>
            <DialogDescription>Set the tier, status, limits, and per-module access.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={editTier} onValueChange={(v: PlanTier) => handleTierChange(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIME">Prime</SelectItem>
                    <SelectItem value="ULTIMATE">Ultimate</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v: LicenseStatus) => setEditStatus(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRIAL">Trial</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Max Users</Label><Input type="number" placeholder="unlimited" value={editMaxUsers} onChange={(e) => setEditMaxUsers(e.target.value)} /></div>
              <div className="space-y-2"><Label>Max Agencies</Label><Input type="number" placeholder="unlimited" value={editMaxAgencies} onChange={(e) => setEditMaxAgencies(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Sandbox Limit</Label><Input type="number" placeholder="tier default" value={editSandboxLimit} onChange={(e) => setEditSandboxLimit(e.target.value)} /></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Enabled Modules ({editModules.size} / {MODULE_KEYS.length})</Label>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => setEditModules(new Set(MODULE_KEYS))}>All</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditModules(new Set())}>None</Button>
                </div>
              </div>
              <div className="border rounded-md max-h-72 overflow-y-auto divide-y">
                {modulesByGroup.map(({ group, items }) => (
                  <div key={group} className="p-3">
                    <div className="text-xs font-semibold uppercase text-gray-500 mb-2">{group}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((k) => (
                        <label key={k} className="flex items-start gap-2 text-sm cursor-pointer">
                          <Checkbox checked={editModules.has(k)} onCheckedChange={() => toggleModule(k)} />
                          <div>
                            <div className="font-medium">{MODULES[k].label}</div>
                            <div className="text-xs text-gray-400 font-mono">{k}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2"><Label>Internal Notes</Label><Textarea rows={3} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Optional internal notes about this account." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={editSaving}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={editSaving}>{editSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({ label, value, valueClass = 'text-gray-900' }: { label: string; value: number | string; valueClass?: string }) {
  return (
    <Card><CardContent className="p-4"><div className="text-sm text-gray-600">{label}</div><div className={`text-2xl font-semibold ${valueClass}`}>{value}</div></CardContent></Card>
  )
}
