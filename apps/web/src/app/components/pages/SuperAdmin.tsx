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
import { MODULES, MODULE_GROUPS, MODULE_KEYS, PLAN_DEFAULTS, type ModuleKey } from '@/lib/modules'
import { useSubscription } from '@/app/context/SubscriptionContext'

type Plan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' | 'CUSTOM'
type SubStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'

interface CompanyRow {
  _id: string
  name: string
  owner: string
  ownerEmail: string
  status: string
  createdAt: string
  userCount: number
  subscription: {
    _id: string
    plan: Plan
    status: SubStatus
    enabledModules: string[]
    maxUsers?: number | null
    maxProjects?: number | null
    trialEndsAt?: string | null
    currentPeriodEnd?: string | null
    notes?: string
  } | null
}

const PLAN_COLOR: Record<Plan, string> = {
  FREE: 'bg-gray-100 text-gray-700',
  STARTER: 'bg-blue-100 text-blue-700',
  PRO: 'bg-purple-100 text-purple-700',
  ENTERPRISE: 'bg-amber-100 text-amber-700',
  CUSTOM: 'bg-slate-100 text-slate-700',
}

const STATUS_COLOR: Record<SubStatus, string> = {
  TRIAL: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  PAST_DUE: 'bg-amber-100 text-amber-700',
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
  const [onPlan, setOnPlan] = useState<Plan>('STARTER')
  const [onSaving, setOnSaving] = useState(false)

  // Subscription editor dialog state
  const [editTarget, setEditTarget] = useState<CompanyRow | null>(null)
  const [editPlan, setEditPlan] = useState<Plan>('FREE')
  const [editStatus, setEditStatus] = useState<SubStatus>('TRIAL')
  const [editModules, setEditModules] = useState<Set<string>>(new Set())
  const [editMaxUsers, setEditMaxUsers] = useState('')
  const [editMaxProjects, setEditMaxProjects] = useState('')
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
      !s || c.name.toLowerCase().includes(s) || c.ownerEmail?.toLowerCase().includes(s)
    )
  }, [companies, search])

  const totals = useMemo(() => ({
    companies: companies.length,
    activeSubs: companies.filter((c) => c.subscription?.status === 'ACTIVE').length,
    trialSubs: companies.filter((c) => c.subscription?.status === 'TRIAL').length,
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
        owner: onOwner.trim(),
        ownerEmail: onEmail.trim(),
        plan: onPlan,
      })
      toast.success(`Company "${onName}" onboarded.`)
      setOnName(''); setOnOwner(''); setOnEmail(''); setOnPlan('STARTER')
      setOnboardOpen(false); load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to onboard')
    } finally { setOnSaving(false) }
  }

  const openEdit = (c: CompanyRow) => {
    setEditTarget(c)
    setEditPlan(c.subscription?.plan ?? 'FREE')
    setEditStatus(c.subscription?.status ?? 'TRIAL')
    setEditModules(new Set(c.subscription?.enabledModules ?? PLAN_DEFAULTS[c.subscription?.plan ?? 'FREE']))
    setEditMaxUsers(c.subscription?.maxUsers != null ? String(c.subscription.maxUsers) : '')
    setEditMaxProjects(c.subscription?.maxProjects != null ? String(c.subscription.maxProjects) : '')
    setEditNotes(c.subscription?.notes ?? '')
  }

  // When the admin changes the plan dropdown, snap module set to that plan's
  // defaults so they don't have to tick 30 boxes manually.
  const handlePlanChange = (p: Plan) => {
    setEditPlan(p)
    if (p !== 'CUSTOM') setEditModules(new Set(PLAN_DEFAULTS[p]))
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
        plan: editPlan,
        status: editStatus,
        enabledModules: Array.from(editModules),
        maxUsers: editMaxUsers ? Number(editMaxUsers) : null,
        maxProjects: editMaxProjects ? Number(editMaxProjects) : null,
        notes: editNotes,
      }
      if (editTarget.subscription) {
        await api.patch(`/admin/subscriptions/${editTarget.subscription._id}`, payload)
      } else {
        await api.post('/admin/subscriptions', { agencyId: editTarget._id, ...payload })
      }
      toast.success(`Subscription updated for ${editTarget.name}.`)
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
          <p className="text-gray-600 mt-1">Onboard companies and manage subscription / module access</p>
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
                      <div className="text-sm">{c.owner}</div>
                      <div className="text-xs text-gray-500">{c.ownerEmail}</div>
                    </TableCell>
                    <TableCell>{c.userCount}</TableCell>
                    <TableCell>
                      {c.subscription
                        ? <Badge className={PLAN_COLOR[c.subscription.plan]}>{c.subscription.plan}</Badge>
                        : <Badge variant="outline">No sub</Badge>}
                    </TableCell>
                    <TableCell>
                      {c.subscription
                        ? <Badge className={STATUS_COLOR[c.subscription.status]}>{c.subscription.status}</Badge>
                        : '—'}
                    </TableCell>
                    <TableCell>{c.subscription?.enabledModules?.length ?? 0}</TableCell>
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
            <DialogDescription>Creates the agency, an initial owner user, and a subscription seeded from the chosen plan.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Company Name *</Label><Input value={onName} onChange={(e) => setOnName(e.target.value)} placeholder="Acme Digital" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Owner Full Name *</Label><Input value={onOwner} onChange={(e) => setOnOwner(e.target.value)} placeholder="Jane Smith" /></div>
              <div className="space-y-2"><Label>Owner Email *</Label><Input type="email" value={onEmail} onChange={(e) => setOnEmail(e.target.value)} placeholder="jane@acme.com" /></div>
            </div>
            <div className="space-y-2">
              <Label>Initial Plan</Label>
              <Select value={onPlan} onValueChange={(v: Plan) => setOnPlan(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="STARTER">Starter</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {PLAN_DEFAULTS[onPlan].length} modules will be enabled by default. You can fine-tune them after onboarding.
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
            <DialogTitle>Manage Subscription — {editTarget?.name}</DialogTitle>
            <DialogDescription>Set the plan, status, limits, and per-module access.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={editPlan} onValueChange={(v: Plan) => handlePlanChange(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="STARTER">Starter</SelectItem>
                    <SelectItem value="PRO">Pro</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v: SubStatus) => setEditStatus(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRIAL">Trial</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PAST_DUE">Past Due</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Max Users</Label><Input type="number" placeholder="unlimited" value={editMaxUsers} onChange={(e) => setEditMaxUsers(e.target.value)} /></div>
              <div className="space-y-2"><Label>Max Projects</Label><Input type="number" placeholder="unlimited" value={editMaxProjects} onChange={(e) => setEditMaxProjects(e.target.value)} /></div>
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
